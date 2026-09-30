import React, { useEffect, useRef, useState } from 'react';
import { CARD } from '../cardData.js';

// Live visitor counter ("12 viewing now · Today · Total views"), from the upstream template kit.
// Data: GET /api/vcard/public/:slug/live?v=<visitor id> → { now, today, total }, polled every 15s.
// While polling, this visitor counts as "viewing now". If the request fails or the phone is
// offline, the pill hides.

export const fmtCount = (n) => (n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K' : String(n));

const visitorId = () => {
  try {
    let id = sessionStorage.getItem('wc-visitor');
    if (!id) {
      id = (window.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^\w-]/g, '');
      sessionStorage.setItem('wc-visitor', id);
    }
    return id;
  } catch {
    return '';
  }
};

export function useVisitorStats(enabled = true) {
  const [s, setS] = useState({ status: 'loading', now: 0, today: 0, total: 0 });
  const slug = CARD.slug;
  useEffect(() => {
    if (!enabled || !slug) return;
    let alive = true;
    const url = `${import.meta.env.VITE_API_URL}/api/vcard/public/${slug}/live?v=${visitorId()}`;
    const load = () =>
      fetch(url)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => alive && setS({ status: 'live', now: Math.max(1, d.now | 0), today: Math.max(1, d.today | 0), total: Math.max(1, d.total | 0) }))
        .catch(() => alive && setS((p) => ({ ...p, status: 'offline' })));
    load();
    const timer = setInterval(() => !document.hidden && load(), 15000);
    const off = () => setS((p) => ({ ...p, status: 'offline' }));
    window.addEventListener('offline', off);
    window.addEventListener('online', load);
    return () => {
      alive = false;
      clearInterval(timer);
      window.removeEventListener('offline', off);
      window.removeEventListener('online', load);
    };
  }, [enabled, slug]);
  return s;
}

function Roll({ value }) {
  return <span style={{ display: 'inline-block', overflow: 'hidden', height: 14, lineHeight: '14px', verticalAlign: 'top' }}><span key={value} className="wc-roll" style={{ display: 'inline-block' }}>{value}</span></span>;
}

// light = true for light covers (dark text on white frost)
// Sits at the top left of the card (scrolls away with the cover).
export default function VisitorCounter({ stats, light, tokens, top = 12 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);
  if (stats.status !== 'live') return null; // offline / loading → hidden gracefully

  const pill = {
    height: 28, padding: '0 11px 0 9px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6,
    background: light ? 'rgba(255,255,255,.82)' : 'rgba(10,10,12,.58)', color: light ? '#111111' : '#FFFFFF',
    border: `1px solid ${light ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.14)'}`,
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', font: "600 12px/1 'Inter',sans-serif", cursor: 'pointer', whiteSpace: 'nowrap',
  };
  const dot = <span className="wc-pulse" style={{ width: 8, height: 8, borderRadius: 99, background: light ? '#15803D' : '#22C55E', flex: '0 0 auto' }} />;
  const T = tokens;
  return (
    <>
      <div ref={ref} style={{ position: 'absolute', top: `calc(env(safe-area-inset-top, 0px) + ${top}px)`, left: 16, zIndex: 6 }}>
        <button type="button" aria-expanded={open} aria-label={`${stats.now} ${stats.now === 1 ? 'visitor' : 'visitors'} now. Tap for details`} onClick={() => setOpen((o) => !o)} style={pill}>
          {dot}<Roll value={fmtCount(stats.now)} /><span>{stats.now === 1 ? 'visitor' : 'visitors'}</span>
        </button>
        {open && (
          <div role="dialog" style={{ position: 'absolute', top: 36, left: 0, display: 'flex', gap: 14, padding: '10px 14px', borderRadius: 12, background: T.surface, color: T.text, border: `1px solid ${T.border}`, boxShadow: '0 12px 30px -12px rgba(0,0,0,.4)', whiteSpace: 'nowrap', fontFamily: "'Inter',sans-serif" }}>
            {[['Visitors now', fmtCount(stats.now)], ['Today', fmtCount(stats.today)], ['Total views', fmtCount(stats.total)]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span style={{ fontSize: 11, color: T.muted }}>{k}</span><span style={{ font: "700 15px 'Inter'" }}>{v}</span></div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
