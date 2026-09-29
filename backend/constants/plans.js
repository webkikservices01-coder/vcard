const PLANS = {
  DIGITAL: 'DIGITAL CARD',
  SMART_AI: 'SMART AI CARD',
  AI_AGENT_PRO: 'AI AGENT PRO',
};

// Smart AI Card + AI Agent Pro: chatbot assistant to fill vCard details
const CHAT_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Smart AI Card + AI Agent Pro: voice assistant to fill vCard details
const VOICE_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Pricing is switched off for now: plan checks pass for everyone.
// Set PRICING_ENABLED=true in the environment to enforce plans again.
const PRICING_ENABLED = process.env.PRICING_ENABLED === 'true';
const hasChatFill = (plan) => !PRICING_ENABLED || CHAT_FILL_PLANS.includes(plan);
const hasVoiceFill = (plan) => !PRICING_ENABLED || VOICE_FILL_PLANS.includes(plan);

module.exports = { PLANS, CHAT_FILL_PLANS, VOICE_FILL_PLANS, PRICING_ENABLED, hasChatFill, hasVoiceFill };
