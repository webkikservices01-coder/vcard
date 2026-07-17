import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';
import { plans, featureSections } from '../data/plans.jsx';

let cashfreePromise = null;
const getCashfree = () => {
  if (!cashfreePromise) {
    cashfreePromise = loadCashfree({
      mode: import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  return cashfreePromise;
};

// Side-by-side feature grid — shared by the always-visible page section and the
// plan-details popup, so differences between plans read the same way in both places.
const FeatureComparisonTable = ({ highlightId }) => (
  <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    <div className="min-w-[560px]">
      <div className="grid grid-cols-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
        <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Feature</div>
        {plans.map(p => (
          <div key={p.id} className={`px-3 py-3 text-center text-xs font-black tracking-wide ${
            p.id === highlightId ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white' : ''
          }`} style={p.id !== highlightId ? { color: 'var(--surface-text)' } : undefined}>
            {p.name}
          </div>
        ))}
      </div>

      {featureSections.map((section) => (
        <div key={section.label}>
          <div className={`grid grid-cols-4 ${section.highlight ? 'bg-gray-950' : ''}`}
            style={{ borderBottom: '1px solid var(--surface-border)', ...(section.highlight ? {} : { background: 'var(--surface-2)' }) }}>
            <div className={`px-4 py-2.5 col-span-4 text-xs font-bold uppercase tracking-widest ${
              section.highlight ? 'text-white' : ''
            }`} style={!section.highlight ? { color: 'var(--surface-text-2)' } : undefined}>
              {section.highlight ? '🤖 ' : ''}{section.label}
            </div>
          </div>

          {section.features.map(({ key, label, type }) => (
            <div key={key} className="grid grid-cols-4 hover:bg-[var(--surface-2)] fast-transition" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="px-4 py-3 text-xs" style={{ color: 'var(--surface-text-2)' }}>{label}</div>
              {plans.map(plan => {
                const val = plan.features[key];
                return (
                  <div key={plan.id} className="px-3 py-3 flex items-center justify-center"
                    style={plan.id === highlightId ? { background: 'color-mix(in srgb, var(--mesh-a) 8%, transparent)' } : undefined}>
                    {type === 'count' ? (
                      <span className="text-xs font-bold" style={{ color: 'var(--surface-text)' }}>{val}</span>
                    ) : type === 'text' ? (
                      <span className="text-xs font-semibold" style={{ color: 'var(--surface-text)' }}>{val}</span>
                    ) : val ? (
                      <Check className="w-4 h-4 text-brand-500" />
                    ) : (
                      <XIcon className="w-3.5 h-3.5" style={{ color: 'var(--surface-text-2)', opacity: 0.35 }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Derived from real plan pricing, not hardcoded — stays accurate if prices in data/plans.jsx change.
const yearlySavingsPct = Math.round(
  (plans.reduce((sum, p) => sum + (1 - p.price.yearly / (p.price.monthly * 12)), 0) / plans.length) * 100
);

const Plans = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [billing, setBilling] = useState('yearly');
  const [loading, setLoading] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const closeTimerRef = useRef(null);

  // Straight from onboarding ("Continue to Pricing")? Open the plan popup immediately
  // instead of making them hover a card — this is the payment step they were sent here for.
  useEffect(() => {
    if (location.state?.justOnboarded) {
      setSelectedPlan(plans.find(p => p.popular) || plans[0]);
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hover-intent: open instantly, but delay closing so the cursor has time to
  // travel from the card to the popup without it disappearing mid-move.
  const openPanel = (plan) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setSelectedPlan(plan);
  };
  const scheduleClosePanel = () => {
    closeTimerRef.current = setTimeout(() => setSelectedPlan(null), 350);
  };
  const cancelClosePanel = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  const handleSubscribe = async (plan) => {
    setLoading(plan.id);
    try {
      const token = localStorage.getItem('token');
      const axios = (await import('axios')).default;
      const amount = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
      const expireDays = billing === 'yearly' ? 365 : 30;

      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions/create-order`, {
        amount, plan: plan.name, expireDays
      }, { headers: { 'x-auth-token': token } });

      const cashfree = await getCashfree();
      const result = await cashfree.checkout({
        paymentSessionId: orderRes.data.paymentSessionId,
        redirectTarget: '_modal',
      });

      if (result.error) {
        toast.error('Payment was not completed');
        return;
      }

      const verifyRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions/verify`, {
        orderId: orderRes.data.orderId
      }, { headers: { 'x-auth-token': token } });

      if (verifyRes.data.status === 'PAID') {
        toast.success('Plan activated successfully!');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast('Payment is processing — your plan will update shortly.', { icon: '⏳' });
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Payment initialization failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ── Hero header ─────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden px-1 py-2">
        <MeshBackground className="opacity-40" />
        <motion.div {...fadeUp(0)} className="relative">
          <h2 className="font-display text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Plans & Pricing</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>From a simple digital card to a full AI-powered sales agent</p>
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative flex items-center justify-center mt-6"
        >
          <div className="relative inline-flex rounded-full p-1 gap-1" style={{ background: 'var(--surface-2)' }}>
            <button
              onClick={() => setBilling('monthly')}
              className="relative px-5 py-2 rounded-full text-sm font-semibold fast-transition"
              style={billing !== 'monthly' ? { color: 'var(--surface-text-2)' } : undefined}
            >
              {billing === 'monthly' && (
                <motion.div
                  layoutId="billing-toggle-pill"
                  className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 ${billing === 'monthly' ? 'text-white' : 'hover:text-brand-500'}`}>
                Monthly
              </span>
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className="relative px-5 py-2 rounded-full text-sm font-semibold fast-transition"
              style={billing !== 'yearly' ? { color: 'var(--surface-text-2)' } : undefined}
            >
              {billing === 'yearly' && (
                <motion.div
                  layoutId="billing-toggle-pill"
                  className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className={`relative z-10 inline-flex items-center ${billing === 'yearly' ? 'text-white' : 'hover:text-brand-500'}`}>
                Yearly
                <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                  SAVE {yearlySavingsPct}%
                </span>
              </span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, i) => {
          const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
          return (
            <GlassCard
              key={plan.id}
              {...fadeUp(0.1 + i * 0.08)}
              hover
              onMouseEnter={() => openPanel(plan)}
              onMouseLeave={scheduleClosePanel}
              onClick={() => openPanel(plan)}
              className={`relative overflow-hidden cursor-pointer ${plan.popular ? 'ring-2 ring-brand-500' : ''} ${selectedPlan?.id === plan.id ? 'ring-2 ring-brand-500' : ''}`}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-40 blur-xl -z-10"
                  style={{ background: 'linear-gradient(135deg,#9f1c44,#e70c65)' }}
                  animate={{ opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {plan.badge && (
                <div className={`text-xs font-bold text-center py-2 tracking-widest uppercase ${
                  plan.popular ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.08 }}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                    plan.popular ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white' : ''
                  }`}
                  style={!plan.popular ? { background: 'var(--surface-2)', color: 'var(--surface-text-2)' } : undefined}
                >
                  {plan.icon}
                </motion.div>
                <h3 className="text-sm font-black tracking-wide mb-0.5" style={{ color: 'var(--surface-text)' }}>{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--surface-text-2)' }}>{plan.tagline}</p>

                <div className="flex items-baseline space-x-1 mb-0.5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.id}-${price}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-black"
                      style={{ color: 'var(--surface-text)' }}
                    >
                      ₹{price.toLocaleString('en-IN')}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="text-xs mb-5" style={{ color: 'var(--surface-text-2)' }}>
                  per {billing === 'yearly' ? 'year' : 'month'} · billed {billing}
                  {billing === 'yearly' && (
                    <span className="ml-1 text-green-600 font-semibold">
                      (₹{plan.price.monthly}/mo value)
                    </span>
                  )}
                </p>

                {plan.popular ? (
                  <GradientButton onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }} disabled={loading === plan.id}>
                    {loading === plan.id && (
                      <motion.span
                        className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                    <span>{loading === plan.id ? 'Processing...' : 'GET STARTED →'}</span>
                  </GradientButton>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => { e.stopPropagation(); handleSubscribe(plan); }}
                    disabled={loading === plan.id}
                    className="w-full py-2.5 rounded-xl font-bold text-sm fast-transition hover:border-brand-500 hover:text-brand-500 disabled:opacity-60"
                    style={{ border: '2px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  >
                    {loading === plan.id ? (
                      <span className="inline-flex items-center gap-2">
                        <motion.span
                          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        />
                        Processing...
                      </span>
                    ) : 'GET STARTED →'}
                  </motion.button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Full Feature Comparison Table */}
      <GlassCard
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-2)' }}>
          <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Full Feature Comparison</h3>
        </div>
        <FeatureComparisonTable highlightId={plans.find(p => p.popular)?.id} />
      </GlassCard>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900 text-white rounded-2xl p-5 flex items-start space-x-4"
      >
        <Sparkles className="w-6 h-6 text-brand-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold mb-0.5">AI Features — Live on Smart AI Card & AI Agent Pro</p>
          <p className="text-xs text-gray-400">
            AI Chat Widget, Voice Agent & WhatsApp Bot come active the moment your plan is upgraded.
          </p>
        </div>
      </motion.div>

      <div className="rounded-xl p-4 flex items-center justify-center gap-2 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
        <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--surface-text-2)' }} />
        <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
          Secure payments powered by <strong>Cashfree</strong>. Cancel anytime.
          For enterprise or agency pricing, <a href="mailto:support@mycardlink.site" className="font-semibold text-brand-500 hover:underline">contact us</a>.
        </p>
      </div>

      {/* Plan details popup — reveals on hover over any plan card, full-screen centered so the
          side-by-side comparison (same table as below) makes the differences between plans obvious */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onMouseEnter={cancelClosePanel}
            onMouseLeave={scheduleClosePanel}
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 30px 80px -20px rgba(0,0,0,0.45)',
              }}
            >
              <div className="p-6 flex items-start justify-between gap-3 sticky top-0 z-10" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-1)' }}>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>Compare plans</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>
                    <strong style={{ color: 'var(--surface-text)' }}>{selectedPlan.name}</strong> is highlighted below — see exactly what's different.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-1.5 rounded-lg hover:bg-brand-500/10 fast-transition shrink-0"
                  style={{ color: 'var(--surface-text-2)' }}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <FeatureComparisonTable highlightId={selectedPlan.id} />

              <div className="p-6 flex flex-wrap items-center justify-between gap-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Ready to go with</p>
                  <p className="text-2xl font-black" style={{ color: 'var(--surface-text)' }}>
                    {selectedPlan.name}
                    <span className="text-sm font-normal ml-2" style={{ color: 'var(--surface-text-2)' }}>
                      ₹{(billing === 'yearly' ? selectedPlan.price.yearly : selectedPlan.price.monthly).toLocaleString('en-IN')} / {billing === 'yearly' ? 'year' : 'month'}
                    </span>
                  </p>
                </div>
                <div className="w-full sm:w-56">
                  <GradientButton
                    onClick={() => { const p = selectedPlan; setSelectedPlan(null); handleSubscribe(p); }}
                    disabled={loading === selectedPlan.id}
                  >
                    {loading === selectedPlan.id && (
                      <motion.span
                        className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      />
                    )}
                    <span>{loading === selectedPlan.id ? 'Processing...' : 'GET STARTED →'}</span>
                  </GradientButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
