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
  'ai-agent-pro':  { name: PLANS.AI_AGENT_PRO, monthly: 1999, yearly: 9999 },
};

// GST is added on top of every plan price (the prices above are before GST).
const GST_RATE = 0.18;
const withGst = (base) => {
  const gst = Math.round(base * GST_RATE * 100) / 100;
  return { base, gst, amount: Math.round((base + gst) * 100) / 100 };
};

// Price and duration for a plan + billing period, or null if the combination doesn't exist.
// amount = what is charged (base + 18% GST).
const priceFor = (planId, billing) => {
  const p = CATALOG[planId];
  if (!p) return null;
  if (billing === 'monthly') return { name: p.name, ...withGst(p.monthly), days: 30, billingType: 'Monthly' };
  if (billing === 'yearly') return { name: p.name, ...withGst(p.yearly), days: 365, billingType: 'Yearly' };
  return null;
};

// Chatbot assistant, AI persona and card AI chat
const CHAT_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Voice assistant to fill vCard details
const VOICE_FILL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];

// Set PRICING_ENABLED=true in the environment to enforce plans; otherwise every check passes.
const PRICING_ENABLED = process.env.PRICING_ENABLED === 'true';

// Accounts whose plan never expires: users.lifetime (admin panel), plus these sign-in emails
// (comma-separated LIFETIME_EMAILS env adds more).
const LIFETIME_EMAILS = new Set(
  ['shubham.khurana6989@gmail.com', 'umandeep22@gmail.com', ...String(process.env.LIFETIME_EMAILS || '').split(',')]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);
const isLifetime = (user) => !!user && (user.lifetime === true || LIFETIME_EMAILS.has(String(user.email || '').toLowerCase()));

// The plan a user has right now: their plan until planExpiry, then 'Free Trial'.
// A lifetime account keeps its plan for good (AI Agent Pro when it has no paid plan).
const activePlan = (user) => {
  if (!user) return null;
  if (isLifetime(user)) return user.plan && user.plan !== 'Free Trial' ? user.plan : PLANS.AI_AGENT_PRO;
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

// Live AI calls on the public card (they cost per minute, so they follow the owner's plan even
// while PRICING_ENABLED is off): Smart AI Card = chat + AI voice call; AI Agent Pro = chat +
// AI voice call + AI video call.
const VOICE_CALL_PLANS = [PLANS.SMART_AI, PLANS.AI_AGENT_PRO];
const VIDEO_CALL_PLANS = [PLANS.AI_AGENT_PRO];
const callFeatures = (u) => {
  const plan = planOf(u);
  return { voice: VOICE_CALL_PLANS.includes(plan), video: VIDEO_CALL_PLANS.includes(plan) };
};

// Free accounts (no paid plan): one card template, and the card's AI chatbot answers only a few
// times as a trial (FREE_AI_CHATS, default 4) until the owner upgrades.
const FREE_THEME = 'webkik-signature';
const FREE_AI_CHATS = Math.max(0, Number(process.env.FREE_AI_CHATS ?? 4));
const PAID_PLANS = Object.values(PLANS);
const isPaid = (u) => isLifetime(u) || PAID_PLANS.includes(planOf(u));
const hasPaidAi = (u) => isLifetime(u) || CHAT_FILL_PLANS.includes(planOf(u));

// What each plan includes. chats = AI chatbot conversations per calendar month on the owner's
// card(s) (Infinity = unlimited); cards = digital cards on the account; themes = how many card
// templates (first N of THEME_ORDER); nfcCard = a premium metal NFC card comes with the plan.
// Keep in sync with FRONTEND/src/data/plans.jsx.
const PLAN_LIMITS = {
  [PLANS.DIGITAL]: { cards: 1, chats: 10, themes: 1, nfcCard: false },
  [PLANS.SMART_AI]: { cards: 3, chats: 25, themes: 3, nfcCard: false },
  [PLANS.AI_AGENT_PRO]: { cards: 7, chats: Infinity, themes: 10, nfcCard: true },
};

// Card templates in unlock order: the free template first, then the ones the 3-theme plan adds.
// Keep the ids in sync with FRONTEND/src/webcard/templates/TemplatePicker.jsx.
const THEME_ORDER = [
  FREE_THEME,
  'aurora-ai',
  'minimal-pro',
  'luxe-noir',
  'split-hero-corporate',
  'neo-brutal',
  'soft-bento-wellness',
  'creator-reel',
  'dev-terminal',
  'editorial-architect',
];
// Templates this user may use right now (free trial: only the free one; lifetime: all).
const allowedThemes = (u) => {
  if (isLifetime(u)) return [...THEME_ORDER];
  const n = PLAN_LIMITS[planOf(u)]?.themes || 1;
  return THEME_ORDER.slice(0, n);
};
// Limits for this user's plan right now, or null on the free trial (FREE_AI_CHATS applies).
const limitsFor = (u) => {
  // Lifetime accounts get AI Agent Pro's limits.
  if (isLifetime(u)) return { ...PLAN_LIMITS[PLANS.AI_AGENT_PRO], cards: Math.max(PLAN_LIMITS[PLANS.AI_AGENT_PRO].cards, u?.cardLimit || 0) };
  const l = PLAN_LIMITS[planOf(u)];
  return l ? { ...l, cards: Math.max(l.cards, u?.cardLimit || 0) } : null;
};
// Start of this month in India time (chat quotas reset on the 1st).
const monthStartIST = () => {
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1) - 5.5 * 3600 * 1000);
};

module.exports = { PLAN_LIMITS, THEME_ORDER, allowedThemes, limitsFor, monthStartIST, GST_RATE, withGst, FREE_THEME, FREE_AI_CHATS, isPaid, hasPaidAi, PLANS, CATALOG, priceFor, CHAT_FILL_PLANS, VOICE_FILL_PLANS, PRICING_ENABLED, activePlan, isLifetime, hasChatFill, hasVoiceFill, hasCardAi, hasDashboardAi, callFeatures };
