// Admin panel setup, safe to run again: indexes, plans seeded from constants/plans.js CATALOG,
// and plan history (user_plans) backfilled from past payments and running plans.
// Used by scripts/migrateAdmin.js and by the one-time bootstrap (routes/admin/auth.js).
const Admin = require('../../models/Admin');
const AdminSession = require('../../models/AdminSession');
const AdminAuditLog = require('../../models/AdminAuditLog');
const Plan = require('../../models/Plan');
const UserPlan = require('../../models/UserPlan');
const User = require('../../models/User');
const Transaction = require('../../models/Transaction');
const { CATALOG } = require('../../constants/plans');

// Card limits the old admin panel used per plan.
const CARD_LIMITS = { 'DIGITAL CARD': 1, 'SMART AI CARD': 3, 'AI AGENT PRO': 7 }; // = PLAN_LIMITS in constants/plans.js
const DAY = 24 * 60 * 60 * 1000;

async function runAdminSetup() {
  // createIndexes only adds missing indexes; it never drops existing ones.
  for (const M of [Admin, AdminSession, AdminAuditLog, Plan, UserPlan, User]) await M.createIndexes();

  let plansAdded = 0;
  for (const [code, p] of Object.entries(CATALOG)) {
    for (const [suffix, price, days, label] of [['yearly', p.yearly, 365, 'Yearly'], ['monthly', p.monthly, 30, 'Monthly']]) {
      const r = await Plan.updateOne(
        { code: `${code}-${suffix}` },
        { $setOnInsert: { code: `${code}-${suffix}`, name: `${p.name} (${label})`, tier: p.name, price, durationDays: days, cardLimit: CARD_LIMITS[p.name] || 1, description: 'Seeded from the website price list.' } },
        { upsert: true }
      );
      plansAdded += r.upsertedCount || 0;
    }
  }
  const plansTotal = await Plan.countDocuments();

  // Completed plan payments without a history row.
  let fromPayments = 0;
  const txns = await Transaction.find({ status: 'completed' }).sort({ createdAt: 1 }).lean();
  for (const t of txns) {
    if (await UserPlan.exists({ transaction: t._id })) continue;
    const start = new Date(t.updatedAt || t.createdAt);
    await UserPlan.create({
      user: t.userId,
      planName: t.plan,
      tier: t.plan,
      source: 'purchase',
      status: 'replaced',
      startAt: start,
      endAt: new Date(start.getTime() + (t.expireDays || 365) * DAY),
      amount: t.amount,
      transaction: t._id,
      reason: 'Backfilled from payment',
    });
    fromPayments++;
  }

  // The latest row of each user with a running plan becomes the active one; users with a running
  // plan and no rows at all get a backfill row.
  let activated = 0;
  let fromUsers = 0;
  const running = await User.find({ plan: { $ne: 'Free Trial' }, planExpiry: { $gt: new Date() } }).select('plan planExpiry createdAt').lean();
  for (const u of running) {
    if (await UserPlan.exists({ user: u._id, status: 'active' })) continue;
    const last = await UserPlan.findOne({ user: u._id }).sort({ startAt: -1 });
    if (last && last.tier === u.plan) {
      last.status = 'active';
      last.endAt = u.planExpiry;
      await last.save();
      activated++;
    } else {
      await UserPlan.create({ user: u._id, planName: u.plan, tier: u.plan, source: 'backfill', startAt: u.createdAt, endAt: u.planExpiry, reason: 'Plan existed before plan history' });
      fromUsers++;
    }
  }
  return { plansAdded, plansTotal, fromPayments, activated, fromUsers };
}

module.exports = { runAdminSetup };
