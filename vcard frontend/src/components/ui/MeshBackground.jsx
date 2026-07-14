import { motion } from 'framer-motion';

// Ambient blurred gradient blobs — reused behind hero/panel sections for the "premium mesh" backdrop.
// The first blob slowly morphs its border-radius for an organic "amoeba" feel; a slow-rotating
// conic "aurora" wash sits behind everything for extra depth. Pass `fixed` to pin it to the
// viewport (for a persistent app-wide ambient layer) instead of the nearest positioned ancestor.
const MeshBackground = ({ className = '', fixed = false }) => (
  <div className={`${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none ${className}`}>
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'conic-gradient(from 0deg at 50% 50%, var(--mesh-a), var(--mesh-c), var(--mesh-b), var(--mesh-a))',
        opacity: 0.07,
        filter: 'blur(80px)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
    />
    <motion.div
      className="absolute -top-24 -left-16 w-80 h-80 blur-3xl"
      style={{ background: 'radial-gradient(circle, var(--mesh-a), transparent 70%)' }}
      animate={{
        opacity: [0.35, 0.55, 0.35],
        scale: [1, 1.12, 1],
        borderRadius: ['42% 58% 65% 35% / 45% 45% 55% 55%', '65% 35% 42% 58% / 55% 62% 38% 45%', '42% 58% 65% 35% / 45% 45% 55% 55%'],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"
      style={{ background: 'radial-gradient(circle, var(--mesh-b), transparent 70%)' }}
      animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.15, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    <motion.div
      className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, var(--mesh-c), transparent 70%)' }}
      animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <div
      className="absolute inset-0"
      style={{ backgroundImage: 'radial-gradient(circle, var(--surface-text) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.06 }}
    />
  </div>
);

export default MeshBackground;
