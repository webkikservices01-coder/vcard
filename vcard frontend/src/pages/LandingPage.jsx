import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Smartphone,
  QrCode,
  BarChart3,
  Sparkles,
  MessageCircle,
  Globe,
  ArrowRight,
  Check,
  Star,
  Zap,
  Bot,
  Phone,
} from 'lucide-react';
import MeshBackground from '../components/ui/MeshBackground';
import Logo from '../components/ui/Logo';
import FadeIn from '../components/ui/FadeIn';
import SectionHeading from '../components/ui/SectionHeading';
import { plans as realPlans } from '../data/plans';

const features = [
  { icon: Smartphone, title: 'Digital Business Card', desc: 'Share your identity with a tap. No app required — works on any device, instantly.' },
  { icon: Bot, title: 'AI Persona & Chat Widget', desc: 'A configurable AI assistant on your card that greets visitors and answers for you, 24/7.' },
  { icon: QrCode, title: 'Smart QR Codes', desc: 'Generate elegant QR codes that route straight to your card. Print, share, scan.' },
  { icon: BarChart3, title: 'Visit Analytics', desc: 'Track profile views, link taps, and engagement with a refined, executive dashboard.' },
  { icon: MessageCircle, title: 'WhatsApp Quick Connect', desc: 'Let visitors reach you on WhatsApp in one tap, straight from your card.' },
  { icon: Globe, title: 'Custom Public Link', desc: 'Your own /c/yourname link — polished, memorable, and ready to share anywhere.' },
];

const PLAN_ICONS = { 'digital-id': Zap, 'smart-ai-card': Bot, 'ai-agent-pro': Phone };

const testimonials = [
  { name: 'Aarav Sharma', role: 'Founder, Studio Nine', quote: 'Webcard.ai replaced the paper cards I kept forgetting at home. Clients scan the QR and my whole profile is right there.' },
  { name: 'Meera Iyer', role: 'Real Estate Consultant', quote: 'The AI chat widget answers basic questions for leads even when I am with another client. It genuinely saves me calls.' },
  { name: 'Rohan Verma', role: 'Freelance Designer', quote: 'The themes feel premium — it is the first digital card I have used that actually looks the way I wanted my brand to feel.' },
];

const stats = [
  { value: '10k+', label: 'Cards created' },
  { value: '50k+', label: 'Profile views' },
  { value: '4.8★', label: 'Avg. rating' },
];

