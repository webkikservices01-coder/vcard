const mongoose = require('mongoose');

// Discount codes for plan checkout (admin panel → Coupons). The discount comes off the plan
// price before GST; GST is then 18% of the discounted price.
const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ['percent', 'flat'], default: 'percent' },
    value: { type: Number, required: true, min: 1 }, // % or ₹
    plans: { type: [String], default: [] }, // plan ids (digital-id, smart-ai-card, ai-agent-pro); empty = every plan
    billing: { type: String, enum: ['any', 'monthly', 'yearly'], default: 'any' },
    maxUses: { type: Number, default: 0 }, // 0 = no limit
    usedCount: { type: Number, default: 0 },
    oncePerUser: { type: Boolean, default: true },
    startsAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true },
    note: { type: String, default: '' }, // for the team, e.g. "Diwali offer"
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', CouponSchema);
