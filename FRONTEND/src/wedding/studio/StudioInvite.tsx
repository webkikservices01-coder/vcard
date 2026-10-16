import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { QRCodeCanvas } from "qrcode.react";
import type { Template } from "../data/templates";
import { useInvite } from "../rsvp";
import { DESIGNS, designBySlug, loadStudioFonts, mix, tokensOf, type Design, type Palette, type Tokens } from "./designs";
import "./studio.css";

/* =========================================================
   StudioInvite: the eight Invite Studio wedding designs (studio/designs.ts). One renderer reads
   the design's fonts, palette and tokens; the couple's own details come from the invite
   (Template + extras). In the design showcase the sample details are shown.
   ========================================================= */

const API = (import.meta.env.VITE_API_URL as string) || "";
const SITE = "https://aicardly.com";
const pad = (n: number) => String(Math.max(0, n)).padStart(2, "0");
const ICON = {
  nav: "M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11zM12 12.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z",
  call: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  wa: "M4 20l1.3-4A8 8 0 1 1 8 18.7z",
  cal: "M4 7h16v13H4zM4 11h16M9 4v4M15 4v4",
  rsvp: "M3.5 6h17v12h-17zM4 7l8 6 8-6",
  spark: "M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z",
  sound: "M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6",
  mute: "M4 9v6h4l5 4V5L8 9zM16 9l5 6M21 9l-5 6",
};
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

type Ceremony = Template["ceremonies"][number] & { dress?: string };

// ── Small helpers ───────────────────────────────────────────────────────────
const digits = (p?: string) => String(p || "").replace(/[^\d+]/g, "");
const waNumber = (p?: string) => {
  const d = String(p || "").replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};
const initials = (a: string, b: string) => `${(a || "").trim()[0] || ""}${(b || "").trim()[0] || ""}`.toUpperCase();

// A function's start time from its free-text date and time ("Fri, 12 Feb", "3:00 PM"), in the
// wedding's year; falls back to the main date.
function whenOf(c: Ceremony, eventDate?: string): Date | null {
  const year = eventDate ? new Date(eventDate).getFullYear() : new Date().getFullYear();
  const day = String(c.date || "").replace(/^[A-Za-z]{3},?\s*/, "");
  const tryParse = (s: string) => {
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : new Date(t);
  };
  return tryParse(`${day} ${year} ${c.time || ""}`) || tryParse(`${day} ${year}`) || (eventDate ? new Date(eventDate) : null);
}

function icsFile(title: string, events: { name: string; start: Date; venue: string }[]) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s: string) => String(s || "").replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, " ");
  const body = events
    .map((e) => {
      const end = new Date(e.start.getTime() + 3 * 3600 * 1000);
      return ["BEGIN:VEVENT", `UID:${stamp(e.start)}-${Math.random().toString(36).slice(2)}@aicardly.com`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp(end)}`, `SUMMARY:${esc(`${e.name} · ${title}`)}`, `LOCATION:${esc(e.venue)}`, "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(e.name)} tomorrow`, "END:VALARM", "END:VEVENT"].join("\r\n");
    })
    .join("\r\n");
  const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Aicardly//Invite//EN\r\n${body}\r\nEND:VCALENDAR`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = `${title.replace(/[^\w]+/g, "-").toLowerCase() || "invite"}.ics`;
  a.click();
}

// A soft bell / chime when the invite opens (no sound files).
function chime() {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    [660, 880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), ctx.currentTime + i * 0.12 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 2.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 2.4);
    });
  } catch {
    /* no audio */
  }
}

// ── Shared look ─────────────────────────────────────────────────────────────
type Look = { d: Design; P: Palette; T: Tokens };

function Divider({ look, label }: { look: Look; label: string }) {
  const { P, T } = look;
  return (
    <div className="flex flex-col items-center gap-2 py-8" aria-hidden={!label}>
      {T.divC ? (
        <div className="relative" style={{ width: 140, height: 58 }}>
          <div className="absolute inset-0" style={{ border: `1.5px solid ${P.metal}`, borderBottom: "none", borderRadius: "70px 70px 0 0" }} />
          <div className="absolute left-1/2 top-[-6px] h-3 w-3 -translate-x-1/2 rotate-45" style={{ background: P.surface, border: `1.5px solid ${P.metal}` }} />
          <div className="absolute bottom-0 left-1/2 top-[6px] w-px -translate-x-1/2" style={{ background: P.metal }} />
        </div>
      ) : (
        <div style={{ width: T.divW, height: T.divH, background: T.divBg, maxWidth: "70%" }} />
      )}
      {label && <p className="text-[11px] uppercase tracking-[.32em]" style={{ color: P.a1, fontFamily: look.d.text }}>{label}</p>}
    </div>
  );
}

const Label = ({ look, children }: { look: Look; children: ReactNode }) => (
  <p className="mb-4 text-center text-[11px] uppercase tracking-[.32em]" style={{ color: look.P.a1, fontFamily: look.d.text }}>{children}</p>
);

function Petals({ colors }: { colors: string[] }) {
  if (!colors.length) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <span
          key={i}
          className="absolute top-0 block"
          style={{ left: `${(8 + i * 11) % 96}%`, width: 8 + (i % 3) * 3, height: 10 + (i % 3) * 3, background: colors[i % colors.length], borderRadius: "70% 0 70% 0", opacity: 0.8, animation: `st-fall ${10 + (i % 4) * 3}s linear ${-i * 2.1}s infinite` }}
        />
      ))}
    </div>
  );
}

function Glints() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {[["30%", "18%", "3s", "0s"], ["62%", "26%", "3.6s", "-1.2s"], ["48%", "10%", "2.8s", "-2s"], ["72%", "40%", "4s", "-.6s"]].map(([x, y, d, dl], i) => (
        <span key={i} className="absolute h-3 w-3" style={{ left: x, top: y, background: "radial-gradient(circle, #fff, transparent 60%)", animation: `st-glint ${d} ease-in-out ${dl} infinite` }} />
      ))}
    </div>
  );
}

function Burst({ on, colors, k }: { on: boolean; colors: string[]; k: number }) {
  if (!on) return null;
  return (
    <div key={k} className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        const r = 90 + (i % 3) * 40;
        return <span key={i} className="absolute block h-2.5 w-2.5 rounded-full" style={{ background: colors[i % colors.length], ["--dx" as string]: `${Math.round(Math.cos(a) * r)}px`, ["--dy" as string]: `${Math.round(Math.sin(a) * r)}px`, animation: "st-burst 1.6s cubic-bezier(.22,1,.36,1) both" } as CSSProperties} />;
      })}
    </div>
  );
}

