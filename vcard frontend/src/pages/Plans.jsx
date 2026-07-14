import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X as XIcon, Zap, Bot, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { load as loadCashfree } from '@cashfreepayments/cashfree-js';

let cashfreePromise = null;
const getCashfree = () => {
  if (!cashfreePromise) {
    cashfreePromise = loadCashfree({
      mode: import.meta.env.VITE_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
    });
  }
  return cashfreePromise;
};

const plans = [
  {
    id: 'digital-id',
    name: 'DIGITAL CARD',
    tagline: 'Perfect for professionals',
    price: { monthly: 99, yearly: 999 },
    icon: <Zap className="w-5 h-5" />,
    popular: false,
    badge: null,
    accent: '#111827',
    features: {
      vCards: 1, themes: 10, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: false,
      aiChatWidget: false, aiPersonaConfig: false, animatedAvatar: false, linkedinSync: false, aiLeadScoring: false,
      aiVoiceAgent: false, whatsappBot: false, voiceNoteTranscription: false, imageRecognition: false,
      whatsappFlowBuilder: false, outboundCalling: false, whiteLabelOption: false,
      support: 'Email',
    }
  },
  {
    id: 'smart-ai-card',
    name: 'SMART AI CARD',
    tagline: 'AI-powered digital presence',
    price: { monthly: 199, yearly: 1999 },
    icon: <Bot className="w-5 h-5" />,
    popular: true,
    badge: '★ Most Popular',
    accent: '#6366f1',
    features: {
      vCards: 1, themes: 10, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: true,
      aiChatWidget: true, aiPersonaConfig: true, animatedAvatar: true, linkedinSync: true, aiLeadScoring: true,
      aiVoiceAgent: false, whatsappBot: false, voiceNoteTranscription: false, imageRecognition: false,
      whatsappFlowBuilder: false, outboundCalling: false, whiteLabelOption: false,
      support: 'Priority',
    }
  },
  {
    id: 'ai-agent-pro',
    name: 'AI AGENT PRO',
    tagline: 'Full AI sales & support automation',
    price: { monthly: 399, yearly: 3999 },
    icon: <Phone className="w-5 h-5" />,
    popular: false,
    badge: '🤖 AI Powered',
    accent: '#8b5cf6',
    features: {
      vCards: 3, themes: 10, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: true,
      aiChatWidget: true, aiPersonaConfig: true, animatedAvatar: true, linkedinSync: true, aiLeadScoring: true,
      aiVoiceAgent: true, whatsappBot: true, voiceNoteTranscription: true, imageRecognition: true,
      whatsappFlowBuilder: true, outboundCalling: true, whiteLabelOption: true,
      support: '24/7 Dedicated',
    }
  }
];

const featureSections = [
  {
    label: 'Digital Card',
    features: [
      { key: 'vCards', label: 'vCards', type: 'count' },
      { key: 'themes', label: 'Card Themes', type: 'count' },
      { key: 'qrCode', label: 'QR Code', type: 'bool' },
      { key: 'vcfDownload', label: 'Add to Phonebook (.vcf)', type: 'bool' },
      { key: 'linkTapTracking', label: 'Link Tap Analytics', type: 'bool' },
      { key: 'leadCaptureForm', label: 'Lead Capture Form', type: 'bool' },
      { key: 'whatsappButton', label: 'WhatsApp Quick Connect', type: 'bool' },
      { key: 'seoIndexing', label: 'SEO Indexing', type: 'bool' },
      { key: 'darkLightMode', label: 'Dark / Light Mode', type: 'bool' },
      { key: 'hideBranding', label: 'Hide Branding', type: 'bool' },
    ]
  },
  {
    label: 'AI Features',
    highlight: true,
    features: [
      { key: 'aiChatWidget', label: 'AI Chat Widget', type: 'bool' },
      { key: 'aiPersonaConfig', label: 'AI Persona Config (tone, greeting, fallback)', type: 'bool' },
      { key: 'animatedAvatar', label: 'Animated AI Avatar', type: 'bool' },
      { key: 'linkedinSync', label: 'LinkedIn & Instagram Auto-Sync', type: 'bool' },
      { key: 'aiLeadScoring', label: 'AI Lead Scoring (Hot/Warm/Cold)', type: 'bool' },
    ]
  },
  {
    label: 'Voice & WhatsApp AI Agent',
    highlight: true,
    features: [
      { key: 'aiVoiceAgent', label: 'Inbound AI Voice Agent', type: 'bool' },
      { key: 'whatsappBot', label: 'WhatsApp Business API Bot', type: 'bool' },
      { key: 'voiceNoteTranscription', label: 'Voice Note Transcription', type: 'bool' },
      { key: 'imageRecognition', label: 'Image Recognition', type: 'bool' },
      { key: 'whatsappFlowBuilder', label: 'Visual WhatsApp Flow Builder', type: 'bool' },
      { key: 'outboundCalling', label: 'Outbound AI Calling Campaigns', type: 'bool' },
      { key: 'whiteLabelOption', label: 'White-label Agency Option', type: 'bool' },
    ]
  },
  {
    label: 'Support',
    features: [{ key: 'support', label: 'Support Level', type: 'text' }]
  }
];

