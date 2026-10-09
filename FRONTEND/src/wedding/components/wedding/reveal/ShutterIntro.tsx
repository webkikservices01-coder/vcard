import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Template } from "../../../data/templates";
import { occasionOf, namesLine, initialsOf } from "../../../data/occasions";

/* =========================================================
   ShutterIntro — the invite opens behind a painted metal shutter. The guest pulls it up
   (drag / swipe up, or tap the handle); past a quarter of the way it rolls up by itself
   with a little bounce, and the invitation (and its music) starts.
   ========================================================= */

const SLATS = 16;

export function ShutterIntro({ template, onEnter }: { template: Template; onEnter: () => void }) {
  const [lift, setLift] = useState(0); // 0 = closed, 1 = fully up
  const [phase, setPhase] = useState<"closed" | "dragging" | "opening" | "gone">("closed");
  const start = useRef<{ y: number; lift: number } | null>(null);
  const opened = useRef(false);

  const open = () => {
    if (opened.current) return;
    opened.current = true;
    setPhase("opening");
    setLift(1);
    onEnter();
    setTimeout(() => setPhase("gone"), 1300);
  };

  useEffect(() => {
    const key = (e: KeyboardEvent) => (e.key === "Enter" || e.key === " " || e.key === "ArrowUp") && open();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === "gone") return null;

  const down = (e: ReactPointerEvent) => {
    if (opened.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    start.current = { y: e.clientY, lift };
    setPhase("dragging");
  };
  const move = (e: ReactPointerEvent) => {
    if (!start.current) return;
    const dy = start.current.y - e.clientY;
    setLift(Math.max(0, Math.min(1, start.current.lift + dy / window.innerHeight)));
  };
  const up = () => {
    if (!start.current) return;
    const moved = Math.abs(lift - start.current.lift);
    start.current = null;
    if (lift > 0.22 || moved < 0.01) open(); // a pull or a plain tap opens it
    else {
      setPhase("closed");
      setLift(0);
    }
  };

  const o = occasionOf(template);
  const initials = initialsOf(template);
  return (
    <div
      className="fixed inset-0 z-[9999] touch-none select-none overflow-hidden"
      data-palette={template.palette}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      role="button"
      tabIndex={0}
      aria-label="Pull the shutter up to open the invitation"
      style={{ pointerEvents: phase === "opening" ? "none" : "auto" }}
    >
      <div
        className="absolute inset-x-0 top-0 h-full"
        style={{
          transform: `translateY(${-lift * 104}%)`,
          transition: phase === "dragging" ? "none" : phase === "opening" ? "transform 1.15s cubic-bezier(.55,-0.12,.3,1)" : "transform .45s cubic-bezier(.3,1.4,.5,1)",
        }}
      >
        {/* slats */}
        <div className="absolute inset-0 flex flex-col">
          {Array.from({ length: SLATS }, (_, i) => (
            <div
              key={i}
              className="relative flex-1"
              style={{
                background: "linear-gradient(180deg, color-mix(in oklab, var(--wt-gold-lite) 70%, #fff) 0%, var(--wt-gold) 38%, color-mix(in oklab, var(--wt-gold) 60%, #2a1a05) 92%, #1d1204 100%)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 3px rgba(0,0,0,.35)",
              }}
            />
          ))}
          <div className="wt-shutter-shine pointer-events-none absolute inset-0" />
        </div>

        {/* painted panel on the shutter */}
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div className="wt-shutter-plate relative w-[min(420px,88vw)] rounded-[28px] px-6 py-8" style={{ background: "linear-gradient(160deg, var(--wt-bg-2), var(--wt-bg-1))", border: "3px solid var(--wt-gold-lite)", boxShadow: "0 0 0 6px color-mix(in oklab, var(--wt-bg-1) 70%, transparent), 0 30px 70px rgba(0,0,0,.55)" }}>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full text-xl font-bold" style={{ background: "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))", color: "var(--wt-bg-1)", fontFamily: "var(--wt-display)" }}>
              {initials}
            </div>
            <p className="mt-4 text-lg" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-gold-lite)" }}>
              {o.rsvp ? template.script : o.invited}
            </p>
            <h1 className="mt-2 wt-text-gradient font-bold" style={{ fontFamily: "var(--wt-heading)", fontSize: "clamp(30px, 8vw, 46px)", lineHeight: 1.1 }}>
              {o.couple ? (
                <>
                  {template.couple.one}
                  <span className="mx-2 text-[0.6em]" style={{ color: "var(--wt-accent)" }}>{template.couple.amp}</span>
                  {template.couple.two}
                </>
              ) : o.rsvp ? (
                namesLine(template)
              ) : (
                template.script
              )}
            </h1>
            <p className="mt-3 text-[11px] uppercase tracking-[0.35em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-ink-soft)" }}>
              {o.rsvp ? o.invited : `from ${template.couple.one}`}
            </p>
          </div>
        </div>

        {/* bottom bar + handle */}
        <div className="absolute inset-x-0 bottom-0 h-7" style={{ background: "linear-gradient(180deg, #3a2608, #120a02)", boxShadow: "0 -2px 6px rgba(0,0,0,.4)" }} />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
          <div className="wt-shutter-hint flex flex-col items-center gap-2" style={{ color: "var(--wt-bg-1)" }}>
            <span className="text-2xl leading-none">⌃</span>
            <span className="rounded-full px-6 py-3 text-xs font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))", color: "#fff", boxShadow: "0 10px 26px rgba(0,0,0,.45)" }}>
              Pull up to open
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
