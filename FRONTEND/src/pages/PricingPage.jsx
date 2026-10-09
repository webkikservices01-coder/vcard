import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X as XIcon, ArrowRight } from 'lucide-react';
import MeshBackground from '../components/ui/MeshBackground';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { plans, featureSections, withGst, inr, yearlySaving, FREE_TRIAL } from '../data/plans.jsx';

// Public /pricing page (the dashboard's Plans page is for signed-in owners). Prices come from
// data/plans.jsx, the same list the dashboard and the server's catalog use.
export default function PricingPage() {
  const [billing, setBilling] = useState('yearly');
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-50" />
      <PublicNav />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Pricing</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
            Simple plans for every professional
          </h1>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: 'var(--surface-text-2)' }}>
            Try it free for 24 hours, then pick the plan that fits. Prices in INR.
          </p>
          <div className="mt-8 inline-flex rounded-full p-1" style={{ background: 'var(--surface-2)' }}>
            {['monthly', 'yearly'].map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={billing === b}
                onClick={() => setBilling(b)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${billing === b ? 'bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow' : ''}`}
                style={billing !== b ? { color: 'var(--surface-text-2)' } : undefined}
              >
                {b}
              </button>
            ))}
          </div>
        </motion.div>

        <p
          className="mx-auto mt-10 max-w-3xl rounded-2xl border px-5 py-3 text-center text-sm"
          style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}
        >
          <span className="font-bold">Free trial: </span>
          {FREE_TRIAL.summary}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {plans.map((p, i) => {
            const price = billing === 'yearly' ? p.price.yearly : p.price.monthly;
            return (
              <motion.article
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.08 * i }}
                className={`relative flex flex-col rounded-3xl border p-7 ${p.popular ? 'ring-2 ring-[#E70C65]' : ''}`}
                style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-3 py-1 text-[11px] font-bold text-white">
                    {p.badge}
                  </span>
                )}
                <h2 className="text-lg font-black tracking-wide" style={{ color: 'var(--surface-text)' }}>{p.name}</h2>
                <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{p.tagline}</p>
                <p className="mt-5 text-4xl font-black" style={{ color: 'var(--surface-text)' }}>
                  ₹{price.toLocaleString('en-IN')}
                  <span className="text-sm font-medium" style={{ color: 'var(--surface-text-2)' }}> / {billing === 'yearly' ? 'year' : 'month'} + GST</span>
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--surface-text-2)' }}>{inr(withGst(price))} incl. 18% GST</p>
                {billing === 'yearly' && yearlySaving(p).amount > 0 && (
                  <p className="mt-1 text-xs font-semibold text-green-600">
                    ₹{yearlySaving(p).perMonth.toLocaleString('en-IN')}/month · save {yearlySaving(p).pct}% vs monthly
                  </p>
                )}
                <ul className="mt-6 space-y-2 text-sm flex-1" style={{ color: 'var(--surface-text)' }}>
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
                    p.popular ? 'bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30' : 'border'
                  }`}
                  style={p.popular ? undefined : { borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}
                >
                  Get started <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </motion.article>
            );
          })}
        </div>

        <section className="mt-16 overflow-x-auto rounded-3xl border" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}>
          <h2 className="px-6 pt-6 text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Compare all features</h2>
          <p className="px-6 pt-1 text-xs sm:hidden" style={{ color: 'var(--surface-text-2)' }} aria-hidden="true">
            Swipe sideways to see every plan →
          </p>
          <table className="mt-4 w-full min-w-[560px] text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th className="px-6 py-3 text-left font-semibold" style={{ color: 'var(--surface-text-2)' }}>Feature</th>
                {plans.map((p) => (
                  <th key={p.id} className="px-3 py-3 text-center font-black" style={{ color: 'var(--surface-text)' }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureSections.flatMap((s) =>
                s.features.map((f) => (
                  <tr key={f.key} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td className="px-6 py-3" style={{ color: 'var(--surface-text-2)' }}>{f.label}</td>
                    {plans.map((p) => {
                      const v = p.features[f.key];
                      return (
                        <td key={p.id} className="px-3 py-3 text-center" style={{ color: 'var(--surface-text)' }}>
                          {f.type === 'bool' ? (v ? <Check className="mx-auto h-4 w-4 text-[#E70C65]" aria-label="Included" /> : <XIcon className="mx-auto h-4 w-4 opacity-30" aria-label="Not included" />) : v}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <p className="mt-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>
          Questions about plans or metal NFC cards? <Link to="/contact-us" className="font-semibold text-[#E70C65] hover:underline">Contact us</Link> or read the{' '}
          <Link to="/faqs" className="font-semibold text-[#E70C65] hover:underline">FAQs</Link>.
        </p>
      </main>
      <PublicFooter />
    </div>
  );
}
