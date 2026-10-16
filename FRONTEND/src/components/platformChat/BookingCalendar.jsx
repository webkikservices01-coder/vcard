import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

// The booking calendar (Calendly) inside Cardy's panel: the visitor picks a slot without leaving
// the site. Calendly tells the page when a meeting is booked (postMessage), and Cardy confirms it.
export function calendlyUrl(base, { name = '', email = '' } = {}) {
  try {
    const u = new URL(base);
    u.searchParams.set('embed_domain', window.location.hostname);
    u.searchParams.set('embed_type', 'Inline');
    u.searchParams.set('hide_gdpr_banner', '1');
    if (name) u.searchParams.set('name', name);
    if (email) u.searchParams.set('email', email);
    return u.toString();
  } catch {
    return base;
  }
}

export default function BookingCalendar({ url, prefill, onClose, onBooked }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const onMessage = (e) => {
      if (!/(^|\.)calendly\.com$/.test(new URL(e.origin || 'http://x').hostname)) return;
      if (e.data?.event === 'calendly.event_scheduled') onBooked?.();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onBooked]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: 'var(--surface-1)' }} role="dialog" aria-label="Book a free demo">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--surface-border)' }}>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Book a free demo</p>
          <p className="text-[11px]" style={{ color: 'var(--surface-text-2)' }}>Pick a time that suits you. You get the invite by email.</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-black/5" aria-label="Close the calendar" style={{ color: 'var(--surface-text)' }}>
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 bg-white">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading the calendar" />
          </div>
        )}
        <iframe title="Booking calendar" src={calendlyUrl(url, prefill)} onLoad={() => setLoaded(true)} className="h-full w-full border-0" allow="payment" />
      </div>
      <a href={calendlyUrl(url, prefill).replace(/embed_type=Inline&?/, '')} target="_blank" rel="noopener noreferrer" className="shrink-0 border-t py-2 text-center text-[11px] font-semibold text-brand-600" style={{ borderColor: 'var(--surface-border)' }}>
        Calendar not loading? Open it in a new tab
      </a>
    </div>
  );
}
