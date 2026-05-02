import React, { useState } from 'react';
import { Check, X as XIcon, Zap, Bot, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const plans = [
  {
    id: 'digital-id',
    name: 'DIGITAL CARD',
    tagline: 'Perfect for professionals',
    price: { monthly: 99, yearly: 999 },
    icon: <Zap className="w-5 h-5" />,
    popular: false,
    badge: null,
    color: 'gray',
    features: {
      // Digital Card
      vCards: 1,
      themes: 10,
      qrCode: true,
      vcfDownload: true,
      linkTapTracking: true,
      leadCaptureForm: true,
      whatsappButton: true,
      seoIndexing: true,
      darkLightMode: true,
      hideBranding: false,
      // AI Features
      aiChatWidget: false,
      aiPersonaConfig: false,
      animatedAvatar: false,
      linkedinSync: false,
      aiLeadScoring: false,
      // Voice & WhatsApp Agent
      aiVoiceAgent: false,
      whatsappBot: false,
      voiceNoteTranscription: false,
      imageRecognition: false,
      whatsappFlowBuilder: false,
      outboundCalling: false,
      whiteLabelOption: false,
      // Support
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
    color: 'black',
    features: {
      // Digital Card
      vCards: 1,
      themes: 10,
      qrCode: true,
      vcfDownload: true,
      linkTapTracking: true,
      leadCaptureForm: true,
      whatsappButton: true,
      seoIndexing: true,
      darkLightMode: true,
      hideBranding: true,
      // AI Features
      aiChatWidget: true,
      aiPersonaConfig: true,
      animatedAvatar: true,
      linkedinSync: true,
      aiLeadScoring: true,
      // Voice & WhatsApp Agent
      aiVoiceAgent: false,
      whatsappBot: false,
      voiceNoteTranscription: false,
      imageRecognition: false,
      whatsappFlowBuilder: false,
      outboundCalling: false,
      whiteLabelOption: false,
      // Support
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
    color: 'gray',
    features: {
      // Digital Card
      vCards: 3,
      themes: 10,
      qrCode: true,
      vcfDownload: true,
      linkTapTracking: true,
      leadCaptureForm: true,
      whatsappButton: true,
      seoIndexing: true,
      darkLightMode: true,
      hideBranding: true,
      // AI Features
      aiChatWidget: true,
      aiPersonaConfig: true,
      animatedAvatar: true,
      linkedinSync: true,
      aiLeadScoring: true,
      // Voice & WhatsApp Agent
      aiVoiceAgent: true,
      whatsappBot: true,
      voiceNoteTranscription: true,
      imageRecognition: true,
      whatsappFlowBuilder: true,
      outboundCalling: true,
      whiteLabelOption: true,
      // Support
      support: '24/7 Dedicated',
    }
  }
];

const featureSections = [
  {
    label: 'Digital Card',
    features: [
      { key: 'vCards',           label: 'vCards',                        type: 'count' },
      { key: 'themes',           label: 'Card Themes',                   type: 'count' },
      { key: 'qrCode',           label: 'QR Code',                       type: 'bool' },
      { key: 'vcfDownload',      label: 'Add to Phonebook (.vcf)',        type: 'bool' },
      { key: 'linkTapTracking',  label: 'Link Tap Analytics',            type: 'bool' },
      { key: 'leadCaptureForm',  label: 'Lead Capture Form',             type: 'bool' },
      { key: 'whatsappButton',   label: 'WhatsApp Quick Connect',        type: 'bool' },
      { key: 'seoIndexing',      label: 'SEO Indexing',                  type: 'bool' },
      { key: 'darkLightMode',    label: 'Dark / Light Mode',             type: 'bool' },
      { key: 'hideBranding',     label: 'Hide Branding',                 type: 'bool' },
    ]
  },
  {
    label: 'AI Features',
    highlight: true,
    features: [
      { key: 'aiChatWidget',    label: 'AI Chat Widget (RAG + GPT-4o)', type: 'bool' },
      { key: 'aiPersonaConfig', label: 'AI Persona Config (tone, greeting, fallback)', type: 'bool' },
      { key: 'animatedAvatar',  label: 'Animated AI Avatar (D-ID / HeyGen)', type: 'bool' },
      { key: 'linkedinSync',    label: 'LinkedIn & Instagram Auto-Sync', type: 'bool' },
      { key: 'aiLeadScoring',   label: 'AI Lead Scoring (Hot/Warm/Cold)', type: 'bool' },
    ]
  },
  {
    label: 'Voice & WhatsApp AI Agent',
    highlight: true,
    features: [
      { key: 'aiVoiceAgent',          label: 'Inbound AI Voice Agent (Twilio + ElevenLabs)', type: 'bool' },
      { key: 'whatsappBot',           label: 'WhatsApp Business API Bot',                    type: 'bool' },
      { key: 'voiceNoteTranscription',label: 'Voice Note Transcription (Whisper STT)',        type: 'bool' },
      { key: 'imageRecognition',      label: 'Image Recognition (GPT-4o Vision)',            type: 'bool' },
      { key: 'whatsappFlowBuilder',   label: 'Visual WhatsApp Flow Builder',                 type: 'bool' },
      { key: 'outboundCalling',       label: 'Outbound AI Calling Campaigns',                type: 'bool' },
      { key: 'whiteLabelOption',      label: 'White-label Agency Option',                    type: 'bool' },
    ]
  },
  {
    label: 'Support',
    features: [
      { key: 'support', label: 'Support Level', type: 'text' },
    ]
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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions/create-order`, {
        amount, plan: plan.name
      }, { headers: { 'x-auth-token': token } });

      const options = {
        key: res.data.key,
        amount: res.data.amount * 100,
        currency: 'INR',
        name: 'MYcardLINK',
        description: plan.name,
        order_id: res.data.orderId,
        handler: async (response) => {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions/verify`, {
            ...response,
            txnId: res.data.txnId,
            plan: plan.name,
            expireDays: billing === 'yearly' ? 365 : 30
          }, { headers: { 'x-auth-token': token } });
          toast.success('Plan activated successfully!');
          window.location.reload();
        },
        prefill: { name: '', email: '' },
        theme: { color: '#000000' }
      };

      if (window.Razorpay) {
        new window.Razorpay(options).open();
      } else {
        toast.error('Razorpay not loaded. Please add Razorpay script to index.html');
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Payment initialization failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Plans & Pricing</h2>
        <p className="text-sm text-gray-500">From a simple digital card to a full AI-powered sales agent</p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex bg-gray-100 rounded-full p-1">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'monthly' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling('yearly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'yearly' ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Yearly
            <span className="ml-1.5 text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
              SAVE 58%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-shadow hover:shadow-xl ${
                plan.popular ? 'border-black shadow-lg' : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className={`text-xs font-bold text-center py-2 tracking-widest uppercase ${
                  plan.popular ? 'bg-black text-white' : 'bg-gray-900 text-white'
                }`}>
                  {plan.badge}
                </div>
              )}

              <div className="p-6">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-3 ${
                  plan.popular ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                }`}>
                  {plan.icon}
                </div>
                <h3 className="text-sm font-black text-gray-900 tracking-wide mb-0.5">{plan.name}</h3>
                <p className="text-xs text-gray-500 mb-4">{plan.tagline}</p>

                <div className="flex items-baseline space-x-1 mb-0.5">
                  <span className="text-4xl font-black text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-gray-400 mb-5">
                  per {billing === 'yearly' ? 'year' : 'month'} · billed {billing}
                  {billing === 'yearly' && (
                    <span className="ml-1 text-green-600 font-semibold">
                      (₹{plan.price.monthly}/mo value)
                    </span>
                  )}
                </p>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                    plan.popular
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'border-2 border-black text-black hover:bg-black hover:text-white'
                  } disabled:opacity-60`}
                >
                  {loading === plan.id ? 'Processing...' : 'GET STARTED →'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Feature Comparison Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-900">Full Feature Comparison</h3>
        </div>

        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="min-w-[560px]">
            {/* Table Header */}
            <div className="grid grid-cols-4 border-b border-gray-100">
              <div className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Feature</div>
              {plans.map(p => (
                <div key={p.id} className={`px-3 py-3 text-center text-xs font-black tracking-wide ${
                  p.popular ? 'bg-black text-white' : 'text-gray-700'
                }`}>
                  {p.name}
                </div>
              ))}
            </div>

            {featureSections.map((section) => (
              <div key={section.label}>
                {/* Section Header */}
                <div className={`grid grid-cols-4 border-b border-gray-100 ${
                  section.highlight ? 'bg-gray-950' : 'bg-gray-50'
                }`}>
                  <div className={`px-4 py-2.5 col-span-4 text-xs font-bold uppercase tracking-widest ${
                    section.highlight ? 'text-white' : 'text-gray-500'
                  }`}>
                    {section.highlight ? '🤖 ' : ''}{section.label}
                  </div>
                </div>

                {/* Features */}
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
                            <Check className="w-4 h-4 text-black" />
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
      </div>

      {/* Coming Soon Badge */}
      <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-start space-x-4">
        <div className="text-2xl">🤖</div>
        <div>
          <p className="text-sm font-bold mb-0.5">AI Features — Coming Soon</p>
          <p className="text-xs text-gray-400">
            AI Chat Widget, Animated Avatar, Voice Agent & WhatsApp Bot are actively being built.
            Subscribe to Smart AI Card or AI Agent Pro to get early access when they launch.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-500">
          Secure payments powered by <strong>Razorpay</strong>. Cancel anytime.
          For enterprise or agency pricing, <a href="mailto:support@mycardlink.site" className="font-semibold text-black hover:underline">contact us</a>.
        </p>
      </div>
    </div>
  );
};

export default Plans;
