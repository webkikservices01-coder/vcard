import { motion } from 'framer-motion';
import MeshBackground from '../../components/ui/MeshBackground';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

// Shared shell for the legal/policy pages (T&C, Privacy, Refund, Cancellation) —
// keeps the hero + prose-typography treatment identical across all four.
const LegalLayout = ({ title, updated, children }) => (
  <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
    <MeshBackground fixed className="opacity-50" />
    <PublicNav />

    <section className="relative z-10 mx-auto max-w-3xl px-6 pt-8 pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>{title}</h1>
        {updated && (
          <p className="mt-2 text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--surface-text-2)' }}>
            Last updated: {updated}
          </p>
        )}

        <div
          className="mt-10 space-y-6 text-sm leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:underline [&_a]:underline-offset-2"
          style={{ color: 'var(--surface-text-2)' }}
        >
          {children}
        </div>
      </motion.div>
    </section>

    <PublicFooter />
  </div>
);

export default LegalLayout;
