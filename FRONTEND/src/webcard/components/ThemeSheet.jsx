import { useState } from 'react';
import { Sheet } from './Sheet.jsx';
import { templateInfo } from '../theme/themeTree.js';

// Theme controls from the upstream template kit: the template's 5 palettes, Light/Dark and the
// live visitor counter switch. value = { template, palette, mode ('' = template's own), counter }.
export function ThemeControls({ value, onChange, dark = false }) {
  const info = templateInfo(value.template);
  if (!info) return null;
  const mode = value.mode || info.native;
  const fg = dark ? '#F5F2F4' : '#1A1A1A';
  const muted = dark ? '#B7AEB5' : '#5C5C66';
  const set = (patch) => onChange({ ...value, ...patch });
  const seg = (on) => ({
    height: 38,
    padding: '0 16px',
    borderRadius: 10,
    border: 'none',
    font: "600 14px 'Inter'",
    cursor: 'pointer',
    color: on ? '#1A1A1A' : fg,
    background: on ? '#FFFFFF' : 'transparent',
    boxShadow: on ? '0 1px 3px rgba(0,0,0,.15)' : 'none',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: fg, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {info.palettes.map((p, j) => (
          <button
            key={p.name}
            type="button"
            aria-pressed={j === value.palette}
            onClick={() => set({ palette: j })}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '4px 0', minHeight: 44, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: p.swatch,
                boxShadow: j === value.palette ? `0 0 0 3px ${dark ? '#14141A' : '#FFFFFF'}, 0 0 0 5px ${dark ? '#FFFFFF' : '#14141A'}` : '0 0 0 1px rgba(0,0,0,.12)',
              }}
            />
            <span style={{ font: "500 11px/1.25 'Inter'", color: j === value.palette ? fg : muted, textAlign: 'center' }}>{p.name}</span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ font: "600 15px 'Inter'" }}>Appearance</span>
        <div style={{ display: 'flex', padding: 3, borderRadius: 12, background: dark ? 'rgba(255,255,255,.08)' : '#F0F0F3' }}>
          {['light', 'dark'].map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => set({ mode: m === info.native ? '' : m })} style={seg(mode === m)}>
              {m === 'light' ? 'Light' : 'Dark'}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value.counter}
        onClick={() => set({ counter: !value.counter })}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', textAlign: 'left', color: fg }}
      >
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ font: "600 15px 'Inter'" }}>Show live visitor counter</span>
          <span style={{ fontSize: 13, color: muted }}>“12 viewing now” on the cover</span>
        </span>
        <span style={{ width: 48, height: 28, borderRadius: 999, background: value.counter ? '#15803D' : '#C4C4CC', position: 'relative', flex: '0 0 auto' }}>
          <span
            style={{ position: 'absolute', top: 3, left: value.counter ? 23 : 3, width: 22, height: 22, borderRadius: '50%', background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transition: 'left 200ms ease-out' }}
          />
        </span>
      </button>
    </div>
  );
}

// Bottom sheet for the owner on their own live card: preview while choosing, Apply to save.
export default function ThemeSheet({ open, onClose, value, onPreview, onApply, onChangeTemplate, saving }) {
  const [d, setD] = useState(value);
  // Start from the saved look each time the sheet opens.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setD(value);
  }
  const info = templateInfo(d.template);
  const change = (n) => {
    setD(n);
    onPreview && onPreview(n);
  };
  const cancel = () => {
    onPreview && onPreview(value);
    onClose();
  };
  return (
    <Sheet open={open} onClose={cancel} bg="#FFFFFF" label="Theme">
      <div style={{ padding: '10px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16, color: '#1A1A1A', fontFamily: "'Inter',sans-serif", overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: "700 20px 'Poppins',sans-serif" }}>Theme</div>
            <div style={{ fontSize: 14, color: '#5C5C66', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {info?.name} · {info?.palettes[d.palette]?.name}
            </div>
          </div>
          <button
            type="button"
            onClick={onChangeTemplate}
            style={{ height: 44, padding: '0 14px', borderRadius: 12, border: '1px solid #D4D4DA', background: '#FFFFFF', font: "600 14px 'Inter'", cursor: 'pointer', color: '#1A1A1A', flex: '0 0 auto' }}
          >
            Change template
          </button>
        </div>
        <ThemeControls value={d} onChange={change} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={cancel} style={{ flex: 1, height: 48, borderRadius: 14, border: '1px solid #D4D4DA', background: '#FFFFFF', color: '#1A1A1A', font: "600 15px 'Inter'", cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            type="button"
            className="wc-press"
            disabled={saving}
            onClick={() => onApply(d)}
            style={{ flex: 1.7, height: 48, borderRadius: 14, border: 'none', background: '#14141A', color: '#FFFFFF', font: "600 15px 'Inter'", cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Saving…' : 'Apply'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
