const PLANS = {
  DIGITAL: 'DIGITAL CARD',
  SMART_AI: 'SMART AI CARD',
  AI_AGENT_PRO: 'AI AGENT PRO',
};

// What each plan costs. The server charges from this table only; the browser just says which
// plan and billing period it wants, so a changed amount in the request can't buy a plan cheaper.
// Keep in sync with FRONTEND/src/data/plans.jsx (display only).
const CATALOG = {
  'digital-id':    { name: PLANS.DIGITAL,      monthly: 99,  yearly: 999 },
  'smart-ai-card': { name: PLANS.SMART_AI,     monthly: 199, yearly: 1999 },
  // ₹1 for now, to test live payments and invoices end to end (was ₹399 / ₹3,999).
  'ai-agent-pro':  { name: PLANS.AI_AGENT_PRO, monthly: 1999, yearly: 19999 },
};

// Price and duration for a plan + billing period, or null if the combination doesn't exist.
const priceFor = (planId, billing) => {
  const p = CATALOG[planId];
  if (!p) return null;
  if (billing === 'monthly') return { name: p.name, amount: p.monthly, days: 30, billingType: 'Monthly' };
  if (billing === 'yearly') return { name: p.name, amount: p.yearly, days: 365, billingType: 'Yearly' };
  return null;
};

// Chatbot assistant, AI persona and card AI chat
const CHAT_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Voice assistant to fill vCard details
const VOICE_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Set PRICING_ENABLED=true in the environment to enforce plans; otherwise every check passes.
const PRICING_ENABLED = process.env.PRICING_ENABLED === 'true';

// The plan a user has right now: their plan until planExpiry, then 'Free Trial'.
const activePlan = (user) => {
  if (!user) return null;
  if (user.planExpiry && new Date(user.planExpiry) < new Date()) return 'Free Trial';
  return user.plan;
};

// Accepts a user document (expiry-aware) or a plan name.
const planOf = (u) => (u && typeof u === 'object' ? activePlan(u) : u);
const hasChatFill = (u) => !PRICING_ENABLED || CHAT_FILL_PLANS.includes(planOf(u));
const hasVoiceFill = (u) => !PRICING_ENABLED || VOICE_FILL_PLANS.includes(planOf(u));

// The AI chat on public cards (and its settings page) is on for every card, whatever the owner's
// plan. Set CARD_AI_FOR_ALL=false to make it a Smart AI Card / AI Agent Pro feature again.
// (Dashboard tools — Jarvis assistant, AI theme designer — still follow hasChatFill.)
const CARD_AI_FOR_ALL = process.env.CARD_AI_FOR_ALL !== 'false';
const hasCardAi = (u) => CARD_AI_FOR_ALL || hasChatFill(u);

// The AI assistant inside the user's dashboard (Jarvis: chat + voice, fills in the card) is on for
// every user. Set DASHBOARD_AI_FOR_ALL=false to make it Smart AI Card / AI Agent Pro only again.
const DASHBOARD_AI_FOR_ALL = process.env.DASHBOARD_AI_FOR_ALL !== 'false';
const hasDashboardAi = (u) => DASHBOARD_AI_FOR_ALL || hasChatFill(u);

module.exports = { PLANS, CATALOG, priceFor, CHAT_FILL_PLANS, VOICE_FILL_PLANS, PRICING_ENABLED, activePlan, hasChatFill, hasVoiceFill, hasCardAi, hasDashboardAi };
