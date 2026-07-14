import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Bot, BarChart3, Sparkles } from 'lucide-react';
import MeshBackground from './ui/MeshBackground';

const features = [
  { icon: QrCode, text: 'One tap-share QR & link for every card' },
  { icon: Bot, text: 'AI assistant fills your card for you' },
  { icon: BarChart3, text: 'Track views & leads in real time' },
];

const AuthBrandPanel = () => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setFlipped((f) => !f), 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative hidden lg:flex lg:w-[45%] shrink-0 flex-col justify-between overflow-hidden px-12 py-12"
      style={{ background: 'var(--surface-2)' }}>
      <MeshBackground />

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
        <h1 className="font-display text-xl font-black tracking-tight" style={{ color: 'var(--surface-text)' }}>MYcardLINK</h1>
        <p className="text-[10px] font-medium tracking-widest uppercase mt-0.5" style={{ color: 'var(--surface-text-2)' }}>Card · QR · Digital</p>
      </motion.div>

      {/* Floating auto-flipping glass card mockup */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-64 h-72"
            style={{ perspective: 1400 }}
          >
            <motion.div
              className="relative w-full h-full"
              style={{ transformStyle: 'preserve-3d' }}
              animate={{
                rotateY: flipped ? 180 : 0,
                scale: [1, 0.9, 1],
                boxShadow: [
                  '0 20px 60px -15px rgba(219,39,119,0.15)',
                  '0 8px 24px -8px rgba(219,39,119,0.35)',
                  '0 20px 60px -15px rgba(219,39,119,0.15)',
                ],
              }}
              transition={{ duration: 0.9, times: [0, 0.5, 1], ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Shine sweep — replays on every flip */}
              <motion.div
                key={flipped}
                initial={{ x: '-160%', opacity: 0 }}
                animate={{ x: '160%', opacity: [0, 0.7, 0] }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                className="absolute inset-y-0 left-0 w-1/3 pointer-events-none z-20"
                style={{
                  background: 'linear-gradient(115deg, transparent, rgba(255,255,255,0.55), transparent)',
                  transform: 'skewX(-20deg)',
                }}
              />

              {/* Front face — business card */}
              <div className="glass absolute inset-0 rounded-3xl p-5" style={{ backfaceVisibility: 'hidden' }}>
                <div className="h-16 -mx-5 -mt-5 mb-4 rounded-t-3xl bg-gradient-to-br from-brand-500 to-rose-500" />
                <div className="flex items-center gap-3 -mt-9 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-sm font-black text-brand-600 shrink-0">
                    A
                  </div>
                </div>
                <div className="h-2.5 w-28 rounded-full mb-2" style={{ background: 'var(--surface-text)', opacity: 0.7 }} />
                <div className="h-2 w-20 rounded-full mb-5" style={{ background: 'var(--surface-text-2)', opacity: 0.5 }} />
                <div className="space-y-2">
                  <div className="h-7 rounded-lg bg-brand-500/10 border border-brand-500/20" />
                  <div className="h-7 rounded-lg bg-brand-500/10 border border-brand-500/20" />
                </div>
              </div>

              {/* Back face — analytics + QR */}
              <div
                className="glass absolute inset-0 rounded-3xl p-5 flex flex-col"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: 'var(--surface-text)' }}>Card Analytics</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="rounded-xl p-2.5 bg-brand-500/10 border border-brand-500/20">
                    <p className="text-lg font-black text-brand-500">1.2k</p>
                    <p className="text-[9px]" style={{ color: 'var(--surface-text-2)' }}>Views</p>
                  </div>
                  <div className="rounded-xl p-2.5 bg-brand-500/10 border border-brand-500/20">
                    <p className="text-lg font-black text-brand-500">86</p>
                    <p className="text-[9px]" style={{ color: 'var(--surface-text-2)' }}>Leads</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-14 mb-4">
                  {[40, 65, 45, 80, 60, 95, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${h}%` }} />
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6 text-black" />
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--surface-text-2)' }}>Scan to share your card anywhere</p>
                </div>
              </div>
            </motion.div>

            {/* Flip indicator dots */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 rounded-full bg-brand-500"
                  animate={{ width: (flipped ? 1 : 0) === i ? 18 : 6, opacity: (flipped ? 1 : 0) === i ? 1 : 0.3 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}
            </div>
          </motion.div>

          <motion.div
            className="glass w-9 h-9 rounded-xl flex items-center justify-center -mt-5 ml-auto mr-4 relative"
            animate={{ rotate: [0, 8, 0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-4 h-4 text-brand-500" />
          </motion.div>
        </motion.div>
      </div>

      {/* Feature list */}
      <div className="relative z-10 space-y-4">
        {features.map(({ icon: Icon, text }, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="glass w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-brand-500" />
            </div>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AuthBrandPanel;
