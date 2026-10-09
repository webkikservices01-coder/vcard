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
import { PRICING_ENABLED } from '../../utils/plan';

const faqs = [
  {
    q: 'What is Aicardly?',
    a: 'Aicardly is a digital business card platform — you build a card once (profile, contact links, products, portfolio) and share it via a QR code or a single link, instead of handing out paper cards.',
  },
  {
    q: 'Do I need to download an app?',
    a: 'No. Your card lives at a public web link (aicardly.com/yourname). Anyone can view it in a browser on any device — no app install required, for you or for visitors.',
  },
  {
    pricingOnly: true,
    q: 'What plans are available?',
    a: 'Three plans, all + 18% GST: Digital Card (₹99/month: 1 card, 1 theme, AI chatbot 10 chats a month), Smart AI Card (₹199/month: 3 cards, 3 themes, 25 AI chats a month and live AI voice calls) and AI Agent Pro (₹1,999/month: 7 cards, all 10 themes, unlimited AI chats, AI voice and video calls and a metal NFC card). Yearly billing costs less. See the Pricing page for the full comparison.',
  },
  {
    pricingOnly: true,
    q: 'Is there a free plan or free trial?',
    a: 'There is no free plan. Every new account gets a 24-hour free trial with no credit card: 1 card, 1 theme and 4 AI chatbot answers. After 24 hours your card pauses until you choose a plan, and we email you a link to pick one.',
  },
  {
    q: 'How does the AI chat widget work?',
    aFree: "You can enable an AI assistant on your public card. It's trained on your profile, products, portfolio, and FAQs, and answers visitor questions automatically, 24/7.",
    a: "On every plan you can enable an AI assistant on your public card (10 chats a month on Digital Card, 25 on Smart AI Card, unlimited on AI Agent Pro). It's trained on your profile, products, portfolio, and FAQs, and answers visitor questions automatically, 24/7.",
  },
  {
    q: 'Can visitors talk to my AI assistant by voice?',
    aFree: 'Yes, the assistant supports voice input in the chat widget in addition to typed messages.',
    a: 'Yes. On Smart AI Card visitors can tap "AI call" on your card and talk to your AI assistant live (English or Hindi). AI Agent Pro adds live AI video calls.',
  },
  {
    pricingOnly: true,
    q: 'Can I change my plan later?',
    a: 'Yes. You can upgrade at any time from Dashboard → Plans, and the new features activate immediately. See our Cancellation Policy for how downgrades and cancellations work.',
  },
  {
    pricingOnly: true,
    q: 'Is my payment information safe?',
    a: 'Yes. Payments are handled by Cashfree, a licensed payment gateway. We never see or store your full card details.',
  },
  {
    pricingOnly: true,
    q: 'Can I get a refund?',
    a: 'Refunds are available in specific cases (duplicate charges, failed activation, or unused plans within 24 hours). Full details are in our Refund Policy.',
  },
  {
    q: 'How much does the metal NFC card cost, and how long does delivery take?',
    a: "The price depends on finish, quantity and engraving, so we send you a quote first; request one on the Metal NFC Card page. It's included with the AI Agent Pro plan. Delivery is anywhere in India in 5–7 working days. Cards damaged in transit or with a faulty chip are replaced free; see the Shipping Policy.",
  },
  {
    q: 'Can I use my own custom domain?',
    a: "Every card gets a free public link on aicardly.com. If you'd like a fully custom domain, reach out to our support team to discuss availability.",
  },
  {
    q: 'How do I get support?',
    a: `You can raise a ticket from Dashboard → Support, or reach us directly at ${COMPANY.email} / ${COMPANY.phone}.`,
  },
];

// While pricing is switched off, plan / billing questions are hidden and answers drop plan names.
const visibleFaqs = PRICING_ENABLED ? faqs : faqs.filter(f => !f.pricingOnly).map(f => ({ ...f, a: f.aFree || f.a }));

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
        <SectionHeading eyebrow="Support" title="Frequently Asked Questions" subtitle={PRICING_ENABLED ? 'Everything you need to know about Aicardly — plans, AI features, billing, and support.' : 'Everything you need to know about Aicardly — your card, AI features, and support.'} />

        <div className="mt-12 space-y-3">
          {visibleFaqs.map((item, i) => (
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