const audience = ['Founders', 'Consultants', 'Real Estate', 'Creators', 'Coaches', 'Agencies'];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed rich className="opacity-70" />

      {/* Nav */}
      <header className="relative z-20">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
        >
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium hover:text-crimson-700 transition" style={{ color: 'var(--surface-text-2)' }}>Features</a>
            <a href="#pricing" className="text-sm font-medium hover:text-crimson-700 transition" style={{ color: 'var(--surface-text-2)' }}>Pricing</a>
            <a href="#stories" className="text-sm font-medium hover:text-crimson-700 transition" style={{ color: 'var(--surface-text-2)' }}>Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="badge-glass text-crimson-700"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-magenta-500 animate-pulse-glow" />
              The AI-powered digital card platform
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl text-balance"
              style={{ color: 'var(--surface-text)' }}
            >
              Your network,
              <br />
              <span className="text-gradient-crimson-animated">elevated.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-balance"
              style={{ color: 'var(--surface-text-2)' }}
            >
              Design a breathtaking digital business card, share it with a single link or QR, and let an AI assistant handle the follow-ups. Built for professionals who care about first impressions.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link to="/register" className="btn-primary text-base">
                Build your card <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#features" className="btn-ghost text-base">Explore features</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {['#9F1C44', '#E70C65', '#b3154b', '#cf0555'].map((c) => (
                  <motion.div
                    key={c}
                    whileHover={{ y: -4, scale: 1.1 }}
                    className="h-10 w-10 rounded-full border-2 shadow-premium"
                    style={{ background: `linear-gradient(135deg, ${c}, ${c}dd)`, borderColor: 'var(--surface-1)' }}
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Loved by early professionals</p>
              </div>
            </motion.div>
          </div>

          {/* Hero card mockup with floating elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 bg-gradient-crimson opacity-20 blur-3xl rounded-full" />

            <motion.div
              animate={{ rotate: [1, 0, 1, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="glass-card relative mx-auto max-w-md p-8"
            >
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-3xl bg-gradient-crimson flex items-center justify-center text-2xl font-bold text-white shadow-glow-crimson">
                  AL
                </div>
                <div>
                  <p className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Ava Lindgren</p>
                  <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Partner · Nordvest Capital</p>
                </div>
              </div>
              <div className="mt-6 space-y-2.5">
                {[
                  ['Email', 'ava@nordvest.vc'],
                  ['Phone', '+1 (415) 555-0192'],
                  ['Web', 'nordvest.vc/ava'],
                ].map(([k, v]) => (
                  <motion.div
                    key={k}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between rounded-2xl px-4 py-3"
                    style={{ background: 'color-mix(in srgb, var(--surface-1) 50%, transparent)' }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--surface-text-2)' }}>{k}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{v}</span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                {['in', 'X', 'Be'].map((s) => (
                  <div key={s} className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold" style={{ background: 'color-mix(in srgb, var(--surface-text) 5%, transparent)', color: 'var(--surface-text-2)' }}>{s}</div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-gradient-crimson p-[1px]">
                <div className="rounded-[15px] px-4 py-3 flex items-center justify-between" style={{ background: 'var(--surface-1)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>Scan to connect</span>
                  <QrCode className="h-8 w-8 text-crimson-700" />
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-4 -left-4 sm:-left-6 glass-card p-4"
            >
              <p className="text-2xl font-bold" style={{ color: 'var(--surface-text)' }}>4.2k</p>
              <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>profile views</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-2 -right-2 sm:-right-6 badge-glow"
            >
              <Sparkles className="h-3 w-3" /> Premium
            </motion.div>
          </motion.div>
        </div>

        {/* Audience row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 border-t pt-10"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--surface-text-2)', opacity: 0.7 }}>Built for</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {audience.map((a) => (
              <span key={a} className="text-lg font-bold hover:text-crimson-700 transition-colors" style={{ color: 'var(--surface-text-2)', opacity: 0.6 }}>{a}</span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Stats banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-8">
        <FadeIn>
          <div className="glass-card grid grid-cols-3 divide-x divide-ink-900/8 overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="text-3xl sm:text-4xl font-bold text-gradient-crimson">{s.value}</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--surface-text-2)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Everything you need"
          title="Crafted for the modern professional"
          subtitle="A complete toolkit to present, share, and measure your professional identity — wrapped in a luxury interface."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div className="glass-card h-full p-7 group hover:-translate-y-1.5 hover:shadow-card-hover transition-all duration-500 relative overflow-hidden">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-crimson opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-crimson-soft text-crimson-700 group-hover:bg-gradient-crimson group-hover:text-white group-hover:shadow-glow-crimson transition-all duration-500">
                  <f.icon className="h-7 w-7" />
                </div>
                <h3 className="relative mt-6 text-xl font-bold" style={{ color: 'var(--surface-text)' }}>{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionHeading
          eyebrow="Simple pricing"
          title="Plans that scale with your ambition"
          subtitle="Start with a digital card. Upgrade when you want AI doing the talking for you."
        />
        <div className="mt-16 grid gap-6 lg:grid-cols-3 items-stretch">
          {realPlans.map((p, i) => {
            const Icon = PLAN_ICONS[p.id] || Zap;
            const highlight = p.popular;
            const bullets = [
              `${p.features.vCards} vCard${p.features.vCards > 1 ? 's' : ''}`,
              `${p.features.themes}+ premium themes`,
              p.features.aiChatWidget ? 'AI chat widget' : 'QR code + analytics',
              p.features.aiVoiceAgent ? 'AI voice & WhatsApp agent' : (p.features.hideBranding ? 'Hide branding' : 'Standard branding'),
              `${p.features.support} support`,
            ];
            return (
              <FadeIn key={p.id} delay={i * 0.08} className="h-full">
                <div
                  className={`relative h-full rounded-3xl p-8 transition-all duration-500 ${
                    highlight
                      ? 'bg-ink-900 text-white shadow-glass-lg border border-crimson-500/30 hover:shadow-glow-crimson-lg'
                      : 'glass-card hover:-translate-y-1.5 hover:shadow-card-hover'
                  }`}
                >
                  {highlight && (
                    <>
                      <div className="absolute inset-0 bg-gradient-radial-crimson rounded-3xl opacity-40" />
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 badge-glow">
                        <Sparkles className="h-3 w-3" /> Most popular
                      </span>
                    </>
                  )}
                  <div className="relative">
                    <div className={`flex items-center gap-3 ${highlight ? 'text-magenta-300' : 'text-crimson-700'}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${highlight ? 'bg-white/10' : 'bg-gradient-crimson-soft'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold">{p.name}</p>
                    </div>
                    <div className="mt-5 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">₹{p.price.monthly}</span>
                      <span className={`text-sm ${highlight ? 'text-white/60' : ''}`} style={!highlight ? { color: 'var(--surface-text-2)' } : undefined}>/ month</span>
                    </div>
                    <p className={`mt-3 text-sm ${highlight ? 'text-white/70' : ''}`} style={!highlight ? { color: 'var(--surface-text-2)' } : undefined}>{p.tagline}</p>
                    <ul className="mt-6 space-y-3">
                      {bullets.map((feat) => (
                        <li key={feat} className="flex items-center gap-3 text-sm">
                          <Check className={`h-4 w-4 shrink-0 ${highlight ? 'text-magenta-300' : 'text-crimson-700'}`} />
                          <span className={highlight ? 'text-white/90' : ''} style={!highlight ? { color: 'var(--surface-text)' } : undefined}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to="/register"
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-semibold transition-all duration-300 ${
                        highlight
                          ? 'bg-gradient-crimson text-white shadow-glow-crimson hover:shadow-glow-crimson-lg hover:-translate-y-0.5'
                          : 'border hover:-translate-y-0.5'
                      }`}
                      style={!highlight ? { background: 'color-mix(in srgb, var(--surface-1) 70%, transparent)', color: 'var(--surface-text)', borderColor: 'var(--surface-border)' } : undefined}
                    >
                      Choose {p.name} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Trusted by early users" title="Stories from the field" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.08}>
              <figure className="glass-card h-full p-7 group hover:-translate-y-1 transition-all duration-500">
                <div className="flex gap-1 text-amber-500">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}
                </div>
                <blockquote className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--surface-text)' }}>"{t.quote}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-crimson flex items-center justify-center text-sm font-bold text-white shadow-glow-crimson">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <FadeIn>
          <div className="relative overflow-hidden rounded-4xl bg-ink-900 p-12 text-center sm:p-20">
            <div className="absolute inset-0 bg-gradient-radial" />
            <div className="absolute inset-0 bg-mesh-dark opacity-50" />
            <div className="absolute -top-20 left-1/4 h-40 w-40 rounded-full bg-magenta-500/20 blur-3xl animate-pulse-glow" />
            <div className="absolute -bottom-20 right-1/4 h-40 w-40 rounded-full bg-crimson-700/20 blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
            <div className="relative">
              <span className="badge-glass-dark mb-6">
                <Sparkles className="h-3 w-3" /> Start free, upgrade anytime
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight text-balance">
                Ready to make an unforgettable <span className="text-gradient-crimson-animated">impression?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/70 text-balance">
                Join professionals who upgraded their first impression with a card that works as hard as they do.
              </p>
              <Link to="/register" className="btn-primary mt-8 text-base">
                Build your free card <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t backdrop-blur-md" style={{ borderColor: 'var(--surface-border)', background: 'color-mix(in srgb, var(--surface-1) 40%, transparent)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
          <Logo />
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>© {new Date().getFullYear()} Webcard.ai. Crafted for the discerning.</p>
          <div className="flex gap-6 text-sm" style={{ color: 'var(--surface-text-2)' }}>
            <a href="#" className="hover:text-crimson-700 transition">Privacy</a>
            <a href="#" className="hover:text-crimson-700 transition">Terms</a>
            <a href="#" className="hover:text-crimson-700 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
