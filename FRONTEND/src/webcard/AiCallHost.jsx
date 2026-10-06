import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, SwitchCamera, X, MessageCircle } from 'lucide-react';

/* =========================================================
   AiCallHost — live AI voice / video call from a public card.
   Any part of the card opens it with:  window.dispatchEvent(new CustomEvent('aicardly:call', { detail: { mode } }))
   The browser talks to OpenAI Realtime directly over WebRTC with a short-lived secret from
   POST /api/ai-call/:slug/start (the plan, limits and the AI's instructions are decided there).
   Video calls also send a small camera still now and then, so the AI can see what the
   visitor shows it.
   ========================================================= */

const API = import.meta.env.VITE_API_URL;
const CALL_EVENT = 'aicardly:call';
const openAiCall = (mode = 'voice') => window.dispatchEvent(new CustomEvent(CALL_EVENT, { detail: { mode } }));

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const avg = (d) => {
  let t = 0;
  for (let i = 0; i < d.length; i++) t += d[i];
  return d.length ? t / d.length / 255 : 0;
};
const MAX_STILLS = 24; // camera pictures sent per video call

export default function AiCallHost({ slug, ownerName, aiName, avatar, initials, calls, whatsapp }) {
  const [mode, setMode] = useState(null); // null = closed
  const [stage, setStage] = useState('ready'); // ready | connecting | live | ended | error
  const [err, setErr] = useState('');
  const [left, setLeft] = useState(0);
  const [used, setUsed] = useState(0);
  const [speaker, setSpeaker] = useState('idle'); // idle | ai | me
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [facing, setFacing] = useState('user');

  const pc = useRef(null);
  const dc = useRef(null);
  const mic = useRef(null);
  const cam = useRef(null);
  const audioEl = useRef(null);
  const selfVideo = useRef(null);
  const ring = useRef(null);
  const raf = useRef(0);
  const timer = useRef(0);
  const stillTimer = useRef(0);
  const ctx = useRef(null);
  const callId = useRef('');
  const startedAt = useRef(0);
  const ending = useRef(false);
  const stills = useRef(0);
  const speakerRef = useRef('idle');

  // Open from anywhere on the card.
  useEffect(() => {
    const on = (e) => {
      const m = e.detail?.mode === 'video' ? 'video' : 'voice';
      if (!calls?.[m]) return;
      setErr('');
      setStage('ready');
      setMode(m);
    };
    window.addEventListener(CALL_EVENT, on);
    return () => window.removeEventListener(CALL_EVENT, on);
  }, [calls]);

  const cleanup = useCallback(() => {
    clearInterval(timer.current);
    clearInterval(stillTimer.current);
    cancelAnimationFrame(raf.current);
    try {
      dc.current?.close();
    } catch {
      /* closed */
    }
    try {
      pc.current?.close();
    } catch {
      /* closed */
    }
    mic.current?.getTracks().forEach((t) => t.stop());
    cam.current?.getTracks().forEach((t) => t.stop());
    ctx.current?.close().catch(() => {});
    pc.current = dc.current = mic.current = cam.current = ctx.current = null;
    if (audioEl.current) audioEl.current.srcObject = null;
    speakerRef.current = 'idle';
    setSpeaker('idle');
  }, []);

  const end = useCallback(
    (reason) => {
      if (ending.current) return;
      ending.current = true;
      const secs = startedAt.current ? Math.round((Date.now() - startedAt.current) / 1000) : 0;
      startedAt.current = 0;
      cleanup();
      if (callId.current) {
        // keepalive: the request still goes out if the visitor closes the tab.
        fetch(`${API}/api/ai-call/${slug}/end`, {
          method: 'POST',
          keepalive: true,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callId: callId.current, seconds: secs }),
        }).catch(() => {});
        callId.current = '';
      }
      setUsed(secs);
      if (reason) setErr(reason);
      setStage('ended');
    },
    [cleanup, slug]
  );

  useEffect(() => () => end(), [end]);
  useEffect(() => {
    const bye = () => end();
    window.addEventListener('pagehide', bye);
    return () => window.removeEventListener('pagehide', bye);
  }, [end]);

  const close = () => {
    if (stage === 'live' || stage === 'connecting') end();
    setMode(null);
  };

  // A small camera still for the AI (video calls only).
  const sendStill = useCallback(() => {
    const v = selfVideo.current;
    const ch = dc.current;
    if (!v || !ch || ch.readyState !== 'open' || !cam.current || stills.current >= MAX_STILLS || !v.videoWidth) return;
    const c = document.createElement('canvas');
    const w = 480;
    c.width = w;
    c.height = Math.round((v.videoHeight / v.videoWidth) * w);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', 0.6);
    stills.current++;
    ch.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_image', image_url: url }] } }));
  }, []);

  const meter = (remote, local) => {
    try {
      const ac = new (window.AudioContext || window.webkitAudioContext)();
      ctx.current = ac;
      const mk = (stream) => {
        const a = ac.createAnalyser();
        a.fftSize = 64;
        ac.createMediaStreamSource(stream).connect(a);
        return a;
      };
      const ra = mk(remote);
      const la = mk(local);
      const rd = new Uint8Array(ra.frequencyBinCount);
      const ld = new Uint8Array(la.frequencyBinCount);
      let lastSwitch = 0;
      const tick = () => {
        ra.getByteFrequencyData(rd);
        la.getByteFrequencyData(ld);
        const r = avg(rd);
        const l = avg(ld);
        const next = r > 0.05 ? 'ai' : l > 0.08 ? 'me' : 'idle';
        const now = performance.now();
        if (next !== speakerRef.current && now - lastSwitch > 220) {
          speakerRef.current = next;
          lastSwitch = now;
          setSpeaker(next);
        }
        if (ring.current) ring.current.style.transform = `scale(${1 + Math.min(1, r * 2.2) * 0.22})`;
        raf.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* no Web Audio: the call still works */
    }
  };

  const start = async () => {
    setErr('');
    setStage('connecting');
    ending.current = false;
    stills.current = 0;
    try {
      // Ask for the mic (and camera) first: if the visitor says no, nothing is charged.
      let media;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: mode === 'video' ? { facingMode: facing, width: { ideal: 640 }, height: { ideal: 480 } } : false,
        });
      } catch {
        throw new Error(mode === 'video' ? 'Please allow microphone and camera to start the video call.' : 'Please allow the microphone to start the call.');
      }
      mic.current = new MediaStream(media.getAudioTracks());
      if (mode === 'video') {
        cam.current = new MediaStream(media.getVideoTracks());
        if (selfVideo.current) selfVideo.current.srcObject = cam.current;
      }

      const { data } = await axios.post(`${API}/api/ai-call/${slug}/start`, { mode, consent: true });
      callId.current = data.callId;

      const peer = new RTCPeerConnection();
      pc.current = peer;
      if (!audioEl.current) {
        audioEl.current = new Audio();
        audioEl.current.autoplay = true;
      }
      peer.ontrack = (e) => {
        audioEl.current.srcObject = e.streams[0];
        audioEl.current.play().catch(() => {});
        meter(e.streams[0], mic.current);
      };
      peer.addTrack(mic.current.getAudioTracks()[0], mic.current);
      const ch = peer.createDataChannel('oai-events');
      dc.current = ch;
      ch.onopen = () => {
        // The AI opens the call with its hello.
        ch.send(JSON.stringify({ type: 'response.create' }));
        if (mode === 'video') {
          setTimeout(sendStill, 1500);
          stillTimer.current = setInterval(sendStill, 9000);
        }
      };
      ch.onmessage = (e) => {
        try {
          const ev = JSON.parse(e.data);
          if (ev.type === 'input_audio_buffer.speech_started' && mode === 'video') sendStill();
        } catch {
          /* ignore */
        }
      };
      peer.onconnectionstatechange = () => {
        const s = peer.connectionState;
        if (s === 'connected' && !startedAt.current) {
          startedAt.current = Date.now();
          setLeft(data.maxSeconds);
          setStage('live');
          timer.current = setInterval(() => {
            const remaining = data.maxSeconds - Math.round((Date.now() - startedAt.current) / 1000);
            setLeft(remaining);
            if (remaining <= 0) end('Time is up for this call. You can call again or continue in the chat.');
          }, 1000);
        } else if ((s === 'failed' || s === 'disconnected') && !ending.current) end('The call dropped. Please try again.');
      };
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      const sdp = await fetch('https://api.openai.com/v1/realtime/calls', {
        method: 'POST',
        body: offer.sdp,
        headers: { Authorization: `Bearer ${data.clientSecret}`, 'Content-Type': 'application/sdp' },
      });
      if (!sdp.ok) throw new Error('Could not connect the call. Please try again.');
      await peer.setRemoteDescription({ type: 'answer', sdp: await sdp.text() });
    } catch (e) {
      const msg = e.response?.data?.msg || e.message || 'Could not start the call. Please try again.';
      if (callId.current) end(msg);
      else {
        cleanup();
        setErr(msg);
        setStage('error');
      }
    }
  };

  const toggleMute = () => {
    const t = mic.current?.getAudioTracks()[0];
    if (!t) return;
    t.enabled = muted;
    setMuted(!muted);
  };
  const toggleCam = () => {
    const t = cam.current?.getVideoTracks()[0];
    if (!t) return;
    t.enabled = !camOn;
    setCamOn(!camOn);
  };
  const flipCam = async () => {
    const next = facing === 'user' ? 'environment' : 'user';
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: next, width: { ideal: 640 }, height: { ideal: 480 } } });
      cam.current?.getTracks().forEach((t) => t.stop());
      cam.current = s;
      if (selfVideo.current) selfVideo.current.srcObject = s;
      setFacing(next);
      setCamOn(true);
    } catch {
      /* only one camera */
    }
  };

  if (!mode) return null;
  const video = mode === 'video';
  const who = aiName && aiName !== 'AI Assistant' ? aiName : `${ownerName.split(' ')[0]}'s AI`;
  const status =
    stage === 'connecting' ? 'Connecting…' : stage === 'live' ? (speaker === 'ai' ? 'Speaking…' : speaker === 'me' ? 'Listening…' : muted ? 'You are muted' : 'Say something…') : stage === 'ended' ? `Call ended${used ? ` · ${clock(used)}` : ''}` : '';

  const face = (size) => (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div ref={ring} className="absolute inset-0 rounded-full transition-transform duration-75" style={{ background: 'radial-gradient(circle, rgba(237,36,96,.45), rgba(237,36,96,0) 70%)' }} />
      <div className={`absolute inset-[6%] rounded-full ${stage === 'live' && speaker === 'ai' ? 'animate-pulse' : ''}`} style={{ boxShadow: '0 0 0 3px rgba(255,255,255,.18), 0 0 0 9px rgba(237,36,96,.25)' }} />
      {avatar ? (
        <img src={avatar} alt={ownerName} className="relative h-[84%] w-[84%] rounded-full object-cover" />
      ) : (
        <div className="relative grid h-[84%] w-[84%] place-items-center rounded-full text-4xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#F03276,#A9123F)' }}>
          {initials}
        </div>
      )}
      <span className="absolute bottom-[6%] right-[8%] rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#A9123F] shadow">AI</span>
    </div>
  );

  const btn = 'grid h-14 w-14 place-items-center rounded-full text-white transition active:scale-95';
  return createPortal(
    <div className="fixed inset-0 z-[2147483000] flex flex-col text-white" style={{ background: 'radial-gradient(120% 80% at 50% 0%, #3a0d22 0%, #12060c 55%, #050307 100%)', fontFamily: 'Inter, system-ui, sans-serif' }} role="dialog" aria-label={video ? 'AI video call' : 'AI call'}>
      {/* top bar */}
      <div className="flex items-center justify-between px-4 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">{video ? 'AI video call' : 'AI voice call'}</div>
        {stage !== 'live' && stage !== 'connecting' && (
          <button type="button" onClick={close} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <X className="h-5 w-5" />
          </button>
        )}
        {stage === 'live' && <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tabular-nums">{clock(left)} left</div>}
      </div>

      {/* middle */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        {face(video ? 210 : 190)}
        <h2 className="mt-6 text-2xl font-bold">{who}</h2>
        <p className="mt-1 text-sm opacity-70">AI assistant for {ownerName}</p>
        {status && <p className="mt-3 text-sm font-medium text-pink-200">{status}</p>}

        {stage === 'ready' && (
          <div className="mt-6 max-w-sm rounded-2xl bg-white/[.06] p-4 text-left text-[13px] leading-relaxed text-white/80">
            You’ll talk to an AI, not {ownerName.split(' ')[0]}. It answers from this card in English or Hindi. Your voice{video ? ' and camera pictures' : ''} go to OpenAI
            only to answer you live; the call isn’t recorded.{' '}
            <a href="/ai-data-privacy" target="_blank" rel="noopener noreferrer" className="underline">
              How the AI uses data
            </a>
          </div>
        )}
        {(stage === 'error' || (stage === 'ended' && err)) && <p className="mt-4 max-w-sm rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-100">{err}</p>}

        {video && (
          <video
            ref={selfVideo}
            autoPlay
            playsInline
            muted
            className={`absolute right-4 top-2 h-40 w-28 rounded-2xl bg-black object-cover shadow-2xl ring-2 ring-white/20 sm:h-48 sm:w-36 ${stage === 'live' || stage === 'connecting' ? '' : 'hidden'} ${camOn ? '' : 'opacity-30'}`}
            style={{ transform: facing === 'user' ? 'scaleX(-1)' : undefined }}
          />
        )}
      </div>

      {/* controls */}
      <div className="flex items-center justify-center gap-5 px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-4">
        {(stage === 'ready' || stage === 'error') && (
          <>
            <button type="button" onClick={close} className="rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold">
              Cancel
            </button>
            <button type="button" onClick={start} className="flex items-center gap-2 rounded-full bg-emerald-500 px-7 py-3.5 text-sm font-bold shadow-lg shadow-emerald-500/30">
              {video ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />} {stage === 'error' ? 'Try again' : 'Start call'}
            </button>
          </>
        )}
        {(stage === 'connecting' || stage === 'live') && (
          <>
            <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className={`${btn} ${muted ? 'bg-white text-black' : 'bg-white/15'}`}>
              {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </button>
            {video && (
              <>
                <button type="button" onClick={toggleCam} aria-label={camOn ? 'Camera off' : 'Camera on'} className={`${btn} ${camOn ? 'bg-white/15' : 'bg-white text-black'}`}>
                  {camOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </button>
                <button type="button" onClick={flipCam} aria-label="Switch camera" className={`${btn} bg-white/15`}>
                  <SwitchCamera className="h-6 w-6" />
                </button>
              </>
            )}
            <button type="button" onClick={() => end()} aria-label="End call" className={`${btn} bg-red-500 shadow-lg shadow-red-500/40`}>
              <PhoneOff className="h-6 w-6" />
            </button>
          </>
        )}
        {stage === 'ended' && (
          <>
            <button type="button" onClick={() => setStage('ready')} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold">
              <Phone className="h-4 w-4" /> Call again
            </button>
            {whatsapp ? (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold">
                <MessageCircle className="h-4 w-4" /> WhatsApp {ownerName.split(' ')[0]}
              </a>
            ) : (
              <button type="button" onClick={close} className="rounded-full bg-white/10 px-6 py-3.5 text-sm font-semibold">
                Back to card
              </button>
            )}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Small floating "AI call" button on phones (the chat chips offer the same on every screen).
export function AiCallFab({ calls }) {
  const [hide, setHide] = useState(false);
  useEffect(() => {
    // Out of the way while the visitor types (keyboard open).
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setHide(window.innerHeight - vv.height > 150);
    vv.addEventListener('resize', on);
    return () => vv.removeEventListener('resize', on);
  }, []);
  if (!calls?.voice || hide) return null;
  return (
    <button
      type="button"
      onClick={() => openAiCall(calls.video ? 'video' : 'voice')}
      className="aicall-fab fixed bottom-[96px] left-3 z-[60] flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12px] font-bold text-white shadow-xl sm:hidden"
      style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 10px 28px rgba(5,150,105,.45)' }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">{calls.video ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}</span>
      {calls.video ? 'AI video call' : 'AI call'}
    </button>
  );
}
