import { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MAGNET_STRENGTH = 0.25;
const MAGNET_MAX = 8;

// Primary CTA: liquid gradient shift on hover, descendant icon slide-out + text tracking
// expansion, and a subtle magnetic pull toward the cursor (capped so it stays put in
// full-width contexts). The [&_svg]/[&_span] rules apply to whatever children are passed in.
const GradientButton = ({ children, loading = false, className = '', ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, relX * MAGNET_STRENGTH)));
    y.set(Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, relY * MAGNET_STRENGTH)));
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full py-3 rounded-xl font-semibold text-sm text-white overflow-hidden shadow-glow-crimson
        disabled:opacity-60 disabled:cursor-not-allowed
        inline-flex items-center justify-center gap-2
        [&_svg]:transition-transform [&_svg]:duration-300 [&:hover_svg]:translate-x-1
        [&_span]:transition-all [&_span]:duration-300 [&:hover_span]:tracking-wide
        ${className}`}
      {...props}
    >
      <span className="absolute inset-0 shimmer-border animate-shimmer" />
      <span className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 opacity-90 hover:opacity-0 transition-opacity duration-300" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

export default GradientButton;
