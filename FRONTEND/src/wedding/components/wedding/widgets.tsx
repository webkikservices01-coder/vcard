import { useEffect, useMemo, useRef, useState } from "react";
import type { Template, Tier } from "../../data/templates";

/* =========================================================
   Shared widgets used by all invite templates
   Tier-gated so silver renders a subset, platinum shows all
   ========================================================= */

export function Petals({
  color,
  count = 22,
}: {
  color: string;
  count?: number;
}) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 14,
        size: 8 + Math.random() * 16,
        rotate: Math.random() * 360,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: "-40px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            transform: `rotate(${p.rotate}deg)`,
            animation: `wt-fall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
            filter: "drop-shadow(0 4px 6px rgba(0,0,0,.4))",
            background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
            borderRadius: "50% 0 50% 0",
          }}
        />
      ))}
    </div>
  );
}

export function Fireworks() {
  const bursts = useMemo(
    () =>
      Array.from({ length: 12 }).map(() => ({
        left: 10 + Math.random() * 80,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 2,
        color: ["#f4c96a", "#ff8a3d", "#e8a578", "#f0d078"][
          Math.floor(Math.random() * 4)
        ],
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {bursts.map((b, i) => (
        <span
          key={i}
          className="absolute bottom-0 h-3 w-3 rounded-full"
          style={{
            left: `${b.left}%`,
            background: b.color,
            boxShadow: `0 0 24px 6px ${b.color}`,
            animation: `wt-firework ${b.duration}s ease-out infinite`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Mandala({ size = 200 }: { size?: number }) {
  return (
    <svg
      className="wt-spin-slow"
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ filter: "drop-shadow(0 0 16px var(--wt-gold))" }}
    >
      <defs>
        <radialGradient id="mg-grad">
          <stop offset="0%" stopColor="var(--wt-gold-lite)" />
          <stop offset="100%" stopColor="var(--wt-gold)" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#mg-grad)" strokeWidth="1.2">
        <circle cx="100" cy="100" r="90" />
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="50" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="30" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 24;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 32}
              y1={100 + Math.sin(a) * 32}
              x2={100 + Math.cos(a) * 90}
              y2={100 + Math.sin(a) * 90}
            />
          );
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI * 2) / 12;
          return (
            <circle
              key={i}
              cx={100 + Math.cos(a) * 70}
              cy={100 + Math.sin(a) * 70}
              r="4"
            />
          );
        })}
      </g>
      <text
        x="100"
        y="106"
        textAnchor="middle"
        fill="var(--wt-gold-lite)"
        fontFamily="var(--wt-display)"
        fontSize="18"
        fontWeight="700"
      >
        ॐ
      </text>
    </svg>
  );
}

export function EntryLoader({
  template,
  onEnter,
}: {
  template: Template;
  onEnter: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center text-center"
      style={{
        background: `linear-gradient(180deg, var(--wt-veil), rgba(0,0,0,0.85)), url(${template.image || template.hero}) center/cover no-repeat`,
      }}
    >
      <div className="relative z-10 px-6">
        <Mandala size={220} />
        <p
          className="mt-4 text-lg tracking-[0.3em]"
          style={{
            fontFamily: "var(--wt-script)",
            color: "var(--wt-gold-lite)",
          }}
        >
          {template.script}
        </p>
        <h1
          className="mt-3 wt-text-gradient font-bold"
          style={{
            fontFamily: "var(--wt-display)",
            fontSize: "clamp(38px, 8vw, 72px)",
            lineHeight: 1.05,
          }}
        >
          {template.couple.one} {template.couple.amp} {template.couple.two}
        </h1>
        <button
          onClick={onEnter}
          className="mt-8 inline-block cursor-pointer rounded-full px-8 py-3.5 text-sm uppercase tracking-[0.25em] transition-transform hover:-translate-y-1"
          style={{
            fontFamily: "var(--wt-label)",
            background:
              "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))",
            color: "#fff",
            boxShadow: "0 14px 34px rgba(0,0,0,.45)",
          }}
        >
          Open Invitation
        </button>
      </div>
    </div>
  );
}

export function Countdown({ eventDate }: { eventDate: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(eventDate).getTime();
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  const cells = [
    { v: days, l: "Days" },
    { v: hrs, l: "Hrs" },
    { v: mins, l: "Min" },
    { v: secs, l: "Sec" },
  ];
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      {cells.map((c) => (
        <div
          key={c.l}
          className="min-w-[84px] rounded-2xl px-4 py-3 backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:scale-105"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid var(--wt-gold)",
          }}
        >
          <b
            className="block text-3xl font-bold"
            style={{
              fontFamily: "var(--wt-display)",
              color: "var(--wt-gold-lite)",
            }}
          >
            {String(c.v).padStart(2, "0")}
          </b>
          <span
            className="text-[11px] uppercase tracking-[0.2em]"
            style={{
              fontFamily: "var(--wt-label)",
              color: "var(--wt-ink-soft)",
            }}
          >
            {c.l}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MusicToggle({ musicUrl }: { musicUrl?: string } = {}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceUrl =
    musicUrl ||
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1718e49f21.mp3?filename=indian-fusion-tabla-flute-loop-19246.mp3";

  useEffect(() => {
    if (!sourceUrl) return;
    audioRef.current = new Audio(sourceUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.35;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [sourceUrl]);

  return (
    <button
      onClick={() => {
        if (!audioRef.current) return;
        if (playing) audioRef.current.pause();
        else audioRef.current.play().catch(() => {});
        setPlaying(!playing);
      }}
      aria-label="Toggle background music"
      className="grid h-11 w-11 place-items-center rounded-full text-lg transition"
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid var(--wt-gold)",
        color: "var(--wt-gold-lite)",
        animation: playing ? "wt-spin 6s linear infinite" : undefined,
      }}
    >
      {playing ? "♫" : "♪"}
    </button>
  );
}

/* 3D tilt hover for a photo frame — used in Platinum tier */
export function TiltFrame({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1200px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
      }}
      onMouseLeave={() => {
        if (ref.current) ref.current.style.transform = "";
      }}
      style={{
        transformStyle: "preserve-3d",
        transition: "transform .2s ease-out",
      }}
    >
      <div
        className="wt-kb h-full w-full"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </div>
  );
}

/* Reveal — scroll-triggered by default, or `immediate` to fade in on mount
   (used for above-the-fold hero content). Supports a stagger `delay` in ms. */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  immediate = false,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (immediate) {
      const t = window.setTimeout(() => setVisible(true), 20);
      return () => window.clearTimeout(t);
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setVisible(true));
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [immediate]);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0) scale(1)"
          : "translateY(38px) scale(0.97)",
        transition: `opacity 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 900ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}

/* Thin gold progress bar pinned to the top of the viewport, fills as the
   guest scrolls through the invitation — a premium "reading progress" cue. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const scrollTop = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-[80] h-[3px]"
      style={{ background: "rgba(0,0,0,0.15)" }}
      aria-hidden="true"
    >
      <div
        style={{
          width: `${progress}%`,
          height: "100%",
          background:
            "linear-gradient(90deg, var(--wt-accent), var(--wt-gold-lite), var(--wt-gold))",
          boxShadow:
            "0 0 12px color-mix(in oklab, var(--wt-gold) 60%, transparent)",
          transition: "width 120ms linear",
        }}
      />
    </div>
  );
}

export function tierHasMusic(tier: Tier) {
  return tier === "gold" || tier === "platinum";
}
export function tierHasCeremonies(tier: Tier) {
  return tier === "gold" || tier === "platinum";
}
export function tierHasLoader(tier: Tier) {
  return tier === "platinum";
}
export function tierHasChat(tier: Tier) {
  return tier === "platinum"; // Chatbot is a Platinum-exclusive feature
}
export function tierHasWishes(tier: Tier) {
  return tier === "platinum";
}
export function tierHasParticles(tier: Tier) {
  return tier === "gold" || tier === "platinum";
}
