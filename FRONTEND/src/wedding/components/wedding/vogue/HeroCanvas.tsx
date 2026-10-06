import type { CSSProperties } from "react";
import type { Template } from "../../../data/templates";

/* =========================================================
   Hero Canvas — widescreen cinematic viewport.
   Ambient media mask scales into focus on load, couple names
   render as liquid chrome typography with a line-by-line
   staggered reveal, and a minimalist scroll indicator anchors
   the base of the frame.
   ========================================================= */

export function HeroCanvas({
  template,
  scrollY,
}: {
  template: Template;
  scrollY: number;
}) {
  const names = `${template.couple.one} ${template.couple.amp} ${template.couple.two}`;

  return (
    <section
      id="canvas"
      className="relative min-h-[100svh] overflow-hidden bg-[#100f0d]"
    >
      {/* Ambient media mask */}
      <div className="vsg-hero-media absolute inset-0">
        <div
          className="vsg-photo absolute inset-0 h-[118%] w-full"
          style={
            {
              backgroundImage: `url(${template.image || template.hero})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translateY(${scrollY * 0.12}px) scale(1.06)`,
            } as CSSProperties
          }
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,9,0.55) 0%, rgba(10,10,9,0.22) 38%, rgba(10,10,9,0.35) 68%, #f8f6f1 97%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(1200px 620px at 18% 8%, rgba(255,255,255,0.5), transparent 55%)",
          }}
        />
      </div>

      {/* Glass nav */}
      <nav className="absolute inset-x-4 top-4 z-30 mx-auto flex max-w-6xl items-center gap-4 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-xl sm:inset-x-6 sm:top-6 sm:px-6">
        <a
          href="#canvas"
          aria-label={names}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#D4AF37]/40 text-[13px] text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {template.couple.one[0]}
          {template.couple.two[0]}
        </a>
        <div className="hidden flex-1 items-center justify-end gap-6 sm:flex md:gap-8">
          {["Chronicle", "Gala", "RSVP"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[11px] uppercase tracking-[0.3em] text-white/75 transition hover:text-[#D4AF37]"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {item}
            </a>
          ))}
        </div>
        <span
          className="ml-auto text-[10px] uppercase tracking-[0.35em] text-white/60 sm:ml-0"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {template.countryLabel}
        </span>
      </nav>

      {/* Content */}
      <div className="relative z-20 flex min-h-[100svh] flex-col items-center justify-center px-5 pt-28 pb-24 text-center sm:px-8">
        <div
          className="vsg-line"
          style={{ "--vsg-delay": "80ms" } as CSSProperties}
        >
          <span
            className="vsg-line-inner block text-[11px] uppercase tracking-[0.55em] text-[#D4AF37]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {template.script} · The Private Edition
          </span>
        </div>

        <h1
          className="mt-6 max-w-5xl font-bold leading-[0.94]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 10vw, 8.5rem)",
          }}
        >
          <div
            className="vsg-line"
            style={{ "--vsg-delay": "220ms" } as CSSProperties}
          >
            <span className="vsg-line-inner vsg-chrome block">
              {template.couple.one}
            </span>
          </div>
          <div
            className="vsg-line my-1"
            style={{ "--vsg-delay": "360ms" } as CSSProperties}
          >
            <span
              className="vsg-line-inner block text-[0.32em] italic text-[#D4AF37]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {template.couple.amp}
            </span>
          </div>
          <div
            className="vsg-line"
            style={{ "--vsg-delay": "500ms" } as CSSProperties}
          >
            <span className="vsg-line-inner vsg-chrome block">
              {template.couple.two}
            </span>
          </div>
        </h1>

        <div
          className="vsg-line mt-7 max-w-xl"
          style={{ "--vsg-delay": "640ms" } as CSSProperties}
        >
          <p
            className="vsg-line-inner text-xs uppercase tracking-[0.35em] text-white/70 sm:text-sm"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {template.tagline}
          </p>
        </div>

        <div
          className="vsg-line mt-9"
          style={{ "--vsg-delay": "760ms" } as CSSProperties}
        >
          <div className="vsg-line-inner flex flex-wrap items-center justify-center gap-4">
            <span
              className="rounded-full border border-[#D4AF37]/40 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.3em] text-white backdrop-blur-xl sm:text-sm"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {template.date}
            </span>
            <a
              href="#rsvp"
              className="rounded-full border border-white/70 bg-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#1b1a18] transition-transform duration-500 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(0,0,0,0.35)] sm:text-sm"
              style={{ fontFamily: "var(--font-label)" }}
            >
              Reserve Attendance
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3">
        <span
          className="text-[9px] uppercase tracking-[0.5em] text-white/60"
          style={{ fontFamily: "var(--font-label)" }}
        >
          Scroll
        </span>
        <span className="vsg-scroll-track relative h-14 w-px overflow-hidden bg-white/20">
          <span className="vsg-scroll-dot absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-[#D4AF37]" />
        </span>
      </div>
    </section>
  );
}
