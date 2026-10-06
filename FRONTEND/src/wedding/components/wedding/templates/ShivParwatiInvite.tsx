import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Heart,
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  Send,
} from "lucide-react";
import type { Template } from "../../../data/templates";
import { useInvite } from "../../../rsvp";

/* ==================================================================== */
/*  "SHIV & PARWATI" — Wedding Invitation Website                        */
/*  Bespoke Platinum template — Himalayan temple hero, ornate pillar     */
/*  invite, mandap save-the-date, baroque photo frame, falling gallery.  */
/*                                                                       */
/*  SECTION ORDER:                                                       */
/*   1. Hero — Himalayan temple scene + names in gold serif              */
/*   2. Invite card — ornate pillar borders                              */
/*   3. Script invite — arch card                                        */
/*   4. Events — cards on ornate patterned frame                         */
/*   5. Full-bleed painting panel (varmala scene)                        */
/*   6. Dark mandap section — Save the Date                              */
/*   7. Gold baroque frame — couple photo                                */
/*   8. RSVP — arch card, red button                                     */
/*   9. Counting the Days — floral canopy + countdown                    */
/*  10. Falling photos gallery                                           */
/*  11. Full-bleed blessing panel                                        */
/*  12. Footer                                                           */
/* ==================================================================== */

const C = {
  cream: "#F6EEDD",
  cream2: "#EFE3CB",
  card: "#FFFBF2",
  ink: "#3B2B18",
  gold: "#B98A2F",
  goldL: "#E3C878",
  blue: "#1F3B6E",
  blueD: "#122448",
  red: "#A32E2E",
  sky: "#9FD0EA",
  skyLow: "#F3D9A6",
  dark: "#1B130C",
};

/*  FULL-BLEED ART PANELS — swap with custom AI-painted art
    (Midjourney / Higgsfield: "Indian miniature painting, varmala
    ceremony / Shiv Parvati divine wedding, warm tones") when available. */
const ART = {
  varmala:
    "https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=1800&q=80",
  blessing:
    "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1800&q=80",
  couple:
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1000&q=80",
};

const PHOTOS = [
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&q=80",
  "https://images.unsplash.com/photo-1583939411023-14783179e581?w=500&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=500&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&q=80",
  "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=500&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&q=80",
];

/* -------------------- reveal hook -------------------- */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setOn(true), io.disconnect()),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on] as const;
}

