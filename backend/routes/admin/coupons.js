// /api/admin/coupons: discount codes for plan checkout (services/coupons.js applies them).
const express = require('express');
const Coupon = require('../../models/Coupon');
const Transaction = require('../../models/Transaction');
const { CATALOG } = require('../../constants/plans');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');

const router = express.Router();
const PLAN_IDS = Object.keys(CATALOG);
const date = z.union([z.literal(''), z.null(), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional();
const toDate = (v, end) => (v ? new Date(`${v}T${end ? '23:59:59' : '00:00:00'}+05:30`) : null);

const body = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,30}$/, 'use 3–30 letters, numbers, - or _'),
  kind: z.enum(['percent', 'flat']),
  value: z.coerce.number().positive().max(100000),
  plans: z.array(z.enum(PLAN_IDS)).max(10).optional().default([]),
  billing: z.enum(['any', 'monthly', 'yearly']).optional().default('any'),
  maxUses: z.coerce.number().int().min(0).max(1000000).optional().default(0),
  oncePerUser: z.boolean().optional().default(true),
  startsAt: date,
  expiresAt: date,
  active: z.boolean().optional().default(true),
  note: z.string().trim().max(200).optional().default(''),
});

const shape = (b) => ({ ...b, startsAt: toDate(b.startsAt), expiresAt: toDate(b.expiresAt, true) });

router.get('/', requirePermission('coupons.view'), async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).limit(500).lean();
  // Paid orders and the money taken with each code.
  const used = await Transaction.aggregate([{ $match: { couponCode: { $ne: '' }, status: 'completed' } }, { $group: { _id: '$couponCode', orders: { $sum: 1 }, revenue: { $sum: '$amount' }, discount: { $sum: '$discount' } } }]);
  const by = Object.fromEntries(used.map((u) => [u._id, u]));
  res.json({
    coupons: coupons.map((c) => ({ ...c, orders: by[c.code]?.orders || 0, revenue: by[c.code]?.revenue || 0, discountGiven: by[c.code]?.discount || 0 })),
    plans: PLAN_IDS.map((id) => ({ id, name: CATALOG[id].name })),
  });
});

router.post('/', requirePermission('coupons.manage'), validate({ body }), async (req, res) => {
  const b = req.v.body;
  if (b.kind === 'percent' && b.value > 100) return res.status(400).json({ msg: 'A percentage can be at most 100.' });
  if (await Coupon.exists({ code: b.code })) return res.status(400).json({ msg: 'A coupon with this code already exists.' });
  const coupon = await Coupon.create({ ...shape(b), createdBy: req.admin.email });
  await audit(req, 'coupon.create', { targetType: 'coupon', targetId: coupon._id, summary: `Coupon ${coupon.code}: ${coupon.kind === 'percent' ? `${coupon.value}%` : `₹${coupon.value}`} off` });
  res.status(201).json({ coupon });
});

router.put('/:id', requirePermission('coupons.manage'), validate({ params: idParams, body }), async (req, res) => {
  const coupon = await Coupon.findById(req.v.params.id);
  if (!coupon) return res.status(404).json({ msg: 'Coupon not found.' });
  const b = req.v.body;
  if (b.kind === 'percent' && b.value > 100) return res.status(400).json({ msg: 'A percentage can be at most 100.' });
  if (b.code !== coupon.code && (await Coupon.exists({ code: b.code }))) return res.status(400).json({ msg: 'A coupon with this code already exists.' });
  Object.assign(coupon, shape(b));
  await coupon.save();
  await audit(req, 'coupon.update', { targetType: 'coupon', targetId: coupon._id, summary: `Edited coupon ${coupon.code}${coupon.active ? '' : ' (switched off)'}` });
  res.json({ coupon });
});

router.delete('/:id', requirePermission('coupons.manage'), validate({ params: idParams }), async (req, res) => {
  const coupon = await Coupon.findById(req.v.params.id);
  if (!coupon) return res.status(404).json({ msg: 'Coupon not found.' });
  // Used codes are switched off (kept for the invoices that mention them); unused ones are deleted.
  if (coupon.usedCount > 0) {
    coupon.active = false;
    await coupon.save();
  } else await coupon.deleteOne();
  await audit(req, 'coupon.delete', { targetType: 'coupon', targetId: coupon._id, summary: `${coupon.usedCount > 0 ? 'Switched off' : 'Deleted'} coupon ${coupon.code}` });
  res.json({ ok: true, kept: coupon.usedCount > 0 });
});

module.exports = router;
