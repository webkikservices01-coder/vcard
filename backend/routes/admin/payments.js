// /api/admin/payments: card orders (Razorpay 24h links) and plan purchases (Cashfree), with
// resend / regenerate link and resend card.
const express = require('express');
const CardOrder = require('../../models/CardOrder');
const Transaction = require('../../models/Transaction');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { orderView } = require('../../services/admin/users');
const cardOrders = require('../../services/cardOrders');
const { audit } = require('../../services/admin/audit');
const { sendCsv } = require('../../utils/csv');

const router = express.Router();
const fmt = (d) => (d ? new Date(d).toISOString() : '');

const ORDER_STATUSES = ['', 'PENDING_PAYMENT', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED'];
const orderQuery = z.object({
  ...paging,
  q: search,
  status: z.enum(ORDER_STATUSES).optional().default(''),
  delivery: z.enum(['', 'NOT_STARTED', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SKIPPED']).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

async function orderFilter({ q, status, delivery, from, to }) {
  const now = new Date();
  const f = {};
  // A pending link past its 24 hours counts as expired even before the job marks it.
  if (status === 'PENDING_PAYMENT') Object.assign(f, { status: 'PENDING_PAYMENT', expiresAt: { $gt: now } });
  else if (status === 'EXPIRED') f.$or = [{ status: 'EXPIRED' }, { status: 'PENDING_PAYMENT', expiresAt: { $lte: now } }];
  else if (status) f.status = status;
  if (delivery) f['delivery.status'] = delivery;
  if (from || to) f.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ name: re }, { email: re }, { phone: re }] }).select('_id').limit(500).lean();
    const or = [{ email: re }, { phone: re }, { razorpayPaymentId: re }, { paymentLinkId: re }, { user: { $in: users.map((u) => u._id) } }];
    if (f.$or) {
      f.$and = [{ $or: f.$or }, { $or: or }];
      delete f.$or;
    } else {
      f.$or = or;
    }
  }
  return f;
}

async function withUsersAndNotes(orders) {
  const notes = await Notification.find({ order: { $in: orders.map((o) => o._id) } }).sort({ createdAt: 1 }).lean();
  return orders.map((o) => {
    const mine = notes.filter((n) => String(n.order) === String(o._id));
    const linkNotes = mine.filter((n) => n.type === 'payment_link');
    return {
      ...orderView(o),
      user: o.user && { id: String(o.user._id), name: o.user.name, email: o.user.email, phone: o.user.phone },
      username: o.card?.username || '',
      linkSent: {
        email: linkNotes.find((n) => n.channel === 'email')?.status || '',
        whatsapp: linkNotes.find((n) => n.channel === 'whatsapp')?.status || '',
        at: linkNotes[0]?.createdAt || null,
      },
      notifications: mine.map((n) => ({ channel: n.channel, type: n.type, status: n.status, error: n.error, at: n.createdAt })),
    };
  });
}

router.get('/card-orders', requirePermission('payments.view'), validate({ query: orderQuery }), async (req, res) => {
  const { page, limit } = req.v.query;
  const filter = await orderFilter(req.v.query);
  const [orders, total] = await Promise.all([
    CardOrder.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('user', 'name email phone').populate('card', 'username').lean(),
    CardOrder.countDocuments(filter),
  ]);
  res.json({ orders: await withUsersAndNotes(orders), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/card-orders/export', requirePermission('export.csv'), validate({ query: orderQuery }), async (req, res) => {
  const orders = await CardOrder.find(await orderFilter(req.v.query)).sort({ createdAt: -1 }).limit(50000).populate('user', 'name email phone').populate('card', 'username').lean();
  const rows = orders.map((o) => ({ ...orderView(o), user: o.user, username: o.card?.username }));
  await audit(req, 'export.payments', { summary: `Exported ${rows.length} card payments (CSV)`, meta: { filters: req.v.query } });
  sendCsv(res, 'aicardly-card-payments', rows, [
    { header: 'Order ID', value: (o) => o.id },
    { header: 'Name', value: (o) => o.user?.name },
    { header: 'Email', value: (o) => o.email },
    { header: 'Phone', value: (o) => o.phone },
    { header: 'Card', value: (o) => o.username },
    { header: 'Amount (INR)', value: (o) => o.amount },
    { header: 'Complimentary', value: (o) => (o.complimentary ? 'yes' : 'no') },
    { header: 'Status', value: (o) => o.status },
    { header: 'Link sent', value: (o) => fmt(o.linkSentAt) },
    { header: 'Link expires', value: (o) => fmt(o.expiresAt) },
    { header: 'Paid at', value: (o) => fmt(o.paidAt) },
    { header: 'Razorpay payment ID', value: (o) => o.razorpayPaymentId },
    { header: 'Delivery', value: (o) => o.delivery?.status },
    { header: 'Delivered at', value: (o) => fmt(o.delivery?.deliveredAt) },
  ]);
});

const orderAction = (handler) => [
  requirePermission('payments.resend'),
  validate({ params: idParams }),
  async (req, res) => {
    try {
      const order = await CardOrder.findById(req.v.params.id);
      if (!order) return res.status(404).json({ msg: 'Order not found.' });
      await handler(req, res, order);
    } catch (err) {
      res.status(err.status || 500).json({ msg: err.status ? err.message : 'Something went wrong.' });
    }
  },
];

const usableUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('The user of this order no longer exists.'), { status: 400 });
  if (user.isBlocked || user.deletedAt) throw Object.assign(new Error('This user is blocked or removed.'), { status: 400 });
  return user;
};

