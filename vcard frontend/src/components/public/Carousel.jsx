import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GAP = 12;
const MAX_DOTS = 8;

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ));
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
};

// Horizontal scroll-snap carousel: native swipe on phones/tablets, click-and-drag + arrow buttons
// on desktop, dots/counter, keyboard arrows, and optional autoplay that pauses on hover/touch/focus,
// when off-screen and when the tab is hidden. Children become the slides.
const Carousel = ({ children, perView = 1, autoPlayMs = 0, label = 'carousel' }) => {
  const slides = Children.toArray(children);
  const count = slides.length;
  const maxIndex = Math.max(0, count - perView);
  const multiple = count > perView;

  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const activeRef = useRef(0);
  const pausedRef = useRef(false);
  const visibleRef = useRef(true);
  const resumeTimer = useRef(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();

  const goTo = useCallback((i, instant = false) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[Math.min(Math.max(i, 0), maxIndex)];
    if (child) el.scrollTo({ left: child.offsetLeft, behavior: instant || reduced ? 'auto' : 'smooth' });
  }, [maxIndex, reduced]);

  const step = useCallback((dir) => {
    const cur = activeRef.current;
    const next = cur + dir;
    goTo(next > maxIndex ? 0 : next < 0 ? maxIndex : next);
  }, [goTo, maxIndex]);

  const pauseFor = useCallback((ms) => {
    pausedRef.current = true;
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { pausedRef.current = false; }, ms);
  }, []);

  // Keep the active dot in sync with wherever the track is scrolled.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let best = 0;
        let bestDist = Infinity;
        Array.from(el.children).forEach((c, i) => {
          const d = Math.abs(c.offsetLeft - el.scrollLeft);
          if (d < bestDist) { bestDist = d; best = i; }
        });
        best = Math.min(best, maxIndex);
        activeRef.current = best;
        setActive(best);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [maxIndex]);

  // If slides are removed while scrolled past the end, snap back into range.
  useEffect(() => {
    if (activeRef.current > maxIndex) goTo(maxIndex, true);
  }, [maxIndex, goTo]);

  // Autoplay.
  useEffect(() => {
    if (!autoPlayMs || !multiple || reduced) return undefined;
    const io = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { threshold: 0.4 });
    if (wrapRef.current) io.observe(wrapRef.current);
    const id = setInterval(() => {
      if (pausedRef.current || !visibleRef.current || document.hidden) return;
      step(1);
    }, autoPlayMs);
    return () => { clearInterval(id); io.disconnect(); };
  }, [autoPlayMs, multiple, reduced, step]);

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  // Mouse drag-to-scroll (touch already scrolls natively).
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !multiple) return;
    const el = trackRef.current;
    drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.style.scrollSnapType = 'none';
    pausedRef.current = true;
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    trackRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    const el = trackRef.current;
    el.style.scrollSnapType = '';
    let best = 0;
    let bestDist = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const dist = Math.abs(c.offsetLeft - el.scrollLeft);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    goTo(best);
    pauseFor(5000);
  };
  const onClickCapture = (e) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); pauseFor(6000); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); pauseFor(6000); }
  };

  if (count === 0) return null;
  const slideBasis = `calc((100% - ${GAP * (perView - 1)}px) / ${perView})`;
  const dots = maxIndex + 1;

  return (
    <div
      ref={wrapRef}
      className="group/car relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { if (!drag.current.down) pauseFor(800); }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => pauseFor(800)}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => pauseFor(5000)}
      onKeyDown={onKeyDown}
    >
      <div
        ref={trackRef}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`relative flex items-stretch overflow-x-auto overscroll-x-contain snap-x snap-mandatory py-1 -my-1 outline-none select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${multiple ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ gap: GAP, WebkitOverflowScrolling: 'touch' }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.key ?? i}
            className="flex snap-start"
            style={{ flex: `0 0 ${slideBasis}`, minWidth: 0 }}
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
          >
            {slide}
          </div>
        ))}
      </div>

      {multiple && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => { step(-1); pauseFor(6000); }}
            className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-pink-100 bg-white/95 text-[#E70C65] opacity-0 shadow-md transition-opacity focus-visible:opacity-100 group-hover/car:opacity-100 [@media(hover:hover)]:flex cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => { step(1); pauseFor(6000); }}
            className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-pink-100 bg-white/95 text-[#E70C65] opacity-0 shadow-md transition-opacity focus-visible:opacity-100 group-hover/car:opacity-100 [@media(hover:hover)]:flex cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {dots > MAX_DOTS ? (
            <p className="mt-2 text-center text-[10px] font-bold tabular-nums text-slate-500">
              {active + 1} / {count}
            </p>
          ) : (
            <div className="mt-2.5 flex items-center justify-center gap-1.5" role="tablist" aria-label={`${label} slides`}>
              {Array.from({ length: dots }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => { goTo(i); pauseFor(6000); }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-[#E70C65]' : 'w-1.5 bg-pink-200 hover:bg-pink-300'}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Carousel;
