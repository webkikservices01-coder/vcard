// Keeps the admin panel's plan records and plan history in step with what the site sells and
// unlocks, so there is one source of truth:
//   - price, billing length and card limit of the website plans come from constants/plans.js
//     (CATALOG + PLAN_LIMITS), which checkout also charges from;
//   - lifetime accounts get a "Lifetime" plan-history row and count as paid everywhere.
const Plan = require('../../models/Plan');
const User = require('../../models/User');
const UserPlan = require('../../models/UserPlan');
const { CATALOG, PLAN_LIMITS, PLANS, LIFETIME_EMAILS, isLifetime } = require('../../constants/plans');
const { recordPlan } = require('../planHistory');

const FREE = ['Free', 'Free Trial'];
const LIFETIME_END = new Date('2099-12-31T00:00:00Z');

// Plan codes that mirror the website price list: '<catalog id>-monthly' / '-yearly'.
const catalogPlans = () =>
  Object.entries(CATALOG).flatMap(([id, p]) => [
    { code: `${id}-yearly`, name: `${p.name} (Yearly)`, tier: p.name, price: p.yearly, durationDays: 365, cardLimit: PLAN_LIMITS[p.name]?.cards || 1 },
    { code: `${id}-monthly`, name: `${p.name} (Monthly)`, tier: p.name, price: p.monthly, durationDays: 30, cardLimit: PLAN_LIMITS[p.name]?.cards || 1 },
  ]);
const CATALOG_CODES = new Set(catalogPlans().map((p) => p.code));
const isCatalogPlan = (code) => CATALOG_CODES.has(String(code || ''));

let lastSync = 0;
async function syncCatalogPlans({ force = false } = {}) {
  if (!force && Date.now() - lastSync < 60 * 1000) return;
  lastSync = Date.now();
  for (const p of catalogPlans()) {
    const { code, ...fields } = p;
    await Plan.updateOne(
      { code },
      { $set: { tier: fields.tier, price: fields.price, durationDays: fields.durationDays, cardLimit: fields.cardLimit }, $setOnInsert: { code, name: fields.name, description: 'From the website price list.' } },
      { upsert: true }
    );
  }
}

// Mongo filter for lifetime accounts (users.lifetime or one of LIFETIME_EMAILS).
const lifetimeFilter = () => ({ $or: [{ lifetime: true }, { email: { $in: [...LIFETIME_EMAILS] } }] });

// The tier an account really has right now (lifetime without a paid plan = AI Agent Pro).
const effectiveTier = (u) => {
  if (isLifetime(u)) return u.plan && !FREE.includes(u.plan) ? u.plan : PLANS.AI_AGENT_PRO;
  return u.plan && !FREE.includes(u.plan) && u.planExpiry && new Date(u.planExpiry) > new Date() ? u.plan : null;
};

// Paid or lifetime accounts, counted by tier.
async function activeByTier() {
  const now = new Date();
  const users = await User.find({ deletedAt: null, $or: [{ plan: { $nin: FREE }, planExpiry: { $gt: now } }, ...lifetimeFilter().$or] })
    .select('plan planExpiry lifetime email')
    .lean();
  const out = {};
  for (const u of users) {
    const t = effectiveTier(u);
    if (t) out[t] = (out[t] || 0) + 1;
  }
  return { byTier: out, total: Object.values(out).reduce((a, b) => a + b, 0) };
}

// A plan-history row for every lifetime account that has none.
async function ensureLifetimeRows() {
  const users = await User.find({ deletedAt: null, ...lifetimeFilter() }).select('plan email lifetime createdAt').lean();
  let added = 0;
  for (const u of users) {
    if (await UserPlan.exists({ user: u._id, status: 'active', endAt: { $gte: LIFETIME_END } })) continue;
    const tier = effectiveTier(u);
    await recordPlan({ userId: u._id, planName: `${tier} (Lifetime)`, tier, source: 'admin_grant', startAt: new Date(), endAt: LIFETIME_END, reason: 'Lifetime account' });
    added++;
  }
  return added;
}

// Lifetime switched off: its history row ends now.
const endLifetimeRow = (userId) =>
  UserPlan.updateMany({ user: userId, status: 'active', endAt: { $gte: LIFETIME_END } }, { $set: { status: 'revoked', revokedAt: new Date(), endAt: new Date() } });

module.exports = { syncCatalogPlans, isCatalogPlan, lifetimeFilter, effectiveTier, activeByTier, ensureLifetimeRows, endLifetimeRow, LIFETIME_END };
