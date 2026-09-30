import React, { useEffect } from 'react';

export function Sheet({ open, onClose, bg, children, label, maxHeight = '88dvh' }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 80, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.42)', backdropFilter: 'blur(2px)' }} />
      <div role="dialog" aria-modal="true" aria-label={label} className="wc-sheet" style={{ position: 'relative', width: '100%', maxWidth: 480, maxHeight, background: bg, borderRadius: '24px 24px 0 0', display: 'flex', flexDirection: 'column', boxShadow: '0 -20px 40px -20px rgba(0,0,0,.5)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 9, background: 'rgba(128,128,128,.4)', alignSelf: 'center', marginTop: 10, flex: '0 0 auto' }} />
        {children}
      </div>
    </div>
  );
}

export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div role="status" className="wc-toast" style={{ position: 'fixed', left: '50%', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)', transform: 'translateX(-50%)', zIndex: 90, width: 'calc(100% - 32px)', maxWidth: 400, minHeight: 52, padding: '10px 14px', boxSizing: 'border-box', borderRadius: 14, background: '#14141A', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 10, font: "600 15px 'Inter',sans-serif", boxShadow: '0 16px 30px -14px rgba(0,0,0,.5)' }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#22C55E', color: '#0B0B10', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
      </span>
      <span>{msg}</span>
    </div>
  );
}
