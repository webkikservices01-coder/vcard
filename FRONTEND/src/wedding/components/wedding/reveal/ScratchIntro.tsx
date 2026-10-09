import { useState } from "react";
import type { Template } from "../../../data/templates";
import { ScratchCard } from "./ScratchCard";
import { CoupleArt, type CoupleLook } from "./CoupleArt";
import { OccasionArt } from "./OccasionArt";
import { occasionOf } from "../../../data/occasions";

/* =========================================================
   ScratchIntro — opening cover: the couple, then a gold scratch card hiding the date.
   Scratch it, the date pops out with confetti, and "Open Invitation" appears.
   ========================================================= */

export function ScratchIntro({ template, look, onEnter }: { template: Template; look?: CoupleLook | null; onEnter: () => void }) {
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const enter = () => {
    setLeaving(true);
    onEnter();
  };
  const o = occasionOf(template);
  // Greeting cards hide the wish itself; invites hide the date.
  const [day, ...rest] = !o.rsvp ? [template.script] : template.date ? template.date.split(" ") : [o.emoji, "Save the date!"];
  return (
    <div
      data-palette={template.palette}
      className={`fixed inset-0 z-[9999] grid place-items-center overflow-y-auto px-5 py-8 text-center transition-all duration-700 ${leaving ? "pointer-events-none scale-105 opacity-0" : ""}`}
      style={{ background: `linear-gradient(180deg, var(--wt-veil), rgba(0,0,0,.88)), url(${template.image || template.hero}) center/cover no-repeat`, color: "var(--wt-ink)" }}
    >
      <div className="w-full max-w-sm">
        {template.art ? <OccasionArt kind={template.art} label={template.couple.two} size={200} className="mx-auto" /> : look ? <CoupleArt look={look} size={200} className="mx-auto" /> : null}
        <p className="mt-2 text-base" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-gold-lite)" }}>
          {o.rsvp ? template.script : o.invited}
        </p>
        <h1 className="mt-1 wt-text-gradient font-bold" style={{ fontFamily: "var(--wt-heading)", fontSize: "clamp(32px, 9vw, 52px)", lineHeight: 1.08 }}>
          {o.couple ? (
            <>
              {template.couple.one} <span style={{ color: "var(--wt-accent)", fontSize: "0.6em" }}>{template.couple.amp}</span> {template.couple.two}
            </>
          ) : o.rsvp ? (
            template.couple.one
          ) : (
            `From ${template.couple.one}`
          )}
        </h1>
        <p className="mt-3 text-[11px] uppercase tracking-[0.35em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-ink-soft)" }}>
          {shown ? (o.rsvp ? "See you there!" : "With love") : o.rsvp ? "Scratch the card to find out when" : "Scratch the card to reveal your wish"}
        </p>

        <ScratchCard className="mx-auto mt-5 w-[min(320px,86vw)] rounded-3xl" label="Scratch here" onReveal={() => setShown(true)}>
          <div className="grid aspect-[16/10] place-items-center rounded-3xl px-4" style={{ background: "linear-gradient(160deg, var(--wt-bg-2), var(--wt-bg-1))", border: "2px solid var(--wt-gold-lite)" }}>
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-gold-lite)" }}>
                {o.rsvp ? "Save the date" : "Wishing you"}
              </div>
              <div className="mt-1 font-bold leading-none" style={{ fontFamily: "var(--wt-display)", fontSize: o.rsvp ? "clamp(40px, 13vw, 60px)" : "clamp(28px, 9vw, 42px)", lineHeight: 1.1, color: "#fff" }}>
                {day}
              </div>
              <div className="mt-1 text-lg" style={{ fontFamily: "var(--wt-heading)", color: "var(--wt-ink-soft)" }}>
                {rest.join(" ")}
              </div>
            </div>
          </div>
        </ScratchCard>

        <button
          type="button"
          onClick={enter}
          className={`mt-6 inline-block rounded-full px-8 py-3.5 text-sm uppercase tracking-[0.25em] text-white transition-all duration-500 ${shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-70"}`}
          style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))", boxShadow: "0 14px 34px rgba(0,0,0,.45)" }}
        >
          {shown ? (o.rsvp ? "Open Invitation" : "Open Your Wish") : "Skip & open"}
        </button>
      </div>
    </div>
  );
}
