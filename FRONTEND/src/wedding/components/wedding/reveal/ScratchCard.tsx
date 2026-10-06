import { useEffect, useRef, useState, type ReactNode } from "react";

/* =========================================================
   ScratchCard — a gold-foil layer the guest scratches off (finger or mouse) to reveal what is
   underneath, usually the wedding date. Once about half is cleared the foil melts away and a
   burst of confetti pops. A "Reveal" button does the same for keyboard / screen-reader users.
   ========================================================= */

const CONFETTI = ["#f6d97e", "#ed2460", "#ffffff", "#ff9f1c", "#8fd3c7", "#e7b53c"];

export function ScratchCard({
  children,
  label = "Scratch to reveal",
  className = "",
  revealed: startRevealed = false,
  onReveal,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
  revealed?: boolean;
  onReveal?: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(startRevealed);
  const [burst, setBurst] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const strokes = useRef(0);

  // Paint the foil (again when the card changes size).
  useEffect(() => {
    if (done) return;
    const c = canvas.current;
    const box = wrap.current;
    if (!c || !box) return;
    const paint = () => {
      const r = box.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.max(1, Math.round(r.width * dpr));
      c.height = Math.max(1, Math.round(r.height * dpr));
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const css = getComputedStyle(box);
      const gold = css.getPropertyValue("--wt-gold").trim() || "#e7b53c";
      const lite = css.getPropertyValue("--wt-gold-lite").trim() || "#f6d97e";
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, lite);
      g.addColorStop(0.45, gold);
      g.addColorStop(0.55, lite);
      g.addColorStop(1, gold);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      // foil sparkle
      for (let i = 0; i < (r.width * r.height) / 90; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,.35)" : "rgba(80,50,0,.12)";
        ctx.fillRect(Math.random() * r.width, Math.random() * r.height, 1.4, 1.4);
      }
      ctx.fillStyle = "rgba(60,35,0,.75)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${Math.max(13, Math.min(18, r.width / 18))}px Marcellus, serif`;
      ctx.fillText(`✦  ${label.toUpperCase()}  ✦`, r.width / 2, r.height / 2);
    };
    paint();
    const ro = new ResizeObserver(() => strokes.current === 0 && paint());
    ro.observe(box);
    return () => ro.disconnect();
  }, [done, label]);

  const finish = () => {
    if (done) return;
    setDone(true);
    setBurst(true);
    onReveal?.();
    setTimeout(() => setBurst(false), 1600);
  };

  const clearedShare = () => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let clear = 0;
    let total = 0;
    const step = 4 * 24; // every 24th pixel is plenty
    for (let i = 3; i < data.length; i += step) {
      total++;
      if (data[i] < 40) clear++;
    }
    return total ? clear / total : 0;
  };

  const scratch = (x: number, y: number) => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const r = c.getBoundingClientRect();
    const p = { x: x - r.left, y: y - r.top };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(34, r.width / 9);
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (++strokes.current % 8 === 0 && clearedShare() > 0.48) finish();
  };

  return (
    <div ref={wrap} className={`relative overflow-hidden ${className}`}>
      <div className={done ? "wt-scratch-in" : ""}>{children}</div>
      {!done && (
        <>
          <canvas
            ref={canvas}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
            onPointerDown={(e) => {
              drawing.current = true;
              last.current = null;
              (e.target as Element).setPointerCapture?.(e.pointerId);
              scratch(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => drawing.current && scratch(e.clientX, e.clientY)}
            onPointerUp={() => {
              drawing.current = false;
              last.current = null;
              if (clearedShare() > 0.48) finish();
            }}
            onPointerCancel={() => (drawing.current = false)}
            aria-hidden="true"
          />
          <span className="wt-scratch-coin pointer-events-none absolute bottom-3 right-4 grid h-7 w-7 place-items-center rounded-full text-[11px] font-bold" style={{ background: "radial-gradient(circle at 35% 30%, #fff6c8, #e2b13c 55%, #a8761a)", color: "#7a5410", boxShadow: "0 2px 6px rgba(0,0,0,.35), inset 0 0 0 2px rgba(255,255,255,.45)" }} aria-hidden="true">₹</span>
          <button type="button" onClick={finish} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded-full focus:bg-black/70 focus:px-3 focus:py-1 focus:text-xs focus:text-white">
            Reveal
          </button>
        </>
      )}
      {burst && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 34 }, (_, i) => {
            const a = (i / 34) * Math.PI * 2;
            const d = 90 + (i % 5) * 26;
            return (
              <span
                key={i}
                className="wt-confetti absolute left-1/2 top-1/2 block h-2.5 w-1.5 rounded-sm"
                style={{
                  background: CONFETTI[i % CONFETTI.length],
                  ["--dx" as string]: `${Math.cos(a) * d}px`,
                  ["--dy" as string]: `${Math.sin(a) * d - 30}px`,
                  ["--rot" as string]: `${(i * 47) % 360}deg`,
                  animationDelay: `${(i % 4) * 25}ms`,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