// ── Opening ─────────────────────────────────────────────────────────────────
function Opening({ look, guest, onOpen }: { look: Look; guest: string; onOpen: (sound: boolean) => void }) {
  const { d, P, T } = look;
  const [open, setOpen] = useState(false);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const go = (sound = true) => {
    if (open) return;
    setOpen(true);
    if (sound) chime();
    try {
      navigator.vibrate?.(30);
    } catch {
      /* no vibration */
    }
    setTimeout(() => onOpen(sound), 1900);
  };
  const down = (e: RPointerEvent) => {
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };
  const up = (e: RPointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const g = d.gesture[0];
    // The design's gesture, or a plain tap (always works, so nobody gets stuck).
    if (g === "tap" || Math.hypot(dx, dy) < 10 || (g === "down" && dy > 40) || (g === "up" && dy < -40) || (g === "side" && Math.abs(dx) > 40)) go();
  };
  const plate = d.plate(P);
  const ease = "transform 1.6s cubic-bezier(.65,0,.35,1), opacity 1.2s ease";
  const o = open;
  const panel = (side: "l" | "r"): CSSProperties => ({ position: "absolute", top: 0, bottom: 0, width: "50%", [side === "l" ? "left" : "right"]: 0, transition: ease, transformOrigin: side === "l" ? "left center" : "right center" });

  let art: ReactNode = null;
  if (d.open === "Doors") {
    const door = (side: "l" | "r") => (
      <div style={{ ...panel(side), background: `repeating-linear-gradient(90deg, rgba(0,0,0,.08) 0 2px, transparent 2px 24px), linear-gradient(${side === "l" ? "100deg" : "260deg"}, ${mix(T.doorBg, "#fff", 80)}, ${T.doorBg})`, transform: o ? `perspective(1200px) rotateY(${side === "l" ? -104 : 104}deg)` : "none", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }}>
        <div className="absolute inset-x-[10%] top-[14%] h-[24%]" style={{ border: `2px solid ${T.doorLine}`, borderRadius: "999px 999px 4px 4px" }} />
        <div className="absolute inset-x-[10%] top-[42%] h-[36%]" style={{ border: `2px solid ${T.doorLine}`, borderRadius: 4 }} />
        <div className="absolute inset-x-[10%] bottom-[5%] h-[12%]" style={{ border: `2px solid ${T.doorLine}`, borderRadius: 4 }} />
        <div className="absolute top-1/2 h-9 w-9 rounded-full" style={{ [side === "l" ? "right" : "left"]: 10, border: `3px solid ${P.metal}`, boxShadow: "0 2px 6px rgba(0,0,0,.25)" }} />
      </div>
    );
    art = (
      <>
        {door("l")}
        {door("r")}
        {T.bells && (
          <div className="absolute inset-x-0 top-0 flex justify-center gap-10" style={{ opacity: o ? 0 : 1, transition: ease }}>
            {["3s", "3.6s", "3.2s"].map((dur, i) => (
              <div key={i} className="flex flex-col items-center" style={{ animation: `st-sway ${dur} ease-in-out infinite`, transformOrigin: "50% 0" }}>
                <span className="block h-10 w-px" style={{ background: P.metal }} />
                <span className="block h-7 w-6" style={{ borderRadius: "50% 50% 8px 8px", background: `radial-gradient(circle at 35% 30%, #fff8, transparent 45%), ${P.metal}` }} />
              </div>
            ))}
          </div>
        )}
      </>
    );
  } else if (d.open === "Curtain") {
    const curtain = (side: "l" | "r") => (
      <div style={{ ...panel(side), background: `repeating-linear-gradient(90deg, ${T.silkA} 0 14px, ${T.silkB} 14px 22px, ${T.silkC} 22px 26px)`, transform: o ? `translateX(${side === "l" ? -70 : 70}%) scaleX(.5)` : "none" }} />
    );
    art = (
      <>
        {curtain("l")}
        {curtain("r")}
        <div className="absolute left-1/2 top-0 h-40 w-px" style={{ background: P.metal, opacity: o ? 0 : 1, transition: ease }} />
        <div className="absolute left-1/2 top-40 h-5 w-5 -translate-x-1/2 rounded-full" style={{ background: foilBg(P), opacity: o ? 0 : 1, transition: ease }} />
      </>
    );
  } else if (d.open === "Fabric") {
    art = (
      <div className="absolute inset-0" style={{ background: T.flipBg, transform: o ? "perspective(1400px) rotateX(-115deg)" : "none", transformOrigin: "top center", transition: ease }}>
        <div className="absolute inset-[14%] grid place-items-center" style={{ border: `2px solid ${P.metal}` }}>
          <div className="grid h-40 w-40 rotate-45 place-items-center" style={{ border: `2px solid ${P.metal}`, background: mix(P.a1, "transparent", 30) }}>
            <span className="-rotate-45 text-5xl" style={{ color: P.metal, fontFamily: d.nameAltFont || d.display }}>{d.code === "W4" ? "ੴ" : "✿"}</span>
          </div>
        </div>
      </div>
    );
  } else if (d.open === "Thoranam") {
    art = (
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 14px 26px at 50% 40%, ${mix(P.a2, "#3B6B2A", 30)} 98%, transparent) 0 0/34px 44px, linear-gradient(180deg, #4F7A2C, #3B5E22)`, transform: o ? "translateY(-100%)" : "none", transition: ease }}>
        <div className="absolute inset-x-0 top-0 h-6" style={{ background: `repeating-linear-gradient(90deg, ${P.a2} 0 16px, ${P.a1} 16px 32px)` }} />
      </div>
    );
  } else if (d.open === "Envelope") {
    art = (
      <div className="absolute inset-0 grid place-items-center" style={{ background: P.base }}>
        <div className="relative h-[230px] w-[320px] max-w-[86%]" style={{ transform: o ? "translateY(420px)" : "none", transition: ease }}>
          <div className="absolute inset-0 rounded-md" style={{ background: T.envBg, boxShadow: "0 18px 40px rgba(0,0,0,.18)" }} />
          <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: T.envFlap, clipPath: "polygon(0 0, 100% 0, 50% 100%)", transformOrigin: "top", transform: o ? "rotateX(180deg)" : "none", transition: ease }} />
          <div className="absolute left-1/2 top-[44%] grid h-16 w-16 -translate-x-1/2 place-items-center rounded-full" style={{ background: `radial-gradient(circle at 38% 30%, ${T.sealHi}, ${T.sealC} 55%, ${T.sealLo})`, transform: o ? "scale(1.3) rotate(20deg)" : "none", opacity: o ? 0 : 1, transition: ease, fontFamily: d.display, color: P.surface, fontSize: 22 }}>{initials(d.n1, d.n2)}</div>
        </div>
      </div>
    );
  } else if (d.open === "Box") {
    art = (
      <div className="absolute inset-0 grid place-items-center" style={{ background: P.base }}>
        <div className="relative h-[300px] w-[260px]" style={{ transform: o ? "translateY(-200px) scale(.9)" : "none", opacity: o ? 0 : 1, transition: ease }}>
          <div className="absolute inset-0 rounded-md" style={{ background: T.velvet, boxShadow: "0 24px 50px rgba(0,0,0,.35)" }}>
            <Glints />
            <div className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full" style={{ background: foilBg(P), fontFamily: d.display, color: P.a1, fontSize: 30, boxShadow: "0 6px 16px rgba(0,0,0,.35)" }}>{initials(d.n1, d.n2)}</div>
          </div>
        </div>
      </div>
    );
  } else {
    art = (
      <div className="absolute inset-0 grid place-items-center" style={{ background: P.base }}>
        <div className="relative h-[300px] w-[240px]">
          <div className="absolute inset-0 rounded-sm" style={{ background: "#fffdf8", boxShadow: "0 10px 26px rgba(0,0,0,.12)", transform: o ? "translateY(-200px)" : "none", opacity: o ? 0 : 1, transition: ease }} />
          <div className="absolute inset-0 rounded-sm" style={{ background: "rgba(255,255,255,.55)", backdropFilter: "blur(6px)", transform: o ? "translateY(420px)" : "translateY(60px)", transition: ease, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.8)" }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9000] select-none overflow-hidden"
      style={{ opacity: o ? 0 : 1, transition: "opacity .7s ease 1.3s", background: P.base, touchAction: "none" }}
      onPointerDown={down}
      onPointerUp={up}
      role="button"
      aria-label={`${d.gesture[1]} to open the invitation`}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go()}
    >
      {art}
      {T.glints && <Glints />}
      <div className="absolute inset-x-0 flex justify-center px-6" style={{ top: `min(${plate.top}, 40%)`, opacity: o ? 0 : 1, transition: "opacity .5s ease" }}>
        <div className="px-5 py-2 text-center" style={{ background: plate.bg, color: plate.ink, fontFamily: plate.font, fontSize: plate.size, borderRadius: plate.radius, boxShadow: plate.shadow, letterSpacing: plate.font.includes("Cinzel") ? ".08em" : undefined }}>
          {guest ? `Dear ${guest}` : "You are invited"}
        </div>
      </div>
      <button type="button" onClick={(e) => { e.stopPropagation(); go(false); }} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} className="absolute right-4 top-4 rounded-full px-4 py-1.5 text-xs font-semibold" style={{ background: mix(P.surface, "transparent", 80), color: P.ink, fontFamily: "Manrope, sans-serif" }}>
        Skip
      </button>
      <div className="st-hint absolute inset-x-0 bottom-8 flex justify-center px-6" style={{ opacity: o ? 0 : 1 }}>
        <div className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px]" style={{ background: mix(P.surface, "transparent", 82), color: P.a1, fontFamily: "Manrope, sans-serif", boxShadow: "0 6px 18px rgba(0,0,0,.12)" }}>
          <Icon d={ICON.sound} size={14} /> {d.gesture[1]} <span className="opacity-60">· with sound</span>
        </div>
      </div>
    </div>
  );
}
const foilBg = (P: Palette) => `linear-gradient(110deg, ${mix(P.metal, "#000", 62)} 0%, ${mix(P.metal, "#fff", 35)} 34%, ${P.metal} 50%, ${mix(P.metal, "#fff", 22)} 64%, ${mix(P.metal, "#000", 68)} 100%)`;

