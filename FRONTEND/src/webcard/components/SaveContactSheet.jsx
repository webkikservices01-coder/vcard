import React, { useMemo, useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { CARD, contactDetails, downloadContact } from '../cardData.js';

// Save Contact sheet (from the upstream template kit): lists every filled detail of the card,
// the visitor can untick some, then the vCard downloads. Colours come from the card's palette.
export default function SaveContactSheet({ open, onClose, onSaved, tokens: T, radius = 14 }) {
  // Rebuilt each time the sheet opens, so it always matches the card on screen.
  const rows = useMemo(() => (open ? contactDetails() : []), [open]);
  const [off, setOff] = useState({});
  const on = (k) => !off[k];
  const count = rows.filter((r) => r.required || on(r.k)).length;

  const save = () => {
    const saved = downloadContact(new Set(Object.keys(off).filter((k) => off[k])));
    onSaved(saved);
    onClose();
  };

  const btn = { height: 48, borderRadius: radius, font: "600 15px 'Inter',sans-serif", cursor: 'pointer' };
  return (
    <Sheet open={open} onClose={onClose} bg={T.surface} label="Save contact">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px 12px', color: T.text, fontFamily: "'Inter',sans-serif" }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ font: "700 19px/1.25 'Inter'", overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            Save {CARD.fullName}
          </div>
          <div style={{ fontSize: 13, color: T.muted }}>
            {count} of {rows.length} details will be saved
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ width: 44, height: 44, borderRadius: 12, border: 'none', background: T.tint, color: T.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px', borderTop: `1px solid ${T.border}`, color: T.text, fontFamily: "'Inter',sans-serif" }}>
        {rows.map((r) => {
          const checked = r.required || on(r.k);
          return (
            <label
              key={r.k}
              style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '6px 8px', borderBottom: `1px solid ${T.border}`, cursor: r.required ? 'default' : 'pointer', opacity: checked ? 1 : 0.6 }}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={r.required}
                onChange={() => setOff((o) => ({ ...o, [r.k]: !o[r.k] }))}
                style={{ width: 22, height: 22, accentColor: T.primaryFill, flex: '0 0 auto', margin: 0 }}
              />
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ font: "600 14px 'Inter'" }}>
                  {r.label}
                  {r.required ? ' (required)' : ''}
                </span>
                <span style={{ fontSize: 13, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.value}</span>
              </span>
            </label>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '12px 20px 20px', borderTop: `1px solid ${T.border}` }}>
        <button type="button" onClick={onClose} style={{ ...btn, flex: 1, background: 'transparent', color: T.primaryText, border: `1.5px solid ${T.border}` }}>
          Cancel
        </button>
        <button type="button" onClick={save} className="wc-press" style={{ ...btn, flex: 1.7, border: 'none', background: T.primaryFill, color: T.onPrimary }}>
          Save to Contacts
        </button>
      </div>
    </Sheet>
  );
}
