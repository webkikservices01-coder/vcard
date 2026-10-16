import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// The camera inside the page for scanning a visiting card: a live view with a card-shaped frame and
// a Capture button (back camera on phones, webcam on laptops). If the camera can't be used
// (no camera, permission refused, insecure page), a button calls onFallback() so the caller can
// open the phone's own camera / photo picker instead. Up to 3 shots (front and back of the card);
// "Upload photo" inside adds photos from the gallery / computer the same way.
// "Read card" calls onCapture with the JPEG data URLs (max 1600 px each).
// Inline styles: it also opens over the public card pages, which have their own CSS.
const MAX_SIDE = 1600;
const MAX_SHOTS = 3;

export function shrinkToJpeg(source, width, height) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const c = document.createElement('canvas');
  c.width = Math.round(width * scale);
  c.height = Math.round(height * scale);
  c.getContext('2d').drawImage(source, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}

// A picked photo file → JPEG data URL (smaller), the same as a camera shot.
export function fileToJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(shrinkToJpeg(img, img.width, img.height));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This photo can't be opened. Please use a JPG or PNG photo."));
    };
    img.src = url;
  });
}

// Mounted only while open, so every opening starts fresh.
export default function CameraCapture(props) {
  return props.open ? <CameraView {...props} /> : null;
}

function CameraView({ onClose, onCapture, onFallback, title = 'Scan a visiting card' }) {
  const video = useRef(null);
  const stream = useRef(null);
  const [state, setState] = useState('starting'); // starting | live | error
  const [shots, setShots] = useState([]);
  const [upErr, setUpErr] = useState('');
  const picker = useRef(null);

  useEffect(() => {
    let live = true;
    // No camera here: show a button for the phone's own camera / a photo (a tap is needed for that).
    const fail = () => {
      if (live) setState('error');
    };
    if (!navigator.mediaDevices?.getUserMedia) {
      fail();
      return undefined;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (!live) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream.current = s;
        if (video.current) {
          video.current.srcObject = s;
          video.current.play().catch(() => {});
        }
        setState('live');
      })
      .catch(fail);
    return () => {
      live = false;
      stream.current?.getTracks().forEach((t) => t.stop());
      stream.current = null;
    };
  }, []);

  const snap = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const next = [...shots, shrinkToJpeg(v, v.videoWidth, v.videoHeight)].slice(0, MAX_SHOTS);
    setShots(next);
    if (next.length >= MAX_SHOTS) finish(next);
  };
  // Photos picked from the gallery: added like camera shots (front, back).
  const pick = async (e) => {
    const files = [...(e.target.files || [])].slice(0, MAX_SHOTS);
    e.target.value = '';
    if (!files.length) return;
    try {
      setUpErr('');
      const imgs = await Promise.all(files.map(fileToJpeg));
      const next = [...shots, ...imgs].slice(0, MAX_SHOTS);
      setShots(next);
      if (next.length >= MAX_SHOTS) finish(next);
    } catch (err) {
      setUpErr(err.message);
    }
  };
  const finish = (list = shots) => {
    if (!list.length) return;
    onClose?.();
    onCapture?.(list);
  };
  const btn = { border: 'none', borderRadius: '999px', padding: '12px 22px', font: '600 15px system-ui, sans-serif', cursor: 'pointer' };
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} style={{ position: 'fixed', inset: 0, zIndex: 10060, background: '#000', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px' }}>
        <span style={{ fontWeight: 700 }}>{title}</span>
        <button type="button" onClick={onClose} aria-label="Close the camera" style={{ ...btn, padding: '8px 14px', background: 'rgba(255,255,255,.15)', color: '#fff' }}>Close</button>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        <video ref={video} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* The card frame: keep the card inside it. */}
        <div aria-hidden="true" style={{ position: 'absolute', width: 'min(86vw, 560px)', height: 'calc(min(86vw, 560px) / 1.75)', border: '3px solid rgba(255,255,255,.95)', borderRadius: '14px', background: 'transparent', boxShadow: '0 0 0 9999px rgba(0,0,0,.45)', pointerEvents: 'none' }} />
        {state === 'starting' && <p style={{ position: 'absolute', margin: 0 }}>Opening the camera…</p>}
        {state === 'error' && (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: '#000', padding: '24px', textAlign: 'center' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontWeight: 700 }}>The camera couldn't open here.</p>
              <p style={{ margin: '0 0 16px', fontSize: '13px', opacity: 0.8 }}>Allow camera access in the browser, or take / choose a photo instead.</p>
              <button type="button" onClick={() => { onClose?.(); onFallback?.(); }} style={{ ...btn, background: '#fff', color: '#111' }}>Take a photo</button>
              <button type="button" onClick={() => picker.current?.click()} style={{ ...btn, marginLeft: '8px', background: 'rgba(255,255,255,.15)', color: '#fff' }}>Upload photo</button>
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '16px 16px max(20px, env(safe-area-inset-bottom))', textAlign: 'center' }}>
        {shots.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            {shots.map((src, i) => (
              <span key={i} style={{ position: 'relative' }}>
                <img src={src} alt={i ? 'Back side' : 'Front side'} style={{ width: '64px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #fff' }} />
                <button type="button" onClick={() => setShots(shots.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`} style={{ position: 'absolute', top: '-8px', right: '-8px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#E70C65', color: '#fff', fontSize: '12px', lineHeight: '20px', cursor: 'pointer', padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}
        <p style={{ margin: '0 0 12px', fontSize: '13px', opacity: 0.85 }}>
          {shots.length ? 'Details on the back too? Turn the card over and capture it, or tap Read card.' : 'Fit the whole card inside the frame, in good light, then tap Capture. Or upload a photo of it.'}
        </p>
        {upErr && <p role="alert" style={{ margin: '0 0 10px', fontSize: '13px', color: '#FCA5A5' }}>{upErr}</p>}
        <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} aria-label="Upload a photo of the visiting card" />
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={snap} disabled={state !== 'live'} style={{ ...btn, background: shots.length ? 'rgba(255,255,255,.15)' : '#fff', color: shots.length ? '#fff' : '#111', minWidth: '140px', opacity: state === 'live' ? 1 : 0.5 }}>
            {shots.length ? 'Capture back side' : 'Capture'}
          </button>
          {shots.length > 0 && (
            <button type="button" onClick={() => finish()} style={{ ...btn, background: '#fff', color: '#111', minWidth: '140px' }}>
              Read card ({shots.length} photo{shots.length > 1 ? 's' : ''})
            </button>
          )}
          {shots.length < MAX_SHOTS && (
            <button type="button" onClick={() => picker.current?.click()} style={{ ...btn, background: 'rgba(255,255,255,.15)', color: '#fff', minWidth: '140px' }}>
              Upload photo
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