// ── Hero ────────────────────────────────────────────────────────────────────
function Hero({ look, t, sample }: { look: Look; t: Template; sample: boolean }) {
  const { d, P, T } = look;
  const photo = t.image;
  const mono = initials(t.couple.one, t.couple.two);
  const frameArt = (radius: string, extra?: CSSProperties) => (
    <div className="relative mx-auto overflow-hidden" style={{ borderRadius: radius, ...extra }}>
      {photo ? (
        <img src={photo} alt={`${t.couple.one} and ${t.couple.two}`} className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full w-full place-items-center" style={{ background: `repeating-linear-gradient(135deg, ${T.stripe} 0 10px, ${P.surface} 10px 20px)` }}>
          <span style={{ fontFamily: d.display, color: mix(P.a1, "transparent", 55), fontSize: 64, letterSpacing: ".04em" }}>{mono}</span>
        </div>
      )}
    </div>
  );
  let art: ReactNode;
  if (d.hero === "Jharokha") {
    art = (
      <div className="relative pt-2">
        <div className="mb-4 flex justify-center gap-1" aria-hidden="true">
          {Array.from({ length: 13 }, (_, i) => <span key={i} className="block h-5 w-5 rounded-full" style={{ background: i % 2 ? "#E39A3B" : "#F2B33D", boxShadow: "0 8px 0 -4px #6E8A3A" }} />)}
        </div>
        <div className="mb-3 flex justify-center gap-3" aria-hidden="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-20 w-16" style={{ borderRadius: "40px 40px 2px 2px", border: `1.5px solid ${P.metal}`, background: `repeating-linear-gradient(90deg, ${T.stripe} 0 3px, ${P.surface} 3px 8px)` }} />)}
        </div>
        <div className="relative">
          {frameArt("150px 150px 8px 8px", { width: "78%", height: 300, border: `1.5px solid ${P.metal}` })}
          {[["left", "4%"], ["right", "4%"]].map(([side, off]) => (
            <div key={side} className="absolute top-0 flex flex-col items-center" style={{ [side]: off, animation: "st-sway 4s ease-in-out infinite", transformOrigin: "50% 0" }} aria-hidden="true">
              <span className="block h-24 w-px" style={{ background: P.metal }} />
              <span className="block h-10 w-7" style={{ borderRadius: "6px 6px 12px 12px", background: `radial-gradient(circle at 50% 60%, #FFE3A6, transparent 70%), ${P.metal}`, boxShadow: "0 0 24px 6px rgba(255,210,120,.45)" }} />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (d.hero === "Miniature") {
    art = (
      <div className="mx-auto w-[86%] p-3" style={{ border: `6px solid ${P.a1}`, boxShadow: `inset 0 0 0 2px ${P.metal}`, background: `repeating-linear-gradient(45deg, ${mix(P.a2, P.surface, 18)} 0 6px, ${P.surface} 6px 12px)` }}>
        {frameArt("50%", { width: "78%", height: 260, border: `5px solid ${P.metal}`, boxShadow: "0 8px 20px rgba(0,0,0,.18)" })}
      </div>
    );
  } else if (d.hero === "Riad") {
    art = (
      <div className="relative mx-auto w-[84%] p-2" style={{ borderRadius: "160px 160px 8px 8px", border: `6px dotted ${P.a1}` }}>
        {frameArt("150px 150px 4px 4px", { width: "100%", height: 300 })}
      </div>
    );
  } else if (d.hero === "Phulkari") {
    art = frameArt("150px 150px 10px 10px", { width: "84%", height: 280, border: `2px dashed ${mix(P.a2, "transparent", 40)}`, background: `linear-gradient(180deg, ${mix(P.a2, "#fff", 18)}, ${P.surface})` });
  } else if (d.hero === "Kolam") {
    art = (
      <div className="relative mx-auto flex items-center justify-center gap-4">
        <Lamp P={P} />
        <div className="grid h-52 w-52 place-items-center overflow-hidden rounded-full" style={{ background: P.a1, boxShadow: `inset 0 0 0 6px ${P.metal}` }}>
          {photo ? <img src={photo} alt={`${t.couple.one} and ${t.couple.two}`} className="h-full w-full object-cover" /> : (
            <svg viewBox="0 0 100 100" className="h-40 w-40" aria-hidden="true" style={{ color: "#FFFDF5" }}>
              <g fill="none" stroke="currentColor" strokeWidth="1.4">
                <circle cx="50" cy="50" r="10" />
                <path d="M50 14 L86 50 L50 86 L14 50 Z" />
                <path d="M50 26 C66 34 66 66 50 74 C34 66 34 34 50 26 Z" />
                <path d="M26 50 C34 34 66 34 74 50 C66 66 34 66 26 50 Z" />
              </g>
              {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={50 + 38 * Math.cos((i * Math.PI) / 4)} cy={50 + 38 * Math.sin((i * Math.PI) / 4)} r="2" fill="currentColor" />)}
            </svg>
          )}
        </div>
        <Lamp P={P} />
      </div>
    );
  } else if (d.hero === "Garden") {
    art = (
      <div className="relative mx-auto w-[80%] px-6 py-10 text-center" style={{ background: "#fffdf9", boxShadow: "0 18px 40px rgba(60,50,40,.12)" }}>
        <p className="text-[11px] uppercase tracking-[.3em]" style={{ color: P.ink, fontFamily: d.text }}>{sample ? d.top : t.script}</p>
        <p style={{ fontFamily: d.display, fontSize: 52, color: P.ink, lineHeight: 1.1 }}>{t.couple.one}</p>
        <p style={{ fontFamily: d.text, fontStyle: "italic", color: P.a1 }}>and</p>
        <p style={{ fontFamily: d.display, fontSize: 52, color: P.ink, lineHeight: 1.1 }}>{t.couple.two}</p>
        {photo && <img src={photo} alt="" className="mx-auto mt-5 h-40 w-40 rounded-full object-cover" />}
      </div>
    );
  } else if (d.hero === "Crest") {
    art = (
      <div className="relative mx-auto flex h-[300px] w-full flex-col items-center justify-center overflow-hidden" style={{ background: T.velvet }}>
        <Glints />
        <div className="mb-4 h-16 w-40" style={{ background: `repeating-linear-gradient(90deg, transparent 0 8px, ${mix(P.a2, "transparent", 40)} 8px 9px)`, maskImage: "linear-gradient(180deg, #000, transparent)" }} aria-hidden="true" />
        <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full" style={{ background: foilBg(P), boxShadow: "0 10px 24px rgba(0,0,0,.4)", fontFamily: d.display, color: P.a1, fontSize: 40 }}>
          {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : mono}
        </div>
      </div>
    );
  } else {
    art = (
      <div className="relative mx-auto w-[82%] px-6 py-12 text-center" style={{ background: "#fffdf8", boxShadow: "0 12px 30px rgba(0,0,0,.08)" }}>
        <p style={{ fontFamily: d.display, fontSize: 72, color: P.base, textShadow: T.dateShadow, lineHeight: 1 }}>{mono}</p>
        <p className="mt-6 text-[11px] uppercase tracking-[.4em]" style={{ color: P.ink, fontFamily: d.text }}>{sample ? d.top : t.script}</p>
        {photo && <img src={photo} alt="" className="mx-auto mt-6 h-40 w-full object-cover" />}
      </div>
    );
  }

  const showNames = d.hero !== "Garden";
  return (
    <header className="relative px-5 pb-6 pt-10 text-center">
      {d.hero !== "Garden" && d.hero !== "Letter" && (sample ? d.top : t.script) && (
        <p className="mb-6" style={{ fontFamily: sample ? d.topFont : guessFont(t.script, d), color: P.a1, fontSize: (sample ? d.top : t.script).length > 40 ? 14 : 18 }}>{sample ? d.top : t.script}</p>
      )}
      <div className="st-rise">{art}</div>
      {showNames && (
        <div className="mt-8">
          {d.hero === "Kolam" || d.code === "W2" || d.code === "W4" ? (sample && d.nameAlt ? <p className="mb-1" style={{ fontFamily: d.nameAltFont, color: P.a1, fontSize: 26 }}>{d.nameAlt}</p> : null) : null}
          <h1 style={{ fontFamily: d.display, fontSize: d.nameSize, textTransform: d.nameCase, letterSpacing: d.nameLs, color: P.ink, lineHeight: 1.1, fontWeight: 400 }}>
            {t.couple.one}
            <span className="my-1 block" style={{ fontFamily: d.text, fontStyle: "italic", fontSize: 22, color: P.a1, textTransform: "none" }}>{t.couple.amp || "&"}</span>
            {t.couple.two}
          </h1>
        </div>
      )}
      {t.tagline && <p className="mx-auto mt-6 max-w-[34ch] text-[17px] italic leading-relaxed" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 80) }}>{t.tagline}</p>}
      {t.date && <p className="mt-4 text-[13px] uppercase tracking-[.28em]" style={{ fontFamily: d.text, color: P.ink }}>{t.date}</p>}
      {(sample ? d.city : t.venue.name) && <p className="mt-2" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{sample ? d.city : t.venue.name}</p>}
    </header>
  );
}
const guessFont = (s: string, d: Design) => (/[ऀ-ॿ]/.test(s) ? "'Tiro Devanagari Hindi', serif" : /[؀-ۿ]/.test(s) ? "'Amiri', serif" : /[਀-੿]/.test(s) ? "'Noto Serif Gurmukhi', serif" : /[஀-௿]/.test(s) ? "'Noto Serif Tamil', serif" : d.text);

const Lamp = ({ P }: { P: Palette }) => (
  <div className="flex flex-col items-center" aria-hidden="true">
    <span className="st-flame block h-6 w-3 rounded-full" style={{ background: "radial-gradient(ellipse at 50% 75%, #fff6d8, #ffc65c 45%, #f08a2a 85%)", boxShadow: "0 0 16px 6px rgba(255,190,90,.45)" }} />
    <span className="block h-2 w-8 rounded-b-full" style={{ background: P.metal }} />
    <span className="block h-14 w-1.5" style={{ background: P.metal }} />
    <span className="block h-2 w-10 rounded-full" style={{ background: P.metal }} />
  </div>
);

// ── The design's interactive moment ─────────────────────────────────────────
const FAMILY_WORDS = ["Swagat", "Aashirwad", "Pyaar", "Rishta", "Khushiyan", "Saath"];

