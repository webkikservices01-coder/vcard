// Coupon codes at plan checkout (models/Coupon.js). The discount comes off the plan price before
// GST, then GST is added on what is left. Used by the plans page / upgrade page (routes/transactions.js).
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');
const { GST_RATE } = require('../constants/plans');

const round2 = (n) => Math.round(n * 100) / 100;

// The price with a coupon, or { error }. price: priceFor(planId, billing).
async function applyCoupon(rawCode, { planId, billing, price, userId }) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) return { price };
  const c = await Coupon.findOne({ code }).lean();
  const now = new Date();
  if (!c || !c.active) return { error: 'This coupon code is not valid.' };
  if (c.startsAt && c.startsAt > now) return { error: 'This coupon is not active yet.' };
  if (c.expiresAt && c.expiresAt < now) return { error: 'This coupon has expired.' };
  if (c.maxUses && c.usedCount >= c.maxUses) return { error: 'This coupon has been fully used.' };
  if (c.plans?.length && !c.plans.includes(planId)) return { error: 'This coupon does not work on this plan.' };
  if (c.billing !== 'any' && c.billing !== billing) return { error: `This coupon works only on ${c.billing} billing.` };
  if (c.oncePerUser && userId && (await Transaction.exists({ userId, couponCode: code, status: 'completed' }))) return { error: 'You have already used this coupon.' };

  const off = c.kind === 'percent' ? round2((price.base * Math.min(100, c.value)) / 100) : Math.min(price.base, c.value);
  const base = round2(Math.max(0, price.base - off));
  if (base < 1) return { error: 'This coupon cannot be used on this plan.' };
  const gst = round2(base * GST_RATE);
  return { coupon: c, price: { ...price, base, gst, amount: round2(base + gst) }, discount: round2(off), code };
}

// After a paid order: count the use (only once per transaction).
async function countUse(txn) {
  if (!txn?.couponCode) return;
  await Coupon.updateOne({ code: txn.couponCode }, { $inc: { usedCount: 1 } });
}

module.exports = { applyCoupon, countUse };
