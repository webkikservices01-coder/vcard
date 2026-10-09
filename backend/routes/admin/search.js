// /api/admin/search?q= : one box that finds users, cards, plan payments (invoice / Cashfree id),
// card orders and website leads. Each group is shown only to admins who can see that page.
const express = require('express');
const User = require('../../models/User');
const vCard = require('../../models/vCard');
const Transaction = require('../../models/Transaction');
const CardOrder = require('../../models/CardOrder');
const PlatformLead = require('../../models/PlatformLead');
const { validate, z, escapeRegex } = require('../../middleware/admin/validate');
const { can } = require('../../constants/adminPermissions');

const router = express.Router();
const LIMIT = 5;

router.get('/', validate({ query: z.object({ q: z.string().trim().min(2).max(100) }) }), async (req, res) => {
  const { q } = req.v.query;
  const re = new RegExp(escapeRegex(q), 'i');
  const role = req.admin.role;
  const isId = /^[a-f0-9]{24}$/i.test(q);

  const [users, cards, payments, orders, leads] = await Promise.all([
    can(role, 'users.view')
      ? User.find({ $or: [{ name: re }, { email: re }, { phone: re }, ...(isId ? [{ _id: q }] : [])] }).select('name email deletedAt').limit(LIMIT).lean()
      : [],
    can(role, 'cards.view')
      ? vCard.find({ $or: [{ username: re }, { 'personalInfo.name': re }, { 'personalInfo.company': re }] }).select('username personalInfo.name userId').limit(LIMIT).lean()
      : [],
    can(role, 'payments.view')
      ? Transaction.find({ $or: [{ invoiceNumber: re }, { cfOrderId: re }, { cfLinkId: re }, ...(isId ? [{ _id: q }] : [])] }).select('plan amount status invoiceNumber createdAt').limit(LIMIT).lean()
      : [],
    can(role, 'payments.view')
      ? CardOrder.find({ $or: [{ razorpayPaymentId: re }, { paymentLinkId: re }, { email: re }, { phone: re }, ...(isId ? [{ _id: q }] : [])] }).select('email status amount createdAt').limit(LIMIT).lean()
      : [],
    can(role, 'leads.view') ? PlatformLead.find({ $or: [{ name: re }, { email: re }, { phone: re }, { businessName: re }] }).select('name need status').limit(LIMIT).lean() : [],
  ]);

  res.json({
    results: [
      ...users.map((u) => ({ type: 'user', id: String(u._id), title: u.name || u.email, sub: `${u.email}${u.deletedAt ? ' · removed' : ''}`, to: `/users/${u._id}` })),
      ...cards.map((c) => ({ type: 'card', id: String(c._id), title: `/${c.username}`, sub: c.personalInfo?.name || '', to: `/cards?open=${c._id}` })),
      ...payments.map((t) => ({ type: 'payment', id: String(t._id), title: t.invoiceNumber || `Payment ${String(t._id).slice(-6)}`, sub: `${t.plan} · Rs ${t.amount} · ${t.status}`, to: `/payments?tab=plans&open=${t._id}` })),
      ...orders.map((o) => ({ type: 'order', id: String(o._id), title: `Card order ${String(o._id).slice(-6)}`, sub: `${o.email || ''} · ${o.status}`, to: `/payments?tab=cards&q=${encodeURIComponent(o.email || '')}` })),
      ...leads.map((l) => ({ type: 'lead', id: String(l._id), title: l.name, sub: `${l.need || 'Lead'} · ${l.status}`, to: `/leads?q=${encodeURIComponent(l.name)}` })),
    ],
  });
});

module.exports = router;
