import type { ReactNode } from "react";
import type { Template } from "../../../data/templates";
import { useInView } from "./Reveal";

/* =========================================================
   The Chronicle — asymmetric editorial timeline.
   Each entry alternates text / image sides; the image sits in
   an organic liquid clip-path mask that unfolds from a sliver
   into its full silhouette as the row enters the viewport, and
   morphs to a second silhouette on hover.
   ========================================================= */

function ChronicleRow({
  index,
  chapter,
  title,
  copy,
  image,
  reverse,
}: {
  index: number;
  chapter: string;
  title: string;
  copy: string;
  image: string;
  reverse: boolean;
}) {
  const [ref, visible] = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`grid items-center gap-8 md:grid-cols-12 md:gap-6 lg:gap-10 ${
        reverse ? "" : ""
      }`}
    >
      <div
        className={`md:col-span-5 ${reverse ? "md:order-2" : "md:order-1"} ${
          reverse ? "md:pl-6 lg:pl-10" : "md:pr-6 lg:pr-10"
        }`}
      >
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 900ms cubic-bezier(0.16,1,0.3,1) 120ms, transform 900ms cubic-bezier(0.16,1,0.3,1) 120ms",
          }}
        >
          <span
            className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]"
            style={{ fontFamily: "var(--font-label)" }}
          >
            Chapter {chapter}
          </span>
          <h3
            className="mt-3 text-[clamp(1.7rem,3.4vw,2.75rem)] font-semibold leading-[1.08] text-[#1b1a18]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {title}
          </h3>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#5b5852] sm:text-base">
            {copy}
          </p>
        </div>
      </div>

      <div className={`md:col-span-7 ${reverse ? "md:order-1" : "md:order-2"}`}>
        <div
          className={`vsg-blob relative aspect-[5/4] w-full overflow-hidden bg-[#e7e2d6] sm:aspect-[16/10] ${
            visible ? "is-visible" : ""
          } ${index % 2 === 0 ? "vsg-blob-a" : "vsg-blob-b"}`}
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="vsg-photo h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(200deg, transparent 55%, rgba(0,0,0,0.28) 100%)",
            }}
          />
          <span
            className="absolute bottom-5 left-5 text-[10px] uppercase tracking-[0.4em] text-white"
            style={{ fontFamily: "var(--font-label)" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Chronicle({ template }: { template: Template }) {
  const beats: {
    chapter: string;
    title: string;
    copy: string;
    image: string;
  }[] = [
    {
      chapter: "I",
      title: "A conversation with staying power",
      copy: "What began as a composed introduction across a quiet dinner table became the rare kind of ease neither of them expected to find twice.",
      image: template.monuments[1] ?? template.hero,
    },
    {
      chapter: "II",
      title: "Quiet architecture, luminous answer",
      copy: "No spectacle — only intention. A cliffside dusk, a single question, and a yes that needed no rehearsal.",
      image: template.monuments[2] ?? template.hero,
    },
    {
      chapter: "III",
      title: "An invitation, edited like a keepsake",
      copy: template.story,
      image: template.hero,
    },
  ];

  return (
    <section
      id="chronicle"
      className="relative bg-[#f8f6f1] py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The Chronicle"
          title="Our Story, Told in Restraint"
        />

        <div className="mt-16 flex flex-col gap-16 sm:mt-20 sm:gap-24 lg:gap-32">
          {beats.map((beat, i) => (
            <ChronicleRow
              key={beat.chapter}
              index={i}
              chapter={beat.chapter}
              title={beat.title}
              copy={beat.copy}
              image={beat.image}
              reverse={i % 2 === 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  tone = "dark",
  children,
}: {
  eyebrow: string;
  title: string;
  tone?: "dark" | "light";
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span
        className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {eyebrow}
      </span>
      <h2
        className={`mt-3 font-bold ${tone === "dark" ? "text-[#1b1a18]" : "text-white"}`}
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4.6vw, 3.6rem)",
        }}
      >
        {title}
      </h2>
      <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
      {children}
    </div>
  );
}
