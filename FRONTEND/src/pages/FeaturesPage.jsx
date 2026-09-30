import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Nfc, Bot, Palette, BarChart3, ShieldCheck, FileText, Share2, ArrowRight, Check } from 'lucide-react';
import MeshBackground from '../components/ui/MeshBackground';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';

// Public /features page: everything an Aicardly card can do, grouped for first-time visitors.
const GROUPS = [
  {
    icon: Share2,
    title: 'Share in one tap',
    points: ['Your own link: aicardly.com/yourname', 'QR code to print or show on your phone', 'WhatsApp quick connect', 'One-tap Save Contact with photo and all your links'],
  },
  {
    icon: Nfc,
    title: 'Metal NFC business card',
    points: ['Tap any iPhone or Android to open your card', 'Stainless steel with logo and name engraving', 'Linked to your digital card, update without reprinting'],
    link: { to: '/metal-nfc-card', label: 'See the metal card' },
  },
  {
    icon: Bot,
    title: 'AI assistant on your card',
    points: ['Answers visitors 24/7 in English, Hindi and Hinglish', 'Knows your services, work and FAQs', 'Consulting mode that recommends your best-fit service', 'Guardrails for doctors, lawyers, CAs and more'],
  },
  {
    icon: Palette,
    title: 'Designs that look premium',
    points: ['10 templates, 5 colour palettes each', 'Light and dark mode', 'Live visitor counter', 'Your own favicon and card background'],
  },
  {
    icon: FileText,
    title: 'Show your work',
    points: ['Services and products with prices', 'Portfolio with automatic website previews', 'Instagram, Facebook and YouTube reels', 'Brochures, PDFs and documents'],
  },
  {
    icon: BarChart3,
    title: 'Leads and insights',
    points: ['Enquiry form with email alerts', 'Card views and link taps', 'AI chat funnel and NPS ratings', 'Test groups to compare campaigns'],
  },
  {
    icon: QrCode,
    title: 'Found on Google',
    points: ['Your card can appear in search results', 'Rich link previews on WhatsApp, LinkedIn and X', 'Turn indexing off anytime'],
  },
  {
    icon: ShieldCheck,
    title: 'Private and secure',
    points: ['Built for India’s DPDP Act', 'Visitor consent before AI chat and enquiries', 'We never sell your data'],
    link: { to: '/privacy-policy', label: 'Privacy Policy' },
  },
];

export default function FeaturesPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-50" />
      <PublicNav />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Features</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
            Everything your AI digital business card can do
          </h1>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: 'var(--surface-text-2)' }}>
            Share by QR, NFC or link, let an AI assistant answer visitors, and see who is interested, all from one card.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map(({ icon: Icon, title, points, link }, i) => (
            <motion.section
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: 0.04 * (i % 4) }}
              className="flex flex-col rounded-3xl border p-6 transition hover:-translate-y-1"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold" style={{ color: 'var(--surface-text)' }}>{title}</h2>
              <ul className="mt-3 space-y-2 text-sm flex-1" style={{ color: 'var(--surface-text-2)' }}>
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" aria-hidden="true" /> {p}
                  </li>
                ))}
              </ul>
              {link && (
                <Link to={link.to} className="mt-4 text-sm font-semibold text-[#E70C65] hover:underline">
                  {link.label} →
                </Link>
              )}
            </motion.section>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] p-8 sm:p-10 text-center text-white shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold">Make your card in 60 seconds</h2>
          <p className="mt-2 text-white/85">Free to start. No app needed for you or the people you meet.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#9F1C44]">
              Create my free card <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white">
              See pricing
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
