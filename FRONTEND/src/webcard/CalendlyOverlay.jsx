import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CalendarCheck } from 'lucide-react';

/* =========================================================
   CalendlyOverlay — the card owner's Calendly calendar on top of the card (chat or AI call).
   Opened with  window.dispatchEvent(new CustomEvent('aicardly:calendly', { detail: { url } }))
   when the card's AI sets up a meeting. The visitor's name and email are already filled in;
   they tap a slot and Calendly sends the invite to both sides. When Calendly says the meeting
   is booked we fire 'aicardly:calendly-booked', so the chat / the call can confirm it.
   ========================================================= */

export const CALENDLY_EVENT = 'aicardly:calendly';
export const CALENDLY_BOOKED = 'aicardly:calendly-booked';
export const isCalendly = (u) => /^https:\/\/([a-z0-9-]+\.)*calendly\.com\//i.test(String(u || ''));
export const openCalendly = (url) => window.dispatchEvent(new CustomEvent(CALENDLY_EVENT, { detail: { url } }));

const embedUrl = (url) => {
  try {
    const u = new URL(url);
    u.searchParams.set('embed_domain', window.location.hostname);
    u.searchParams.set('embed_type', 'Inline');
    u.searchParams.set('hide_gdpr_banner', '1');
    return u.toString();
  } catch {
    return url;
  }
};

export default function CalendlyOverlay() {
  const [url, setUrl] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const open = (e) => {
      if (!isCalendly(e.detail?.url)) return;
      setLoaded(false);
      setBooked(false);
      setUrl(e.detail.url);
    };
    const onMessage = (e) => {
      let host;
      try {
        host = new URL(e.origin).hostname;
      } catch {
        return;
      }
      if (!/(^|\.)calendly\.com$/.test(host) || e.data?.event !== 'calendly.event_scheduled') return;
      setBooked(true);
      window.dispatchEvent(new CustomEvent(CALENDLY_BOOKED));
    };
    window.addEventListener(CALENDLY_EVENT, open);
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener(CALENDLY_EVENT, open);
      window.removeEventListener('message', onMessage);
    };
  }, []);

  if (!url) return null;
  return createPortal(
    <div className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Pick a meeting time">
      <div className="flex h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl sm:h-[min(720px,90dvh)] sm:max-w-[560px] sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              <CalendarCheck className="h-4 w-4 text-emerald-600" /> {booked ? 'Meeting booked' : 'Pick a time for your meeting'}
            </p>
            <p className="text-[11px] text-slate-500">{booked ? 'The invite is on its way to your email.' : 'Your details are filled in. Tap a day and a time, then confirm.'}</p>
          </div>
          <button type="button" onClick={() => setUrl('')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-slate-100" aria-label="Close the calendar">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative min-h-0 flex-1">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading the calendar" />
            </div>
          )}
          <iframe title="Meeting calendar" src={embedUrl(url)} onLoad={() => setLoaded(true)} className="h-full w-full border-0" />
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="shrink-0 border-t border-slate-200 py-2 text-center text-[11px] font-semibold text-pink-600">
          Calendar not loading? Open it in a new tab
        </a>
      </div>
    </div>,
    document.body,
  );
}