const Reveal = ({
  children,
  delay = 0,
  y = 30,
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const [ref, on] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: on ? 1 : 0,
        transform: on ? "none" : `translateY(${y}px)`,
        transition: `all .9s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* -------------------- ornaments -------------------- */
const Diamond = () => (
  <svg width="22" height="22" viewBox="0 0 24 24">
    <path
      d="M12 2c1.5 3.5 4.5 6.5 8 8-3.5 1.5-6.5 4.5-8 8-1.5-3.5-4.5-6.5-8-8 3.5-1.5 6.5-4.5 8-8z"
      fill={C.gold}
    />
  </svg>
);

const Divider = ({ color = C.gold }: { color?: string }) => (
  <div className="flex items-center justify-center gap-3 my-5">
    <span className="h-px w-16" style={{ background: color }} />
    <Diamond />
    <span className="h-px w-16" style={{ background: color }} />
  </div>
);

/* ornate pillar (miniature-art style column, pure SVG) */
const Pillar = ({ flip }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 60 420"
    className="h-full w-10 md:w-14 shrink-0"
    style={{ transform: flip ? "scaleX(-1)" : "none" }}
    preserveAspectRatio="none"
  >
    <rect x="14" y="30" width="24" height="360" fill={C.blue} />
    <rect x="18" y="30" width="16" height="360" fill={C.blueD} />
    {[...Array(9)].map((_, i) => (
      <circle key={i} cx="26" cy={60 + i * 38} r="5" fill={C.goldL} />
    ))}
    <rect x="8" y="14" width="36" height="18" rx="4" fill={C.gold} />
    <rect x="8" y="388" width="36" height="18" rx="4" fill={C.gold} />
    <path d="M26 0 L40 16 L12 16 Z" fill={C.red} />
  </svg>
);

/* floral canopy over countdown (vines + hanging bells) */
const Canopy = () => (
  <svg viewBox="0 0 800 130" className="w-full max-w-3xl mx-auto" fill="none">
    <path
      d="M20 110 Q200 10 400 60 Q600 10 780 110"
      stroke={C.gold}
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M20 118 Q200 24 400 72 Q600 24 780 118"
      stroke={C.blue}
      strokeWidth="2"
      fill="none"
      opacity=".6"
    />
    {[80, 180, 280, 400, 520, 620, 720].map((x, i) => {
      const y = 60 + Math.abs(400 - x) / 14;
      return (
        <g key={x}>
          <line x1={x} y1={y} x2={x} y2={y + 22} stroke={C.gold} strokeWidth="2" />
          <circle cx={x} cy={y + 28} r="6" fill={i % 2 ? C.red : C.gold} />
          <circle cx={x - 14} cy={y - 4} r="4" fill={C.red} opacity=".8" />
          <circle cx={x + 14} cy={y - 6} r="4" fill={C.goldL} />
        </g>
      );
    })}
    <path d="M300 30 q8 -10 16 0 q8 -10 16 0" stroke={C.ink} strokeWidth="2" fill="none" />
    <path d="M470 22 q8 -10 16 0 q8 -10 16 0" stroke={C.ink} strokeWidth="2" fill="none" />
  </svg>
);

/* mandap / temple roofline silhouette for dark section */
const MandapRoof = () => (
  <svg viewBox="0 0 900 260" className="w-full max-w-4xl mx-auto" fill="none">
    <path d="M450 10 L470 50 L430 50 Z" fill={C.goldL} />
    <path d="M450 40 L560 120 L340 120 Z" fill={C.gold} />
    <path d="M450 70 L640 170 L260 170 Z" fill="#8A6420" />
    <path d="M450 105 L720 220 L180 220 Z" fill="#6E4E17" />
    <rect x="200" y="220" width="500" height="10" fill={C.gold} />
    {[220, 320, 420, 520, 620].map((x) => (
      <circle key={x} cx={x + 30} cy="242" r="5" fill={C.goldL} />
    ))}
  </svg>
);

/* baroque gold frame around a photo */
const BaroqueFrame = ({ src }: { src: string }) => (
  <div className="relative mx-auto w-fit">
    <div
      className="p-3 md:p-4"
      style={{
        background: `linear-gradient(135deg, ${C.goldL}, ${C.gold} 40%, #8A6420 60%, ${C.goldL})`,
        borderRadius: 14,
        boxShadow: "0 30px 70px rgba(59,43,24,.35)",
      }}
    >
      <div className="p-2" style={{ background: "#7A5A1E", borderRadius: 8 }}>
        <img
          src={src}
          alt="The couple"
          className="w-64 md:w-80 h-80 md:h-96 object-cover"
          style={{ borderRadius: 4, border: `3px solid ${C.goldL}` }}
        />
      </div>
    </div>
    {[
      "top-0 left-0",
      "top-0 right-0 scale-x-[-1]",
      "bottom-0 left-0 scale-y-[-1]",
      "bottom-0 right-0 scale-[-1]",
    ].map((pos) => (
      <svg
        key={pos}
        className={`absolute ${pos} w-14 h-14 -m-4`}
        viewBox="0 0 60 60"
      >
        <path
          d="M4 56 Q4 20 22 12 Q40 4 56 4 Q36 12 28 24 Q18 38 4 56Z"
          fill={C.gold}
          stroke="#8A6420"
        />
        <circle cx="14" cy="44" r="5" fill={C.goldL} />
      </svg>
    ))}
  </div>
);

