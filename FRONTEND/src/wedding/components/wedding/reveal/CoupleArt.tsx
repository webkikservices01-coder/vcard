import { useId } from "react";

/* =========================================================
   CoupleArt — an animated bride & groom drawn in SVG (no images to load).
   Four looks: Hindu (safa + lehenga, varmala), South Indian (veshti + silk saree, jasmine),
   Nikkah (sherwani + dupatta, crescent moon) and Modern (suit + gown, bouquet).
   They sway gently, lean in, the garlands drop on and little hearts float up.
   ========================================================= */

export type CoupleLook = "hindu" | "south" | "nikkah" | "modern";

export const COUPLE_LOOKS: { id: CoupleLook; label: string }[] = [
  { id: "hindu", label: "Dulha–Dulhan (safa & lehenga)" },
  { id: "south", label: "South Indian (veshti & silk saree)" },
  { id: "nikkah", label: "Nikkah (sherwani & dupatta)" },
  { id: "modern", label: "Modern (suit & gown)" },
];

type Look = {
  coat: string; coatTrim: string; pants: string; turban?: string; turbanTrim?: string; tie?: string;
  skirt: string; skirtBorder: string; choli: string; veil: string; veilOpacity: number;
  garland?: [string, string]; jasmine?: boolean; bouquet?: boolean; moon?: boolean; groomHair?: boolean;
};

const LOOKS: Record<CoupleLook, Look> = {
  hindu: { coat: "#f6e7c8", coatTrim: "#d4a23c", pants: "#fff6e6", turban: "#d81b45", turbanTrim: "#f2b632", skirt: "#b3122e", skirtBorder: "#f0b93a", choli: "#a10f2a", veil: "#e8476a", veilOpacity: 0.72, garland: ["#ff9f1c", "#e63946"] },
  south: { coat: "#fbf6ea", coatTrim: "#d9a93f", pants: "#fbf6ea", skirt: "#7a1631", skirtBorder: "#e3b448", choli: "#1f6b3a", veil: "#8d1a3a", veilOpacity: 0.85, garland: ["#fffaf0", "#d62f4b"], jasmine: true, groomHair: true },
  nikkah: { coat: "#f2e8d3", coatTrim: "#c9a24a", pants: "#fbf5e8", skirt: "#14594a", skirtBorder: "#e6c66a", choli: "#0f4a3d", veil: "#e9d9a8", veilOpacity: 0.7, moon: true, groomHair: true },
  modern: { coat: "#23304f", coatTrim: "#c9a96a", pants: "#1b2540", tie: "#e46b8a", skirt: "#fffaf3", skirtBorder: "#f1d9c6", choli: "#fffaf3", veil: "#ffffff", veilOpacity: 0.6, bouquet: true, groomHair: true },
};

const SKIN_A = "#efc29b";
const SKIN_B = "#f4cfae";
const HAIR = "#2b1a12";

