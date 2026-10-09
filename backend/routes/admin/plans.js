// /api/admin/plans: plan definitions (create / edit / disable) and who has which plan.
const express = require('express');
const Plan = require('../../models/Plan');
const { TIERS } = require('../../models/Plan');
const User = require('../../models/User');
const UserPlan = require('../../models/UserPlan');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { syncCatalogPlans, isCatalogPlan, activeByTier, ensureLifetimeRows } = require('../../services/admin/planSync');
const { PLAN_LIMITS, GST_RATE } = require('../../constants/plans');

// What each tier includes on the site (shown next to the plans, read-only).
const tierInfo = () =>
  Object.fromEntries(Object.entries(PLAN_LIMITS).map(([tier, l]) => [tier, { cards: l.cards, chats: Number.isFinite(l.chats) ? l.chats : 'unlimited', themes: l.themes, nfcCard: !!l.nfcCard }]));

const router = express.Router();

const planBody = z.object({
  code: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/, 'use 2–40 lowercase letters, digits or dashes'),
  name: z.string().trim().min(2).max(60),
  tier: z.enum(TIERS),
  price: z.coerce.number().min(0).max(1000000),
  durationDays: z.coerce.number().int().min(1).max(3650),
  cardLimit: z.coerce.number().int().min(0).max(1000),
  description: z.string().trim().max(500).optional().default(''),
});

router.get('/', requirePermission('plans.view'), async (req, res) => {
  // Website plans always show the website's price, length and card limit.
  await syncCatalogPlans();
  const [plans, active] = await Promise.all([Plan.find().sort({ isActive: -1, price: 1 }).lean(), activeByTier()]);
  res.json({
    plans: plans.map((p) => ({ ...p, fromWebsite: isCatalogPlan(p.code), gst: Math.round(p.price * GST_RATE * 100) / 100, totalWithGst: Math.round(p.price * (1 + GST_RATE) * 100) / 100 })),
    tiers: TIERS,
    tierInfo: tierInfo(),
    gstRate: GST_RATE,
    activeUsersByTier: active.byTier,
  });
});

router.post('/', requirePermission('plans.manage'), validate({ body: planBody }), async (req, res) => {
  if (await Plan.exists({ code: req.v.body.code })) return res.status(400).json({ msg: 'A plan with this code already exists.' });
  const plan = await Plan.create(req.v.body);
  await audit(req, 'plan.create', { targetType: 'plan', targetId: plan._id, summary: `Created plan ${plan.name}`, meta: req.v.body });
  res.status(201).json({ plan });
});

router.put('/:id', requirePermission('plans.manage'), validate({ params: idParams, body: planBody.omit({ code: true }) }), async (req, res) => {
  const before = await Plan.findById(req.v.params.id).lean();
  if (!before) return res.status(404).json({ msg: 'Plan not found.' });
  // Website plans: price, length, tier and card limit come from the website price list.
  if (isCatalogPlan(before.code)) {
    const b = req.v.body;
    if (b.price !== before.price || b.durationDays !== before.durationDays || b.cardLimit !== before.cardLimit || b.tier !== before.tier) {
      return res.status(400).json({ msg: 'This plan follows the website price list. Its price, length, tier and card limit change only with the website prices (ask the developer). You can edit the name and description.' });
    }
  }
  const plan = await Plan.findByIdAndUpdate(req.v.params.id, { $set: req.v.body }, { returnDocument: 'after' });
  await audit(req, 'plan.update', { targetType: 'plan', targetId: plan._id, summary: `Edited plan ${plan.name}`, meta: { before: { name: before.name, tier: before.tier, price: before.price, durationDays: before.durationDays, cardLimit: before.cardLimit }, after: req.v.body } });
  res.json({ plan });
});

router.post('/:id/:state', requirePermission('plans.manage'), validate({ params: idParams.extend({ state: z.enum(['enable', 'disable']) }), body: z.object({ reason: z.string().trim().max(500).optional().default('') }) }), async (req, res) => {
  const isActive = req.v.params.state === 'enable';
  if (!isActive && req.v.body.reason.length < 3) return res.status(400).json({ msg: 'Please give a reason for disabling this plan.' });
  const plan = await Plan.findByIdAndUpdate(req.v.params.id, { $set: { isActive } }, { returnDocument: 'after' });
  if (!plan) return res.status(404).json({ msg: 'Plan not found.' });
  await audit(req, `plan.${req.v.params.state}`, { targetType: 'plan', targetId: plan._id, summary: `${isActive ? 'Enabled' : 'Disabled'} plan ${plan.name}`, meta: { reason: req.v.body.reason } });
  res.json({ plan });
});

// Who bought / was given which plan, when, until when, and whether it was renewed.
const subsQuery = z.object({
  ...paging,
  q: search,
  state: z.enum(['', 'active', 'expired', 'revoked', 'replaced']).optional().default(''),
  source: z.enum(['', 'purchase', 'admin_grant', 'complimentary', 'backfill']).optional().default(''),
});

router.get('/subscriptions', requirePermission('plans.view'), validate({ query: subsQuery }), async (req, res) => {
  // Lifetime accounts appear here like any other plan.
  await ensureLifetimeRows();
  const { page, limit, q, state, source } = req.v.query;
  const now = new Date();
  const f = {};
  if (state === 'active') Object.assign(f, { status: 'active', endAt: { $gt: now } });
  else if (state === 'expired') Object.assign(f, { status: 'active', endAt: { $lte: now } });
  else if (state) f.status = state;
  if (source) f.source = source;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ name: re }, { email: re }, { phone: re }] }).select('_id').limit(500).lean();
    f.$or = [{ planName: re }, { user: { $in: users.map((u) => u._id) } }];
  }
  const [rows, total] = await Promise.all([
    UserPlan.find(f).sort({ startAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email phone').populate('grantedBy', 'name email').lean(),
    UserPlan.countDocuments(f),
  ]);
  // Renewed = the same user got a later plan row after this one.
  const later = await UserPlan.aggregate([{ $match: { user: { $in: rows.map((r) => r.user?._id).filter(Boolean) } } }, { $group: { _id: '$user', last: { $max: '$startAt' } } }]);
  const lastStart = Object.fromEntries(later.map((l) => [String(l._id), l.last]));
  res.json({
    subscriptions: rows.map((r) => ({
      id: String(r._id),
      user: r.user && { id: String(r.user._id), name: r.user.name, email: r.user.email, phone: r.user.phone },
      planName: r.planName,
      tier: r.tier,
      source: r.source,
      amount: r.amount,
      startAt: r.startAt,
      endAt: r.endAt,
      state: r.status === 'active' ? (new Date(r.endAt) > now ? 'active' : 'expired') : r.status,
      renewed: !!(r.user && lastStart[String(r.user._id)] > r.startAt),
      grantedBy: r.grantedBy && { name: r.grantedBy.name, email: r.grantedBy.email },
      reason: r.reason,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

module.exports = router;
