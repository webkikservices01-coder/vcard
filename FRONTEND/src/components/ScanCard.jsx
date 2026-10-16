import { useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ScanLine, Camera, ImageUp, Loader2, CheckCircle2 } from 'lucide-react';
import CameraCapture, { fileToJpeg } from './CameraCapture';

// "Scan your visiting card": take a photo of the old paper card (or pick one) and the AI fills the
// Aicardly card everywhere: profile, contact links, services. Saved straight away.
// The photo is made smaller here, sent once for reading and never stored anywhere.
export default function ScanCard({ onDone, compact = false }) {
  const camera = useRef(null);
  const gallery = useRef(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const [camOpen, setCamOpen] = useState(false);

  const scanImages = async (images) => {
    setBusy(true);
    setResult(null);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/scan-card`, { images }, { headers: { 'x-auth-token': localStorage.getItem('token') }, timeout: 90000 });
      setResult(data);
      toast.success(data.msg);
      window.dispatchEvent(new Event('vcard:data-changed'));
      onDone?.(data);
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Could not scan the card. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  // Up to 3 photos of one card (front and back) picked together.
  const scanFile = async (e) => {
    const files = [...(e.target.files || [])].slice(0, 3);
    e.target.value = '';
    if (!files.length) return;
    try {
      await scanImages(await Promise.all(files.map(fileToJpeg)));
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={`rounded-2xl border border-dashed ${compact ? 'p-3' : 'p-4'}`} style={{ borderColor: 'rgba(231,12,101,.45)', background: 'rgba(231,12,101,.05)' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white" aria-hidden="true">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ScanLine className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{busy ? 'Reading your card…' : 'Have a paper visiting card? Scan it'}</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>
              {busy ? 'This takes a few seconds.' : 'We fill your name, phone, email, website, address and services for you, and save them. Details on the back too? Add both sides. Photos are not stored.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" disabled={busy} onClick={() => setCamOpen(true)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-3.5 py-2.5 text-xs font-semibold text-white disabled:opacity-60 sm:flex-none">
            <Camera className="h-4 w-4" aria-hidden="true" /> Take photo
          </button>
          <button type="button" disabled={busy} onClick={() => gallery.current?.click()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold disabled:opacity-60 sm:flex-none" style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
            <ImageUp className="h-4 w-4" aria-hidden="true" /> Upload
          </button>
        </div>
      </div>
      <CameraCapture open={camOpen} onClose={() => setCamOpen(false)} onCapture={scanImages} onFallback={() => camera.current?.click()} title="Scan your visiting card" />
      <input ref={camera} type="file" accept="image/*" capture="environment" className="hidden" onChange={scanFile} aria-label="Take a photo of your visiting card" />
      <input ref={gallery} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={scanFile} aria-label="Upload a photo of your visiting card" />
      {result && (
        <p className="mt-3 flex items-start gap-1.5 text-xs" style={{ color: 'var(--surface-text-2)' }} role="status">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
          <span>
            {result.filled?.length ? <>Added and saved: <b style={{ color: 'var(--surface-text)' }}>{result.filled.join(', ')}</b>.</> : 'Your card already had these details.'}
            {result.kept?.length ? <> Kept what you had already written for: {result.kept.join(', ')}.</> : null}
          </span>
        </p>
      )}
    </div>
  );
}
