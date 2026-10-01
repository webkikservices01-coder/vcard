const mongoose = require('mongoose');

// Plan history: one row each time a user gets a plan (online purchase, admin grant, backfill).
// users.plan / users.planExpiry stay the source of truth for what the app unlocks right now.
const UserPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    planName: { type: String, required: true }, // what was granted or bought, e.g. "Diwali Offer"
    tier: { type: String, required: true }, // what it unlocks (copied to users.plan)
    source: { type: String, enum: ['purchase', 'admin_grant', 'complimentary', 'backfill'], required: true },
    status: { type: String, enum: ['active', 'revoked', 'replaced'], default: 'active', index: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true, index: true },
    amount: { type: Number, default: 0 }, // rupees paid (0 for grants)
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
    grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
    reason: { type: String, default: '' },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserPlan', UserPlanSchema);
