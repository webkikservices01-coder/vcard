import { memo, useEffect, useRef, useState } from 'react';
import { TEMPLATES, TemplateView } from '../WebCard.jsx';
import { TEMPLATE_META, TEMPLATE_FILTERS } from '../templates/TemplatePicker.jsx';
import { templateInfo } from '../theme/themeTree.js';

// Template picker from the upstream template kit: every thumbnail is the real template, with the
// owner's own card data, rendered at 390px and scaled down. Each has its 5 palettes underneath,
// and the Light/Dark switch recolours them all.

// Thumbnails are full templates, so they mount one at a time when the browser is idle
// instead of all at once (which froze the page for a moment).
const queue = [];
let running = false;
const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 400 }) : setTimeout(fn, 60));
function mountNext() {
  const next = queue.shift();
  if (!next) {
    running = false;
    return;
  }
  next();
  queue.shift()?.();
  idle(mountNext);
}
const enqueueMount = (fn) => {
  queue.push(fn);
  if (!running) {
    running = true;
    idle(mountNext);
  }
};

// Real template, scaled into the thumbnail box. Mounted only once it scrolls near the screen.
// Memoised: picking a template re-renders only the thumbnails whose palette or mode changed.
export const LiveThumb = memo(function LiveThumb({ template, palette, mode, height = 300 }) {
  const box = useRef(null);
  const [w, setW] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = box.current;
    let alive = true;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        enqueueMount(() => alive && setSeen(true));
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => {
      alive = false;
      ro.disconnect();
      io.disconnect();
    };
  }, []);
  const s = w / 390;
  const info = templateInfo(template);
  const bg = info.palettes[palette][mode || info.native].bg;
  return (
    <div ref={box} style={{ position: 'relative', height, borderRadius: 14, overflow: 'hidden', background: bg, transform: 'translateZ(0)' }}>
      {seen && w > 0 && (
        <div
          inert
          aria-hidden="true"
          className="wc-thumb"
          style={{ position: 'absolute', top: 0, left: 0, width: 390, height: height / s, transform: `scale(${s})`, transformOrigin: '0 0', pointerEvents: 'none', overflow: 'hidden', animation: 'wcThumbIn .35s ease-out' }}
        >
          <TemplateView template={template} palette={palette} mode={mode} />
        </div>
      )}
    </div>
  );
});

/**
 * value: { template, palette, mode } where mode '' = the template's own mode.
 * onChange(next): called with the new { template, palette, mode } when a thumbnail or swatch is tapped.
 * allowed: template ids the owner's plan unlocks (others still preview, with a 🔒 badge); null = all.
 */
export default function LiveTemplatePicker({ value, onChange, dark = false, allowed = null }) {
  const [filter, setFilter] = useState('All');
  // Light/Dark for all thumbnails; starts on the chosen template's look.
  const [mode, setMode] = useState(() => value.mode || templateInfo(value.template)?.native || 'light');
  // Palette shown on each thumbnail (the chosen one keeps the saved palette).
  const [pal, setPal] = useState(() => TEMPLATES.map((t) => (t.id === value.template ? value.palette : 0)));

  const fg = dark ? '#F5F2F4' : '#1A1A1A';
  const muted = dark ? '#B7AEB5' : '#5C5C66';
  const pick = (id, palette, m = mode) => onChange({ template: id, palette, mode: m === templateInfo(id).native ? '' : m });
  const switchMode = (m) => {
    setMode(m);
    pick(value.template, value.palette, m);
  };

  const chip = (on) => ({
    flex: '0 0 auto',
    height: 36,
    padding: '0 14px',
    borderRadius: 999,
    font: "600 13px 'Inter',sans-serif",
    cursor: 'pointer',
    border: `1px solid ${on ? '#ED2460' : dark ? 'rgba(255,255,255,.15)' : '#D4D4DA'}`,
    background: on ? '#ED2460' : 'transparent',
    color: on ? '#FFFFFF' : fg,
  });
  const list = TEMPLATES.map((t, i) => ({ t, i, meta: TEMPLATE_META.find((m) => m.id === t.id) || {} })).filter(
    ({ meta }) => filter === 'All' || (meta.tags || []).includes(filter)
  );

  return (
    <div style={{ color: fg, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ font: "700 18px/1.2 'Poppins',sans-serif" }}>Choose your template</div>
          <div style={{ fontSize: 13, color: muted }}>10 templates · 5 colours each · tap to preview</div>
        </div>
        <div style={{ display: 'flex', padding: 3, borderRadius: 12, background: dark ? 'rgba(255,255,255,.08)' : '#F0F0F3' }}>
          {['light', 'dark'].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => switchMode(m)}
              style={{
                height: 36,
                padding: '0 14px',
                borderRadius: 10,
                border: 'none',
                font: "600 13px 'Inter'",
                cursor: 'pointer',
                textTransform: 'capitalize',
                color: mode === m ? '#1A1A1A' : fg,
                background: mode === m ? '#FFFFFF' : 'transparent',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,.15)' : 'none',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 0 14px', scrollbarWidth: 'none' }}>
        {TEMPLATE_FILTERS.map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} style={chip(f === filter)}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '20px 14px' }}>
        {list.map(({ t, i, meta }) => {
          const info = templateInfo(t.id);
          const chosen = value.template === t.id;
          return (
            <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
              <button
                type="button"
                onClick={() => pick(t.id, pal[i])}
                aria-label={`Preview ${t.name}`}
                aria-pressed={chosen}
                style={{ position: 'relative', padding: 3, border: `2px solid ${chosen ? '#ED2460' : 'transparent'}`, borderRadius: 18, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
              >
                <LiveThumb template={t.id} palette={pal[i]} mode={mode} />
                {allowed && !allowed.includes(t.id) ? (
                  <span style={{ position: 'absolute', top: 10, right: 10, height: 20, padding: '0 7px', borderRadius: 999, background: 'rgba(0,0,0,.75)', color: '#FFFFFF', font: "700 10px/20px 'Inter'" }}>
                    🔒 {allowed.length >= 3 ? 'AI AGENT PRO' : 'UPGRADE'}
                  </span>
                ) : (
                  meta.badge && (
                    <span style={{ position: 'absolute', top: 10, right: 10, height: 20, padding: '0 7px', borderRadius: 999, background: '#14141A', color: '#FFFFFF', font: "700 10px/20px 'Inter'" }}>
                      {meta.badge}
                    </span>
                  )
                )}
              </button>
              <div style={{ font: "600 14px/1.2 'Poppins',sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
              <div style={{ fontSize: 12, lineHeight: 1.35, color: muted, minHeight: 32 }}>{meta.mood}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                {info.palettes.map((p, j) => (
                  <button
                    key={p.name}
                    type="button"
                    title={p.name}
                    aria-label={`${t.name}: ${p.name}`}
                    aria-pressed={pal[i] === j}
                    onClick={() => {
                      setPal((a) => {
                        const n = a.slice();
                        n[i] = j;
                        return n;
                      });
                      pick(t.id, j);
                    }}
                    style={{ width: 32, height: 40, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: p.swatch,
                        boxShadow: pal[i] === j ? `0 0 0 2px ${dark ? '#14141A' : '#FFFFFF'}, 0 0 0 4px ${dark ? '#FFFFFF' : '#14141A'}` : '0 0 0 1px rgba(0,0,0,.15)',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {list.length === 0 && <p style={{ fontSize: 14, color: muted, textAlign: 'center' }}>No templates in this filter.</p>}
    </div>
  );
}
