import { useEffect, useState } from "react";
import type { Template } from "../../../data/templates";
import { HeroCanvas } from "../vogue/HeroCanvas";
import { Chronicle } from "../vogue/Chronicle";
import { GalaDetails } from "../vogue/GalaDetails";
import { RsvpPortal } from "../vogue/RsvpPortal";

/* =========================================================
   Vogue Silver & Gold — "The Editorial Vow"
   A cinematic, monochrome-luxe wedding edition. Snow white and
   alabaster surfaces, liquid chrome typography, brushed white-
   gold hairlines. Assembles the four kinetic zones: Hero
   Canvas, The Chronicle, The Gala Details, The RSVP Portal.
   ========================================================= */

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return scrollY;
}

export function VogueSilverGold({ template }: { template: Template }) {
  const scrollY = useScrollY();
  const year = new Date(template.eventDate).getFullYear();

  return (
    <div className="vsg-root relative isolate overflow-x-hidden bg-[#f8f6f1] text-[#1b1a18]">
      <style>{`
        .vsg-root { isolation: isolate; }
        .vsg-root::before {
          content: "";
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: 0.55;
          mix-blend-mode: multiply;
          background-image:
            linear-gradient(115deg, transparent 0 46%, rgba(150,146,138,0.10) 47%, transparent 49%),
            linear-gradient(72deg, transparent 0 56%, rgba(170,168,162,0.10) 57%, transparent 59%),
            radial-gradient(circle at 28% 18%, rgba(255,255,255,0.65), transparent 30%);
          background-size: 640px 640px, 520px 520px, 100% 100%;
        }

        .vsg-photo {
          filter: grayscale(45%) saturate(0.65) contrast(1.08) brightness(1.03);
          transition: filter 700ms ease;
        }
        .vsg-photo:hover { filter: grayscale(18%) saturate(0.9) contrast(1.1) brightness(1.04); }

        .vsg-chrome {
          background-image: linear-gradient(100deg, #6b6b6f 0%, #ffffff 20%, #9aa0a6 38%, #ffffff 55%, #d9c98a 68%, #ffffff 85%, #6b6b6f 100%);
          background-size: 260% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: vsg-chrome-shimmer 9s linear infinite;
        }

        .vsg-line { overflow: hidden; }
        .vsg-line-inner {
          transform: translateY(115%);
          opacity: 0;
          animation: vsg-line-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--vsg-delay, 0ms);
        }

        .vsg-scroll-dot { animation: vsg-scroll-dot 1.9s ease-in-out infinite; }

        .vsg-blob {
          clip-path: polygon(48% 8%, 52% 4%, 55% 40%, 53% 78%, 50% 96%, 47% 88%, 45% 54%, 46% 20%);
          transition: clip-path 1.15s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vsg-blob.is-visible.vsg-blob-a {
          clip-path: polygon(8% 4%, 88% 0%, 100% 34%, 94% 84%, 70% 100%, 20% 94%, 0% 62%, 4% 22%);
        }
        .vsg-blob.is-visible.vsg-blob-b {
          clip-path: polygon(4% 18%, 76% 0%, 100% 26%, 96% 74%, 66% 100%, 14% 92%, 0% 56%, 10% 6%);
        }
        .vsg-blob-a:hover {
          clip-path: polygon(2% 10%, 80% 2%, 100% 40%, 90% 90%, 60% 98%, 12% 100%, 0% 66%, 6% 30%) !important;
        }
        .vsg-blob-b:hover {
          clip-path: polygon(10% 2%, 92% 8%, 98% 46%, 100% 88%, 58% 100%, 8% 94%, 0% 48%, 4% 14%) !important;
        }

        @keyframes vsg-chrome-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 260% 50%; }
        }
        @keyframes vsg-line-in {
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes vsg-scroll-dot {
          0% { transform: translate(-50%, -8px); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(-50%, 52px); opacity: 0; }
        }
        @keyframes vsg-step-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vsg-root *, .vsg-root *::before, .vsg-root *::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 1ms !important;
          }
          .vsg-line-inner { transform: none; opacity: 1; }
        }
      `}</style>

      <HeroCanvas template={template} scrollY={scrollY} />
      <Chronicle template={template} />
      <GalaDetails template={template} />
      <RsvpPortal template={template} />

      <footer className="relative border-t border-[#D4AF37]/25 bg-[#f8f6f1] py-16 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.5em] text-[#D4AF37]"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {year} · The Private Edition
        </p>
        <h2
          className="mt-3 text-3xl font-bold sm:text-4xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {template.couple.one} {template.couple.amp} {template.couple.two}
        </h2>
        {template.hashtag && (
          <p
            className="mt-2 text-lg italic text-[#5b5852]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {template.hashtag}
          </p>
        )}
      </footer>
    </div>
  );
}
