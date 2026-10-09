import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight, Check } from 'lucide-react';
import MeshBackground from '../components/ui/MeshBackground';
import PublicNav from '../components/PublicNav';
import PublicFooter, { COMPANY } from '../components/PublicFooter';
import { MetalCardVisual, METAL_COPY, METAL_POINTS } from '../components/MetalCardSection';
import HOME_SCHEMA from '../data/homeSchema.json';
import MetalOrderForm from '../components/MetalOrderForm';

// /metal-nfc-card: product page for the premium metal NFC card. Price is by quote (finish,
// quantity, engraving); orders come in through the form below, WhatsApp or a call.
// When a fixed starting price is decided, set METAL_FROM_PRICE (e.g. 1499) to show it.
const METAL_FROM_PRICE = Number(import.meta.env.VITE_METAL_FROM_PRICE) || 0;
const ORDER_TEXT = encodeURIComponent("Hi Aicardly, I'd like to order a premium metal NFC business card.");
const WHATSAPP_URL = `https://wa.me/${COMPANY.whatsapp}?text=${ORDER_TEXT}`;

const STEPS = [
  ['Tell us what you want', 'Send the form below, WhatsApp or call with your name, logo and finish.'],
  ['We engrave your card', 'Your logo and name are engraved on durable stainless steel.'],
  ['We link it to your Aicardly card', 'The NFC chip opens your digital business card on any phone.'],
  ['Delivered in 5–7 working days', 'Shipped anywhere in India.'],
];

// Same answers as the homepage FAQ, for the questions about NFC.
const FAQ = HOME_SCHEMA.faqs.filter((f) => /NFC|install an app|custom link/i.test(f.q));

const btnPrimary =
  'group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl active:scale-95';
const btnSecondary =
  'inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-bold transition-all hover:-translate-y-0.5';

export default function MetalNfcCard() {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-50" />
      <PublicNav />

      <main className="relative z-10">
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-6 pt-6 text-xs" style={{ color: 'var(--surface-text-2)' }}>
          <Link to="/" className="hover:underline">Home</Link> <span aria-hidden="true">/</span> <span>Metal NFC Card</span>
        </nav>

        <section className="mx-auto max-w-6xl px-6 pt-8 pb-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Metal NFC Card</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
              Premium Metal NFC Business Card
            </h1>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>
              {METAL_COPY[0]}
            </p>
            <p className="mt-6 text-lg font-bold" style={{ color: 'var(--surface-text)' }}>
              {METAL_FROM_PRICE ? <>From ₹{METAL_FROM_PRICE.toLocaleString('en-IN')} + GST</> : 'Price on quote'}
              <span className="ml-2 text-sm font-medium" style={{ color: 'var(--surface-text-2)' }}>· Included free with AI Agent Pro</span>
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href="#order" className={btnPrimary}>
                Request a quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary} style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Order on WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>
              Pricing depends on finish, quantity and engraving. Delivered across India in 5–7 working days. Or call{' '}
              <a href={COMPANY.phoneHref} className="font-semibold underline">{COMPANY.phone}</a>.
            </p>
          </motion.div>
          <div className="flex justify-center">
            <MetalCardVisual />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {METAL_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-xl border px-4 py-4 text-sm font-medium" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)', color: 'var(--surface-text)' }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#E70C65]/10 text-[#E70C65]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16 space-y-4 text-base leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
            Built to last, made to share
          </h2>
          {METAL_COPY.slice(1).map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" style={{ color: 'var(--surface-text)' }}>
            How ordering works
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map(([title, desc], i) => (
              <li key={title} className="rounded-2xl border p-5" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-sm font-bold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold" style={{ color: 'var(--surface-text)' }}>{title}</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--surface-text-2)' }}>{desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="order" className="mx-auto max-w-3xl scroll-mt-24 px-6 pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--surface-text)' }}>
            Request your metal card
          </h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--surface-text-2)' }}>
            Tell us what you need and we'll send a quote. See our <Link to="/shipping-policy" className="font-semibold text-[#E70C65] hover:underline">Shipping Policy</Link> for delivery, damage and replacement terms.
          </p>
          <MetalOrderForm />
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" style={{ color: 'var(--surface-text)' }}>
            Questions about NFC cards
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl border px-5 py-4" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold" style={{ color: 'var(--surface-text)' }}>
                  <h3 className="text-base font-semibold">{f.q}</h3>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E70C65]/10 text-[#E70C65] transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-3xl p-8 sm:p-10 text-center text-white bg-gradient-to-br from-[#E70C65] to-[#9F1C44] shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready for a card people remember?</h2>
            <p className="mt-2 text-white/85">Order your metal NFC card, or create your free AI digital business card today.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#9F1C44]">
                <Check className="h-4 w-4" aria-hidden="true" /> Order Metal Card
              </a>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full border border-white/60 px-6 py-3 text-sm font-bold text-white">
                Create free digital card <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