export function CoupleArt({ look = "hindu", className = "", size = 320 }: { look?: CoupleLook; className?: string; size?: number }) {
  const L = LOOKS[look] || LOOKS.hindu;
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 320 340" width={size} height={(size * 340) / 320} className={`wt-couple ${className}`} role="img" aria-label="Illustration of the bride and groom">
      <defs>
        <radialGradient id={`halo-${uid}`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="var(--wt-gold-lite)" stopOpacity=".55" />
          <stop offset=".6" stopColor="var(--wt-gold)" stopOpacity=".12" />
          <stop offset="1" stopColor="var(--wt-gold)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`skirt-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.skirt} />
          <stop offset="1" stopColor={L.skirt} stopOpacity=".86" />
        </linearGradient>
      </defs>

      {/* Halo + slowly turning ring */}
      <circle cx="160" cy="170" r="150" fill={`url(#halo-${uid})`} />
      <g className="wt-couple-ring" style={{ transformOrigin: "160px 170px" }}>
        <circle cx="160" cy="170" r="128" fill="none" stroke="var(--wt-gold)" strokeOpacity=".55" strokeWidth="1.5" strokeDasharray="2 7" />
        <circle cx="160" cy="170" r="138" fill="none" stroke="var(--wt-gold-lite)" strokeOpacity=".35" strokeWidth="1" />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={160 + 138 * Math.cos((i * Math.PI) / 6)} cy={170 + 138 * Math.sin((i * Math.PI) / 6)} r="3" fill="var(--wt-gold-lite)" fillOpacity=".7" />
        ))}
      </g>

      {L.moon && (
        <g className="wt-couple-float">
          <path d="M168 26a20 20 0 1 0 14 34 16 16 0 1 1-14-34z" fill="var(--wt-gold-lite)" />
          <path d="m196 34 2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.8 2.7 1-5.3-4-3.7 5.4-.6z" fill="var(--wt-gold-lite)" />
        </g>
      )}

      {/* Ground shadow */}
      <ellipse cx="160" cy="330" rx="112" ry="8" fill="#000" opacity=".22" />

      {/* ---------- GROOM ---------- */}
      <g className="wt-groom" style={{ transformOrigin: "110px 330px" }}>
        <ellipse cx="99" cy="327" rx="10" ry="4.5" fill="#3a2418" />
        <ellipse cx="121" cy="327" rx="10" ry="4.5" fill="#3a2418" />
        {look === "south" ? (
          <>
            {/* veshti: wrapped white cloth to the ankles with a gold border */}
            <path d="M84 206 L136 206 L140 324 L80 324 Z" fill={L.pants} />
            <path d="M80 318 L140 318" stroke={L.coatTrim} strokeWidth="5" />
            <path d="M110 206 L106 324" stroke={L.coatTrim} strokeWidth="2" opacity=".7" />
          </>
        ) : (
          <>
            <rect x="96" y="246" width="12" height="80" rx="5" fill={L.pants} />
            <rect x="112" y="246" width="12" height="80" rx="5" fill={L.pants} />
          </>
        )}
        {/* coat / kurta */}
        <path d={look === "south" ? "M88 148 Q110 140 132 148 L136 212 Q110 218 84 212 Z" : look === "modern" ? "M88 148 Q110 140 132 148 L136 252 Q110 258 84 252 Z" : "M88 148 Q110 140 132 148 L140 266 Q110 274 80 266 Z"} fill={L.coat} />
        {look === "modern" ? (
          <>
            <path d="M102 146 L110 186 L118 146 Z" fill="#fff" />
            <path d="M104 150 L110 157 L116 150 L110 154 Z" fill={L.tie} />
            <path d="M101 146 L110 190 L95 150 Z" fill="#18213a" />
            <path d="M119 146 L110 190 L125 150 Z" fill="#18213a" />
            <circle cx="96" cy="170" r="3.2" fill={L.tie} />
          </>
        ) : (
          <>
            <path d={look === "south" ? "M110 150 L110 210" : "M110 150 L110 266"} stroke={L.coatTrim} strokeWidth="2" />
            {(look === "south" ? [166, 186] : [166, 184, 202, 220, 238]).map((y) => (
              <circle key={y} cx="110" cy={y} r="2.6" fill={L.coatTrim} />
            ))}
            {/* stole across the chest */}
            <path d="M90 150 Q108 196 134 226" stroke={look === "south" ? L.coatTrim : L.turbanTrim || L.coatTrim} strokeWidth={look === "south" ? 7 : 9} fill="none" opacity=".85" strokeLinecap="round" />
          </>
        )}
        {/* arms */}
        <path d="M89 152 Q76 190 81 228" stroke={L.coat} strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M131 152 Q146 186 150 212" stroke={L.coat} strokeWidth="13" fill="none" strokeLinecap="round" />
        <circle cx="81" cy="232" r="6" fill={SKIN_A} />
        <circle cx="151" cy="217" r="6" fill={SKIN_A} />
        {/* neck + head (leans toward the bride) */}
        <g style={{ transform: "rotate(5deg)", transformOrigin: "110px 140px" }}>
          <rect x="104" y="126" width="12" height="20" rx="4" fill={SKIN_A} />
          <circle cx="110" cy="112" r="20" fill={SKIN_A} />
          {L.groomHair && <path d="M90 110 Q92 88 112 88 Q130 90 131 108 Q122 98 108 100 Q98 101 90 110Z" fill={HAIR} />}
          <circle cx="90" cy="114" r="3.4" fill={SKIN_A} />
          <circle cx="130" cy="114" r="3.4" fill={SKIN_A} />
          <path d="M100 113 q3.2 3 6.4 0" stroke="#3a2418" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M114 113 q3.2 3 6.4 0" stroke="#3a2418" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M104 119.5 q6 -3 12 0" stroke={HAIR} strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M106 124 q4 3 8 0" stroke="#b5533c" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <circle cx="98" cy="120" r="3" fill="#ef8f8f" opacity=".35" />
          <circle cx="122" cy="120" r="3" fill="#ef8f8f" opacity=".35" />
          {L.turban && (
            <>
              <path d="M87 108 Q86 80 110 76 Q134 80 133 108 Q110 98 87 108Z" fill={L.turban} />
              <path d="M90 100 Q110 88 130 100 M92 92 Q110 82 128 92" stroke={L.turbanTrim} strokeWidth="1.6" fill="none" opacity=".9" />
              <path d="M132 98 Q146 112 140 150" stroke={L.turban} strokeWidth="7" fill="none" strokeLinecap="round" />
              <circle cx="118" cy="84" r="4" fill={L.turbanTrim} />
              <path d="M118 82 Q124 64 134 60 Q128 72 121 84" fill="#fff4d6" stroke={L.turbanTrim} strokeWidth="1" />
            </>
          )}
        </g>
      </g>

      {/* ---------- BRIDE ---------- */}
      <g className="wt-bride" style={{ transformOrigin: "210px 330px" }}>
        {/* veil behind */}
        <path d="M187 108 Q210 76 233 108 Q248 165 256 262 L246 266 Q238 174 226 122 Q210 106 194 122 Q182 174 174 250 L165 247 Q172 160 187 108Z" fill={L.veil} opacity={L.veilOpacity} />
        {/* skirt */}
        <path d="M186 198 Q210 192 234 198 L264 324 Q210 336 156 324 Z" fill={`url(#skirt-${uid})`} />
        <path d="M159 318 Q210 330 261 318" stroke={L.skirtBorder} strokeWidth="7" fill="none" />
        <path d="M163 302 Q210 312 257 302" stroke={L.skirtBorder} strokeWidth="1.6" fill="none" opacity=".7" />
        {[[190, 240], [214, 228], [236, 248], [200, 276], [226, 282], [178, 290], [246, 292]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill={L.skirtBorder} opacity=".9" />
        ))}
        {look === "south" && <path d="M186 200 Q216 230 238 300" stroke={L.skirtBorder} strokeWidth="5" fill="none" opacity=".9" />}
        {/* blouse */}
        <path d="M193 150 Q210 143 227 150 L231 202 Q210 207 189 202 Z" fill={L.choli} />
        <path d="M193 150 Q210 160 227 150" stroke={L.skirtBorder} strokeWidth="2" fill="none" />
        {/* arms */}
        <path d="M194 154 Q178 186 170 211" stroke={SKIN_B} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M226 154 Q239 190 234 226" stroke={SKIN_B} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M172 204 l6 3 M171 207 l6 3 M232 218 l6 -1 M232 221 l6 -1" stroke={L.skirtBorder} strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="169" cy="215" r="5.5" fill={SKIN_B} />
        <circle cx="234" cy="230" r="5.5" fill={SKIN_B} />
        {L.bouquet && (
          <g>
            <path d="M228 236 L238 266" stroke="#4f7a4a" strokeWidth="3" />
            {[[226, 228, "#f29bb2"], [236, 226, "#ffd1dc"], [231, 220, "#e46b8a"], [240, 233, "#f7b9c8"], [222, 236, "#ffe3ea"]].map(([x, y, c]) => (
              <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="6" fill={c as string} />
            ))}
          </g>
        )}
        {/* neck + head (leans toward the groom) */}
        <g style={{ transform: "rotate(-5deg)", transformOrigin: "210px 140px" }}>
          <rect x="205" y="127" width="10" height="20" rx="4" fill={SKIN_B} />
          <path d="M199 140 q11 12 22 0" stroke={L.skirtBorder} strokeWidth="2.6" fill="none" />
          <circle cx="210" cy="150" r="2.6" fill={L.skirtBorder} />
          <circle cx="227" cy="106" r="10" fill={HAIR} />
          <circle cx="210" cy="112" r="19" fill={SKIN_B} />
          <path d="M191 112 Q190 88 210 87 Q230 88 229 112 Q224 97 210 97 Q196 97 191 112Z" fill={HAIR} />
          {L.jasmine && [[220, 96], [226, 98], [232, 101], [235, 107], [234, 113]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" fill="#fffdf5" />)}
          {look !== "modern" && (
            <>
              <path d="M210 88 L210 97" stroke={L.skirtBorder} strokeWidth="1.4" />
              <circle cx="210" cy="99" r="2.6" fill={L.skirtBorder} />
            </>
          )}
          {(look === "hindu" || look === "south") && <circle cx="210" cy="104.5" r="1.7" fill="#d1123f" />}
          <path d="M200 113 q3 2.8 6 0" stroke="#3a2418" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M214 113 q3 2.8 6 0" stroke="#3a2418" strokeWidth="1.7" fill="none" strokeLinecap="round" />
          <path d="M205 121 q5 3.6 10 0" stroke="#c2364f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {look !== "modern" && <circle cx="203.5" cy="118" r="2.4" fill="none" stroke={L.skirtBorder} strokeWidth="1.1" />}
          <circle cx="199" cy="119" r="3" fill="#ef8f8f" opacity=".4" />
          <circle cx="221" cy="119" r="3" fill="#ef8f8f" opacity=".4" />
          <circle cx="191.5" cy="118" r="2" fill={L.skirtBorder} />
          <circle cx="228.5" cy="118" r="2" fill={L.skirtBorder} />
          {/* veil over the head */}
          <path d="M188 112 Q190 82 210 80 Q230 82 232 112 Q226 92 210 91 Q194 92 188 112Z" fill={L.veil} opacity={Math.min(1, L.veilOpacity + 0.1)} />
          <path d="M188 112 Q190 82 210 80 Q230 82 232 112" stroke={L.skirtBorder} strokeWidth="1.6" fill="none" />
        </g>
      </g>

      {/* ---------- VARMALA (drop on after a moment) ---------- */}
      {L.garland && (
        <>
          <g className="wt-garland wt-garland-1">
            <path d="M93 141 Q110 182 128 141" stroke={L.garland[0]} strokeWidth="7" strokeLinecap="round" strokeDasharray="0 7.5" fill="none" />
            <path d="M96 143 Q110 176 125 143" stroke={L.garland[1]} strokeWidth="4" strokeLinecap="round" strokeDasharray="0 9" fill="none" />
          </g>
          <g className="wt-garland wt-garland-2">
            <path d="M193 141 Q210 182 227 141" stroke={L.garland[0]} strokeWidth="7" strokeLinecap="round" strokeDasharray="0 7.5" fill="none" />
            <path d="M196 143 Q210 176 224 143" stroke={L.garland[1]} strokeWidth="4" strokeLinecap="round" strokeDasharray="0 9" fill="none" />
          </g>
        </>
      )}

      {/* ---------- floating hearts ---------- */}
      {[0, 1, 2].map((i) => (
        <path key={i} className={`wt-heart wt-heart-${i}`} d="M160 120c-4-6-13-4-13 3 0 6 8 10 13 15 5-5 13-9 13-15 0-7-9-9-13-3z" fill="var(--wt-accent)" style={{ transformOrigin: "160px 130px" }} />
      ))}
    </svg>
  );
}
