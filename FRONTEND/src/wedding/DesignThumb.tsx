import { useEffect } from "react";
import type { Template } from "./data/templates";
import { loadWeddingFonts } from "./fonts";
import { OccasionArt } from "./components/wedding/reveal/OccasionArt";
import { occasionOf } from "./data/occasions";
import "./wedding-theme.css";

// The picture of a design in the /invites showcase and the dashboard picker: wedding designs
// have their photo; occasion designs are drawn (backdrop + animated art + greeting line).
export function DesignThumb({ template: t, className = "", animate = true, labels = true }: { template: Template; className?: string; animate?: boolean; labels?: boolean }) {
  useEffect(loadWeddingFonts, []);
  if (!t.art) return <img src={t.hero} alt={`${t.name} invitation design`} loading="lazy" className={`h-full w-full object-cover ${className}`} />;
  const o = occasionOf(t);
  return (
    <div data-palette={t.palette} className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`} style={{ backgroundImage: `url("${t.hero}")`, backgroundSize: "cover", backgroundPosition: "center" }}>
      {labels && <div className="absolute inset-x-0 top-[15%] text-center text-[clamp(10px,2.6vw,15px)]" style={{ fontFamily: t.scriptFont === "devanagari" ? "'Yatra One', serif" : "var(--wt-script)", color: "var(--wt-gold-lite)" }}>
        {o.rsvp ? t.script : o.label}
      </div>}
      <div className={`w-[78%] ${animate ? "" : "[&_*]:!animate-none"}`}>
        <OccasionArt kind={t.art} label={t.couple.two} size={240} className="h-auto w-full" />
      </div>
      {labels && <div className="absolute inset-x-0 bottom-[22%] px-2 text-center font-bold leading-tight" style={{ fontFamily: "var(--wt-heading)", color: "var(--wt-gold-lite)", fontSize: "clamp(14px,3.4vw,22px)", textShadow: "0 2px 10px rgba(0,0,0,.6)" }}>
        {o.rsvp ? (o.couple ? `${t.couple.one} & ${t.couple.two}` : t.couple.one) : t.script}
      </div>}
    </div>
  );
}
