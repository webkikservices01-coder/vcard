// Plan history (models/UserPlan.js): one row each time a user gets a plan. users.plan and
// users.planExpiry remain what the app checks; these rows are the record of how they got there.
const UserPlan = require('../models/UserPlan');

// Starts a new history row and marks the user's earlier active rows as replaced.
async function recordPlan({ userId, planName, tier, source, startAt, endAt, amount = 0, transactionId = null, planId = null, adminId = null, reason = '' }) {
  await UserPlan.updateMany({ user: userId, status: 'active' }, { $set: { status: 'replaced' } });
  return UserPlan.create({
    user: userId,
    plan: planId,
    planName,
    tier,
    source,
    startAt,
    endAt,
    amount,
    transaction: transactionId,
    grantedBy: adminId,
    reason,
  });
}

// Keeps the active row in step when an admin extends or shortens the current plan.
const setActiveEnd = (userId, endAt) => UserPlan.updateMany({ user: userId, status: 'active' }, { $set: { endAt } });

async function revokeActive(userId) {
  await UserPlan.updateMany({ user: userId, status: 'active' }, { $set: { status: 'revoked', revokedAt: new Date(), endAt: new Date() } });
}

module.exports = { recordPlan, setActiveEnd, revokeActive };
