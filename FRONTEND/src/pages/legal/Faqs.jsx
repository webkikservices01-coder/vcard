import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import MeshBackground from '../../components/ui/MeshBackground';
import SectionHeading from '../../components/ui/SectionHeading';
import GlassCard from '../../components/ui/GlassCard';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { COMPANY } from '../../components/PublicFooter';

const faqs = [
  {
    q: 'What is Webcard.ai?',
    a: 'Webcard.ai is a digital business card platform — you build a card once (profile, contact links, products, portfolio) and share it via a QR code or a single link, instead of handing out paper cards.',
  },
  {
    q: 'Do I need to download an app?',
    a: 'No. Your card lives at a public web link (mycardlink.site/c/yourname). Anyone can view it in a browser on any device — no app install required, for you or for visitors.',
  },
  {
    q: 'What plans are available?',
    a: 'Three plans: Digital Card (the essentials — QR code, themes, analytics), Smart AI Card (adds the AI chat widget and AI persona), and AI Agent Pro (adds the voice assistant and multi-card support). See the Plans page for full pricing and feature comparison.',
  },
  {
    q: 'How does the AI chat widget work?',
    a: "On Smart AI Card and AI Agent Pro, you can enable an AI assistant on your public card. It's trained on your profile, products, portfolio, and FAQs, and answers visitor questions automatically, 24/7.",
  },
  {
    q: 'Can visitors talk to my AI assistant by voice?',
    a: 'Yes, on the AI Agent Pro plan the assistant supports voice input in the chat widget in addition to typed messages.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Yes. You can upgrade at any time from Dashboard → Plans, and the new features activate immediately. See our Cancellation Policy for how downgrades and cancellations work.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Yes. Payments are handled by Cashfree, a licensed payment gateway. We never see or store your full card details.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Refunds are available in specific cases (duplicate charges, failed activation, or unused plans within 24 hours). Full details are in our Refund Policy.',
  },
  {
    q: 'Can I use my own custom domain?',
    a: "Every card gets a free public link on mycardlink.site. If you'd like a fully custom domain, reach out to our support team to discuss availability.",
  },
  {
    q: 'How do I get support?',
    a: `You can raise a ticket from Dashboard → Support, or reach us directly at ${COMPANY.email} / ${COMPANY.phone}.`,
  },
];

const FaqItem = ({ item, isOpen, onToggle }) => (
  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <span className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>{item.q}</span>
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
        <ChevronDown className="h-4 w-4" style={{ color: 'var(--surface-text-2)' }} />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>{item.a}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Faqs = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-60" />
      <PublicNav />

      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-12 pb-24">
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" subtitle="Everything you need to know about Webcard.ai — plans, AI features, billing, and support." />

        <div className="mt-12 space-y-3">
          {faqs.map((item, i) => (
            <FaqItem key={item.q} item={item} isOpen={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? -1 : i)} />
          ))}
        </div>

        <GlassCard className="mt-10 p-6 text-center">
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>
            Still have a question? <Link to="/contact-us" className="text-crimson-700 font-semibold hover:underline">Contact our team</Link>.
          </p>
        </GlassCard>
      </section>

      <PublicFooter />
    </div>
  );
};

export default Faqs;
