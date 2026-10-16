import { useEffect } from "react";
import type { Template } from "../data/templates";
import { designBySlug, loadStudioFonts, mix, tokensOf } from "./designs";

// The card picture of an Invite Studio design (drawn, no photo): its arch, names and palette.
export function StudioThumb({ template: t, className = "", labels = true }: { template: Template; className?: string; labels?: boolean }) {
  useEffect(loadStudioFonts, []);
  const d = designBySlug(t.slug);
  if (!d) return null;
  const P = d.pals[Math.min(2, Math.max(0, Number(t.studioPalette) || 0))];
  const T = tokensOf(d, P);
  const dark = d.hero === "Crest";
  const ink = dark ? P.a2 : P.ink;
  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center overflow-hidden px-[8%] text-center ${className}`} style={{ background: dark ? T.velvet : `radial-gradient(120% 80% at 50% 0%, ${P.surface}, ${P.base})` }}>
      <div
        className="absolute inset-x-[20%] top-[7%] bottom-[48%]"
        style={{ borderRadius: d.hero === "Kolam" || d.hero === "Crest" ? "50%" : d.hero === "Letter" || d.hero === "Garden" ? 4 : "999px 999px 6px 6px", border: `1.5px solid ${P.metal}`, background: `repeating-linear-gradient(135deg, ${T.stripe} 0 8px, ${mix(P.surface, "transparent", dark ? 0 : 60)} 8px 16px)`, opacity: dark ? 0.5 : 1 }}
        aria-hidden="true"
      />
      {labels && (
        <div className="absolute inset-x-[6%] top-[55%]">
          <p className="leading-none" style={{ fontFamily: d.display, color: ink, fontSize: "clamp(18px,4.6vw,30px)", textTransform: d.nameCase, letterSpacing: d.nameLs }}>
            {t.couple.one} <span style={{ fontFamily: d.text, fontStyle: "italic", color: P.a1 }}>&amp;</span> {t.couple.two}
          </p>
        </div>
      )}
      <div className="absolute right-[6%] top-[5%] flex gap-1" aria-hidden="true">
        {d.pals.map((p) => <span key={p.name} className="block h-2.5 w-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${p.a1} 50%, ${p.a2} 50%)`, boxShadow: "0 0 0 1px rgba(255,255,255,.7)" }} />)}
      </div>
    </div>
  );
}
