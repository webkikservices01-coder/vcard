import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, SwitchCamera, X, MessageCircle, CalendarCheck, ExternalLink } from 'lucide-react';

/* =========================================================
   AiCallHost — live AI voice / video call from a public card.
   Any part of the card opens it with:  window.dispatchEvent(new CustomEvent('aicardly:call', { detail: { mode } }))
   The browser talks to OpenAI Realtime directly over WebRTC with a short-lived secret from
   POST /api/ai-call/:slug/start (the plan, limits and the AI's instructions are decided there).
   Video calls also send a small camera still now and then, so the AI can see what the
   visitor shows it, and show the AI as a big face (the owner's photo, or a drawn face whose
   mouth moves with its voice). When the caller asks for a meeting, the AI calls the
   save_meeting_request tool: we save it (POST /:slug/meeting, which emails the owner) and show
   the meeting link with a one-tap "send on WhatsApp".
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

// WhatsApp link with the meeting written in: to the owner's WhatsApp when the card has one
// (the message then sits in the caller's chat with the owner), otherwise to any chat they pick.
const meetingWhatsApp = (whatsapp, ownerName, m) => {
  const text = `Hi ${ownerName.split(' ')[0]}, I just spoke with your AI assistant and asked for a meeting${m.preferredTime ? ` (${m.preferredTime})` : ''}. Meeting link: ${m.meetingUrl}`;
  if (whatsapp && /wa\.me\/\d|api\.whatsapp\.com/.test(whatsapp)) {
    const base = whatsapp.split('?')[0];
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

// The AI's face when the owner has no photo: a friendly drawn face; mouthRef opens with the voice.
function DrawnFace({ mouthRef }) {
  return (
    <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="aiface-bg" cx="50%" cy="35%" r="75%">
          <stop offset="0" stopColor="#5b1a36" />
          <stop offset="1" stopColor="#13060c" />
        </radialGradient>
        <linearGradient id="aiface-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d2b4" />
          <stop offset="1" stopColor="#e7b48d" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" fill="url(#aiface-bg)" />
      <path d="M40 400c8-70 52-108 110-108s102 38 110 108Z" fill="#A9123F" />
      <path d="M128 262h44v40c0 12-44 12-44 0Z" fill="#e7b48d" />
      <ellipse cx="150" cy="190" rx="78" ry="92" fill="url(#aiface-skin)" />
      <path d="M70 182c-4-66 32-104 80-104s84 38 80 104c-6-22-16-38-30-46-14 8-34 10-50 4-22-8-44-4-60 10-8 8-14 20-20 32Z" fill="#2b1a12" />
      <g className="aiface-eyes">
        <ellipse cx="122" cy="196" rx="8" ry="9" fill="#2b1a12" />
        <ellipse cx="178" cy="196" rx="8" ry="9" fill="#2b1a12" />
      </g>
      <path d="M108 176q14-8 28 0M164 176q14-8 28 0" stroke="#2b1a12" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M150 204q-6 18 4 22" stroke="#c98a63" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse ref={mouthRef} cx="150" cy="246" rx="18" ry="2.5" fill="#7a2034" />
      <circle cx="104" cy="226" r="10" fill="#ff8fa9" opacity=".35" />
      <circle cx="196" cy="226" r="10" fill="#ff8fa9" opacity=".35" />
    </svg>
  );
}

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
  const [meeting, setMeeting] = useState(null); // { name, preferredTime, meetingUrl }
  const [waInfo, setWaInfo] = useState(null); // { sent, tapLink, topic } from send_whatsapp_info

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
  const lastStill = useRef(0);
  const ctx = useRef(null);
  const callId = useRef('');
  const startedAt = useRef(0);
  const ending = useRef(false);
  const stills = useRef(0);
  const speakerRef = useRef('idle');
  const faceImg = useRef(null);
  const mouth = useRef(null);
  const bars = useRef([]);

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
    lastStill.current = Date.now();
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
        const level = Math.min(1, r * 2.2);
        if (ring.current) ring.current.style.transform = `scale(${1 + level * 0.22})`;
        // Video: the AI's face moves with its voice.
        if (faceImg.current) faceImg.current.style.transform = `scale(${1.03 + level * 0.035})`;
        if (mouth.current) mouth.current.setAttribute('ry', String(2.5 + level * 13));
        bars.current.forEach((b, i) => {
          if (b) b.style.height = `${6 + Math.min(1, r * (2.4 + i * 0.5)) * 22}px`;
        });
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
    setMeeting(null);
    setWaInfo(null);
    try {
      // Ask for the mic (and camera) first: if the visitor says no, nothing is charged.
      let media;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
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
        // Video: one camera picture at the start, then one when the caller speaks (at most every
        // 15 s). Fewer pictures keep the replies quick.
        if (mode === 'video') setTimeout(sendStill, 1500);
      };
      ch.onmessage = (e) => {
        let ev;
        try {
          ev = JSON.parse(e.data);
        } catch {
          return;
        }
        if (ev.type === 'input_audio_buffer.speech_started' && mode === 'video' && Date.now() - lastStill.current > 15000) sendStill();
        // The AI wrote down a meeting: save it, show the link, tell the AI how it went.
        if (ev.type === 'response.function_call_arguments.done' && ev.name === 'save_meeting_request') {
          let args = {};
          try {
            args = JSON.parse(ev.arguments || '{}');
          } catch {
            /* empty */
          }
          axios
            .post(`${API}/api/ai-call/${slug}/meeting`, { callId: callId.current, ...args })
            .then(({ data: m }) => {
              setMeeting(m);
              return m.scheduled
                ? { ok: true, booked: true, when: m.when, meeting_link_shown_on_screen: true, invite_emailed_to_caller: m.invited }
                : { ok: true, booked: false, link_shown_on_screen: true, booking_page: m.booking };
            })
            .catch((err) => ({ ok: false, error: err.response?.data?.msg || 'Could not save the meeting' }))
            .then((output) => {
              if (dc.current?.readyState !== 'open') return;
              dc.current.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: ev.call_id, output: JSON.stringify(output) } }));
              dc.current.send(JSON.stringify({ type: 'response.create' }));
            });
        }
        // "Send me your services on WhatsApp": sent automatically, or a one-tap button on screen.
        if (ev.type === 'response.function_call_arguments.done' && ev.name === 'send_whatsapp_info') {
          let args = {};
          try {
            args = JSON.parse(ev.arguments || '{}');
          } catch {
            /* empty */
          }
          axios
            .post(`${API}/api/ai-call/${slug}/whatsapp`, { callId: callId.current, ...args })
            .then(({ data: w }) => {
              setWaInfo(w);
              return { ok: true, sent: w.sent, owner_told: true, button_shown_on_screen: !w.sent && !!w.tapLink };
            })
            .catch((err) => ({ ok: false, error: err.response?.data?.msg || 'Could not send it on WhatsApp' }))
            .then((output) => {
              if (dc.current?.readyState !== 'open') return;
              dc.current.send(JSON.stringify({ type: 'conversation.item.create', item: { type: 'function_call_output', call_id: ev.call_id, output: JSON.stringify(output) } }));
              dc.current.send(JSON.stringify({ type: 'response.create' }));
            });
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
        {video ? (
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-black shadow-2xl" style={{ aspectRatio: '3 / 4', maxHeight: '66vh' }}>
            {/* The other side's "camera": the face moves gently like a live feed and reacts to the voice. */}
            <div className={`absolute inset-0 ${stage === 'live' ? 'aiface-live' : ''}`}>
              {avatar ? (
                <img ref={faceImg} src={avatar} alt={who} className="absolute inset-0 h-full w-full object-cover transition-transform duration-100 ease-out" style={{ transformOrigin: '50% 38%', transform: 'scale(1.03)' }} />
              ) : (
                <DrawnFace mouthRef={mouth} />
              )}
            </div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,.25) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 55%, rgba(0,0,0,.8) 100%)' }} />
            <div className={`pointer-events-none absolute inset-0 rounded-[28px] transition-shadow duration-200 ${stage === 'live' && speaker === 'ai' ? 'shadow-[inset_0_0_0_3px_rgba(16,185,129,.95)]' : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]'}`} />
            <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold backdrop-blur">
              <span className={`h-2 w-2 rounded-full ${stage === 'live' ? 'bg-red-500 animate-pulse' : 'bg-white/50'}`} /> AI
            </span>
            <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-3 text-left">
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold">{who}</h2>
                <p className="truncate text-xs opacity-75">AI assistant for {ownerName}</p>
              </div>
              <div className="flex h-7 items-end gap-[3px]" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} ref={(el) => (bars.current[i] = el)} className="w-[4px] rounded-full bg-emerald-400" style={{ height: 6 }} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {face(190)}
            <h2 className="mt-6 text-2xl font-bold">{who}</h2>
            <p className="mt-1 text-sm opacity-70">AI assistant for {ownerName}</p>
          </>
        )}
        {status && <p className="mt-3 text-sm font-medium text-pink-200">{status}</p>}

        {waInfo && (
          <div className="mt-4 w-full max-w-sm rounded-2xl bg-white/[.08] p-4 text-left ring-1 ring-[#25D366]/50">
            <p className="flex items-center gap-2 text-sm font-bold text-[#5ee08f]">
              <MessageCircle className="h-4 w-4" /> {waInfo.sent ? `Sent to your WhatsApp: ${waInfo.topic}` : `${waInfo.topic} on WhatsApp`}
            </p>
            {waInfo.sent ? (
              <p className="mt-1 text-xs text-white/80">{ownerName.split(' ')[0]} has your number too and will get back to you.</p>
            ) : (
              waInfo.tapLink && (
                <>
                  <p className="mt-1 text-xs text-white/80">Tap and press send: you get all the details and {ownerName.split(' ')[0]} gets your message.</p>
                  <a href={waInfo.tapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white">
                    <MessageCircle className="h-4 w-4" /> Open WhatsApp
                  </a>
                </>
              )
            )}
          </div>
        )}

        {meeting && (
          <div className="mt-4 w-full max-w-sm rounded-2xl bg-white/[.08] p-4 text-left ring-1 ring-emerald-400/40">
            <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
              <CalendarCheck className="h-4 w-4" /> {meeting.scheduled ? `Meeting booked with ${ownerName.split(' ')[0]}` : `Meeting noted for ${ownerName.split(' ')[0]}`}
            </p>
            {meeting.scheduled ? (
              <p className="mt-1 text-xs text-white/85">{meeting.when}{meeting.invited ? ' · calendar invite sent to your email' : ''}</p>
            ) : (
              meeting.preferredTime && <p className="mt-1 text-xs text-white/75">Preferred time: {meeting.preferredTime} ({ownerName.split(' ')[0]} will confirm)</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {meeting.booking && (
                <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white">
                  <CalendarCheck className="h-4 w-4" /> Pick a time
                </a>
              )}
              <a href={meetingWhatsApp(whatsapp, ownerName, meeting)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold text-white">
                <MessageCircle className="h-4 w-4" /> {meeting.booking || meeting.scheduled ? 'Message on WhatsApp' : 'Get link on WhatsApp'}
              </a>
              {meeting.scheduled && (
                <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white">
                  <ExternalLink className="h-3.5 w-3.5" /> Join link
                </a>
              )}
              {!meeting.booking && !meeting.scheduled && (
                <a href={meeting.meetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">
                  <ExternalLink className="h-3.5 w-3.5" /> Meeting link
                </a>
              )}
            </div>
          </div>
        )}

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
            className={`absolute right-4 top-2 z-10 h-44 w-32 rounded-2xl bg-black object-cover shadow-2xl ring-2 ring-white/30 sm:h-52 sm:w-40 ${stage === 'live' || stage === 'connecting' ? '' : 'hidden'} ${camOn ? '' : 'opacity-30'}`}
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
  const [chatOpen, setChatOpen] = useState(false);
  // Hidden while the chat is open: its header has the call buttons.
  useEffect(() => {
    const id = setInterval(() => setChatOpen(!!document.querySelector('input[aria-label="Message"], textarea[aria-label="Message"]')), 600);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    // Out of the way while the visitor types (keyboard open).
    const vv = window.visualViewport;
    if (!vv) return;
    const on = () => setHide(window.innerHeight - vv.height > 150);
    vv.addEventListener('resize', on);
    return () => vv.removeEventListener('resize', on);
  }, []);
  if (!calls?.voice || hide || chatOpen) return null;
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