// Same, still valid link again by email + WhatsApp.
router.post('/card-orders/:id/resend-link', ...orderAction(async (req, res, order) => {
  await cardOrders.expireIfDue(order);
  if (order.status !== 'PENDING_PAYMENT') return res.status(400).json({ msg: 'This link is no longer active. Regenerate it instead.' });
  const user = await usableUser(order.user);
  const sent = await cardOrders.sendPaymentLink(order, user);
  await audit(req, 'payment.link.resend', { targetType: 'order', targetId: order._id, summary: `Re-sent payment link to ${order.email}`, meta: { results: sent.map((n) => ({ channel: n.channel, status: n.status })) } });
  res.json({ msg: 'Payment link sent again (email + WhatsApp).', results: sent.map((n) => ({ channel: n.channel, status: n.status, error: n.error })) });
}));

// Fresh 24-hour link after the old one expired (the user's latest order for this card).
router.post('/card-orders/:id/regenerate', ...orderAction(async (req, res, order) => {
  await cardOrders.expireIfDue(order);
  if (order.status === 'PAID') return res.status(400).json({ msg: 'This order is already paid.' });
  if (order.status === 'PENDING_PAYMENT') return res.status(400).json({ msg: 'The link is still valid. Use "Resend link".' });
  const user = await usableUser(order.user);
  const { order: fresh, created } = await cardOrders.getOrCreateOrder(user, { forceNew: true });
  // The user's card was paid through a newer order (e.g. a free credit): nothing to send.
  if (!created) return res.status(400).json({ msg: fresh.status === 'PAID' ? 'This card is already paid through a newer order.' : 'The user already has a valid link. Use "Resend link".' });
  await audit(req, 'payment.link.regenerate', { targetType: 'order', targetId: fresh._id, summary: `New payment link for ${user.email} (replaces ${order._id})`, meta: { previous: String(order._id), complimentary: !!fresh.complimentary } });
  res.json({ msg: fresh.complimentary ? 'The user had a free credit: the card is being delivered.' : 'New 24-hour link created and sent (email + WhatsApp).', order: orderView(fresh.toObject()) });
}));

router.post('/card-orders/:id/resend-card', ...orderAction(async (req, res, order) => {
  if (order.status !== 'PAID') return res.status(400).json({ msg: 'The card is sent only after payment.' });
  const done = await cardOrders.deliverCard(order._id, { manual: true });
  if (!done) return res.status(409).json({ msg: 'A delivery is running right now. Check again in a minute.' });
  await audit(req, 'card.resend', { targetType: 'order', targetId: order._id, summary: `Re-sent card to ${order.phone || order.email}`, meta: { delivery: done.delivery?.status } });
  res.json({ msg: `Card re-sent. WhatsApp: ${done.delivery?.status}.`, order: orderView(done.toObject()) });
}));

// Plan purchases (Cashfree).
const txnQuery = z.object({
  ...paging,
  q: search,
  status: z.enum(['', 'pending', 'completed', 'failed']).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

async function txnFilter({ q, status, from, to }) {
  const f = {};
  if (status) f.status = status;
  if (from || to) f.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ name: re }, { email: re }, { phone: re }] }).select('_id').limit(500).lean();
    f.$or = [{ cfOrderId: re }, { invoiceNumber: re }, { plan: re }, { userId: { $in: users.map((u) => u._id) } }];
  }
  return f;
}

// Only what the admin needs: never the payment session id.
const txnView = (t) => ({
  id: String(t._id),
  user: t.userId && { id: String(t.userId._id), name: t.userId.name, email: t.userId.email },
  plan: t.plan,
  amount: t.amount,
  billingType: t.billingType,
  expireDays: t.expireDays,
  cfOrderId: t.cfOrderId,
  status: t.status,
  invoiceNumber: t.invoiceNumber,
  createdAt: t.createdAt,
});

router.get('/transactions', requirePermission('payments.view'), validate({ query: txnQuery }), async (req, res) => {
  const { page, limit } = req.v.query;
  const filter = await txnFilter(req.v.query);
  const [txns, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name email').lean(),
    Transaction.countDocuments(filter),
  ]);
  res.json({ transactions: txns.map(txnView), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/transactions/export', requirePermission('export.csv'), validate({ query: txnQuery }), async (req, res) => {
  const txns = (await Transaction.find(await txnFilter(req.v.query)).sort({ createdAt: -1 }).limit(50000).populate('userId', 'name email').lean()).map(txnView);
  await audit(req, 'export.payments', { summary: `Exported ${txns.length} plan payments (CSV)`, meta: { filters: req.v.query } });
  sendCsv(res, 'aicardly-plan-payments', txns, [
    { header: 'Date', value: (t) => fmt(t.createdAt) },
    { header: 'Name', value: (t) => t.user?.name },
    { header: 'Email', value: (t) => t.user?.email },
    { header: 'Plan', value: (t) => t.plan },
    { header: 'Billing', value: (t) => t.billingType },
    { header: 'Amount (INR)', value: (t) => t.amount },
    { header: 'Status', value: (t) => t.status },
    { header: 'Cashfree order ID', value: (t) => t.cfOrderId },
    { header: 'Invoice', value: (t) => t.invoiceNumber },
  ]);
});

module.exports = router;