/* -------------------- countdown -------------------- */
function useCountdown(target: Date) {
  const targetTime = target.getTime();
  const calc = useCallback((): [string, number][] => {
    const d = Math.max(0, targetTime - Date.now());
    return [
      ["Days", Math.floor(d / 864e5)],
      ["Hours", Math.floor(d / 36e5) % 24],
      ["Mins", Math.floor(d / 6e4) % 60],
      ["Secs", Math.floor(d / 1e3) % 60],
    ];
  }, [targetTime]);
  const [t, setT] = useState(calc);
  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return t;
}

/* ==================================================================== */
export function ShivParwatiInvite({ template }: { template: Template }) {
  const W = {
    groom: template.couple.one,
    bride: template.couple.two,
    date: new Date(template.eventDate),
    dateText: template.date,
    venue: template.venue.name,
    hashtag: template.hashtag ?? `#${template.couple.one}${template.couple.two}`,
  };
  const EVENTS = template.ceremonies.map((c) => ({
    t: c.name,
    date: c.date,
    time: c.time,
    venue: c.venue,
    img: c.img ?? template.hero,
  }));

  const cd = useCountdown(W.date);
  const [rsvp, setRsvp] = useState({ name: "", guests: "1", attending: "yes" });
  const [sent, setSent] = useState(false);
  const invite = useInvite();
  const [rsvpState, setRsvpState] = useState<{ busy?: boolean; error?: string }>({});
  const sendRsvp = async () => {
    if (rsvp.name.trim().length < 2) return setRsvpState({ error: "Please enter your name." });
    setRsvpState({ busy: true });
    try {
      await invite.send({ name: rsvp.name, guests: parseInt(rsvp.guests, 10) || 1, attending: rsvp.attending });
      setRsvpState({});
      setSent(true);
    } catch (err) {
      setRsvpState({ error: (err as Error).message });
    }
  };

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{ background: C.cream, color: C.ink, fontFamily: "'Jost',sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600&family=Great+Vibes&family=Jost:wght@300;400;500&display=swap');
        .f-hero { font-family:'Cinzel Decorative',serif; }
        .f-cz   { font-family:'Cinzel',serif; }
        .f-scr  { font-family:'Great Vibes',cursive; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes cloud  { from{transform:translateX(-6%)} to{transform:translateX(6%)} }
        @keyframes sway   { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes glow   { 0%,100%{text-shadow:0 0 24px rgba(227,200,120,.45),0 3px 0 rgba(0,0,0,.15)} 50%{text-shadow:0 0 44px rgba(227,200,120,.85),0 3px 0 rgba(0,0,0,.15)} }
        .paper { background-image: radial-gradient(rgba(185,138,47,.08) 1px, transparent 1.5px); background-size: 22px 22px; }
        @media (prefers-reduced-motion: reduce){ *{ animation:none !important; } }
        ::selection{ background:${C.gold}; color:#fff; }
      `}</style>

      {/* ================= 1. HERO — TEMPLE SCENE ================= */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(${C.sky} 0%, #CFE6F1 42%, ${C.skyLow} 100%)`,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: "12%",
            right: "16%",
            width: 90,
            height: 90,
            background: "radial-gradient(#FFF3C4, #F3C86A 70%, transparent 71%)",
            filter: "blur(1px)",
          }}
        />
        {[
          { t: "14%", l: "6%", w: 240 },
          { t: "24%", l: "58%", w: 300 },
          { t: "38%", l: "22%", w: 200 },
        ].map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-80"
            style={{
              top: c.t,
              left: c.l,
              width: c.w,
              height: c.w / 4,
              filter: "blur(16px)",
              animation: `cloud ${18 + i * 7}s ease-in-out infinite alternate`,
            }}
          />
        ))}

        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
          style={{ height: "58%" }}
        >
          <path d="M0 520 L0 260 L220 90 L400 250 L560 140 L760 300 L1000 120 L1220 280 L1440 180 L1440 520Z" fill="#9FB4C6" />
          <path d="M180 122 L220 90 L262 124 L230 130 Z" fill="#fff" />
          <path d="M960 152 L1000 120 L1042 154 L1006 162 Z" fill="#fff" />
          <path d="M0 520 L0 340 L300 250 L620 360 L900 270 L1200 380 L1440 300 L1440 520Z" fill="#6E8CA3" />
          <g fill="#3E5E52">
            {[...Array(24)].map((_, i) => (
              <path key={i} d={`M${i * 62} 520 l18 -64 l18 64 Z`} />
            ))}
          </g>
          <g fill="#2E4A40">
            {[...Array(24)].map((_, i) => (
              <path key={"b" + i} d={`M${30 + i * 62} 520 l22 -88 l22 88 Z`} />
            ))}
          </g>
          <g transform="translate(600,190)">
            <rect x="60" y="150" width="120" height="180" fill="#7C6A54" />
            <rect x="70" y="150" width="100" height="180" fill="#8F7B62" />
            <path d="M50 150 L120 20 L190 150 Z" fill="#6B5A46" />
            <path d="M64 150 L120 40 L176 150 Z" fill="#7C6A54" />
            <path d="M104 60 L120 8 L136 60 Z" fill={C.gold} />
            <circle cx="120" cy="6" r="6" fill={C.goldL} />
            <path d="M100 330 L100 240 Q120 214 140 240 L140 330 Z" fill="#3B2B18" />
            <path d="M100 240 Q120 214 140 240" stroke={C.gold} strokeWidth="4" fill="none" />
            <path d="M52 160 Q120 205 188 160" stroke="#E8912D" strokeWidth="9" fill="none" strokeLinecap="round" />
            <path d="M52 160 Q120 198 188 160" stroke="#F3B83C" strokeWidth="4" fill="none" />
            {[62, 92, 120, 148, 178].map((x, i) => (
              <circle key={x} cx={x} cy={168 + [6, 15, 18, 15, 6][i]} r="6" fill="#D9541E" />
            ))}
            <line x1="52" y1="150" x2="52" y2="96" stroke="#5A4A38" strokeWidth="3" />
            <path d="M52 96 L84 104 L52 114 Z" fill={C.red} />
            <line x1="188" y1="150" x2="188" y2="96" stroke="#5A4A38" strokeWidth="3" />
            <path d="M188 96 L156 104 L188 114 Z" fill={C.red} />
          </g>
          <path d="M0 520 L1440 520 L1440 492 Q720 452 0 492 Z" fill={C.cream} />
        </svg>

        <div
          className="relative z-10 text-center px-6"
          style={{ animation: "floatY 7s ease-in-out infinite" }}
        >
          <Reveal>
            <p className="f-cz uppercase tracking-[.4em] text-xs md:text-sm mb-6" style={{ color: C.red }}>
              The Wedding Of
            </p>
          </Reveal>
          <Reveal delay={150}>
            <h1
              className="f-hero font-bold leading-[.95]"
              style={{
                fontSize: "clamp(3.4rem,12vw,9rem)",
                color: "#E9B93C",
                WebkitTextStroke: "1px #8A6420",
                animation: "glow 4s ease-in-out infinite",
              }}
            >
              {W.groom.toUpperCase()}
            </h1>
          </Reveal>
          <Reveal delay={280}>
            <div className="f-scr" style={{ fontSize: "clamp(2rem,5vw,3.4rem)", color: C.red }}>
              &
            </div>
          </Reveal>
          <Reveal delay={380}>
            <h1
              className="f-hero font-bold leading-[.95]"
              style={{
                fontSize: "clamp(3.4rem,12vw,9rem)",
                color: "#E9B93C",
                WebkitTextStroke: "1px #8A6420",
                animation: "glow 4s ease-in-out infinite .6s",
              }}
            >
              {W.bride.toUpperCase()}
            </h1>
          </Reveal>
          <Reveal delay={520}>
            <p className="f-cz mt-8 tracking-[.25em] text-xs md:text-sm">
              {W.dateText}
            </p>
          </Reveal>
        </div>

        <a
          href="#invite"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 f-cz text-[10px] tracking-[.3em] flex flex-col items-center"
          style={{ color: C.red }}
        >
          SCROLL
          <ChevronDown size={16} className="animate-bounce" />
        </a>
      </section>

      {/* ================= 2. INVITE CARD — PILLARS ================= */}
      <section id="invite" className="py-20 px-5 paper">
        <Reveal>
          <div
            className="max-w-2xl mx-auto flex items-stretch rounded-2xl overflow-hidden"
            style={{
              background: C.card,
              border: `2px solid ${C.gold}`,
              boxShadow: "0 26px 60px rgba(59,43,24,.15)",
            }}
          >
            <Pillar />
            <div className="flex-1 py-12 px-4 md:px-8 text-center">
              <p className="f-cz text-[10px] md:text-xs tracking-[.35em] uppercase mb-5" style={{ color: C.red }}>
                || Shubh Vivah ||
              </p>
              <h2 className="f-hero" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", color: C.blue }}>
                {W.groom.toUpperCase()}
                <span className="f-scr px-2 md:px-3" style={{ color: C.red, fontSize: ".8em" }}>
                  &
                </span>
                {W.bride.toUpperCase()}
              </h2>
              <Divider />
              <p className="text-sm leading-relaxed max-w-sm mx-auto">
                Together with their families, joyfully invite you to bless the
                sacred union of their hearts.
              </p>
              <div className="f-cz mt-6 text-sm tracking-widest" style={{ color: C.gold }}>
                {W.dateText}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm">
                <MapPin size={13} style={{ color: C.red }} /> {W.venue}
              </div>
            </div>
            <Pillar flip />
          </div>
        </Reveal>
      </section>

      {/* ================= 3. SCRIPT INVITE — ARCH ================= */}
      <section className="pb-20 px-5">
        <Reveal>
          <div
            className="relative max-w-xl mx-auto text-center px-8 pt-20 pb-12"
            style={{
              background: C.card,
              border: `2px solid ${C.gold}`,
              borderRadius: "180px 180px 16px 16px",
              boxShadow: "0 26px 60px rgba(59,43,24,.15)",
            }}
          >
            <div
              className="absolute inset-2 pointer-events-none"
              style={{ border: `1px dashed ${C.gold}`, borderRadius: "170px 170px 12px 12px" }}
            />
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rotate-45 flex items-center justify-center"
              style={{ background: C.red, border: `2px solid ${C.gold}` }}
            />
            <div className="f-scr" style={{ fontSize: "clamp(3rem,8vw,4.6rem)", color: C.red }}>
              You're Invited
            </div>
            <Divider />
            <p className="text-sm leading-relaxed max-w-sm mx-auto">
              With the blessings of Lord Shiva and hearts full of joy, we
              request the honour of your presence at our wedding celebrations.
            </p>
            <div className="f-scr mt-6 text-3xl" style={{ color: C.blue }}>
              {W.hashtag}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= 4. EVENTS — ORNATE FRAME ================= */}
      <section
        className="py-20 px-4 md:px-8 relative"
        style={{
          background: `
            repeating-linear-gradient(45deg, ${C.blueD} 0 12px, ${C.blue} 12px 24px)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `radial-gradient(circle, ${C.goldL} 2px, transparent 3px)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="relative max-w-5xl mx-auto rounded-3xl p-6 md:p-12 paper"
          style={{ background: C.cream, border: `3px solid ${C.gold}` }}
        >
          <Reveal>
            <div className="text-center mb-12">
              <h2 className="f-scr" style={{ fontSize: "clamp(2.6rem,6vw,4rem)", color: C.blue }}>
                Wedding Events
              </h2>
              <Divider />
            </div>
          </Reveal>

          <div className="flex flex-col gap-8">
            {EVENTS.map((e, i) => (
              <Reveal key={e.t} delay={i * 100}>
                <div
                  className={`flex flex-col md:flex-row ${i % 2 ? "md:flex-row-reverse" : ""} items-stretch rounded-2xl overflow-hidden`}
                  style={{
                    background: C.card,
                    border: `2px solid ${C.gold}`,
                    boxShadow: "0 18px 40px rgba(59,43,24,.14)",
                  }}
                >
                  <div className="md:w-2/5 h-56 md:h-auto overflow-hidden">
                    <img src={e.img} alt={e.t} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 p-7 md:p-9 flex flex-col justify-center text-center md:text-left">
                    <h3 className="f-cz text-2xl md:text-3xl mb-3" style={{ color: C.blue }}>
                      {e.t}
                    </h3>
                    <div className="flex flex-col gap-1.5 text-sm mb-5">
                      <span className="flex items-center gap-2 justify-center md:justify-start">
                        <Calendar size={14} style={{ color: C.red }} /> {e.date}
                      </span>
                      <span className="flex items-center gap-2 justify-center md:justify-start">
                        <Clock size={14} style={{ color: C.red }} /> {e.time} onwards
                      </span>
                      <span className="flex items-center gap-2 justify-center md:justify-start">
                        <MapPin size={14} style={{ color: C.red }} /> {e.venue}
                      </span>
                    </div>
                    <button
                      className="f-cz w-max mx-auto md:mx-0 px-6 py-2.5 rounded-full text-xs tracking-[.2em] uppercase text-white transition-transform hover:scale-105"
                      style={{ background: C.blue }}
                    >
                      View Location
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. FULL-BLEED ART — VARMALA ================= */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <img
          src={ART.varmala}
          alt="Varmala ceremony painting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(27,19,12,.25), rgba(27,19,12,.45))" }}
        />
        <div className="relative h-full flex items-end justify-center pb-12 px-6 text-center">
          <Reveal>
            <p className="f-scr text-3xl md:text-5xl text-white" style={{ textShadow: "0 4px 22px rgba(0,0,0,.6)" }}>
              "Bound by love, blessed by the divine"
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= 6. DARK MANDAP — SAVE THE DATE ================= */}
      <section
        className="py-24 px-5 text-center relative overflow-hidden"
        style={{ background: `radial-gradient(ellipse at 50% 0%, #2E2114, ${C.dark} 70%)` }}
      >
        <Reveal>
          <MandapRoof />
        </Reveal>
        <Reveal delay={150}>
          <h2 className="f-hero mt-10 mb-3" style={{ fontSize: "clamp(1.8rem,5vw,3rem)", color: C.goldL }}>
            Save The Date
          </h2>
          <p className="f-cz tracking-[.3em] text-sm mb-8" style={{ color: "#D9C9A8" }}>
            {W.dateText}
          </p>
          <button
            className="f-cz px-9 py-3.5 rounded-full text-xs tracking-[.25em] uppercase transition-transform hover:scale-105"
            style={{ background: C.gold, color: C.dark }}
          >
            Add to Calendar
          </button>
        </Reveal>
      </section>

      {/* ================= 7. GOLD FRAME — COUPLE PHOTO ================= */}
      <section className="py-24 px-5 paper" style={{ background: C.cream2 }}>
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="f-scr" style={{ fontSize: "clamp(2.4rem,6vw,3.8rem)", color: C.blue }}>
              The Couple
            </h2>
            <Divider />
          </div>
        </Reveal>
        <Reveal delay={150} style={{ animation: "sway 8s ease-in-out infinite" }}>
          <BaroqueFrame src={template.image || ART.couple} />
        </Reveal>
        <Reveal delay={280}>
          <p className="f-scr text-center mt-10 text-3xl" style={{ color: C.red }}>
            {W.groom} & {W.bride}
          </p>
        </Reveal>
      </section>

      {/* ================= 8. RSVP — ARCH + RED BUTTON ================= */}
      <section id="rsvp" className="py-24 px-5">
        <Reveal>
          <div
            className="relative max-w-xl mx-auto text-center px-7 md:px-10 pt-20 pb-12"
            style={{
              background: C.card,
              border: `2px solid ${C.gold}`,
              borderRadius: "180px 180px 16px 16px",
              boxShadow: "0 26px 60px rgba(59,43,24,.15)",
            }}
          >
            <div
              className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rotate-45"
              style={{ background: C.red, border: `2px solid ${C.gold}` }}
            />
            <h2 className="f-scr mb-1" style={{ fontSize: "clamp(2.6rem,6vw,3.8rem)", color: C.blue }}>
              Will You Join Us?
            </h2>
            <p className="f-cz text-[10px] tracking-[.3em] uppercase mb-8" style={{ color: C.red }}>
              Kindly respond at the earliest
            </p>

            {sent ? (
              <div className="py-6">
                <Heart size={34} className="mx-auto mb-3" fill={C.red} color={C.red} />
                <p className="f-cz text-lg" style={{ color: C.blue }}>
                  Thank you, {rsvp.name || "dear guest"}!
                </p>
                <p className="text-sm mt-1">We can't wait to celebrate with you.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-left max-w-sm mx-auto">
                <input
                  value={rsvp.name}
                  onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl bg-white outline-none text-sm"
                  style={{ border: `1.5px solid ${C.gold}` }}
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={rsvp.guests}
                    onChange={(e) => setRsvp({ ...rsvp, guests: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white outline-none text-sm"
                    style={{ border: `1.5px solid ${C.gold}` }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} Guest{n > 1 ? "s" : ""}</option>
                    ))}
                  </select>
                  <select
                    value={rsvp.attending}
                    onChange={(e) => setRsvp({ ...rsvp, attending: e.target.value })}
                    className="px-4 py-3 rounded-xl bg-white outline-none text-sm"
                    style={{ border: `1.5px solid ${C.gold}` }}
                  >
                    <option value="yes">Joyfully Yes</option>
                    <option value="no">Regretfully No</option>
                  </select>
                </div>
                {rsvpState.error && (
                  <p role="alert" className="text-sm text-center" style={{ color: C.red }}>{rsvpState.error}</p>
                )}
                <button
                  disabled={rsvpState.busy}
                  onClick={sendRsvp}
                  className="f-cz inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs tracking-[.25em] uppercase text-white transition-transform hover:scale-[1.03]"
                  style={{ background: C.red }}
                >
                  {rsvpState.busy ? "Sending…" : "Send RSVP"} <Send size={14} />
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </section>

      {/* ================= 9. COUNTING THE DAYS ================= */}
      <section
        className="py-20 px-5 text-center paper"
        style={{ background: C.cream2, borderTop: `2px solid ${C.gold}44`, borderBottom: `2px solid ${C.gold}44` }}
      >
        <Reveal>
          <Canopy />
        </Reveal>
        <Reveal delay={120}>
          <h2 className="f-scr -mt-2 mb-10" style={{ fontSize: "clamp(2.6rem,6vw,4rem)", color: C.blue }}>
            Counting the Days
          </h2>
        </Reveal>
        <Reveal delay={220}>
          <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
            {cd.map(([l, v]) => (
              <div
                key={l}
                className="w-[72px] md:w-28 py-4 md:py-6 rounded-xl"
                style={{
                  background: C.card,
                  border: `2px solid ${C.gold}`,
                  boxShadow: "0 14px 30px rgba(59,43,24,.14)",
                }}
              >
                <div className="f-cz text-2xl md:text-5xl font-semibold" style={{ color: C.red }}>
                  {String(v).padStart(2, "0")}
                </div>
                <div className="f-cz text-[9px] md:text-xs tracking-[.2em] uppercase mt-1">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ================= 10. FALLING PHOTOS GALLERY ================= */}
      <FallingGallery />

      {/* ================= 11. FULL-BLEED ART — BLESSING ================= */}
      <section className="relative h-[60vh] md:h-[85vh] overflow-hidden">
        <img
          src={ART.blessing}
          alt="Divine blessing painting"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(rgba(18,36,72,.2), rgba(18,36,72,.55))" }}
        />
        <div className="relative h-full flex flex-col items-center justify-end pb-14 px-6 text-center">
          <Reveal>
            <p className="f-cz tracking-[.35em] uppercase text-xs mb-3" style={{ color: C.goldL }}>
              {template.script}
            </p>
            <p className="f-scr text-3xl md:text-5xl text-white" style={{ textShadow: "0 4px 22px rgba(0,0,0,.6)" }}>
              With divine blessings, forever begins
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= 12. FOOTER ================= */}
      <footer className="py-14 text-center" style={{ background: C.blueD, color: "#EAF0FF" }}>
        <div className="f-scr text-4xl md:text-5xl mb-2" style={{ color: C.goldL }}>
          {W.groom} & {W.bride}
        </div>
        <p className="f-cz text-[10px] tracking-[.35em] uppercase mb-2">{W.dateText}</p>
        <p className="f-scr text-2xl mb-4" style={{ color: C.goldL }}>
          {W.hashtag}
        </p>
        <Divider color={C.goldL} />
      </footer>
    </div>
  );
}

/* Falling photos gallery is its own component so each <img> can use the
   useReveal hook without breaking react's rules-of-hooks inside .map(). */
function FallingGallery() {
  const positions = [
    { top: "2%", left: "4%" },
    { top: "0%", left: "38%" },
    { top: "4%", right: "4%" },
    { top: "34%", left: "16%" },
    { top: "30%", right: "18%" },
    { top: "58%", left: "2%" },
    { top: "56%", left: "40%" },
    { top: "60%", right: "2%" },
  ];
  return (
    <section className="py-24 px-5 overflow-hidden paper">
      <Reveal>
        <div className="text-center mb-14">
          <h2 className="f-scr" style={{ fontSize: "clamp(2.6rem,6vw,4rem)", color: C.blue }}>
            Our Moments
          </h2>
          <Divider />
        </div>
      </Reveal>

      <div className="relative max-w-4xl mx-auto min-h-[560px] md:min-h-[520px]">
        {PHOTOS.map((src, i) => (
          <FallingPhoto key={src} src={src} index={i} position={positions[i]} />
        ))}
      </div>
    </section>
  );
}

function FallingPhoto({
  src,
  index,
  position,
}: {
  src: string;
  index: number;
  position: React.CSSProperties;
}) {
  const [ref, on] = useReveal(0.1);
  const rot = (index % 2 ? 1 : -1) * (4 + (index % 4) * 3);
  return (
    <figure
      ref={ref}
      className="absolute bg-white p-2.5 pb-8 w-36 md:w-48 hover:z-20 hover:scale-110 transition-transform duration-300"
      style={{
        ...position,
        boxShadow: "0 16px 34px rgba(59,43,24,.25)",
        opacity: on ? 1 : 0,
        transform: on
          ? `rotate(${rot}deg)`
          : `translateY(-140px) rotate(${rot * 3}deg)`,
        transition: `all 1s cubic-bezier(.22,1,.36,1) ${index * 140}ms`,
      }}
    >
      <img src={src} alt={`Memory ${index + 1}`} className="w-full h-32 md:h-40 object-cover" />
    </figure>
  );
}
