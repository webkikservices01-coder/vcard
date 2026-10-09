// Backdrops for the occasion designs, drawn as SVG in code (a few KB, nothing to download):
// a soft gradient with bokeh plus a motif — string lights, stars, confetti, petals, a mandala
// or Holi colour clouds — and a thin gold frame. Returned as a data: URL for <img> / CSS.
export type SceneKind = "lights" | "stars" | "confetti" | "petals" | "mandala" | "colours";
export interface SceneColors {
  bg1: string; // bottom
  bg2: string; // top
  gold: string;
  accent: string;
  extra?: string[];
}

const W = 900;
const H = 1200;

// Same picture every time (seeded), so thumbnails don't change between renders.
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

export function scene(kind: SceneKind, c: SceneColors, seed = 7): string {
  const r = rng(seed);
  const cols = [c.gold, c.accent, ...(c.extra || [])];
  const pick = () => cols[Math.floor(r() * cols.length)];
  const parts: string[] = [];

  // bokeh
  for (let i = 0; i < 26; i++) {
    parts.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(12 + r() * 60).toFixed(0)}" fill="${pick()}" opacity="${(0.06 + r() * 0.16).toFixed(2)}"/>`);
  }

  if (kind === "lights") {
    for (let row = 0; row < 3; row++) {
      const y0 = 40 + row * 120;
      const sag = 90 + row * 20;
      parts.push(`<path d="M-20 ${y0} Q${W / 2} ${y0 + sag * 2} ${W + 20} ${y0}" fill="none" stroke="${c.gold}" stroke-opacity=".5" stroke-width="2"/>`);
      for (let i = 1; i < 18; i++) {
        const t = i / 18;
        const x = -20 + (W + 40) * t;
        const y = y0 + 2 * sag * 2 * t * (1 - t);
        const col = row === 1 ? c.accent : c.gold;
        parts.push(`<circle cx="${x.toFixed(0)}" cy="${(y + 8).toFixed(0)}" r="22" fill="url(#glow)" opacity=".8"/><circle cx="${x.toFixed(0)}" cy="${(y + 8).toFixed(0)}" r="6" fill="${col}"/>`);
      }
    }
  }
  if (kind === "stars") {
    for (let i = 0; i < 90; i++) {
      parts.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H * 0.8).toFixed(0)}" r="${(0.8 + r() * 2.2).toFixed(1)}" fill="#fff" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`);
    }
    for (let i = 0; i < 9; i++) {
      const x = r() * W;
      const y = r() * H * 0.7;
      const s = 8 + r() * 14;
      parts.push(`<path d="M${x} ${y - s}L${x + s * 0.25} ${y - s * 0.25}L${x + s} ${y}L${x + s * 0.25} ${y + s * 0.25}L${x} ${y + s}L${x - s * 0.25} ${y + s * 0.25}L${x - s} ${y}L${x - s * 0.25} ${y - s * 0.25}Z" fill="${c.gold}" opacity=".85"/>`);
    }
  }
  if (kind === "confetti") {
    for (let i = 0; i < 90; i++) {
      const x = r() * W;
      const y = r() * H;
      parts.push(`<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${(8 + r() * 10).toFixed(0)}" height="${(4 + r() * 6).toFixed(0)}" rx="2" fill="${pick()}" opacity="${(0.45 + r() * 0.5).toFixed(2)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`);
    }
  }
  if (kind === "petals") {
    for (let i = 0; i < 46; i++) {
      const x = r() * W;
      const y = r() * H;
      parts.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(7 + r() * 8).toFixed(0)}" ry="${(14 + r() * 10).toFixed(0)}" fill="${pick()}" opacity="${(0.35 + r() * 0.45).toFixed(2)}" transform="rotate(${(r() * 360).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`);
    }
  }
  if (kind === "mandala") {
    const ring = (cx: number, cy: number, rad: number, n: number, rx: number, ry: number, col: string, op: number) => {
      for (let i = 0; i < n; i++) {
        parts.push(`<ellipse cx="${cx}" cy="${cy - rad}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}" transform="rotate(${((360 / n) * i).toFixed(1)} ${cx} ${cy})"/>`);
      }
    };
    for (const [cx, cy, k] of [[W / 2, H + 40, 1.6], [0, 0, 1], [W, 0, 1]] as const) {
      ring(cx, cy, 300 * k, 28, 18 * k, 46 * k, c.gold, 0.22);
      ring(cx, cy, 210 * k, 20, 16 * k, 34 * k, c.accent, 0.25);
      ring(cx, cy, 130 * k, 14, 12 * k, 26 * k, c.gold, 0.3);
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${360 * k}" fill="none" stroke="${c.gold}" stroke-opacity=".3" stroke-width="3" stroke-dasharray="2 14" stroke-linecap="round"/>`);
    }
  }
  if (kind === "colours") {
    for (let i = 0; i < 16; i++) {
      parts.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(90 + r() * 170).toFixed(0)}" fill="${pick()}" opacity="${(0.35 + r() * 0.3).toFixed(2)}" filter="url(#soft)"/>`);
    }
    for (let i = 0; i < 70; i++) {
      parts.push(`<circle cx="${(r() * W).toFixed(0)}" cy="${(r() * H).toFixed(0)}" r="${(2 + r() * 7).toFixed(1)}" fill="${pick()}" opacity=".8"/>`);
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.bg2}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient><radialGradient id="hl" cx="50%" cy="42%" r="60%"><stop offset="0" stop-color="${c.gold}" stop-opacity=".32"/><stop offset="1" stop-color="${c.gold}" stop-opacity="0"/></radialGradient><radialGradient id="glow"><stop offset="0" stop-color="#fff6c8" stop-opacity=".9"/><stop offset="1" stop-color="${c.gold}" stop-opacity="0"/></radialGradient><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter></defs><rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#hl)"/>${parts.join("")}<rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${c.gold}" stroke-opacity=".55" stroke-width="2"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${c.gold}" stroke-opacity=".3" stroke-width="1"/></svg>`;
  // Brackets and quotes encoded too, so the URL also works unquoted inside CSS url(…).
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg).replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/'/g, "%27");
}
