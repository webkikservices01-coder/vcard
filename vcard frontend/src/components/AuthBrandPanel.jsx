import { motion } from 'framer-motion';
import { QrCode, Star } from 'lucide-react';
import Logo from './ui/Logo';

const stats = [
  ['12k+', 'Professionals'],
  ['480k', 'Cards shared'],
  ['4.9★', 'Avg. rating'],
];

// Dark brand panel shown on the left of every auth screen (desktop only) — literal port of the
// reference AuthPage's brand panel: gradient-radial + mesh-dark wash, two pulsing glow orbs,
// two floating glassmorphic mini-card mockups, grain overlay, headline + stat row + footer credit.
const AuthBrandPanel = () => (
  <div className="relative hidden overflow-hidden bg-ink-950 lg:block lg:w-[45%] shrink-0">
    <div className="absolute inset-0 bg-gradient-radial" />
    <div className="absolute inset-0 bg-mesh-dark" />

    <div className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-magenta-500/20 blur-3xl animate-pulse-glow" />
    <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-crimson-700/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />

    {/* Floating mini card mockups */}
    <motion.div
      animate={{ y: [0, -16, 0], rotate: [-2, 1, -2] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-32 right-12 w-48 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-4 shadow-glass-lg"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-crimson flex items-center justify-center text-xs font-bold text-white">AL</div>
        <div>
          <p className="text-sm font-bold text-white">Ava Lindgren</p>
          <p className="text-[10px] text-white/60">Partner</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {['in', 'X', 'Be'].map((s) => (
          <div key={s} className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-white/70">{s}</div>
        ))}
      </div>
    </motion.div>

    <motion.div
      animate={{ y: [0, 12, 0], rotate: [1, -2, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute bottom-40 left-16 w-44 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-4 shadow-glass-lg"
    >
      <div className="flex items-center gap-2">
        <QrCode className="h-8 w-8 text-magenta-300" />
        <div>
          <p className="text-sm font-bold text-white">Scan to connect</p>
          <p className="text-[10px] text-white/60">webcard.ai/ava</p>
        </div>
      </div>
    </motion.div>

    <div className="absolute inset-0 grain opacity-[0.03] mix-blend-overlay" />

    <div className="relative flex h-full flex-col justify-between p-12 z-10">
      <Logo light />

      <div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-bold leading-tight text-white text-balance"
        >
          The card you hand out <br /> when you mean <span className="text-gradient-crimson-animated">business.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-md text-lg text-white/60 text-balance"
        >
          Join thousands of executives, founders, and creatives who replaced paper cards with a velvet touch.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 grid grid-cols-3 gap-6"
        >
          {stats.map(([v, l]) => (
            <div key={l}>
              <p className="text-3xl font-bold text-gradient-crimson">{v}</p>
              <p className="text-sm text-white/50">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 text-sm text-white/40">
        <Star className="h-4 w-4 text-amber-400/60" />
        <p>© {new Date().getFullYear()} Webcard.ai — crafted for the discerning.</p>
      </div>
    </div>
  </div>
);

export default AuthBrandPanel;
