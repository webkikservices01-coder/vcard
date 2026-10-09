import { useId, type ReactNode } from "react";

/* =========================================================
   OccasionArt — the animated illustration in the hero of non-wedding invites (SVG, nothing to
   load): engagement rings, a roka thali, anniversary hearts, a birthday cake, milestone
   balloons, Diwali diyas, a rangoli, a Griha Pravesh home, a baby cradle on the moon, Holi
   colours, an Eid crescent and New Year fireworks. Colours come from the invite's palette.
   ========================================================= */

export type ArtKind =
  | "rings" | "roka" | "anniversary" | "cake" | "milestone" | "diya" | "rangoli"
  | "home" | "cradle" | "holi" | "crescent" | "fireworks";

const GOLD = "var(--wt-gold)";
const GOLD_LITE = "var(--wt-gold-lite)";
const ACCENT = "var(--wt-accent)";
const DEEP = "var(--wt-accent-deep)";

export function OccasionArt({ kind, label = "", size = 320, className = "" }: { kind: ArtKind; label?: string; size?: number; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const g = (n: string) => `${n}-${uid}`;
  const art: Record<ArtKind, () => ReactNode> = {
    rings: () => <Rings g={g} />,
    roka: () => <Roka g={g} />,
    anniversary: () => <Anniversary g={g} />,
    cake: () => <Cake g={g} />,
    milestone: () => <Milestone g={g} label={label} />,
    diya: () => <Diyas g={g} />,
    rangoli: () => <Rangoli g={g} />,
    home: () => <Home g={g} />,
    cradle: () => <Cradle g={g} />,
    holi: () => <Holi g={g} />,
    crescent: () => <Crescent g={g} />,
    fireworks: () => <Fireworks g={g} />,
  };
  return (
    <svg viewBox="0 0 320 320" width={size} height={size} className={`wt-occ ${className}`} role="img" aria-label={`${kind} illustration`}>
      <defs>
        <radialGradient id={g("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={GOLD_LITE} stopOpacity=".5" />
          <stop offset=".6" stopColor={GOLD} stopOpacity=".12" />
          <stop offset="1" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={g("gold")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset=".35" stopColor={GOLD_LITE} />
          <stop offset=".7" stopColor={GOLD} />
          <stop offset="1" stopColor="#8a5a12" />
        </linearGradient>
        <radialGradient id={g("flame")} cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset=".45" stopColor="#ffd34d" />
          <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill={`url(#${g("halo")})`} />
      <g className="wt-couple-ring" style={{ transformOrigin: "160px 160px" }}>
        <circle cx="160" cy="160" r="140" fill="none" stroke={GOLD} strokeOpacity=".45" strokeWidth="1.2" strokeDasharray="2 7" />
      </g>
      {art[kind]?.()}
      <Sparkles />
    </svg>
  );
}

type G = { g: (n: string) => string };

function Sparkles() {
  const pts = [[48, 70], [272, 84], [40, 214], [282, 230], [160, 22], [96, 292], [232, 296]];
  return (
    <g>
      {pts.map(([x, y], i) => (
        <path key={i} className="oa-twinkle" style={{ animationDelay: `${i * 0.45}s`, transformOrigin: `${x}px ${y}px` }} d={`M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z`} fill={GOLD_LITE} />
      ))}
    </g>
  );
}

const Flame = ({ x, y, s = 1, g, d = 0 }: { x: number; y: number; s?: number; d?: number } & G) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r="22" cy="-10" fill={`url(#${g("flame")})`} opacity=".55" className="oa-glow" style={{ animationDelay: `${d}s` }} />
    <path className="oa-flicker" style={{ animationDelay: `${d}s`, transformOrigin: "0 0" }} d="M0 0 C-7 -6 -6 -16 0 -26 C6 -16 7 -6 0 0 Z" fill="#ffb21f" />
    <path className="oa-flicker" style={{ animationDelay: `${d + 0.2}s`, transformOrigin: "0 0" }} d="M0 -2 C-3.5 -6 -3 -12 0 -18 C3 -12 3.5 -6 0 -2 Z" fill="#fff4c2" />
  </g>
);

const Diya = ({ x, y, s = 1, g, d = 0 }: { x: number; y: number; s?: number; d?: number } & G) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-34 0 C-30 18 30 18 34 0 C24 -4 -24 -4 -34 0 Z" fill={`url(#${g("gold")})`} stroke="#7a4a0c" strokeWidth="1.2" />
    <path d="M30 -1 C38 -6 44 -6 46 -10 C42 -2 36 2 30 3 Z" fill={GOLD} />
    <path d="M-26 6 Q0 14 26 6" fill="none" stroke={DEEP} strokeWidth="2" strokeDasharray="1 5" strokeLinecap="round" />
    <ellipse cx="0" cy="-1" rx="27" ry="3.4" fill="#5a2d05" opacity=".5" />
    <Flame x={40} y={-8} s={0.9} g={g} d={d} />
  </g>
);

function Rings({ g }: G) {
  return (
    <g>
      <g className="oa-bob">
        <ellipse cx="128" cy="168" rx="52" ry="52" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="13" />
        <ellipse cx="192" cy="168" rx="52" ry="52" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="13" />
        <ellipse cx="128" cy="168" rx="52" ry="52" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeDasharray="30 300" className="oa-shine-stroke" />
        {/* the diamond */}
        <g transform="translate(192 112)">
          <path d="M-16 0 L-9 -11 L9 -11 L16 0 L0 20 Z" fill="#e9f7ff" stroke="#9cc7e8" strokeWidth="1.2" />
          <path d="M-16 0 H16 M-9 -11 L-4 0 L0 20 L4 0 L9 -11" fill="none" stroke="#9cc7e8" strokeWidth=".9" />
          <path className="oa-twinkle" style={{ transformOrigin: "10px -16px" }} d="M10 -26 L12 -18 L20 -16 L12 -14 L10 -6 L8 -14 L0 -16 L8 -18 Z" fill="#fff" />
        </g>
      </g>
      <Roses y={248} />
      <FloatHearts />
    </g>
  );
}

function Roses({ y }: { y: number }) {
  const rose = (x: number, s: number, c: string) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-26 6 C-30 -10 -6 -18 0 -4 C6 -18 30 -10 26 6" fill="#2f6b3a" opacity=".85" transform="translate(0 10)" />
      <circle r="16" fill={c} />
      <path d="M-9 -2 C-6 -12 8 -12 9 -2 C6 6 -6 6 -9 -2 Z M-4 -4 C-2 -8 4 -8 4 -3" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.6" />
    </g>
  );
  return (
    <g>
      {rose(112, 0.9, DEEP)}
      {rose(208, 0.9, DEEP)}
      {rose(160, 1.15, ACCENT)}
    </g>
  );
}

function FloatHearts() {
  return (
    <g>
      {[[70, 150, 0], [252, 140, 1.2], [96, 96, 2.1], [236, 210, 0.6]].map(([x, y, d], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(.7)`}>
          <path className="oa-heart-float" style={{ animationDelay: `${d}s` }} d="M0 6 C-14 -6 -6 -18 0 -9 C6 -18 14 -6 0 6 Z" fill={ACCENT} />
        </g>
      ))}
    </g>
  );
}

function Roka({ g }: G) {
  return (
    <g>
      <Garland y={34} />
      {/* thali */}
      <ellipse cx="160" cy="236" rx="104" ry="26" fill={`url(#${g("gold")})`} stroke="#7a4a0c" strokeWidth="1.5" />
      <ellipse cx="160" cy="230" rx="86" ry="17" fill="none" stroke={DEEP} strokeWidth="2.4" strokeDasharray="2 6" strokeLinecap="round" />
      {/* kalash with coconut */}
      <g transform="translate(108 206)">
        <path d="M-20 0 C-28 -26 -18 -40 0 -40 C18 -40 28 -26 20 0 Z" fill={`url(#${g("gold")})`} />
        <path d="M-14 -40 H14 L10 -48 H-10 Z" fill={GOLD} />
        {[-14, -5, 5, 14].map((x) => <path key={x} d={`M${x} -48 Q${x * 1.7} -64 ${x * 2.2} -58`} stroke="#2f7a3a" strokeWidth="5" fill="none" strokeLinecap="round" />)}
        <ellipse cy="-58" rx="12" ry="14" fill="#8a5a2b" />
        <path d="M-18 -20 H18" stroke={DEEP} strokeWidth="3" />
      </g>
      {/* rings on a velvet box */}
      <g transform="translate(196 172)"><g className="oa-bob">
        <rect x="-30" y="0" width="60" height="34" rx="6" fill={DEEP} />
        <path d="M-30 4 Q0 -22 30 4" fill={ACCENT} />
        <circle cx="-8" cy="-2" r="13" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="5" />
        <circle cx="10" cy="-2" r="13" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="5" />
        <path d="M10 -20 l4 5 l-4 5 l-4 -5 Z" fill="#e9f7ff" />
      </g></g>
      <Diya x={226} y={226} s={0.55} g={g} d={0.4} />
    </g>
  );
}

function Garland({ y }: { y: number }) {
  const strings = [40, 80, 120, 160, 200, 240, 280];
  return (
    <g className="oa-sway-slow" style={{ transformOrigin: `160px ${y}px` }}>
      <path d={`M10 ${y} Q160 ${y + 46} 310 ${y}`} fill="none" stroke="#2f7a3a" strokeWidth="3" />
      {Array.from({ length: 15 }, (_, i) => {
        const t = (i + 0.5) / 15;
        const x = 10 + 300 * t;
        const yy = y + 92 * t * (1 - t);
        return <circle key={i} cx={x} cy={yy} r="7" fill={i % 2 ? "#ff9f1c" : "#ffcf33"} stroke="#c2410c" strokeWidth=".8" />;
      })}
      {strings.map((x, i) => {
        const len = 22 + (i % 3) * 14;
        const tt = (x - 10) / 300;
        const top = y + 92 * tt * (1 - tt) + 6;
        return (
          <g key={x}>
            <line x1={x} y1={top} x2={x} y2={top + len} stroke="#2f7a3a" strokeWidth="1.2" />
            {Array.from({ length: 3 }, (_, j) => <circle key={j} cx={x} cy={top + 6 + j * (len / 3)} r="4.5" fill={j % 2 ? "#ffcf33" : "#ff9f1c"} />)}
          </g>
        );
      })}
    </g>
  );
}

function Anniversary({ g }: G) {
  return (
    <g>
      {/* laurel wreath */}
      {Array.from({ length: 22 }, (_, i) => {
        const side = i < 11 ? -1 : 1;
        const k = i % 11;
        const a = Math.PI / 2 + side * (0.35 + k * 0.22);
        const x = 160 + 112 * Math.cos(a);
        const y = 168 + 112 * Math.sin(a);
        return <ellipse key={i} cx={x} cy={y} rx="12" ry="5" fill={GOLD} opacity=".9" transform={`rotate(${(a * 180) / Math.PI + 90 * side} ${x} ${y})`} />;
      })}
      <g className="oa-bob">
        <path d="M128 200 C78 160 96 104 136 120 C150 126 156 138 158 148 C160 138 166 126 180 120 C220 104 238 160 188 200 L158 228 Z" fill={`url(#${g("gold")})`} opacity=".35" transform="translate(-24 -4)" />
        <path d="M150 206 C100 166 118 110 158 126 C172 132 178 144 180 154 C182 144 188 132 202 126 C242 110 260 166 210 206 L180 234 Z" fill={ACCENT} transform="translate(-34 -18)" />
        <path d="M150 206 C100 166 118 110 158 126 C172 132 178 144 180 154 C182 144 188 132 202 126 C242 110 260 166 210 206 L180 234 Z" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="6" transform="translate(-6 -6)" />
      </g>
      <FloatHearts />
    </g>
  );
}

function Balloon({ x, y, c, d = 0, children }: { x: number; y: number; c: string; d?: number; children?: ReactNode }) {
  return (
    <g className="oa-balloon" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y + 60}px` }}>
      <path d={`M${x} ${y + 34} q-6 20 4 40 q8 16 -2 34`} fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
      <ellipse cx={x} cy={y} rx="24" ry="30" fill={c} />
      <ellipse cx={x - 8} cy={y - 12} rx="6" ry="9" fill="#fff" opacity=".35" />
      <path d={`M${x - 4} ${y + 30} h8 l-4 6 Z`} fill={c} />
      {children}
    </g>
  );
}

function Cake({ g }: G) {
  return (
    <g>
      <Balloon x={60} y={86} c={ACCENT} />
      <Balloon x={262} y={78} c={GOLD} d={0.8} />
      <Balloon x={36} y={150} c={DEEP} d={1.5} />
      <Balloon x={284} y={150} c="#5ec4ff" d={0.4} />
      {/* bunting */}
      <path d="M20 26 Q160 70 300 26" fill="none" stroke={GOLD_LITE} strokeWidth="1.5" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const x = 20 + 280 * t;
        const y = 26 + 88 * t * (1 - t);
        return <path key={i} d={`M${x - 9} ${y} L${x + 9} ${y} L${x} ${y + 16} Z`} fill={[ACCENT, GOLD, "#5ec4ff"][i % 3]} />;
      })}
      {/* cake */}
      <ellipse cx="160" cy="276" rx="98" ry="12" fill="#000" opacity=".25" />
      <rect x="74" y="214" width="172" height="58" rx="10" fill="#fff4f8" />
      <path d="M74 226 q14 16 28 0 t28 0 t28 0 t28 0 t28 0 t28 0 v-6 h-168 Z" fill={ACCENT} />
      <rect x="98" y="170" width="124" height="46" rx="9" fill="#fff9ef" />
      <path d="M98 182 q15 14 31 0 t31 0 t31 0 t31 0 v-6 h-124 Z" fill={GOLD} />
      <rect x="122" y="136" width="76" height="36" rx="8" fill="#fff4f8" />
      <path d="M122 148 q12 12 25 0 t25 0 t26 0 v-6 h-76 Z" fill={DEEP} />
      {[86, 112, 138, 164, 190, 216, 242].map((x, i) => <circle key={x} cx={x - 2} cy={252} r="3.2" fill={[GOLD, ACCENT, "#5ec4ff"][i % 3]} />)}
      {[138, 160, 182].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y={110} width="6" height="26" rx="2" fill={i === 1 ? GOLD_LITE : "#ffd1e0"} />
          <Flame x={x} y={110} s={0.55} g={g} d={i * 0.3} />
        </g>
      ))}
      <Confetti />
    </g>
  );
}

function Confetti() {
  const cols = ["#ff7aa2", "#ffd34d", "#5ec4ff", "#8cf0b0", "#c49bff"];
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} className="oa-confetti" x={20 + ((i * 53) % 280)} y={-10} width="6" height="10" rx="1.5" fill={cols[i % 5]} style={{ animationDelay: `${(i * 0.37) % 4}s`, animationDuration: `${3.4 + (i % 4) * 0.6}s` }} />
      ))}
    </g>
  );
}

function Milestone({ g, label }: G & { label: string }) {
  const digits = (label.match(/\d/g) || []).slice(0, 3);
  const items = digits.length ? digits : ["★"];
  const w = 76;
  const x0 = 160 - ((items.length - 1) * w) / 2;
  return (
    <g>
      <Confetti />
      {items.map((d, i) => (
        <g key={i} className="oa-balloon" style={{ animationDelay: `${i * 0.5}s`, transformOrigin: `${x0 + i * w}px 220px` }}>
          <path d={`M${x0 + i * w} 196 q-8 30 4 60 q6 14 -2 34`} fill="none" stroke={GOLD_LITE} strokeWidth="1.2" />
          <text x={x0 + i * w} y={196} textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif" fontWeight="900" fontSize="128" fill={`url(#${g("gold")})`} stroke="#7a4a0c" strokeWidth="2">
            {d}
          </text>
        </g>
      ))}
      <g transform="translate(160 256)">
        <path d="M-40 0 L-30 -26 L-14 -8 L0 -32 L14 -8 L30 -26 L40 0 Z" fill={`url(#${g("gold")})`} stroke="#7a4a0c" strokeWidth="1.2" />
        <rect x="-40" y="0" width="80" height="10" rx="2" fill={GOLD} />
        {[-30, 0, 30].map((x) => <circle key={x} cx={x} cy={x === 0 ? -32 : -26} r="4" fill={ACCENT} />)}
      </g>
    </g>
  );
}

function Lantern({ x, y, len, g, d = 0, c = ACCENT }: { x: number; y: number; len: number; d?: number; c?: string } & G) {
  return (
    <g className="oa-sway-slow" style={{ animationDelay: `${d}s`, transformOrigin: `${x}px ${y}px` }}>
      <line x1={x} y1={y} x2={x} y2={y + len} stroke={GOLD_LITE} strokeWidth="1.2" />
      <g transform={`translate(${x} ${y + len})`}>
        <path d="M-8 0 H8 L12 6 H-12 Z" fill={GOLD} />
        <path d="M-14 6 C-20 22 -16 36 0 42 C16 36 20 22 14 6 Z" fill={c} opacity=".92" />
        <path d="M-6 8 C-9 22 -7 32 0 40 M6 8 C9 22 7 32 0 40" stroke={GOLD_LITE} strokeWidth="1" fill="none" />
        <circle cy="24" r="10" fill={`url(#${g("flame")})`} className="oa-glow" style={{ animationDelay: `${d}s` }} />
        <path d="M-6 42 H6 L0 56 Z" fill={GOLD} />
        <line y1="56" y2="70" stroke={GOLD} strokeWidth="1.2" />
      </g>
    </g>
  );
}

function Diyas({ g }: G) {
  return (
    <g>
      <Lantern x={58} y={0} len={60} g={g} />
      <Lantern x={262} y={0} len={44} g={g} d={0.7} c={GOLD} />
      <Lantern x={110} y={0} len={22} g={g} d={1.3} c={DEEP} />
      <Lantern x={210} y={0} len={30} g={g} d={0.3} c={DEEP} />
      {/* rangoli plate under the diyas */}
      <ellipse cx="160" cy="250" rx="118" ry="28" fill="none" stroke={ACCENT} strokeWidth="3" strokeDasharray="3 7" strokeLinecap="round" />
      <ellipse cx="160" cy="250" rx="96" ry="20" fill="none" stroke={GOLD} strokeWidth="2" />
      <Diya x={160} y={222} s={1.4} g={g} />
      <Diya x={88} y={250} s={0.85} g={g} d={0.5} />
      <Diya x={232} y={250} s={0.85} g={g} d={0.9} />
    </g>
  );
}

function Rangoli({ g }: G) {
  const ring = (n: number, r: number, rx: number, ry: number, c: string) =>
    Array.from({ length: n }, (_, i) => (
      <ellipse key={i} cx="160" cy={160 - r} rx={rx} ry={ry} fill={c} transform={`rotate(${(360 / n) * i} 160 160)`} />
    ));
  return (
    <g>
      <g className="oa-spin-slow" style={{ transformOrigin: "160px 160px" }}>
        {ring(16, 108, 10, 22, ACCENT)}
        {ring(16, 108, 4, 12, GOLD_LITE)}
        <circle cx="160" cy="160" r="88" fill="none" stroke={GOLD} strokeWidth="3" strokeDasharray="1 8" strokeLinecap="round" />
      </g>
      <g className="oa-spin-rev" style={{ transformOrigin: "160px 160px" }}>
        {ring(12, 70, 13, 20, DEEP)}
        {ring(12, 70, 5, 10, "#ffd34d")}
        {ring(24, 48, 3, 6, "#5ec4ff")}
      </g>
      <circle cx="160" cy="160" r="38" fill={`url(#${g("gold")})`} />
      <circle cx="160" cy="160" r="30" fill="none" stroke={DEEP} strokeWidth="2" strokeDasharray="2 4" />
      <Diya x={156} y={168} s={0.62} g={g} />
    </g>
  );
}

function Home({ g }: G) {
  return (
    <g>
      <g transform="translate(0 10)">
        <path d="M70 140 L160 70 L250 140" fill="none" stroke={`url(#${g("gold")})`} strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" />
        <rect x="88" y="136" width="144" height="126" rx="4" fill="#fff8ec" />
        <rect x="88" y="136" width="144" height="10" fill={GOLD} />
        {/* door */}
        <path d="M134 262 V196 Q160 170 186 196 V262 Z" fill={DEEP} />
        <path d="M160 180 V262" stroke={GOLD} strokeWidth="2" />
        <circle cx="152" cy="226" r="2.5" fill={GOLD_LITE} />
        <circle cx="168" cy="226" r="2.5" fill={GOLD_LITE} />
        {/* windows */}
        {[106, 196].map((x) => (
          <g key={x}>
            <rect x={x} y="160" width="20" height="24" rx="2" fill="#ffe7a8" className="oa-glow" />
            <path d={`M${x + 10} 160 V184 M${x} 172 H${x + 20}`} stroke={DEEP} strokeWidth="1.5" />
          </g>
        ))}
        {/* toran of mango leaves and marigold over the door */}
        <path d="M118 166 Q160 186 202 166" fill="none" stroke="#c2410c" strokeWidth="2" />
        {Array.from({ length: 9 }, (_, i) => {
          const x = 122 + i * 9.5;
          const y = 166 + Math.sin((i / 8) * Math.PI) * 10;
          return i % 2 ? (
            <path key={i} d={`M${x} ${y} q-4 10 0 16 q4 -6 0 -16 Z`} fill="#2f7a3a" />
          ) : (
            <circle key={i} cx={x} cy={y + 4} r="4" fill="#ff9f1c" />
          );
        })}
        {/* kalash and diyas at the door */}
        <g transform="translate(118 262)">
          <path d="M-12 0 C-17 -16 -11 -24 0 -24 C11 -24 17 -16 12 0 Z" fill={`url(#${g("gold")})`} />
          <ellipse cy="-30" rx="7" ry="8" fill="#8a5a2b" />
          {[-8, 0, 8].map((x) => <path key={x} d={`M${x} -26 q${x} -10 ${x * 1.6} -6`} stroke="#2f7a3a" strokeWidth="3" fill="none" />)}
        </g>
        <Diya x={212} y={262} s={0.45} g={g} />
        <Diya x={240} y={262} s={0.45} g={g} d={0.5} />
        {/* Lakshmi footsteps */}
        {[0, 1].map((i) => <ellipse key={i} cx={152 + i * 16} cy={286 - i * 6} rx="4" ry="7" fill={ACCENT} opacity=".75" />)}
      </g>
      <path d="M40 300 H280" stroke={GOLD} strokeWidth="2" strokeDasharray="2 6" />
    </g>
  );
}

function Cradle({ g }: G) {
  return (
    <g>
      {/* clouds */}
      {[[70, 248, 1], [250, 236, 1.2]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
          <path className="oa-bob" style={{ animationDelay: `${i}s` }} d="M-36 0 a14 14 0 0 1 10 -22 a18 18 0 0 1 32 -6 a14 14 0 0 1 26 10 a12 12 0 0 1 4 18 Z" fill="#fff" opacity=".9" />
        </g>
      ))}
      {/* the moon */}
      <g className="oa-bob">
        <path d="M200 70 A96 96 0 1 0 214 238 A76 76 0 1 1 200 70 Z" fill={`url(#${g("gold")})`} />
        {/* cradle hanging from the moon */}
        <line x1="150" y1="150" x2="138" y2="196" stroke={GOLD_LITE} strokeWidth="1.5" />
        <line x1="150" y1="150" x2="198" y2="196" stroke={GOLD_LITE} strokeWidth="1.5" />
        <g className="oa-sway-slow" style={{ transformOrigin: "150px 150px" }}>
          <path d="M126 196 H210 Q206 232 168 232 Q130 232 126 196 Z" fill={ACCENT} />
          <path d="M126 196 H210" stroke={GOLD} strokeWidth="5" strokeLinecap="round" />
          <circle cx="146" cy="190" r="10" fill="#f4cfae" />
          <path d="M136 188 q10 -12 20 0" fill="#3b2416" />
          <path d="M152 196 q20 -10 44 0" fill="#fff" />
        </g>
      </g>
      {/* hanging stars */}
      {[[70, 60], [102, 30], [262, 50]].map(([x, len], i) => (
        <g key={i} className="oa-sway-slow" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${x}px 0px` }}>
          <line x1={x} y1="0" x2={x} y2={len} stroke={GOLD_LITE} strokeWidth="1" />
          <path transform={`translate(${x} ${len + 10})`} d="M0 -10 L3 -3 L10 -3 L4 2 L6 10 L0 5 L-6 10 L-4 2 L-10 -3 L-3 -3 Z" fill={GOLD} />
        </g>
      ))}
      <FloatHearts />
    </g>
  );
}

function Holi(_: G) {
  const cols = ["#ff3d7f", "#ffd21f", "#18c37e", "#2f8cff", "#a855f7", "#ff8a1f"];
  return (
    <g>
      {cols.map((c, i) => {
        const a = (i / cols.length) * Math.PI * 2;
        const x = 160 + 70 * Math.cos(a);
        const y = 160 + 70 * Math.sin(a);
        return (
          <g key={i} className="oa-burst" style={{ animationDelay: `${i * 0.35}s`, transformOrigin: `${x}px ${y}px` }}>
            {Array.from({ length: 7 }, (_, j) => {
              const b = a + (j - 3) * 0.32;
              return <circle key={j} cx={x + Math.cos(b) * (26 + (j % 3) * 10)} cy={y + Math.sin(b) * (26 + (j % 3) * 10)} r={7 - (j % 3) * 1.6} fill={c} opacity=".85" />;
            })}
            <circle cx={x} cy={y} r="30" fill={c} opacity=".9" />
          </g>
        );
      })}
      {/* bowls of gulal */}
      {[[104, 266, "#ff3d7f"], [160, 280, "#ffd21f"], [216, 266, "#18c37e"]].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse cy="-8" rx="26" ry="12" fill={c as string} />
          <path d="M-30 -6 Q0 24 30 -6 Z" fill="var(--wt-gold)" stroke="#7a4a0c" strokeWidth="1" />
        </g>
      ))}
      <circle cx="160" cy="160" r="40" fill="#fff" opacity=".92" />
      <text x="160" y="170" textAnchor="middle" fontFamily="'Yatra One', serif" fontSize="30" fill="#ff3d7f">होली</text>
    </g>
  );
}

function Crescent({ g }: G) {
  return (
    <g>
      <Lantern x={70} y={0} len={70} g={g} c={GOLD} />
      <Lantern x={250} y={0} len={54} g={g} d={0.8} c={ACCENT} />
      <g className="oa-bob">
        <path d="M188 64 A100 100 0 1 0 220 236 A80 80 0 1 1 188 64 Z" fill={`url(#${g("gold")})`} />
        <path className="oa-twinkle" style={{ transformOrigin: "214px 132px" }} d="M214 110 L220 125 L236 125 L223 135 L228 152 L214 142 L200 152 L205 135 L192 125 L208 125 Z" fill={GOLD_LITE} />
      </g>
      {/* mosque skyline */}
      <path d="M40 300 V262 H70 V244 Q86 214 102 244 V262 H130 V232 Q160 182 190 232 V262 H218 V244 Q234 214 250 244 V262 H280 V300 Z" fill={DEEP} opacity=".9" />
      <path d="M58 300 V236 L62 226 L66 236 V300 Z M254 300 V236 L258 226 L262 236 V300 Z" fill={DEEP} />
      {[96, 150, 170, 226].map((x) => <rect key={x} x={x - 4} y={x === 150 || x === 170 ? 268 : 274} width="8" height="12" rx="4" fill="#ffe7a8" className="oa-glow" />)}
    </g>
  );
}

function Fireworks({ g }: G) {
  const bursts: [number, number, number, string][] = [[90, 96, 54, "#ffd34d"], [228, 80, 62, "#ff7aa2"], [160, 150, 46, "#5ec4ff"], [250, 196, 38, "#8cf0b0"], [72, 200, 40, "#c49bff"]];
  return (
    <g>
      {bursts.map(([x, y, r, c], i) => (
        <g key={i} className="oa-firework" style={{ animationDelay: `${i * 0.55}s`, transformOrigin: `${x}px ${y}px` }}>
          {Array.from({ length: 14 }, (_, j) => {
            const a = (j / 14) * Math.PI * 2;
            return <line key={j} x1={x + Math.cos(a) * r * 0.3} y1={y + Math.sin(a) * r * 0.3} x2={x + Math.cos(a) * r} y2={y + Math.sin(a) * r} stroke={c} strokeWidth="2.4" strokeLinecap="round" />;
          })}
          {Array.from({ length: 14 }, (_, j) => {
            const a = (j / 14) * Math.PI * 2 + 0.2;
            return <circle key={j} cx={x + Math.cos(a) * r * 1.12} cy={y + Math.sin(a) * r * 1.12} r="2.2" fill="#fff" />;
          })}
        </g>
      ))}
      {/* champagne glasses */}
      <g transform="translate(160 250)">
        {[-1, 1].map((s) => (
          <g key={s} transform={`rotate(${s * 12}) translate(${s * 18} 0)`}>
            <path d="M-14 -40 H14 L8 -6 Q0 2 -8 -6 Z" fill={`url(#${g("gold")})`} opacity=".9" />
            <path d="M0 -2 V26 M-12 28 H12" stroke={GOLD_LITE} strokeWidth="3" strokeLinecap="round" />
            {[0, 1, 2].map((k) => <circle key={k} className="oa-rise" style={{ animationDelay: `${k * 0.5 + (s > 0 ? 0.25 : 0)}s` }} cx={-3 + k * 3} cy={-14} r="1.8" fill="#fff" />)}
          </g>
        ))}
        <path className="oa-twinkle" style={{ transformOrigin: "0px -50px" }} d="M0 -62 L3 -53 L12 -50 L3 -47 L0 -38 L-3 -47 L-12 -50 L-3 -53 Z" fill="#fff" />
      </g>
    </g>
  );
}
