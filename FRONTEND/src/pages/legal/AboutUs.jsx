import { motion } from 'framer-motion';
import { Sparkles, Target, Users, Rocket } from 'lucide-react';
import MeshBackground from '../../components/ui/MeshBackground';
import SectionHeading from '../../components/ui/SectionHeading';
import FadeIn from '../../components/ui/FadeIn';
import GlassCard from '../../components/ui/GlassCard';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { COMPANY } from '../../components/PublicFooter';

const stats = [
  { value: '10k+', label: 'Cards created' },
  { value: '50k+', label: 'Profile views' },
  { value: '4.8★', label: 'Avg. rating' },
];

const values = [
  { icon: Sparkles, title: 'Craft over clutter', desc: 'Every theme, animation, and interaction is designed to feel premium — never generic.' },
  { icon: Target, title: 'Built for real use', desc: 'From freelancers to agencies, we design for people who actually hand out their card every day.' },
  { icon: Rocket, title: 'AI that helps, not gimmicks', desc: 'Our AI chat and voice features exist to save you real time answering the same questions.' },
  { icon: Users, title: 'Support that responds', desc: 'A small, hands-on team behind the product — not a ticket queue that goes nowhere.' },
];

const AboutUs = () => (
  <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
    <MeshBackground fixed rich className="opacity-70" />
    <PublicNav />

    <section className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-20 text-center">
      <motion.span initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="badge-glass text-crimson-700">
        <span className="h-1.5 w-1.5 rounded-full bg-magenta-500 animate-pulse-glow" />
        About Webcard.ai
      </motion.span>
      <motion.h1
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl text-balance"
        style={{ color: 'var(--surface-text)' }}
      >
        We build the digital card <br />
        <span className="text-gradient-crimson-animated">your network deserves.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}
        className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: 'var(--surface-text-2)' }}
      >
        Webcard.ai is a digital business card platform built by <strong>{COMPANY.name}</strong> — designed for
        professionals who want their first impression to feel as sharp online as it does in person.
      </motion.p>

      <div className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08}>
            <p className="text-3xl font-bold" style={{ color: 'var(--surface-text)' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>

    <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
      <FadeIn>
        <GlassCard premium className="p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--surface-text)' }}>Our story</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>
            Paper business cards get lost, forgotten, and thrown away — but the exchange that matters,
            the actual introduction, still happens face to face every day. We built Webcard.ai to keep
            that human moment while fixing everything about it that's inconvenient: your card is now a
            link and a QR code, always up to date, and can answer questions for you when you're not
            around, through an AI assistant trained on your own profile.
          </p>
          <p className="text-sm leading-relaxed mt-4" style={{ color: 'var(--surface-text-2)' }}>
            We're operated by {COMPANY.name}, a Delhi-based technology and digital services company —
            so behind the product there's a real, reachable team, not a faceless SaaS.
          </p>
        </GlassCard>
      </FadeIn>
    </section>

    <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
      <SectionHeading eyebrow="What we care about" title="How we build" subtitle="A handful of principles that shape every feature we ship." />
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {values.map((v, i) => (
          <FadeIn key={v.title} delay={i * 0.08}>
            <GlassCard hover className="p-6 h-full">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                <v.icon className="h-5 w-5 text-crimson-700" />
              </div>
              <h3 className="font-bold mb-1.5" style={{ color: 'var(--surface-text)' }}>{v.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>{v.desc}</p>
            </GlassCard>
          </FadeIn>
        ))}
      </div>
    </section>

    <PublicFooter />
  </div>
);

export default AboutUs;
