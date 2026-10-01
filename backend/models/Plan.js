const mongoose = require('mongoose');

// Plans an admin can grant, managed in the admin panel. Seeded from constants/plans.js CATALOG
// by scripts/migrateAdmin.js.
// `tier` is the feature set the plan unlocks. The app's feature checks (AI chat, voice fill, ...)
// work on these three names, so a custom plan ("Diwali Offer") still unlocks a real tier:
// users.plan is set to the tier, and the plan's own name is kept in the user's plan history.
// Online checkout still charges from constants/plans.js CATALOG, because the pricing page is static.
const TIERS = ['DIGITAL CARD', 'SMART AI CARD', 'AI AGENT PRO'];

const PlanSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    tier: { type: String, enum: TIERS, required: true },
    price: { type: Number, default: 0, min: 0 }, // rupees
    durationDays: { type: Number, required: true, min: 1 },
    cardLimit: { type: Number, default: 1, min: 0 },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
module.exports.TIERS = TIERS;
