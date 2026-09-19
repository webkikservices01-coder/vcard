import { motion } from 'framer-motion';
import { QrCode, Star } from 'lucide-react';
import Logo from './ui/Logo';

const stats = [
  ['12k+', 'Professionals'],
  ['480k', 'Cards shared'],
  ['4.9★', 'Avg. rating'],
];

const AuthBrandPanel = () => (
  <div className="relative hidden overflow-hidden bg-[#07090E] lg:block lg:w-[46%] shrink-0 border-r border-white/10">
    
    {/* Dot Matrix & Ambient Radial Glows */}
    <div 
      className="pointer-events-none absolute inset-0 opacity-[0.25]"
      style={{
        backgroundImage: `radial-gradient(rgba(231, 12, 101, 0.35) 1px, transparent 1px)`,
        backgroundSize: '28px 28px'
      }}
    />
    <div className="pointer-events-none absolute top-1/4 left-1/4 h-56 w-56 rounded-full bg-[#E70C65]/20 blur-3xl animate-pulse" />
    <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-56 w-56 rounded-full bg-[#6366f1]/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

    {/* Floating Profile Mockup */}
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [-1, 1, -1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-10 right-8 w-52 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-4 shadow-2xl z-10"
    >
      <div className="flex items-center gap-2.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] flex items-center justify-center text-xs font-bold text-white shadow-md shadow-[#E70C65]/30">
          AL
        </div>
        <div>
          <p className="text-sm font-bold text-white">Ava Lindgren</p>
          <p className="text-[10px] font-medium text-slate-400">Partner</p>
        </div>
      </div>
      <div className="mt-3 flex gap-1.5">
        {['in', 'X', 'Be'].map((s) => (
          <div key={s} className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-[10px] font-bold text-white/80 border border-white/10">
            {s}
          </div>
        ))}
      </div>
    </motion.div>

    {/* Floating QR Card */}
    <motion.div
      animate={{ y: [0, 8, 0], rotate: [1, -1, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="absolute bottom-24 right-8 w-48 rounded-2xl bg-white/[0.06] backdrop-blur-2xl border border-white/15 p-3.5 shadow-2xl z-10"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E70C65]/15 text-[#ff6b9d] border border-[#E70C65]/30">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Scan to connect</p>
          <p className="text-[10px] text-slate-400 font-mono">webcard.ai/ava</p>
        </div>
      </div>
    </motion.div>

    {/* Brand Content with strict 48px padding (p-12) */}
    <div className="relative flex h-full flex-col justify-between p-12 z-20">
      <Logo light />

      <div className="my-auto py-8 max-w-lg">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl font-extrabold leading-[1.15] tracking-tight text-white"
        >
          The card you hand out <br /> when you mean{' '}
          <span className="bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] bg-clip-text text-transparent">
            business.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-base leading-relaxed text-slate-300"
        >
          Join thousands of executives, founders, and creatives who replaced paper cards with a velvet touch.
        </motion.p>

        {/* 1. Aligned Stats Container (Edge matches x=48 baseline) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-3 gap-6 pt-4 border-t border-white/10"
        >
          {stats.map(([v, l]) => (
            <div key={l} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff6b9d]">{v}</p>
              <p className="text-xs font-medium text-slate-400">{l}</p>
            </div>
          ))}
        </motion.div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
        <p>© {new Date().getFullYear()} Webcard.ai — crafted for the discerning.</p>
      </div>
    </div>
  </div>
);

export default AuthBrandPanel;