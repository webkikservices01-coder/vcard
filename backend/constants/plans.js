const PLANS = {
  DIGITAL: 'DIGITAL CARD',
  SMART_AI: 'SMART AI CARD',
  AI_AGENT_PRO: 'AI AGENT PRO',
};

// Smart AI Card + AI Agent Pro: chatbot assistant to fill vCard details
const CHAT_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Smart AI Card + AI Agent Pro: voice assistant to fill vCard details
const VOICE_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

module.exports = { PLANS, CHAT_FILL_PLANS, VOICE_FILL_PLANS };
