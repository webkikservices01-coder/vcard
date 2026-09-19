import { plans } from '../../data/plans';
import { COMPANY } from '../PublicFooter';

// Routes where the platform assistant appears — public marketing/legal pages only.
// It stays off /dashboard/* (JarvisWidget lives there), /c/:slug (per-card ChatWidget
// lives there), and /onboarding.
export const ALLOWED_PATHS = [
  '/', '/login', '/register', '/forgot-password',
  '/about-us', '/contact-us', '/faqs',
  '/privacy-policy', '/terms-conditions', '/refund-policy', '/cancellation-policy',
];

export const GREETING_DELAY_MS = 4500;
export const GREETING_SESSION_KEY = 'webcard_platform_chat_greeting_shown';

// Single source of truth for Cardy's opening line — used for BOTH the outside
// greeting bubble and the welcome message inside the opened panel, so they
// read the same instead of two different messages.
export const WELCOME_TEXT = "Hi, I'm Cardy from Webcard.ai 👋 We help you build a digital business card with AI chat, voice, and WhatsApp features built in. How can I help you today?";

export const WHATSAPP_HREF = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hi Webcard.ai team, I'd like to know more about Webcard.ai.")}`;
// Calendly booking page for demo calls. Override with VITE_BOOKING_URL; set it empty to hide the button.
export const BOOKING_HREF = import.meta.env.VITE_BOOKING_URL ?? 'https://calendly.com/webkikservices';
export const PRICING_HREF = '/#pricing';

export const FAQ_CHIPS = [
  'What services does Webcard.ai offer?',
  "What's included in each plan?",
  'How do I create my card?',
  'What does the AI chat widget do?',
  'How much does it cost?',
  'Can I get a demo or talk to your team?',
  '🚀 Help me pick a plan',
];

export const FLOW_TRIGGER_CHIP = '🚀 Help me pick a plan';

// ─── Guided "help me pick a plan" flow ────────────────────────────────────────
export const FLOW_STEPS = [
  {
    key: 'need',
    question: "What do you need most right now?",
    type: 'chips',
    options: [
      'Just a digital business card',
      'AI chat widget for my card',
      'Voice AI agent + WhatsApp bot',
      'Not sure, need advice',
    ],
  },
  {
    key: 'timeline',
    question: 'When would you like to get started?',
    type: 'chips',
    options: ['Today', 'This week', 'Just exploring'],
  },
  {
    key: 'budget',
    question: "What's a comfortable monthly budget?",
    type: 'chips',
    options: ['Under ₹150/mo', '₹150–400/mo', 'I need a custom / enterprise setup'],
  },
];

const planByName = (name) => plans.find(p => p.name === name);

// Returns either { type: 'plan', plan } or { type: 'lead' } (enterprise/custom path).
export const recommendFromAnswers = (answers) => {
  if (answers.budget === 'I need a custom / enterprise setup') {
    return { type: 'lead' };
  }
  if (answers.need === 'Just a digital business card') {
    return { type: 'plan', plan: planByName('DIGITAL CARD') };
  }
  if (answers.need === 'AI chat widget for my card') {
    return { type: 'plan', plan: planByName('SMART AI CARD') };
  }
  if (answers.need === 'Voice AI agent + WhatsApp bot') {
    return { type: 'plan', plan: planByName('AI AGENT PRO') };
  }
  // "Not sure, need advice" — fall back to budget as the signal.
  if (answers.budget === 'Under ₹150/mo') return { type: 'plan', plan: planByName('DIGITAL CARD') };
  if (answers.budget === '₹150–400/mo') return { type: 'plan', plan: planByName('SMART AI CARD') };
  return { type: 'plan', plan: planByName('AI AGENT PRO') };
};

const FEATURE_LABELS = {
  vCards: 'Multiple vCards', themes: 'Card Themes', qrCode: 'QR Code', vcfDownload: 'Add to Phonebook',
  linkTapTracking: 'Link Tap Analytics', leadCaptureForm: 'Lead Capture Form', whatsappButton: 'WhatsApp Quick Connect',
  seoIndexing: 'SEO Indexing', darkLightMode: 'Dark / Light Mode', hideBranding: 'Hide Branding',
  aiChatWidget: 'AI Chat Widget', aiPersonaConfig: 'AI Persona Config', animatedAvatar: 'Animated AI Avatar',
  linkedinSync: 'LinkedIn & Instagram Sync', aiLeadScoring: 'AI Lead Scoring',
  aiVoiceAgent: 'Inbound AI Voice Agent', whatsappBot: 'WhatsApp Business API Bot',
  voiceNoteTranscription: 'Voice Note Transcription', imageRecognition: 'Image Recognition',
  whatsappFlowBuilder: 'Visual WhatsApp Flow Builder', outboundCalling: 'Outbound AI Calling',
  whiteLabelOption: 'White-label Option',
};

const BASELINE = planByName('DIGITAL CARD').features;

// The 3 features that actually justify recommending this plan over the entry
// tier — not just the first 3 booleans in the object, which are always the
// baseline features every plan already has.
export const getKeyHighlights = (plan) => {
  const distinguishing = Object.entries(plan.features)
    .filter(([key, value]) => value === true && !BASELINE[key])
    .map(([key]) => FEATURE_LABELS[key] || key);
  if (distinguishing.length > 0) return distinguishing.slice(0, 3);
  return Object.entries(plan.features)
    .filter(([, value]) => value === true)
    .map(([key]) => FEATURE_LABELS[key] || key)
    .slice(0, 3);
};

export const LEAD_FORM_FIELDS = [
  { key: 'name', label: 'Your name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: false },
  { key: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: false },
  { key: 'message', label: 'Tell us a bit about what you need', type: 'textarea', required: false },
];
