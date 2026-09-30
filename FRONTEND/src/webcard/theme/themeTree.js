// Re-colours a template's rendered tree for any of its 5 palettes, in light or dark.
// Palette 1 in the template's native mode = the original design, untouched.
import React from 'react';
import PALETTES from './palettes.js';
import PSEUDO from './pseudo.js';

// Native colours of each template (from the original design) – used as the mapping reference.
export const META = {
  'aurora-ai':            { pfx: 'a', bg: '#0B0B14', text: '#F5F5FA', roles: ['#7C5CFF', '#22D3EE', '#7C5CFF', '#22D3EE'] },
  'minimal-pro':          { pfx: 'a', bg: '#FFFFFF', text: '#0F172A', roles: ['#0F172A', '#2563EB', '#2563EB', '#60A5FA'] },
  'neo-brutal':           { pfx: 'a', bg: '#FFF4E0', text: '#111111', roles: ['#FF5C39', '#FFD23F', '#FFD23F', '#3DDC97'] },
  'luxe-noir':            { pfx: 'b', bg: '#0A0A0A', text: '#EDE6D6', roles: ['#C9A45C', '#C9A45C', '#C9A45C', '#EDE6D6'] },
  'split-hero-corporate': { pfx: 'b', bg: '#F6F8FB', text: '#0B1B2B', roles: ['#0E7C66', '#0B1B2B', '#0E7C66', '#22B893'] },
  'soft-bento-wellness':  { pfx: 'b', bg: '#FBF7F4', text: '#2B2B2B', roles: ['#3AA17E', '#E8A1A1', '#9FDCC4', '#C6CCF6'] },
  'creator-reel':         { pfx: 'c', bg: '#0D0D0D', text: '#FFFFFF', roles: ['#FF3D77', '#FF9A3D', '#FF3D77', '#FF9A3D'] },
  'dev-terminal':         { pfx: 'd', bg: '#0D1117', text: '#E6EDF3', roles: ['#3FB950', '#58A6FF', '#3FB950', '#58A6FF'] },
  'editorial-architect':  { pfx: 'e', bg: '#F4F1EC', text: '#1C1C1C', roles: ['#B5573B', '#1C1C1C', '#B5573B', '#D9A35E'] },
  'webkik-signature':     { pfx: 'g', bg: '#FFFFFF', text: '#1A1A1A', roles: ['#ED2460', '#14141A', '#ED2460', '#FF8FB1'] },
};

export const templateInfo = (id) => PALETTES.find((t) => t.id === id);
export const tokensFor = (id, p = 0, mode) => {
  const t = templateInfo(id); const m = mode || t.native;
  return t.palettes[p][m];
};

/* ---------- colour maths ---------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
function parse(c) {
  c = c.trim();
  if (c[0] === '#') {
    let h = c.slice(1);
    if (h.length === 3 || h.length === 4) h = h.split('').map((x) => x + x).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
  }
  const m = c.match(/rgba?\(([^)]+)\)/i); if (!m) return null;
  const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p[3] == null ? 1 : p[3] };
}
const fmt = ({ r, g, b, a }) => a >= 1 ? '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()
  : `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${+a.toFixed(3)})`;
function toHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; let h = 0, s = 0; const d = mx - mn;
  if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return { h, s, l, c: d };
}
function fromHsl(h, s, l, a = 1) {
  h = ((h % 360) + 360) % 360; const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255, a };
}
const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const mixRgb = (a, b, t) => ({ r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t, a: 1 });
const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/* ---------- theme ---------- */
const THEMES = new Map();
export function buildTheme(id, p = 0, mode) {
  const info = templateInfo(id); const M = META[id];
  if (!info || !M) return null;
  const m = mode || info.native;
  if (p === 0 && m === info.native) return null; // original design
  const key = `${id}-${p}-${m}`;
  if (THEMES.has(key)) return THEMES.get(key);
  const T = info.palettes[p][m];
  const H = (c) => toHsl(parse(c));
  const th = {
    key, pfx: M.pfx, cache: new Map(),
    nBg: H(M.bg), nText: H(M.text), nRoles: M.roles.map(H),
    tBg: H(T.bg), tText: H(T.text), tRoles: [T.primary, T.secondary, T.aiA, T.aiB].map(H),
    tBgRgb: parse(T.bg),
  };
  th.map = (c) => mapColor(th, c);
  THEMES.set(key, th);
  injectPseudo(th);
  return th;
}

