import { Zap, Bot, Phone } from 'lucide-react';

// Single source of truth for plan pricing/features — shared by Plans.jsx (pricing page)
// and AiPersona.jsx (locked-state feature preview) so the two never drift apart.
// Plan prices are before GST; 18% GST is added at checkout (same as BACKEND constants/plans.js).
export const GST_RATE = 0.18;
export const withGst = (n) => Math.round(n * (1 + GST_RATE) * 100) / 100;
export const inr = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

// What paying yearly saves for one plan, vs 12 monthly payments (before GST).
export const yearlySaving = (plan) => {
  const twelve = plan.price.monthly * 12;
  const amount = twelve - plan.price.yearly;
  return { amount, pct: Math.round((amount / twelve) * 100), perMonth: Math.round(plan.price.yearly / 12) };
};

// The free trial (BACKEND services/trial.js TRIAL_HOURS + constants/plans.js FREE_AI_CHATS).
// There is no free plan: after 24 hours the card pauses until a plan is chosen.
export const FREE_TRIAL = {
  hours: 24,
  summary: '24-hour free trial, no credit card: 1 card, 1 theme and 4 AI chatbot answers. After 24 hours your card pauses until you pick a plan.',
};

export const plans = [
  {
    id: 'digital-id',
    name: 'DIGITAL CARD',
    tagline: '1 card with a starter AI chatbot',
    price: { monthly: 99, yearly: 999 },
    // What sets each plan apart, shown on every pricing card (keep in sync with PLAN_LIMITS in
    // BACKEND/constants/plans.js, which enforces the card and chat limits).
    highlights: ['1 digital card', '1 card theme', 'AI chatbot: 10 chats a month', 'QR code, lead form & analytics', 'WhatsApp & call buttons', 'Email support'],
    icon: <Zap className="w-5 h-5" />,
    popular: false,
    badge: null,
    accent: '#111827',
    features: {
      vCards: 1, aiChats: '10 / month', themes: 1, metalNfcCard: false, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: false,
      aiChatWidget: true, aiVoiceCall: false, aiVideoCall: false, aiPersonaConfig: false, animatedAvatar: false, linkedinSync: false, aiLeadScoring: false,
      aiVoiceAgent: false, whatsappBot: false, voiceNoteTranscription: false, imageRecognition: false,
      whatsappFlowBuilder: false, outboundCalling: false, whiteLabelOption: false,
      support: 'Email',
    }
  },
  {
    id: 'smart-ai-card',
    name: 'SMART AI CARD',
    tagline: '3 cards, AI chatbot + AI voice call',
    price: { monthly: 199, yearly: 1999 },
    highlights: ['3 digital cards', '3 card themes', 'AI chatbot: 25 chats a month', 'Live AI voice call on your card', 'AI books meetings & sends WhatsApp details', 'Hide Aicardly branding', 'Priority support'],
    icon: <Bot className="w-5 h-5" />,
    popular: true,
    badge: '★ Most Popular',
    accent: '#6366f1',
    features: {
      vCards: 3, aiChats: '25 / month', themes: 3, metalNfcCard: false, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: true,
      aiChatWidget: true, aiVoiceCall: true, aiVideoCall: false, aiPersonaConfig: true, animatedAvatar: true, linkedinSync: true, aiLeadScoring: true,
      aiVoiceAgent: false, whatsappBot: false, voiceNoteTranscription: false, imageRecognition: false,
      whatsappFlowBuilder: false, outboundCalling: false, whiteLabelOption: false,
      support: 'Priority',
    }
  },
  {
    id: 'ai-agent-pro',
    name: 'AI AGENT PRO',
    tagline: '7 cards + metal NFC card, unlimited AI, voice + video calls',
    highlights: ['7 digital cards', 'Premium metal NFC card included', 'All 10 card themes', 'Unlimited AI chats (renews monthly)', 'Live AI voice + AI video calls', 'AI books meetings & sends WhatsApp details', 'WhatsApp Business bot & AI lead scoring', '24/7 dedicated support'],
    // Keep in sync with BACKEND/constants/plans.js (the server charges from there).
    price: { monthly: 1999, yearly: 9999 },
    icon: <Phone className="w-5 h-5" />,
    popular: false,
    badge: '🤖 AI Powered',
    accent: '#8b5cf6',
    features: {
      vCards: 7, aiChats: 'Unlimited', themes: 10, metalNfcCard: true, qrCode: true, vcfDownload: true, linkTapTracking: true,
      leadCaptureForm: true, whatsappButton: true, seoIndexing: true, darkLightMode: true, hideBranding: true,
      aiChatWidget: true, aiVoiceCall: true, aiVideoCall: true, aiPersonaConfig: true, animatedAvatar: true, linkedinSync: true, aiLeadScoring: true,
      aiVoiceAgent: true, whatsappBot: true, voiceNoteTranscription: true, imageRecognition: true,
      whatsappFlowBuilder: true, outboundCalling: true, whiteLabelOption: true,
      support: '24/7 Dedicated',
    }
  }
];

export const featureSections = [
  {
    label: 'Digital Card',
    features: [
      { key: 'vCards', label: 'Digital cards', type: 'count' },
      { key: 'themes', label: 'Card Themes', type: 'count' },
      { key: 'metalNfcCard', label: 'Premium Metal NFC Card', type: 'bool' },
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
      { key: 'aiChatWidget', label: 'AI Chatbot on your card', type: 'bool' },
      { key: 'aiChats', label: 'AI chats a month', type: 'text' },
      { key: 'aiVoiceCall', label: 'Live AI Voice Call on your card', type: 'bool' },
      { key: 'aiVideoCall', label: 'Live AI Video Call on your card', type: 'bool' },
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