function Wow({ look, guest, photos, sample }: { look: Look; guest: string; photos: string[]; sample: boolean }) {
  const { d, P, T } = look;
  const [on, setOn] = useState<Record<number, boolean>>({});
  const [k, setK] = useState(0);
  const [pour, setPour] = useState(false);
  const [caught, setCaught] = useState(false);
  const [pressed, setPressed] = useState(false);
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const toggle = (i: number) => () => {
    setOn((x) => ({ ...x, [i]: !x[i] }));
    setK((v) => v + 1);
  };
  const mark = (i: number) => () => setOn((x) => (x[i] ? x : { ...x, [i]: true }));
  const done = Object.values(on).filter(Boolean).length;
  const burstColors = [P.a2, mix(P.a2, "#fff", 40), P.metal];

  // Kolam: the floor mirrors every stroke eight ways.
  useEffect(() => {
    if (d.wow !== "kolam" || !canvas.current) return;
    const el = canvas.current;
    const ctx = el.getContext("2d")!;
    const W = 700;
    const reset = () => {
      ctx.fillStyle = P.a1;
      ctx.fillRect(0, 0, W, W);
      ctx.fillStyle = "rgba(255,253,245,.75)";
      for (let y = 70; y < W; y += 80) for (let x = 70; x < W; x += 80) {
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 6.283);
        ctx.fill();
      }
    };
    reset();
    (el as HTMLCanvasElement & { reset?: () => void }).reset = reset;
    let down = false;
    let last: [number, number] | null = null;
    const pos = (e: PointerEvent): [number, number] => {
      const b = el.getBoundingClientRect();
      return [((e.clientX - b.left) * W) / b.width - 350, ((e.clientY - b.top) * W) / b.height - 350];
    };
    const pd = (e: PointerEvent) => {
      down = true;
      el.setPointerCapture(e.pointerId);
      last = pos(e);
    };
    const pm = (e: PointerEvent) => {
      if (!down || !last) return;
      const p = pos(e);
      ctx.strokeStyle = "#FFFDF5";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const c = Math.cos(a);
        const s = Math.sin(a);
        const r = ([x, y]: [number, number]) => [x * c - y * s + 350, x * s + y * c + 350];
        const A = r(last);
        const B = r(p);
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.lineTo(B[0], B[1]);
        ctx.stroke();
      }
      last = p;
    };
    const pu = () => {
      down = false;
    };
    el.addEventListener("pointerdown", pd);
    el.addEventListener("pointermove", pm);
    el.addEventListener("pointerup", pu);
    return () => {
      el.removeEventListener("pointerdown", pd);
      el.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", pu);
    };
  }, [d.wow, P.a1]);

  let body: ReactNode = null;
  let hint = "";
  if (d.wow === "jharokhas") {
    hint = done >= 6 ? "The whole family is at the windows" : `${done} of 6 windows open`;
    const words = sample ? ["Dadi-sa", "Bua-sa", "Kaka-sa", "Mama-ji", "Bhabhi-sa", "Nani-sa"] : FAMILY_WORDS;
    body = (
      <div className="relative grid grid-cols-3 gap-4 rounded-2xl p-5" style={{ background: mix(P.a2, P.surface, 30) }}>
        {Array.from({ length: 6 }, (_, i) => (
          <button key={i} type="button" onClick={toggle(i)} aria-pressed={!!on[i]} aria-label={`Window ${i + 1}`} className="relative h-[118px] overflow-hidden" style={{ borderRadius: "46px 46px 4px 4px", boxShadow: `inset 0 0 0 3px ${P.surface}, 0 0 0 1px ${P.metal}`, background: on[i] ? (photos[i] ? `center/cover url("${photos[i]}")` : `repeating-linear-gradient(135deg, ${T.stripe} 0 6px, ${P.surface} 6px 12px)`) : `repeating-linear-gradient(90deg, rgba(0,0,0,.14) 0 2px, transparent 2px 15px), ${T.doorBg}`, transition: "background .5s ease" }}>
            {on[i] && !photos[i] && <span className="st-rise absolute inset-x-0 bottom-3 text-center text-[13px]" style={{ fontFamily: d.text, color: P.a1 }}>{words[i]}</span>}
          </button>
        ))}
        <Burst on={done >= 6} colors={burstColors} k={k} />
      </div>
    );
  } else if (d.wow === "bells") {
    hint = done >= 5 ? "All five bells have rung" : "Tap each bell";
    const S = [40, 70, 55, 80, 45];
    body = (
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 280, background: `linear-gradient(180deg, ${P.surface} 62%, ${mix(P.a1, P.surface, 25)} 62%)` }}>
        <div className="flex h-full items-start justify-center gap-6">
          {S.map((len, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="block w-px" style={{ height: len, background: P.metal }} />
              <button type="button" onClick={toggle(i)} aria-label={`Bell ${i + 1}`} aria-pressed={!!on[i]} className="block h-[46px] w-10" style={{ borderRadius: "50% 50% 10px 10px", background: `radial-gradient(circle at 35% 30%, #fff8, transparent 45%), ${P.metal}`, boxShadow: on[i] ? `0 0 22px 6px ${mix(P.metal, "transparent", 45)}` : "0 3px 6px rgba(0,0,0,.25)", animation: on[i] ? "st-ring 1.2s ease-in-out" : "none", transformOrigin: "50% 0" }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-6">
          {S.map((_, i) => <span key={i} className="block h-8 w-10" style={{ borderRadius: "50% 50% 0 0", background: on[i] ? `radial-gradient(circle at 50% 70%, ${mix(P.a2, "#fff", 40)}, ${P.a2})` : "transparent", animation: on[i] ? "st-pop .7s ease both" : "none" }} />)}
        </div>
      </div>
    );
  } else if (d.wow === "lanterns") {
    hint = done >= 7 ? "The courtyard is glowing" : `${done} of 7 lanterns lit`;
    const S = [30, 80, 50, 110, 60, 90, 40];
    body = (
      <div className="flex items-start justify-center gap-3.5 rounded-2xl" style={{ height: 300, background: `linear-gradient(180deg, ${mix(P.a1, "#000", 50)}, ${mix(P.a1, "#000", 30)})` }}>
        {S.map((len, i) => (
          <div key={i} className="flex flex-col items-center" style={{ animation: on[i] ? `st-sway ${4 + (i % 3)}s ease-in-out infinite` : "none", transformOrigin: "50% 0" }}>
            <span className="block w-px" style={{ height: len, background: P.metal }} />
            <button type="button" onClick={toggle(i)} aria-label={`Lantern ${i + 1}`} aria-pressed={!!on[i]} className="block h-[46px] w-[30px]" style={{ borderRadius: "8px 8px 14px 14px", background: on[i] ? `radial-gradient(circle at 50% 55%, #FFF1C4, #F6C46A 45%, ${P.metal} 80%)` : `linear-gradient(180deg, ${mix(P.metal, "#000", 75)}, ${mix(P.metal, "#000", 55)})`, boxShadow: on[i] ? "0 0 30px 10px rgba(255,200,110,.5)" : "0 3px 6px rgba(0,0,0,.3)", transition: "all .5s ease" }} />
          </div>
        ))}
      </div>
    );
  } else if (d.wow === "phulkari") {
    hint = done >= 25 ? "The phulkari is complete" : "Run your finger across the cloth to stitch it";
    body = (
      <div className="grid grid-cols-5 gap-[22px] rounded-2xl px-10 py-8" style={{ background: P.surface, touchAction: "none" }}>
        {Array.from({ length: 25 }, (_, i) => (
          <button key={i} type="button" onPointerEnter={mark(i)} onClick={mark(i)} aria-label={`Stitch ${i + 1}`} className="aspect-square rotate-45" style={{ borderRadius: 3, background: on[i] ? `linear-gradient(45deg, transparent 40%, ${P.metal} 40% 60%, transparent 60%) 0 0/8px 8px, linear-gradient(-45deg, transparent 40%, ${P.a2} 40% 60%, transparent 60%) 0 0/8px 8px, ${T.clothBg}` : "transparent", boxShadow: on[i] ? "0 2px 4px rgba(0,0,0,.2)" : `inset 0 0 0 1px ${mix(P.metal, "transparent", 45)}`, transition: "background .3s ease" }} />
        ))}
      </div>
    );
  } else if (d.wow === "kolam") {
    hint = "Draw on the floor. Your kolam mirrors itself eight ways.";
    body = (
      <div className="flex flex-col items-center gap-3">
        <canvas ref={canvas} width={700} height={700} className="aspect-square w-full max-w-[320px] rounded-full" style={{ touchAction: "none", boxShadow: `0 0 0 4px ${P.metal}` }} aria-label="Kolam drawing floor" />
        <button type="button" onClick={() => (canvas.current as HTMLCanvasElement & { reset?: () => void })?.reset?.()} className="rounded-full px-4 py-1.5 text-xs" style={{ border: `1px solid ${P.metal}`, color: P.a1, fontFamily: "Manrope, sans-serif" }}>Sweep the floor</button>
      </div>
    );
  } else if (d.wow === "bouquet") {
    hint = caught ? "You caught it! You’re next." : "Tap the bouquet before it lands";
    body = (
      <div className="relative overflow-hidden rounded-2xl" style={{ height: 300, background: `linear-gradient(180deg, ${P.surface}, ${mix(P.a1, P.surface, 20)})` }}>
        <button type="button" onClick={() => setCaught((c) => !c)} aria-label={caught ? "Throw the bouquet again" : "Catch the bouquet"} className="absolute left-1/2 -ml-8" style={{ top: caught ? 170 : 0, animation: caught ? "none" : "st-catch 2.6s cubic-bezier(.45,0,.55,1) infinite" }}>
          <svg width="64" height="80" viewBox="0 0 64 80" aria-hidden="true">
            <path d="M28 40 L32 78 L36 40" stroke="#6E8A4A" strokeWidth="3" fill="none" />
            {[[22, 22], [42, 22], [32, 12], [20, 34], [44, 34], [32, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="10" fill={i % 2 ? P.a2 : mix(P.a2, "#fff", 40)} stroke={mix(P.a2, "#000", 80)} strokeWidth="1" />)}
          </svg>
        </button>
        <div className="absolute inset-x-0 bottom-0 h-10" style={{ background: mix(P.a1, "transparent", 35) }} />
        <Burst on={caught} colors={burstColors} k={k} />
      </div>
    );
  } else if (d.wow === "champagne") {
    hint = pour ? "Cheers to the newlyweds!" : "Tap the tower to pour";
    const pos: [number, number, number][] = [];
    [1, 2, 3, 4].forEach((n, r) => {
      for (let j = 0; j < n; j++) pos.push([175 - n * 26 + j * 52 + 3, 40 + r * 62, r]);
    });
    body = (
      <button type="button" onClick={() => setPour((v) => !v)} aria-label={pour ? "Empty the glasses" : "Pour the champagne"} className="relative mx-auto block w-full overflow-hidden rounded-2xl" style={{ height: 300, background: T.velvet }}>
        <div className="absolute left-1/2 top-0 h-full w-[350px] -translate-x-1/2">
          {pos.map(([x, y, r], i) => (
            <span key={i} className="absolute block" style={{ left: x, top: y, width: 46, height: 56, borderRadius: "4px 4px 20px 20px", background: "rgba(255,255,255,.18)", boxShadow: `inset 0 ${pour ? -38 : 0}px 0 rgba(243,217,140,.95), inset 0 0 0 1px rgba(255,255,255,.8)`, transition: `box-shadow .8s ease ${pour ? r * 0.45 : (3 - r) * 0.2}s` }} />
          ))}
        </div>
      </button>
    );
  } else {
    hint = pressed ? "Pressed into the cotton" : "Tap the card to press your name";
    body = (
      <button type="button" onClick={() => setPressed((v) => !v)} className="mx-auto block w-[86%] px-6 py-10 text-center" style={{ background: P.surface, boxShadow: "0 8px 22px rgba(0,0,0,.06)", transform: pressed ? "scale(.985)" : "none", transition: "all .4s ease" }}>
        <p className="text-[10px] uppercase tracking-[.4em]" style={{ color: mix(P.ink, "transparent", 50), fontFamily: d.text }}>Reserved for</p>
        <p className="mt-3" style={{ fontFamily: d.display, fontSize: 30, color: pressed ? P.surface : mix(P.ink, "transparent", 30), textShadow: pressed ? "1px 1px 0 rgba(255,255,255,.95), -1px -1px 0 rgba(0,0,0,.2)" : "none", transition: "all .4s ease" }}>{guest || "You"}</p>
      </button>
    );
  }
  return (
    <section className="px-5">
      <Label look={look}>{d.wowLabel}</Label>
      {body}
      <p className="mt-3 text-center text-[14px] italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 65) }}>{hint}</p>
    </section>
  );
}

// ── Signature (steps or a typographic grid) ─────────────────────────────────
function Signature({ look, steps, grid }: { look: Look; steps: { k: string; t: string; x: string }[]; grid?: { k: string; v: string }[] }) {
  const { d, P, T } = look;
  if (!steps.length && !grid?.length) return null;
  return (
    <section className="px-5">
      <Label look={look}>Signature</Label>
      <h2 className="mb-6 text-center" style={{ fontFamily: T.fnFont, fontSize: 30, color: P.ink, fontWeight: 400 }}>{d.sigName}</h2>
      {grid?.length ? (
        <div className="grid grid-cols-2" style={{ border: `1px solid ${T.line}` }}>
          {grid.map((g, i) => (
            <div key={i} className="p-4" style={{ borderRight: i % 2 === 0 ? `1px solid ${T.line}` : "none", borderBottom: i < grid.length - 2 ? `1px solid ${T.line}` : "none" }}>
              <p className="text-[10px] uppercase tracking-[.3em]" style={{ color: mix(P.ink, "transparent", 55), fontFamily: d.text }}>{g.k}</p>
              <p className="mt-1 text-[15px]" style={{ color: P.ink, fontFamily: d.text }}>{g.v}</p>
            </div>
          ))}
        </div>
      ) : (
        <ol className="relative ml-4" style={{ borderLeft: `1px solid ${P.metal}` }}>
          {steps.map((s, i) => (
            <li key={i} className="relative mb-6 pl-8 last:mb-0">
              <span className="absolute -left-[17px] top-0 grid h-8 w-8 place-items-center rounded-full text-[13px]" style={{ background: P.surface, border: `1px solid ${P.metal}`, color: P.a1, fontFamily: T.numFont }}>{i + 1}</span>
              {s.k && <p className="text-[11px] font-semibold uppercase tracking-[.16em]" style={{ color: P.a1, fontFamily: "Manrope, sans-serif" }}>{s.k}</p>}
              <p className="text-[19px]" style={{ fontFamily: d.text, color: P.ink }}>{s.t}</p>
              {s.x && <p className="mt-1 text-[15px] leading-relaxed" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 72) }}>{s.x}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ── Couple quiz ─────────────────────────────────────────────────────────────
function Quiz({ look, t, fns }: { look: Look; t: Template; fns: Ceremony[] }) {
  const { d, P, T } = look;
  const one = t.couple.one;
  const two = t.couple.two;
  // Two playful questions (no wrong answer) and up to two about the programme (with answers).
  const Q = useMemo(() => {
    const q: { q: string; o: string[]; a: number | null }[] = [
      { q: "Who is more likely to be late?", o: [one, two], a: null },
      { q: "Who said “I love you” first?", o: [one, two], a: null },
    ];
    const withVenue = fns.filter((f) => f.venue);
    if (withVenue.length >= 2) {
      const f = withVenue[1];
      const opts = [...new Set(withVenue.map((x) => x.venue))].slice(0, 3);
      if (opts.length >= 2) q.push({ q: `Where is the ${f.name} held?`, o: opts, a: opts.indexOf(f.venue) });
    }
    const withTime = fns.filter((f) => f.time);
    if (withTime.length >= 2) {
      const f = withTime[withTime.length - 1];
      const opts = [...new Set(withTime.map((x) => x.time))].slice(0, 3);
      if (opts.length >= 2) q.push({ q: `What time does the ${f.name} start?`, o: opts, a: opts.indexOf(f.time) });
    }
    return q;
  }, [one, two, fns]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const facts = Q.filter((q) => q.a !== null).length;
  const finished = i >= Q.length;
  const q = Q[Math.min(i, Q.length - 1)];
  const card: CSSProperties = { background: P.surface, border: `1px solid ${T.line}`, borderRadius: T.formRadius };
  return (
    <section className="px-5">
      <Label look={look}>Couple Quiz</Label>
      <div className="p-5" style={card}>
        {finished ? (
          <div className="text-center">
            <p style={{ fontFamily: d.text, fontSize: 22, color: P.ink }}>{facts ? `${score} of ${facts} right` : "Thanks for playing!"}</p>
            <p className="mt-1 italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{facts && score === facts ? `You know ${one} & ${two} very well.` : "See you at the celebrations!"}</p>
            <button type="button" onClick={() => { setI(0); setPick(null); setScore(0); }} className="mt-4 rounded-full px-5 py-2 text-sm" style={{ border: `1px solid ${P.metal}`, color: P.a1 }}>Play again</button>
          </div>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[.16em]" style={{ color: P.a1, fontFamily: "Manrope, sans-serif" }}>Question {i + 1} of {Q.length}</p>
            <p className="mb-4 mt-2" style={{ fontFamily: d.text, fontSize: 21, color: P.ink }}>{q.q}</p>
            <div className="space-y-2.5">
              {q.o.map((opt, j) => {
                const answered = pick !== null;
                const right = q.a === null ? j === pick : j === q.a;
                const wrong = q.a !== null && answered && j === pick && j !== q.a;
                return (
                  <button key={j} type="button" disabled={answered} onClick={() => { setPick(j); if (q.a !== null && j === q.a) setScore((s) => s + 1); }} className="block w-full px-4 py-3 text-left" style={{ borderRadius: 99, border: `1px solid ${answered && right ? P.a1 : wrong ? "#9B3B3B" : mix(P.metal, "transparent", 50)}`, background: answered && right ? mix(P.a1, "transparent", 14) : wrong ? "rgba(155,59,59,.10)" : "transparent", fontFamily: d.text, fontSize: 17, color: P.ink }}>
                    {answered && right ? "✓ " : wrong ? "✕ " : ""}{opt}
                  </button>
                );
              })}
            </div>
            {pick !== null && (
              <button type="button" onClick={() => { setI((v) => v + 1); setPick(null); }} className="mt-4 w-full rounded-full py-3 text-sm font-semibold" style={{ background: P.a1, color: T.onA1, fontFamily: "Manrope, sans-serif" }}>
                {i === Q.length - 1 ? "See my score" : "Next question"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ── Wishes wall ─────────────────────────────────────────────────────────────
function Wishes({ look, t, guest, initial }: { look: Look; t: Template; guest: string; initial: { n: string; w: string }[] }) {
  const { d, P, T } = look;
  const ctx = useInvite();
  const [list, setList] = useState(initial);
  const [text, setText] = useState("");
  const [name, setName] = useState(guest);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const post = async () => {
    const w = text.trim();
    const n = name.trim();
    if (!w || n.length < 2) {
      setMsg(n.length < 2 ? "Please add your name." : "");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      if (!ctx.preview && ctx.link) {
        const res = await fetch(`${API}/api/wedding/public/${encodeURIComponent(ctx.link)}/wish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: n, message: w }) });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.msg || "Could not post your wish.");
      }
      setList((l) => [{ n, w }, ...l]);
      setText("");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="px-5">
      <Label look={look}>Wishes</Label>
      <div className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder={`Write a wish for ${t.couple.one} & ${t.couple.two}`} aria-label="Your wish" className="min-w-0 flex-1 px-4 py-3 outline-none" style={{ borderRadius: 99, border: `1px solid ${T.line}`, background: P.surface, fontFamily: d.text, fontSize: 16, color: P.ink }} />
        <button type="button" onClick={post} disabled={busy} className="shrink-0 rounded-full px-5 text-sm font-semibold" style={{ background: P.a1, color: T.onA1, fontFamily: "Manrope, sans-serif", opacity: busy ? 0.6 : 1 }}>Post</button>
      </div>
      {!guest && text && <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Your name" aria-label="Your name" className="mt-2 w-full px-4 py-2.5 outline-none" style={{ borderRadius: 99, border: `1px solid ${T.line}`, background: P.surface, fontFamily: d.text, color: P.ink }} />}
      {msg && <p className="mt-2 text-sm" style={{ color: "#9B3B3B" }} role="alert">{msg}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {list.slice(0, 12).map((w, i) => (
          <div key={`${w.n}-${i}`} className="p-4" style={{ background: P.surface, boxShadow: "0 6px 14px rgba(0,0,0,.08)", transform: `rotate(${[-2, 1.5, 1, -1.5][i % 4]}deg)`, borderTop: `4px solid ${mix(P.a2, "transparent", 60)}`, animation: i === 0 ? "st-pop .6s ease both" : undefined }}>
            <p className="italic" style={{ fontFamily: d.text, color: P.ink, fontSize: 15 }}>“{w.w}”</p>
            <p className="mt-2 text-[13px]" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{w.n}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── My plan ─────────────────────────────────────────────────────────────────
function MyPlan({ look, fns, plan, setPlan, guest, title, eventDate }: { look: Look; fns: Ceremony[]; plan: boolean[]; setPlan: (p: boolean[]) => void; guest: string; title: string; eventDate?: string }) {
  const { d, P, T } = look;
  const att = fns.filter((_, i) => plan[i]);
  const who = guest || "You";
  const toggle = (on: boolean) => ({ track: on ? P.a1 : mix(P.ink, "transparent", 25), knob: on ? 21 : 3 });
  const remind = () => {
    const events = att.map((f) => ({ name: f.name, start: whenOf(f, eventDate), venue: f.venue })).filter((e): e is { name: string; start: Date; venue: string } => !!e.start);
    if (events.length) icsFile(title, events);
  };
  return (
    <section className="px-5">
      <Label look={look}>My plan</Label>
      <div className="p-5" style={{ background: P.surface, border: `1px solid ${T.line}`, borderRadius: T.formRadius }}>
        <p style={{ fontFamily: d.text, fontSize: 17, color: P.ink }}>
          {att.length ? `${who}, you’re attending ${att.length} of ${fns.length}. First up: ${att[0].name}${att[0].date ? `, ${att[0].date}` : ""}.` : `${who}, pick the functions you’ll attend.`}
        </p>
        <div className="mt-3">
          {fns.map((f, i) => {
            const tg = toggle(plan[i]);
            return (
              <button key={i} type="button" onClick={() => setPlan(plan.map((v, j) => (j === i ? !v : v)))} aria-pressed={plan[i]} className="flex w-full items-center gap-4 py-3 text-left" style={{ borderTop: `1px solid ${T.line}`, opacity: plan[i] ? 1 : 0.5 }}>
                <span className="w-20 shrink-0 text-[17px]" style={{ fontFamily: T.numFont, color: P.a1 }}>{f.time || "—"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px]" style={{ fontFamily: d.text, color: P.ink }}>{f.name}</span>
                  <span className="block text-[13px]" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 65) }}>{[f.date, f.venue].filter(Boolean).join(" · ")}</span>
                </span>
                <span className="relative block h-7 w-12 shrink-0 rounded-full" style={{ background: tg.track, transition: "background .3s" }}>
                  <span className="absolute top-[3px] block h-[22px] w-[22px] rounded-full bg-white" style={{ left: tg.knob, transition: "left .3s" }} />
                </span>
              </button>
            );
          })}
        </div>
        {att.length > 0 && (
          <button type="button" onClick={remind} className="mt-3 flex w-full items-center justify-center gap-2 py-3 text-sm" style={{ borderRadius: 12, background: mix(P.a2, P.surface, 22), color: P.ink, fontFamily: "Manrope, sans-serif" }}>
            <Icon d={ICON.cal} size={16} /> Add my functions to my calendar (reminder a day before)
          </button>
        )}
      </div>
    </section>
  );
}

// ── Save the date reveal ────────────────────────────────────────────────────
function Reveal({ look, dateLine }: { look: Look; dateLine: { big: string; small: string } }) {
  const { d, P, T } = look;
  const [rv, setRv] = useState(d.reveal === "Plain");
  const canvas = useRef<HTMLCanvasElement | null>(null);

  // Cover: a foil you scratch off with a finger (or tap the hint to reveal).
  useEffect(() => {
    if (d.reveal !== "Cover" || !canvas.current || rv) return;
    const el = canvas.current;
    const ctx = el.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, el.width, el.height);
    const stops: [number, string][] = [[0, "#8a6a2f"], [0.34, "#e9d7a6"], [0.5, P.metal], [0.64, "#e8dcc0"], [1, "#6d5326"]];
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.fillStyle = "rgba(60,40,15,.55)";
    ctx.font = "italic 30px 'Cormorant Garamond', serif";
    ctx.textAlign = "center";
    ctx.fillText("scratch to reveal", el.width / 2, el.height / 2 + 10);
    ctx.globalCompositeOperation = "destination-out";
    let down = false;
    const scratch = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const x = ((e.clientX - b.left) * el.width) / b.width;
      const y = ((e.clientY - b.top) * el.height) / b.height;
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, 6.283);
      ctx.fill();
    };
    const pd = (e: PointerEvent) => {
      down = true;
      el.setPointerCapture(e.pointerId);
      scratch(e);
    };
    const pm = (e: PointerEvent) => down && scratch(e);
    const pu = () => {
      down = false;
      const data = ctx.getImageData(0, 0, el.width, el.height).data;
      let clear = 0;
      for (let i = 3; i < data.length; i += 64) if (data[i] === 0) clear++;
      if (clear / (data.length / 64) > 0.45) setRv(true);
    };
    el.addEventListener("pointerdown", pd);
    el.addEventListener("pointermove", pm);
    el.addEventListener("pointerup", pu);
    return () => {
      el.removeEventListener("pointerdown", pd);
      el.removeEventListener("pointermove", pm);
      el.removeEventListener("pointerup", pu);
    };
  }, [d.reveal, rv, P.metal]);

  const date = (
    <div className="grid h-full w-full place-items-center text-center" style={{ background: P.surface }}>
      <div>
        <p style={{ fontFamily: d.display, fontSize: 54, color: P.a1, lineHeight: 1, textShadow: T.dateShadow }}>{dateLine.big}</p>
        <p className="mt-2 text-[12px] uppercase tracking-[.3em]" style={{ fontFamily: d.text, color: P.ink }}>{dateLine.small}</p>
      </div>
    </div>
  );
  const hints: Record<string, [string, string]> = { Cover: ["Scratch, or tap here to reveal", "Revealed. We can’t wait."], Petals: ["Tap the lotus to bloom", "The lotus has opened"], Seal: ["Tap to break the seal", "Sealed with love"], Flip: ["Tap to turn the page", "Mark your calendar"], Peel: [`Tap to ${T.peelText}`, "Mark your calendar"], Ribbon: ["Tap to untie the ribbon", "Untied. See you there."], Plain: ["", ""] };
  const size = 220;
  let cover: ReactNode = null;
  if (d.reveal === "Cover") cover = !rv && <canvas ref={canvas} width={440} height={440} className="absolute inset-0 h-full w-full" style={{ touchAction: "none", cursor: "grab" }} aria-label="Scratch to reveal the date" />;
  else if (d.reveal === "Petals") cover = (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 8 }, (_, i) => <span key={i} className="absolute left-1/2 top-1/2 -ml-6 -mt-[70px] block h-[70px] w-12" style={{ borderRadius: "50% 50% 50% 50% / 70% 70% 30% 30%", background: `linear-gradient(180deg, ${mix(P.a2, "#fff", 40)}, ${P.a2})`, transformOrigin: "50% 100%", transform: rv ? `rotate(${i * 45}deg) translateY(-70px) scale(.7)` : `rotate(${i * 45}deg)`, opacity: rv ? 0.35 : 1, transition: "all 1s cubic-bezier(.22,1,.36,1)" }} />)}
    </div>
  );
  else if (d.reveal === "Seal") cover = (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {(["l", "r"] as const).map((s) => <span key={s} className="absolute block h-24 w-12" style={{ [s === "l" ? "right" : "left"]: "50%", borderRadius: s === "l" ? "48px 0 0 48px" : "0 48px 48px 0", background: `radial-gradient(circle at ${s === "l" ? "70%" : "30%"} 40%, ${T.sealHi}, ${T.sealC} 55%, ${T.sealLo})`, transform: rv ? `translateX(${s === "l" ? -50 : 50}px) rotate(${s === "l" ? -28 : 28}deg)` : "none", opacity: rv ? 0 : 1, transition: "all .9s cubic-bezier(.22,1,.36,1)" }} />)}
    </div>
  );
  else if (d.reveal === "Flip") cover = <div className="pointer-events-none absolute inset-0" style={{ background: T.flipBg, transformOrigin: "top", transform: rv ? "perspective(800px) rotateX(-180deg)" : "none", opacity: rv ? 0 : 1, transition: "transform 1s ease, opacity .4s ease .6s" }} />;
  else if (d.reveal === "Peel") cover = <div className="pointer-events-none absolute inset-0 grid place-items-center" style={{ background: `radial-gradient(circle, #fff 0 30%, #f5f0e0 31% 34%, #fff 35%)`, transform: rv ? "translate(-120px,-150px) rotate(-35deg)" : "none", opacity: rv ? 0 : 1, transition: "all 1s cubic-bezier(.22,1,.36,1)" }}><span style={{ fontFamily: d.text, color: P.a1, fontStyle: "italic" }}>{T.peelText}</span></div>;
  else if (d.reveal === "Ribbon") cover = (
    <div className="pointer-events-none absolute inset-0">
      {(["l", "r"] as const).map((s) => <span key={s} className="absolute top-1/2 block h-8 w-1/2 -translate-y-1/2" style={{ [s === "l" ? "left" : "right"]: 0, background: T.velvet, transform: rv ? `translateX(${s === "l" ? -130 : 130}%)` : "none", transition: "transform 1s ease" }} />)}
    </div>
  );
  return (
    <section className="px-5 text-center">
      <button type="button" onClick={() => d.reveal !== "Cover" && setRv((v) => !v)} className="relative mx-auto block overflow-hidden" style={{ width: size, height: size, clipPath: T.coverClip, borderRadius: d.reveal === "Flip" || d.reveal === "Ribbon" || d.reveal === "Plain" ? 12 : undefined, cursor: d.reveal === "Cover" ? "default" : "pointer" }} aria-label={hints[d.reveal][rv ? 1 : 0] || "The date"}>
        {date}
        {cover}
      </button>
      {hints[d.reveal][0] && (
        <button type="button" onClick={() => setRv(true)} className="mt-3 text-[14px] italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 65) }}>{hints[d.reveal][rv ? 1 : 0]}</button>
      )}
    </section>
  );
}

// ── Countdown ───────────────────────────────────────────────────────────────
function Countdown({ look, target }: { look: Look; target: string }) {
  const { P, T } = look;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => !document.hidden && setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, new Date(target).getTime() - now);
  const parts: [number, string][] = [[Math.floor(left / 864e5), "Days"], [Math.floor(left / 36e5) % 24, "Hours"], [Math.floor(left / 6e4) % 60, "Mins"], [Math.floor(left / 1e3) % 60, "Secs"]];
  return (
    <div className="flex justify-center gap-2.5 px-5" role="timer" aria-label={`${parts[0][0]} days to go`}>
      {parts.map(([v, l]) => (
        <div key={l} className="relative w-[62px] overflow-hidden py-3 text-center" style={{ borderRadius: T.tileRadius, background: T.tileBg, boxShadow: T.tileShadow, border: `1px solid ${T.tileBorder}`, color: T.tileInk }}>
          <p style={{ fontFamily: T.numFont, fontSize: 28, lineHeight: 1 }}>{pad(v)}</p>
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[.16em]" style={{ fontFamily: "Manrope, sans-serif", opacity: 0.8 }}>{l}</p>
        </div>
      ))}
    </div>
  );
}

// ── Celebrations ────────────────────────────────────────────────────────────
function ActionButton({ look, href, d: path, label, onClick, external }: { look: Look; href?: string; d: string; label: string; onClick?: () => void; external?: boolean }) {
  const { P, T } = look;
  const style: CSSProperties = { borderRadius: T.btnRadius, border: `1px solid ${T.line}`, background: T.btnBg, color: T.btnInk, fontFamily: "Manrope, sans-serif" };
  const inner = (
    <>
      <Icon d={path} size={16} />
      <span className="mt-1 block text-[11px]">{label}</span>
    </>
  );
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer noopener" : undefined} className="flex flex-1 flex-col items-center py-2.5" style={style}>{inner}</a>
  ) : (
    <button type="button" onClick={onClick} className="flex flex-1 flex-col items-center py-2.5" style={{ ...style, color: style.color || P.a1 }}>{inner}</button>
  );
}

function Celebrations({ look, fns, mapHref, phone, title, eventDate }: { look: Look; fns: Ceremony[]; mapHref: string; phone: string; title: string; eventDate?: string }) {
  const { d, P, T } = look;
  return (
    <section className="space-y-5 px-5">
      {fns.map((f, i) => {
        const df = d.fns[i % d.fns.length];
        const when = [f.date, f.time].filter(Boolean).join(" · ");
        const start = whenOf(f, eventDate);
        return (
          <article key={i} className="overflow-hidden p-3 text-center" style={{ background: P.surface, border: T.cardBorder, borderRadius: T.cardRadius, boxShadow: T.cardShadow }}>
            <div className="grid h-32 place-items-end overflow-hidden pb-2" style={{ borderRadius: T.artRadius, background: `repeating-linear-gradient(135deg, ${T.stripe} 0 10px, ${P.surface} 10px 20px)` }}>
              <span className="text-[11px] tracking-wide" style={{ color: P.a1, fontFamily: "ui-monospace, monospace" }}>{f.hi || df.art}</span>
            </div>
            <h3 className="mt-3" style={{ fontFamily: T.fnFont, fontSize: T.fnSize, textTransform: T.fnCase, letterSpacing: T.fnLs, color: P.ink, fontWeight: 400 }}>{f.name}</h3>
            {when && <p className="mt-1 text-[16px] font-semibold" style={{ fontFamily: d.text, color: P.ink }}>{when}</p>}
            {f.venue && <p className="text-[16px]" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{f.venue}</p>}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              {df.sw.map((c) => <span key={c} className="block h-5 w-5 rounded-full" style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }} />)}
              {f.dress && <span className="ml-1 text-[13px] italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 65) }}>{f.dress}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <ActionButton look={look} href={mapHref} d={ICON.nav} label="Navigate" external />
              {phone && <ActionButton look={look} href={`tel:${digits(phone)}`} d={ICON.call} label="Call" />}
              {phone && <ActionButton look={look} href={`https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(`About the ${f.name}: `)}`} d={ICON.wa} label="WhatsApp" external />}
              {start && <ActionButton look={look} d={ICON.cal} label="Calendar" onClick={() => icsFile(title, [{ name: f.name, start, venue: f.venue }])} />}
            </div>
          </article>
        );
      })}
    </section>
  );
}

// ── Venue, dress code, moments, story ───────────────────────────────────────
function Venue({ look, t, mapHref, note, photo }: { look: Look; t: Template; mapHref: string; note: string; photo?: string }) {
  const { d, P, T } = look;
  const q = [t.venue.name, t.venue.address].filter(Boolean).join(", ");
  return (
    <section className="px-5 text-center">
      <div className="mx-auto h-44 w-[80%] overflow-hidden" style={{ borderRadius: T.venueRadius, border: T.venueBorder, background: photo ? `center/cover url("${photo}")` : `repeating-linear-gradient(135deg, ${T.stripe} 0 10px, ${P.surface} 10px 20px)` }} />
      {t.venue.name && <h3 className="mt-5" style={{ fontFamily: T.fnFont, fontSize: T.venueSize, textTransform: T.fnCase, letterSpacing: T.fnLs, color: P.ink, fontWeight: 400, lineHeight: 1.15 }}>{t.venue.name}</h3>}
      {t.venue.address && <p className="mt-2 text-[16px]" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 72) }}>{t.venue.address}</p>}
      {q && (
        <div className="mt-4 overflow-hidden" style={{ borderRadius: T.formRadius, border: `1px solid ${T.line}` }}>
          <iframe title={`Map of ${t.venue.name || "the venue"}`} src={`https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`} className="block h-48 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
      <a href={mapHref} target="_blank" rel="noreferrer noopener" className="mt-4 block py-3.5 text-[15px] font-semibold" style={{ borderRadius: 99, background: P.a1, color: T.onA1, fontFamily: "Manrope, sans-serif" }}>Navigate to venue</a>
      {note && <p className="mt-3 text-[15px] italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{note}</p>}
    </section>
  );
}

function DressCode({ look, fns, sample }: { look: Look; fns: Ceremony[]; sample: boolean }) {
  const { d, P, T } = look;
  const rows = fns.map((f, i) => ({ name: f.name, dress: f.dress || (sample ? d.fns[i % 3].swLabel : ""), sw: d.fns[i % d.fns.length].sw })).filter((r) => r.dress);
  if (!rows.length) return null;
  return (
    <section className="px-5">
      {sample && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          {[d.her, d.him].map((x) => (
            <div key={x} className="grid h-40 place-items-end pb-2" style={{ borderRadius: "80px 80px 4px 4px", border: `1px solid ${T.line}`, background: `repeating-linear-gradient(135deg, ${T.stripe} 0 10px, ${P.surface} 10px 20px)` }}>
              <span className="text-[11px]" style={{ color: P.a1, fontFamily: "ui-monospace, monospace" }}>{x}</span>
            </div>
          ))}
        </div>
      )}
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-3 py-3" style={{ borderBottom: `1px solid ${T.line}` }}>
          <span className="flex-1 text-[17px]" style={{ fontFamily: d.text, color: P.ink }}>{r.name}</span>
          <span className="text-[14px] italic" style={{ fontFamily: d.text, color: mix(P.ink, "transparent", 70) }}>{r.dress}</span>
          <span className="flex gap-1">{r.sw.map((c) => <span key={c} className="block h-5 w-5 rounded-full" style={{ background: c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }} />)}</span>
        </div>
      ))}
    </section>
  );
}

function Moments({ look, photos }: { look: Look; photos: string[] }) {
  const { P } = look;
  if (!photos.length) return null;
  return (
    <section className="grid grid-cols-2 gap-3 px-5">
      {photos.slice(0, 12).map((p, i) => (
        <img key={p} src={p} alt={`Photo ${i + 1}`} loading="lazy" className={`w-full object-cover ${i % 3 === 0 ? "col-span-2 h-56" : "h-40"}`} style={{ borderRadius: 10, boxShadow: `0 0 0 4px ${P.surface}, 0 8px 18px rgba(0,0,0,.12)` }} />
      ))}
    </section>
  );
}

// ── RSVP ────────────────────────────────────────────────────────────────────
function Rsvp({ look, fns, plan, guest, sample }: { look: Look; fns: Ceremony[]; plan: boolean[]; guest: string; sample: boolean }) {
  const { d, P, T } = look;
  const ctx = useInvite();
  const [name, setName] = useState(guest);
  const [phone, setPhone] = useState("");
  const [att, setAtt] = useState<"yes" | "maybe" | "no">("yes");
  const [count, setCount] = useState(1);
  const [chosen, setChosen] = useState<boolean[]>(plan);
  const [meal, setMeal] = useState(d.meals[0]);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<{ busy?: boolean; done?: string; err?: string }>({});
  useEffect(() => setChosen(plan), [plan]);
  if (ctx.rsvpOpen === false) return null;
  const input: CSSProperties = { borderBottom: `1px solid ${T.line}`, background: "transparent", fontFamily: d.text, fontSize: 17, color: P.ink };
  const chip = (on: boolean): CSSProperties => ({ borderRadius: 99, border: `1px solid ${on ? P.a1 : T.line}`, background: on ? mix(P.a1, "transparent", 14) : "transparent", fontFamily: d.text, color: P.ink });
  const submit = async () => {
    if (name.trim().length < 2) return setState({ err: "Please enter your name." });
    setState({ busy: true });
    try {
      const msg = await ctx.send({ name, phone, attending: att, guests: count, message, meal: att === "no" ? "" : meal, functions: att === "no" ? [] : fns.filter((_, i) => chosen[i]).map((f) => f.name) });
      setState({ done: msg });
    } catch (err) {
      setState({ err: (err as Error).message });
    }
  };
  return (
    <section id="rsvp" className="scroll-mt-6 px-5">
      <div className="p-1.5" style={{ border: `1px solid ${T.line}`, borderRadius: T.formRadius, background: P.surface }}>
        <div className="p-5" style={{ border: `1px solid ${T.line}`, borderRadius: T.formRadius }}>
          <p className="text-center text-[11px] uppercase tracking-[.32em]" style={{ color: P.a1, fontFamily: d.text }}>{sample ? d.rsvpBy : "Kindly reply"}</p>
          <h2 className="mb-5 mt-1 text-center" style={{ fontFamily: T.fnFont, fontSize: T.rsvpSize, textTransform: T.fnCase, letterSpacing: T.fnLs, color: P.ink, fontWeight: 400 }}>{d.rsvpTitle}</h2>
          {state.done ? (
            <p className="py-6 text-center text-[18px]" style={{ fontFamily: d.text, color: P.ink }} role="status">{state.done}</p>
          ) : (
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: mix(P.ink, "transparent", 60), fontFamily: "Manrope, sans-serif" }}>Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className="block w-full py-1.5 outline-none" style={input} />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[.2em]" style={{ color: mix(P.ink, "transparent", 60), fontFamily: "Manrope, sans-serif" }}>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} inputMode="tel" autoComplete="tel" className="block w-full py-1.5 outline-none" style={input} />
              </label>
              <div className="flex gap-2">
                {([["yes", d.yes], ["maybe", "Maybe"], ["no", d.no]] as const).map(([v, l]) => (
                  <button key={v} type="button" onClick={() => setAtt(v)} aria-pressed={att === v} className="flex-1 py-2.5 text-[16px]" style={att === v ? { borderRadius: 99, background: P.a1, color: T.onA1, fontFamily: d.text, fontWeight: 600 } : chip(false)}>{l}</button>
                ))}
              </div>
              {att !== "no" && (
                <>
                  <div className="flex items-center justify-between">
                    <span style={{ fontFamily: d.text, fontSize: 17, color: P.ink }}>Guests</span>
                    <span className="flex items-center gap-3">
                      <button type="button" onClick={() => setCount((c) => Math.max(1, c - 1))} className="grid h-10 w-10 place-items-center rounded-full" style={chip(false)} aria-label="Fewer guests">−</button>
                      <span style={{ fontFamily: d.text, fontSize: 18, color: P.ink, minWidth: 18, textAlign: "center" }}>{count}</span>
                      <button type="button" onClick={() => setCount((c) => Math.min(20, c + 1))} className="grid h-10 w-10 place-items-center rounded-full" style={chip(false)} aria-label="More guests">+</button>
                    </span>
                  </div>
                  {fns.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {fns.map((f, i) => (
                        <button key={i} type="button" onClick={() => setChosen((x) => x.map((v, j) => (j === i ? !v : v)))} aria-pressed={!!chosen[i]} className="px-3 py-1.5 text-[15px]" style={chip(!!chosen[i])}>{chosen[i] ? "✓ " : ""}{f.name}</button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {d.meals.map((m) => <button key={m} type="button" onClick={() => setMeal(m)} aria-pressed={meal === m} className="px-3 py-1.5 text-[15px]" style={chip(meal === m)}>{m}</button>)}
                  </div>
                </>
              )}
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={2} placeholder="A message for the couple (optional)" className="block w-full resize-none p-3 outline-none" style={{ borderRadius: 10, border: `1px solid ${T.line}`, background: "transparent", fontFamily: d.text, fontSize: 16, color: P.ink }} />
              {state.err && <p className="text-sm" style={{ color: "#9B3B3B" }} role="alert">{state.err}</p>}
              <button type="button" onClick={submit} disabled={state.busy} className="block w-full py-3.5 text-[15px] font-semibold" style={{ borderRadius: 99, background: P.a1, color: T.onA1, fontFamily: "Manrope, sans-serif", opacity: state.busy ? 0.6 : 1 }}>{state.busy ? "Sending…" : "Send RSVP"}</button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Share ───────────────────────────────────────────────────────────────────
function Share({ look, t, url, phone }: { look: Look; t: Template; url: string; phone: string }) {
  const { d, P, T } = look;
  const wrap = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const names = `${t.couple.one} & ${t.couple.two}`;
  const text = `You're invited to the wedding of ${names}${t.date ? ` on ${t.date}` : ""}. Open the invitation: ${url}`;
  const download = () => {
    const c = wrap.current?.querySelector("canvas");
    if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `${names.replace(/[^\w]+/g, "-").toLowerCase()}-invite-qr.png`;
    a.click();
  };
  const contact = () => {
    const vcf = `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${names} (wedding)\r\nTEL;TYPE=CELL:${digits(phone)}\r\nURL:${url}\r\nEND:VCARD`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard" }));
    a.download = `${names.replace(/[^\w]+/g, "-").toLowerCase()}.vcf`;
    a.click();
  };
  const btn = (primary: boolean): CSSProperties => ({ borderRadius: 99, background: primary ? P.a1 : "transparent", color: primary ? T.onA1 : P.a1, border: primary ? "none" : `1px solid ${T.line}`, fontFamily: "Manrope, sans-serif" });
  return (
    <section className="px-5 text-center">
      <div ref={wrap} className="relative mx-auto inline-block p-4" style={{ background: P.surface, borderRadius: 18, boxShadow: "0 12px 30px rgba(0,0,0,.12)", border: `1px solid ${T.line}` }}>
        <QRCodeCanvas value={url} size={190} level="H" fgColor={P.ink} bgColor={P.surface} marginSize={0} />
        <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full" style={{ background: P.surface, border: `1px solid ${P.metal}`, fontFamily: d.display, color: P.a1, fontSize: 20 }}>{initials(t.couple.one, t.couple.two)}</span>
      </div>
      <div className="mx-auto mt-4 grid max-w-[300px] grid-cols-2 gap-2 text-[13px] font-semibold">
        <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noreferrer noopener" className="py-3" style={btn(true)}>WhatsApp</a>
        <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard blocked */ } }} className="py-3" style={btn(false)}>{copied ? "Copied!" : "Copy link"}</button>
        <button type="button" onClick={download} className="py-3" style={btn(false)}>Download QR</button>
        {phone ? <button type="button" onClick={contact} className="py-3" style={btn(false)}>Save contact</button> : <a href={url} className="py-3" style={btn(false)}>Open link</a>}
      </div>
    </section>
  );
}

// ── The page ────────────────────────────────────────────────────────────────
export function StudioInvite({ template: t, chat }: { template: Template; chat?: ReactNode }) {
  const ctx = useInvite();
  const d = designBySlug(t.slug) || DESIGNS[0];
  const sample = !!ctx.preview && !ctx.link && ctx.timeline === undefined;
  const [pick, setPick] = useState<number | null>(null); // design showcase: try the other palettes
  const pi = pick ?? Math.min(2, Math.max(0, Number(t.studioPalette) || 0));
  const P = d.pals[pi];
  const T = tokensOf(d, P);
  const look: Look = { d, P, T };
  useEffect(loadStudioFonts, []);

  // Design showcase (sample details, no saved timeline) vs a couple's invite.
  const guest = useMemo(() => {
    if (typeof window === "undefined") return "";
    const p = new URLSearchParams(window.location.search);
    return (p.get("g") || p.get("to") || p.get("guest") || "").trim().slice(0, 60) || (sample ? "Sharma Family" : "");
  }, [sample]);
  const [opened, setOpened] = useState(() => !!ctx.preview && !ctx.playOpening);
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  const fns = (t.ceremonies || []) as Ceremony[];
  const [plan, setPlan] = useState<boolean[]>(() => fns.map(() => true));
  useEffect(() => setPlan(fns.map(() => true)), [fns.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const mapHref = ctx.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([t.venue.name, t.venue.address].filter(Boolean).join(", ") || "")}`;
  const phone = ctx.hostPhone || "";
  const title = `${t.couple.one} & ${t.couple.two}`;
  const url = ctx.link ? `${SITE}/invite/${ctx.link}` : typeof window !== "undefined" ? window.location.href.split("?")[0] : SITE;
  const steps = (ctx.timeline ?? (sample ? d.sigSteps?.map((s) => ({ y: s.k, h: s.t, t: s.x })) : [])) || [];
  const grid = d.code === "W8" ? (ctx.timeline?.length ? ctx.timeline.map((s) => ({ k: s.h, v: s.t || s.y })) : sample ? d.sigGrid : undefined) : undefined;
  const wishes = ctx.wishes?.length ? ctx.wishes : sample ? [{ n: "Ishaan", w: "So happy for you both!" }, { n: "Tara", w: "Can’t wait to dance." }, { n: "Dadi", w: "Blessings, always." }] : [];
  const photos = ctx.photos || [];
  const note = t.venueNote || (sample ? d.park : "");
  const when = t.eventDate ? new Date(t.eventDate) : null;
  const dateLine = when && !isNaN(when.getTime())
    ? { big: pad(when.getDate()), small: when.toLocaleDateString("en-GB", { month: "long", year: "numeric" }) }
    : { big: "♥", small: t.date || "" };

  const startMusic = () => {
    if (!t.music || audio.current) return;
    const a = new Audio(t.music);
    a.loop = true;
    a.volume = 0.6;
    audio.current = a;
    a.play().then(() => setPlaying(true)).catch(() => {});
  };
  useEffect(() => () => audio.current?.pause(), []);

  // The AI host's colours follow the design (WeddingChat reads --wt-* from its data-palette).
  // All three palettes are defined, so the chat matches whichever one is shown.
  const chatCss = d.pals
    .map((Q, i) => `[data-palette="studio-${d.code}-${i}"]{--wt-bg-1:${mix(Q.a1, "#000", 70)};--wt-bg-2:${mix(Q.a1, "#000", 85)};--wt-bg-3:${Q.a1};--wt-bg-4:${mix(Q.a1, "#000", 55)};--wt-ink:#fff;--wt-ink-soft:${mix(Q.a2, "#fff", 50)};--wt-ink-dim:${mix(Q.a2, "#fff", 35)};--wt-gold:${Q.metal};--wt-gold-lite:${mix(Q.metal, "#fff", 55)};--wt-accent:${Q.a1};--wt-accent-deep:${mix(Q.a1, "#000", 70)};--wt-frame:${Q.metal};}`)
    .join("");

  const dock = [
    { l: "Navigate", d: ICON.nav, href: mapHref, ext: true },
    phone ? { l: "Call", d: ICON.call, href: `tel:${digits(phone)}` } : null,
    phone ? { l: "WhatsApp", d: ICON.wa, href: `https://wa.me/${waNumber(phone)}`, ext: true } : null,
    ctx.rsvpOpen !== false ? { l: "RSVP", d: ICON.rsvp, href: "#rsvp" } : null,
  ].filter(Boolean) as { l: string; d: string; href: string; ext?: boolean }[];

  return (
    <div className="st-root min-h-screen" style={{ background: mix(P.base, P.ink, 88), fontFamily: d.text }}>
      <style>{chatCss}</style>
      {!opened && <Opening look={look} guest={guest} onOpen={(sound) => { setOpened(true); if (sound) startMusic(); }} />}
      <Petals colors={opened ? T.petals : []} />
      <main className="relative mx-auto min-h-screen max-w-[460px] overflow-hidden pb-40" style={{ background: P.base, boxShadow: "0 0 60px rgba(0,0,0,.18)" }}>
        {T.glints && <Glints />}
        {sample && (
          <div className="flex flex-wrap justify-center gap-2 px-4 pt-5" role="radiogroup" aria-label="Colour palette">
            {d.pals.map((p, i) => (
              <button key={p.name} type="button" role="radio" aria-checked={i === pi} onClick={() => setPick(i)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ fontFamily: "Manrope, sans-serif", color: P.ink, background: i === pi ? P.surface : "transparent", border: `1px solid ${i === pi ? P.metal : mix(P.ink, "transparent", 18)}` }}>
                <span className="block h-3.5 w-3.5 rounded-full" style={{ background: `linear-gradient(135deg, ${p.a1} 50%, ${p.a2} 50%)` }} />
                {p.name}
              </button>
            ))}
          </div>
        )}
        <Hero look={look} t={t} sample={sample} />
        <Wow look={look} guest={guest} photos={photos} sample={sample} />
        <Divider look={look} label="" />
        <Signature look={look} steps={steps.map((s) => ({ k: s.y, t: s.h, x: s.t }))} grid={grid} />
        {t.story && (
          <section className="px-6 pt-8 text-center">
            <Label look={look}>Our story</Label>
            <p className="whitespace-pre-line text-[17px] leading-relaxed" style={{ fontFamily: d.text, color: P.ink }}>{t.story}</p>
          </section>
        )}
        <div className="h-10" />
        <Quiz look={look} t={t} fns={fns} />
        {!ctx.wishesOff && (
          <>
            <div className="h-10" />
            <Wishes look={look} t={t} guest={guest} initial={wishes} />
          </>
        )}
        {fns.length > 0 && (
          <>
            <div className="h-10" />
            <MyPlan look={look} fns={fns} plan={plan} setPlan={setPlan} guest={guest} title={title} eventDate={t.eventDate} />
          </>
        )}
        <Divider look={look} label="Save the date" />
        <Reveal look={look} dateLine={dateLine} />
        {t.eventDate && (
          <>
            <Divider look={look} label={sample ? d.cdLabel : "Until the big day"} />
            <Countdown look={look} target={t.eventDate} />
          </>
        )}
        {fns.length > 0 && (
          <>
            <Divider look={look} label="The celebrations" />
            <Celebrations look={look} fns={fns} mapHref={mapHref} phone={phone} title={title} eventDate={t.eventDate} />
          </>
        )}
        {(t.venue.name || t.venue.address) && (
          <>
            <Divider look={look} label="The venue" />
            <Venue look={look} t={t} mapHref={mapHref} note={note} photo={photos[1] || undefined} />
          </>
        )}
        {(fns.some((f) => (f as Ceremony).dress) || sample) && (
          <>
            <Divider look={look} label="Dress code" />
            <DressCode look={look} fns={fns} sample={sample} />
          </>
        )}
        {photos.length > 0 && (
          <>
            <Divider look={look} label="Our moments" />
            <Moments look={look} photos={photos} />
          </>
        )}
        <Divider look={look} label="" />
        <Rsvp look={look} fns={fns} plan={plan} guest={guest} sample={sample} />
        <Divider look={look} label="Share this invite" />
        <Share look={look} t={t} url={url} phone={phone} />
        <footer className="px-5 pb-6 pt-12 text-center">
          <p style={{ fontFamily: T.fnFont, fontSize: T.footSize, textTransform: T.fnCase, letterSpacing: T.fnLs, color: P.ink }}>{title}</p>
          {t.hashtag && <p className="mt-1 text-sm" style={{ color: P.a1, fontFamily: "Manrope, sans-serif" }}>{t.hashtag}</p>}
          <a href="https://aicardly.com/invites" className="mt-2 inline-block text-[12px]" style={{ color: mix(P.ink, "transparent", 55), fontFamily: "Manrope, sans-serif" }}>Made with Aicardly · create your own</a>
        </footer>
      </main>

      {/* Dock: quick actions + the AI host */}
      {opened && (
        <nav className="fixed inset-x-0 z-[60] mx-auto flex max-w-[440px] items-end gap-2 px-3" style={{ bottom: ctx.playOpening ? 68 : 12 }} aria-label="Invite actions">
          <div className="flex flex-1 justify-around py-2" style={{ borderRadius: T.dockRadius, background: T.dockBg, color: T.dockInk, backdropFilter: "blur(12px)", boxShadow: "0 10px 30px rgba(0,0,0,.18)", border: `1px solid ${mix(P.metal, "transparent", 40)}` }}>
            {dock.map((x) => (
              <a key={x.l} href={x.href} target={x.ext ? "_blank" : undefined} rel={x.ext ? "noreferrer noopener" : undefined} className="flex flex-col items-center px-2 text-[11px]" style={{ fontFamily: "Manrope, sans-serif" }}>
                <Icon d={x.d} size={18} />
                <span className="mt-0.5">{x.l}</span>
              </a>
            ))}
            {t.music && (
              <button type="button" onClick={() => { if (!audio.current) startMusic(); else if (playing) { audio.current.pause(); setPlaying(false); } else { audio.current.play().then(() => setPlaying(true)).catch(() => {}); } }} className="flex flex-col items-center px-2 text-[11px]" style={{ fontFamily: "Manrope, sans-serif" }} aria-label={playing ? "Pause music" : "Play music"}>
                <Icon d={playing ? ICON.sound : ICON.mute} size={18} />
                <span className="mt-0.5">Music</span>
              </button>
            )}
          </div>
          {ctx.aiChat !== false && (
            <button type="button" onClick={() => window.dispatchEvent(new Event("wedding-chat:open"))} className="flex shrink-0 flex-col items-center" aria-label={`Ask ${sample ? d.persona : "the AI host"}`}>
              <span className="grid w-14 place-items-center" style={{ height: T.aiH, borderRadius: T.aiRadius, background: T.aiBg, color: T.aiInk, boxShadow: "0 10px 24px rgba(0,0,0,.25)" }}>
                <Icon d={ICON.spark} size={22} />
              </span>
              <span className="mt-1 text-[10px] font-semibold" style={{ color: P.a1, fontFamily: "Manrope, sans-serif" }}>AI Host</span>
            </button>
          )}
        </nav>
      )}
      {chat}
    </div>
  );
}

export const studioChatPalette = (t: Template) => {
  const d = designBySlug(t.slug);
  if (!d) return t.palette;
  const pi = Math.min(2, Math.max(0, Number(t.studioPalette) || 0));
  return `studio-${d.code}-${pi}`;
};