const Plans = () => {
  const [billing, setBilling] = useState('yearly');
  const [loading, setLoading] = useState(null);

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
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 className="text-xl font-bold text-gray-900">Plans & Pricing</h2>
        <p className="text-sm text-gray-500">From a simple digital card to a full AI-powered sales agent</p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex items-center justify-center"
      >
        <div className="relative inline-flex bg-gray-100 rounded-full p-1">
          <motion.div
            className="absolute inset-y-1 w-1/2 bg-pink-600 rounded-full"
            animate={{ x: billing === 'monthly' ? 0 : '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          />
          <button
            onClick={() => setBilling('monthly')}
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              billing === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              billing === 'yearly' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
              SAVE 58%
            </span>
          </button>
        </div>
      </motion.div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan, i) => {
          const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-shadow hover:shadow-2xl ${
                plan.popular ? 'border-pink-600 shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <motion.div
                  className="absolute -inset-1 rounded-2xl opacity-40 blur-xl -z-10"
                  style={{ background: 'linear-gradient(135deg,#ec4899,#f43f5e)' }}
                  animate={{ opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {plan.badge && (
                <div className={`text-xs font-bold text-center py-2 tracking-widest uppercase ${
                  plan.popular ? 'bg-pink-600 text-white' : 'bg-gray-900 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.08 }}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                    plan.popular ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {plan.icon}
                </motion.div>
                <h3 className="text-sm font-black text-gray-900 tracking-wide mb-0.5">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>

                <div className="flex items-baseline space-x-1 mb-0.5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`${plan.id}-${price}`}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2 }}
                      className="text-4xl font-black text-gray-900"
                    >
                      ₹{price.toLocaleString('en-IN')}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <p className="text-xs text-gray-400 mb-5">
                  per {billing === 'yearly' ? 'year' : 'month'} · billed {billing}
                  {billing === 'yearly' && (
                    <span className="ml-1 text-green-600 font-semibold">
                      (₹{plan.price.monthly}/mo value)
                    </span>
                  )}
                </p>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    plan.popular
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white'
                  } disabled:opacity-60`}
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
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Full Feature Comparison</h3>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-4 border-b border-gray-100">
              <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</div>
              {plans.map(p => (
                <div key={p.id} className={`px-3 py-3 text-center text-xs font-black tracking-wide ${
                  p.popular ? 'bg-pink-600 text-white' : 'text-gray-700'
                }`}>
                  {p.name}
                </div>
              ))}
            </div>

            {featureSections.map((section) => (
              <div key={section.label}>
                <div className={`grid grid-cols-4 border-b border-gray-100 ${
                  section.highlight ? 'bg-gray-950' : 'bg-gray-50'
                }`}>
                  <div className={`px-4 py-2.5 col-span-4 text-xs font-bold uppercase tracking-widest ${
                    section.highlight ? 'text-white' : 'text-gray-500'
                  }`}>
                    {section.highlight ? '🤖 ' : ''}{section.label}
                  </div>
                </div>

                {section.features.map(({ key, label, type }) => (
                  <div key={key} className="grid grid-cols-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <div className="px-4 py-3 text-xs text-gray-600">{label}</div>
                    {plans.map(plan => {
                      const val = plan.features[key];
                      return (
                        <div key={plan.id} className={`px-3 py-3 flex items-center justify-center ${
                          plan.popular ? 'bg-gray-50' : ''
                        }`}>
                          {type === 'count' ? (
                            <span className="text-xs font-bold text-gray-900">{val}</span>
                          ) : type === 'text' ? (
                            <span className="text-xs font-semibold text-gray-700">{val}</span>
                          ) : val ? (
                            <Check className="w-4 h-4 text-pink-600" />
                          ) : (
                            <XIcon className="w-3.5 h-3.5 text-gray-200" />
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
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900 text-white rounded-2xl p-5 flex items-start space-x-4"
      >
        <Sparkles className="w-6 h-6 text-pink-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold mb-0.5">AI Features — Live on Smart AI Card & AI Agent Pro</p>
          <p className="text-xs text-gray-400">
            AI Chat Widget, Voice Agent & WhatsApp Bot come active the moment your plan is upgraded.
          </p>
        </div>
      </motion.div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-center gap-2 text-center">
        <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-500">
          Secure payments powered by <strong>Cashfree</strong>. Cancel anytime.
          For enterprise or agency pricing, <a href="mailto:support@mycardlink.site" className="font-semibold text-pink-600 hover:underline">contact us</a>.
        </p>
      </div>
    </div>
  );
};

export default Plans;
