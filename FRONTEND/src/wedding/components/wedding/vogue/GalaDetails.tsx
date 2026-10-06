import { useEffect, useState } from "react";
import type { Template } from "../../../data/templates";
import { SectionHeading } from "./Chronicle";
import { Reveal } from "./Reveal";

/* =========================================================
   The Gala Details — interactive grid of destination events.
   Responsive glassmorphic cards with a brushed white-gold
   hover accent border and a live countdown to the vow ceremony.
   ========================================================= */

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, new Date(target).getTime() - now);
  return [
    { label: "Days", value: Math.floor(diff / 864e5) },
    { label: "Hours", value: Math.floor(diff / 36e5) % 24 },
    { label: "Mins", value: Math.floor(diff / 6e4) % 60 },
    { label: "Secs", value: Math.floor(diff / 1e3) % 60 },
  ];
}

export function GalaDetails({ template }: { template: Template }) {
  const cells = useCountdown(template.eventDate);

  return (
    <section
      id="gala"
      className="relative overflow-hidden bg-[#15140f] py-20 sm:py-28 lg:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(900px 480px at 12% 0%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(700px 460px at 92% 100%, rgba(212,175,55,0.08), transparent 60%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="The Gala Details"
            title="A Composed Itinerary"
            tone="light"
          />
        </Reveal>

        <Reveal
          delay={140}
          className="mx-auto mt-10 grid max-w-lg grid-cols-4 gap-2 sm:mt-12 sm:gap-3"
        >
          {cells.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-white/15 bg-white/5 py-4 text-center backdrop-blur-xl"
            >
              <span
                className="block text-2xl font-semibold text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {String(c.value).padStart(2, "0")}
              </span>
              <span
                className="mt-1 block text-[9px] uppercase tracking-[0.3em] text-white/50 sm:text-[10px]"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </Reveal>

        <div className="mt-16 grid gap-5 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
          {template.ceremonies.map((event, i) => (
            <Reveal key={event.name} delay={i * 90}>
              <article className="group relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-7 backdrop-blur-xl transition-[border-color,transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37]/60 hover:shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(212,175,55,0.12), transparent 55%)",
                  }}
                />
                <div className="relative flex items-start justify-between">
                  <span
                    className="text-3xl font-semibold text-white/25 transition-colors duration-500 group-hover:text-[#D4AF37]/70"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {event.icon}
                  </span>
                  <span
                    className="rounded-full border border-white/20 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-white/60"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    {event.hi}
                  </span>
                </div>
                <h3
                  className="relative mt-6 text-xl font-semibold leading-snug text-white sm:text-2xl"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {event.name}
                </h3>
                <dl className="relative mt-6 space-y-2 text-sm text-white/65">
                  <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
                    <dt
                      className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/80"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Date
                    </dt>
                    <dd>{event.date}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
                    <dt
                      className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/80"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Time
                    </dt>
                    <dd>{event.time}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
                    <dt
                      className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37]/80"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      Venue
                    </dt>
                    <dd className="text-right">{event.venue}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