function neutralL(th, l) {
  const span = th.nText.l - th.nBg.l || 1e-6;
  const t = (l - th.nBg.l) / span;
  return { t, l: clamp(th.tBg.l + t * (th.tText.l - th.tBg.l)) };
}
function mapColor(th, str) {
  if (th.cache.has(str)) return th.cache.get(str);
  const rgb = parse(str); if (!rgb) return str;
  const h = toHsl(rgb); let out;
  if (h.c < 0.05) {
    const { t, l } = neutralL(th, h.l); const ref = t < 0.5 ? th.tBg : th.tText;
    out = fromHsl(ref.h, Math.min(ref.s, 0.25), l, rgb.a);
  } else {
    let best = -1, bd = 999;
    th.nRoles.forEach((r, i) => { if (r.c < 0.05) return; const d = hueDist(h.h, r.h); if (d < bd) { bd = d; best = i; } });
    if (best < 0 || bd > 40) { out = rgb; } // functional colours (WhatsApp green, stars, errors) stay
    else {
      const nr = th.nRoles[best], tr = th.tRoles[best];
      const s = clamp(h.s * (tr.s / Math.max(nr.s, 0.05)));
      const l = h.l > 0.85 || h.l < 0.15 ? neutralL(th, h.l).l : clamp(h.l + (tr.l - nr.l));
      out = fromHsl(h.h + (tr.h - nr.h), s, l, rgb.a);
    }
  }
  const res = fmt(out); th.cache.set(str, res); return res;
}
const COLOR_RE = /#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/g;
const mapStr = (th, s) => s.replace(COLOR_RE, (c) => th.map(c));

function firstColor(v) { if (typeof v !== 'string') return null; const m = v.match(COLOR_RE); return m ? parse(m[0]) : null; }
function fixContrast(fg, bg) {
  if (ratio(fg, bg) >= 4.5) return null;
  const toward = (tgt) => { let c = fg; for (let i = 0; i < 20 && ratio(c, bg) < 4.5; i++) c = mixRgb(c, tgt, 0.12); return c; };
  const w = toward({ r: 255, g: 255, b: 255, a: 1 }), k = toward({ r: 0, g: 0, b: 0, a: 1 });
  return fmt(ratio(w, bg) >= ratio(k, bg) ? w : k);
}

function themeStyle(th, style, ctx) {
  const s = {};
  for (const k in style) { const v = style[k]; s[k] = typeof v === 'string' ? mapStr(th, v) : v; }
  const bgRaw = s.background || s.backgroundColor || s.backgroundImage;
  const bc = firstColor(bgRaw);
  let bg = ctx.bg;
  if (bc && bc.a >= 0.6) bg = over(bc, ctx.bg);
  let color = ctx.color;
  if (typeof s.color === 'string') { const c = parse(s.color); if (c) color = c; }
  if (color && bg) {
    const eff = color.a < 1 ? over(color, bg) : color;
    const fixed = fixContrast(eff, bg);
    if (fixed) { s.color = fixed; color = parse(fixed); }
  }
  return { s, ctx: { bg, color } };
}

function walk(th, node, ctx) {
  if (Array.isArray(node)) return node.map((n) => walk(th, n, ctx));
  if (!React.isValidElement(node)) return node;
  const props = node.props || {};
  const next = {};
  let cctx = ctx;
  if (props.style) { const r = themeStyle(th, props.style, ctx); next.style = r.s; cctx = r.ctx; }
  // Aicardly: style objects handed to runtime components (EnquiryForm fieldStyle/buttonStyle...).
  for (const k in props) {
    if (k !== 'style' && /Style$/.test(k) && props[k] && typeof props[k] === 'object') next[k] = themeStyle(th, props[k], cctx).s;
  }
  const html = props.dangerouslySetInnerHTML;
  if (html && typeof html.__html === 'string') {
    if (html.__html.includes('crispEdges')) next.style = { ...(next.style || props.style), background: '#FFFFFF', boxShadow: '0 0 0 6px #FFFFFF' }; // keep QR scannable
    else next.dangerouslySetInnerHTML = { __html: mapStr(th, html.__html) };
  }
  if (props.children !== undefined) next.children = walk(th, props.children, cctx);
  // Aicardly: upstream cleared data-wct here, which also removed it from the root and stopped the
  // palette's hover/pressed rules (injectPseudo) from matching. Only the root carries it anyway.
  return React.cloneElement(node, next);
}

export function themeTree(th, el) {
  if (!th) return el;
  const root = React.cloneElement(el, { 'data-wct': th.key });
  const bg = parse(firstColor(el.props.style && (el.props.style.background || el.props.style.backgroundColor)) ? fmt(firstColor(el.props.style.background || el.props.style.backgroundColor)) : '#FFFFFF');
  const start = { bg: parse(th.map(fmt(bg))), color: parse(th.map(el.props.style && el.props.style.color || '#111111')) };
  return walk(th, root, start);
}

function injectPseudo(th) {
  if (typeof document === 'undefined') return;
  const id = 'wct-' + th.key; if (document.getElementById(id)) return;
  const rules = (PSEUDO[th.pfx] || []).map(([cls, pseudo, decl]) => `[data-wct="${th.key}"] .${cls}${pseudo}{${mapStr(th, decl)}}`).join('\n');
  const el = document.createElement('style'); el.id = id; el.textContent = rules; document.head.appendChild(el);
}
