// Colour maths used to sanity-check AI-generated card themes so they are always readable.

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const normHex = (v) => {
  if (typeof v !== 'string') return null;
  const m = v.trim().match(HEX);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1];
  return `#${h.toUpperCase()}`;
};

const toRgb = (h) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));

const luminance = (h) => {
  const [r, g, b] = toRgb(h).map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

const mix = (a, b, t) => {
  const A = toRgb(a);
  const B = toRgb(b);
  return `#${A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
};

// Nudge `color` toward black/white (whichever moves away from `against`) until it reaches `min` contrast.
const ensureContrast = (color, against, min) => {
  if (contrast(color, against) >= min) return color;
  const target = luminance(against) > 0.5 ? '#000000' : '#FFFFFF';
  for (let t = 0.1; t <= 1.0001; t += 0.1) {
    const c = mix(color, target, t);
    if (contrast(c, against) >= min) return c;
  }
  return target;
};

const THEME_KEYS = ['bg', 'cardBg', 'accent', 'linkBg', 'text', 'subTextColor'];

// Validates the model's colours (falling back to `fallback`) and enforces readability + separation.
const fixTheme = (raw, fallback) => {
  const t = {};
  for (const k of THEME_KEYS) t[k] = normHex(raw?.[k]) || normHex(fallback?.[k]);
  if (THEME_KEYS.some(k => !t[k])) return null;

  // Card surface must be visibly distinct from the page background.
  if (contrast(t.bg, t.cardBg) < 1.08) {
    t.cardBg = mix(t.cardBg, luminance(t.bg) < 0.5 ? '#FFFFFF' : '#000000', 0.09);
  }
  t.text = ensureContrast(ensureContrast(t.text, t.cardBg, 4.5), t.bg, 4.5);
  t.subTextColor = ensureContrast(t.subTextColor, t.cardBg, 4.5);
  t.accent = ensureContrast(t.accent, t.cardBg, 3);
  t.linkBg = ensureContrast(t.linkBg, t.text, 3.5);
  return t;
};

module.exports = { normHex, fixTheme, THEME_KEYS };
