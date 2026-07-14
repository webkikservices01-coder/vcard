import { motion } from 'framer-motion';
import { QrCode, Bot, BarChart3, Sparkles } from 'lucide-react';

const features = [
  { icon: QrCode, text: 'One tap-share QR & link for every card' },
  { icon: Bot, text: 'AI assistant fills your card for you' },
  { icon: BarChart3, text: 'Track views & leads in real time' },
];

const AuthBrandPanel = () => (
  <div className="relative hidden lg:flex lg:w-[45%] shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-b from-white via-pink-50/60 to-pink-50 px-12 py-12">
    {/* Ambient gradient orbs */}
    <motion.div
      className="absolute -top-24 -left-16 w-80 h-80 rounded-full"
      style={{ background: 'radial-gradient(circle, #f472b6, transparent 70%)' }}
      animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.12, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-1/3 translate-y-1/3"
      style={{ background: 'radial-gradient(circle, #fb7185, transparent 70%)' }}
      animate={{ opacity: [0.25, 0.45, 0.25], scale: [1, 1.15, 1] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
    />
    {/* Dot grid texture */}
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{ backgroundImage: 'radial-gradient(circle, #fbcfe8 1px, transparent 1px)', backgroundSize: '22px 22px' }}
    />

    {/* Logo */}
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
      <h1 className="text-xl font-black text-black tracking-tight">MYcardLINK</h1>
      <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-0.5">Card · QR · Digital</p>
    </motion.div>

    {/* Floating card mockup */}
    <div className="relative z-10 flex-1 flex items-center justify-center py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-64 rounded-3xl border border-pink-100 bg-white/80 backdrop-blur-sm p-5 shadow-[0_20px_60px_rgba(244,63,94,0.15)]"
        >
          <div className="h-16 -mx-5 -mt-5 mb-4 rounded-t-3xl bg-gradient-to-br from-pink-500 to-rose-500" />
          <div className="flex items-center gap-3 -mt-9 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-sm font-black text-pink-600 shrink-0">
              A
            </div>
          </div>
          <div className="h-2.5 w-28 rounded-full bg-gray-800/80 mb-2" />
          <div className="h-2 w-20 rounded-full bg-gray-300 mb-5" />
          <div className="space-y-2">
            <div className="h-7 rounded-lg bg-pink-50 border border-pink-100" />
            <div className="h-7 rounded-lg bg-pink-50 border border-pink-100" />
          </div>
        </motion.div>
        <motion.div
          className="w-9 h-9 rounded-xl bg-white border border-pink-100 shadow-xl flex items-center justify-center -mt-5 ml-auto mr-4 relative"
          animate={{ rotate: [0, 8, 0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-4 h-4 text-pink-500" />
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
          <div className="w-8 h-8 rounded-lg bg-white border border-pink-100 shadow-sm flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-sm text-gray-600">{text}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default AuthBrandPanel;
