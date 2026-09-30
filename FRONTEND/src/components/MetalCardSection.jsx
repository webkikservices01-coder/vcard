import { Link } from 'react-router-dom';
import { Nfc, PenTool, Sparkles, Truck, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const METAL_POINTS = [
  { icon: Nfc, text: 'Tap to share, no app needed' },
  { icon: PenTool, text: 'Custom logo and name engraving' },
  { icon: Sparkles, text: 'Linked to your AI digital card' },
  { icon: Truck, text: 'Delivered across India in 5 to 7 days' },
];

export const METAL_COPY = [
  'Make your first impression impossible to forget. An Aicardly metal NFC business card is crafted from durable stainless steel with a premium matte finish, and it feels as good in the hand as it looks on the table. Built to last for years, it resists bends, scratches, and daily wear, so your card stays sharp long after paper cards have crumpled.',
  'Simply tap the card on the back of any iPhone or Android phone and your digital business card opens instantly. No app, no typing, no scanning. Your contact details, social links, portfolio, and AI assistant are shared in one tap.',
  'Make it yours with custom logo and name engraving. Every card is linked to your Aicardly profile, so you can update your details anytime without reprinting. Orders are delivered across India in 5 to 7 working days. Perfect for founders, consultants, real estate agents, and creators who want to stand out.',
];

// Brushed-steel card drawn in CSS (no photo yet). role="img" + aria-label act as its alt text.
export function MetalCardVisual({ name = 'YOUR NAME', role = 'Founder · Your Company', className = '' }) {
  return (
    <div
      role="img"
      aria-label="Aicardly premium metal NFC business card"
      className={`relative aspect-[1.586] w-full max-w-md rounded-2xl p-6 sm:p-7 shadow-2xl ${className}`}
      style={{
        background:
          'repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px), linear-gradient(135deg, #3b3d44 0%, #1d1f24 45%, #4a4c53 70%, #17181c 100%)',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.18), inset 0 -1px 0 rgba(0,0,0,.5)',
        transform: 'perspective(900px) rotateY(-10deg) rotateX(6deg)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="h-9 w-12 rounded-md" style={{ background: 'linear-gradient(135deg,#d9c27a,#a8893f 60%,#e8d9a0)', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.25)' }} />
        <Nfc className="h-7 w-7 text-white/70" aria-hidden="true" />
      </div>
      <div className="absolute bottom-6 left-6 right-6 sm:bottom-7 sm:left-7">
        <p className="text-lg sm:text-xl font-bold tracking-[0.18em] text-white/90" style={{ textShadow: '0 1px 0 rgba(0,0,0,.6)' }}>
          {name}
        </p>
        <p className="mt-1 text-[11px] sm:text-xs tracking-[0.2em] uppercase text-white/55">{role}</p>
      </div>
      <p className="absolute top-6 right-16 sm:top-7 text-[11px] font-bold tracking-[0.3em] text-[#ff6b9d]/90">AICARDLY</p>
    </div>
  );
}

// Homepage section (right after Features). The /metal-nfc-card page reuses the copy and visual.
export default function MetalCardSection() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <section id="metal-nfc-card" aria-labelledby="metal-card-heading" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden">
      <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Metal NFC Card</p>
          <h2 id="metal-card-heading" className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Premium Metal NFC Business Cards
          </h2>
          <div className={`mt-6 space-y-4 text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {METAL_COPY.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {METAL_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${isDark ? 'border-white/10 bg-white/[0.03] text-slate-200' : 'border-slate-200 bg-white text-slate-700'}`}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#E70C65]/10 text-[#E70C65]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/metal-nfc-card"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
            >
              Order Metal Card
            </Link>
            <Link
              to="/metal-nfc-card"
              className={`inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5 ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
            >
              See Card Details <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <MetalCardVisual />
        </div>
      </div>
    </section>
  );
}
