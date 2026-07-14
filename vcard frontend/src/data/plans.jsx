import { Zap, Bot, Phone } from 'lucide-react';

// Single source of truth for plan pricing/features — shared by Plans.jsx (pricing page)
// and AiPersona.jsx (locked-state feature preview) so the two never drift apart.
export const plans = [
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

export const featureSections = [
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
