// /api/admin/payments: card orders (Razorpay 24h links) and plan purchases (Cashfree), with
// resend / regenerate link and resend card.
const express = require('express');
const CardOrder = require('../../models/CardOrder');
const Transaction = require('../../models/Transaction');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const { requirePermission, exportReason } = require('../../middleware/admin/auth');
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

router.get('/card-orders/export', requirePermission('export.csv'), exportReason, validate({ query: orderQuery }), async (req, res) => {
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
  status: z.enum(['', 'pending', 'abandoned', 'completed', 'failed', 'refunded']).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// A checkout nobody finished within a day is "abandoned" (shown only; the record stays pending so
// a late payment from Cashfree still activates the plan).
const ABANDON_MS = 24 * 60 * 60 * 1000;
const abandonedBefore = () => new Date(Date.now() - ABANDON_MS);

async function txnFilter({ q, status, from, to }) {
  const f = {};
  if (status === 'pending') Object.assign(f, { status: 'pending', createdAt: { $gt: abandonedBefore() } });
  else if (status === 'abandoned') Object.assign(f, { status: 'pending', createdAt: { $lte: abandonedBefore() } });
  else if (status === 'refunded') f['refund.status'] = { $in: ['pending', 'processed', 'manual'] };
  else if (status) f.status = status;
  if (from || to) f.createdAt = { ...(f.createdAt || {}), ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ name: re }, { email: re }, { phone: re }] }).select('_id').limit(500).lean();
    f.$or = [{ cfOrderId: re }, { invoiceNumber: re }, { plan: re }, { userId: { $in: users.map((u) => u._id) } }];
  }
  return f;
}

const { makeInvoiceNumber } = require('../../services/payments');
const { GST_RATE } = require('../../constants/plans');
const round2 = (n) => Math.round(n * 100) / 100;
// Billing period that doesn't match the days bought (e.g. "Yearly" for 30 days).
const periodMismatch = (t) => (t.billingType === 'Yearly' && (t.expireDays || 365) < 360) || (t.billingType === 'Monthly' && (t.expireDays || 30) > 31);

// Only what the admin needs: never the payment session id.
// Base / GST / total: payments since GST was added store them apart; for older ones the split is
// worked out from the total (GST included) and marked as estimated.
const txnView = (t) => {
  const stored = t.base != null;
  const base = stored ? t.base : round2(t.amount / (1 + GST_RATE));
  const gst = stored ? t.gst || 0 : round2(t.amount - base);
  const shownStatus = t.status === 'pending' && new Date(t.createdAt) <= abandonedBefore() ? 'abandoned' : t.status;
  return {
    id: String(t._id),
    user: t.userId && { id: String(t.userId._id), name: t.userId.name, email: t.userId.email },
    plan: t.plan,
    base,
    gst,
    amount: t.amount,
    gstEstimated: !stored,
    billingType: t.billingType,
    expireDays: t.expireDays,
    periodMismatch: periodMismatch(t),
    test: t.amount > 0 && t.amount <= 5,
    cfOrderId: t.cfOrderId,
    cfLinkId: t.cfLinkId || '',
    source: t.source || '',
    status: shownStatus,
    invoiceNumber: t.invoiceNumber || (t.status === 'completed' ? makeInvoiceNumber(t) : ''),
    refund: t.refund?.status ? { status: t.refund.status, amount: t.refund.amount, at: t.refund.at, reason: t.refund.reason, error: t.refund.error, planEnded: !!t.refund.planEnded } : null,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

// Completed payments from before invoice numbers were saved get theirs now (same format).
async function fillInvoiceNumbers(txns) {
  const missing = txns.filter((t) => t.status === 'completed' && !t.invoiceNumber);
  for (const t of missing) {
    t.invoiceNumber = makeInvoiceNumber(t);
    await Transaction.updateOne({ _id: t._id, invoiceNumber: { $in: ['', null] } }, { $set: { invoiceNumber: t.invoiceNumber } });
  }
}

router.get('/transactions', requirePermission('payments.view'), validate({ query: txnQuery }), async (req, res) => {
  const { page, limit } = req.v.query;
  const filter = await txnFilter(req.v.query);
  const [txns, total] = await Promise.all([
    Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name email').lean(),
    Transaction.countDocuments(filter),
  ]);
  await fillInvoiceNumbers(txns);
  res.json({ transactions: txns.map(txnView), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/transactions/export', requirePermission('export.csv'), exportReason, validate({ query: txnQuery }), async (req, res) => {
  const txns = (await Transaction.find(await txnFilter(req.v.query)).sort({ createdAt: -1 }).limit(50000).populate('userId', 'name email').lean()).map(txnView);
  await audit(req, 'export.payments', { summary: `Exported ${txns.length} plan payments (CSV)`, meta: { filters: req.v.query } });
  sendCsv(res, 'aicardly-plan-payments', txns, [
    { header: 'Date', value: (t) => fmt(t.createdAt) },
    { header: 'Name', value: (t) => t.user?.name },
    { header: 'Email', value: (t) => t.user?.email },
    { header: 'Plan', value: (t) => t.plan },
    { header: 'Billing', value: (t) => t.billingType },
    { header: 'Days', value: (t) => t.expireDays },
    { header: 'Price before GST (INR)', value: (t) => t.base },
    { header: 'GST (INR)', value: (t) => t.gst },
    { header: 'Total (INR)', value: (t) => t.amount },
    { header: 'GST split estimated', value: (t) => (t.gstEstimated ? 'yes' : 'no') },
    { header: 'Status', value: (t) => t.status },
    { header: 'Refund', value: (t) => (t.refund ? `${t.refund.status} ${t.refund.amount}` : '') },
    { header: 'Cashfree order ID', value: (t) => t.cfOrderId },
    { header: 'Invoice', value: (t) => t.invoiceNumber },
  ]);
});

const txnAction = (permission, schema, handler) => [
  requirePermission(permission),
  validate({ params: idParams, ...(schema && { body: schema }) }),
  async (req, res) => {
    try {
      const txn = await Transaction.findById(req.v.params.id);
      if (!txn) return res.status(404).json({ msg: 'Payment not found.' });
      await handler(req, res, txn);
    } catch (err) {
      res.status(err.status && err.status < 500 ? err.status : 500).json({ msg: err.status && err.status < 500 ? err.message : 'Something went wrong.' });
    }
  },
];

// One payment in full (detail drawer).
router.get('/transactions/:id', ...txnAction('payments.view', null, async (req, res, txn) => {
  await fillInvoiceNumbers([txn]);
  const user = await User.findById(txn.userId).select('name email phone').lean();
  res.json({ transaction: { ...txnView({ ...txn.toObject(), userId: user && { ...user } }), userMissing: !user } });
}));

// Invoice PDF of a completed payment (same PDF the customer downloads).
router.get('/transactions/:id/invoice', ...txnAction('payments.view', null, async (req, res, txn) => {
  if (txn.status !== 'completed') return res.status(400).json({ msg: 'Invoices exist only for completed payments.' });
  await fillInvoiceNumbers([txn]);
  if (txn.refrensPdfUrl) return res.redirect(txn.refrensPdfUrl);
  const { generateInvoice } = require('../../utils/generateInvoice');
  const user = await User.findById(txn.userId).select('name email phone').lean();
  await audit(req, 'payment.invoice', { targetType: 'transaction', targetId: txn._id, summary: `Downloaded invoice ${txn.invoiceNumber}` });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${txn.invoiceNumber || txn._id}.pdf"`);
  generateInvoice(txn, user, res);
}));

// Ask Cashfree what happened to a pending checkout; activates the plan if it was paid.
router.post('/transactions/:id/check', ...txnAction('payments.resend', null, async (req, res, txn) => {
  if (txn.status !== 'pending') return res.json({ msg: `This payment is already ${txn.status}.` });
  const cashfree = require('../../services/cashfree');
  if (!cashfree.isCashfreeConfigured()) return res.status(400).json({ msg: 'Cashfree is not set up on the server.' });
  let state;
  try {
    if (txn.cfOrderId) state = (await cashfree.getOrder(txn.cfOrderId)).order_status;
    else if (txn.cfLinkId) state = (await cashfree.getLink(txn.cfLinkId)).link_status;
    else return res.json({ msg: 'This checkout never reached Cashfree (no order id). It will stay as abandoned.' });
  } catch (err) {
    return res.status(502).json({ msg: `Cashfree: ${err.message}` });
  }
  if (state === 'PAID') {
    const { markCompleted } = require('../../services/payments');
    await markCompleted(txn);
    await audit(req, 'payment.reconcile', { targetType: 'transaction', targetId: txn._id, summary: `Cashfree says paid: activated ${txn.plan}`, meta: { state } });
    return res.json({ msg: 'Cashfree says it was paid. The plan is now active.' });
  }
  if (['EXPIRED', 'TERMINATED', 'CANCELLED'].includes(state)) {
    txn.status = 'failed';
    await txn.save();
  }
  await audit(req, 'payment.reconcile', { targetType: 'transaction', targetId: txn._id, summary: `Cashfree status: ${state}`, meta: { state } });
  res.json({ msg: `Cashfree status: ${String(state || 'unknown').toLowerCase()}.${txn.status === 'failed' ? ' Marked as failed.' : ''}` });
}));

// Refund a completed payment (super admin / admin). Checkout orders are refunded through
// Cashfree; payment-link payments must be refunded in the Cashfree dashboard and are recorded here.
router.post('/transactions/:id/refund', ...txnAction('payments.refund', z.object({
  amount: z.coerce.number().positive().optional(),
  reason: z.string().trim().min(5, 'please give a reason').max(300),
  endPlan: z.boolean().default(true),
  manual: z.boolean().default(false),
}), async (req, res, txn) => {
  if (txn.status !== 'completed') return res.status(400).json({ msg: 'Only completed payments can be refunded.' });
  if (['pending', 'processed', 'manual'].includes(txn.refund?.status)) return res.status(400).json({ msg: 'This payment is already refunded.' });
  const amount = round2(Math.min(req.v.body.amount || txn.amount, txn.amount));
  const { reason, endPlan, manual } = req.v.body;
  const refundId = `rf_${String(txn._id).slice(-10)}_${Date.now().toString(36)}`;
  let status = 'manual';
  let error = '';
  if (!manual) {
    if (!txn.cfOrderId) return res.status(400).json({ msg: 'This was paid through a payment link: refund it in the Cashfree dashboard, then record it here with "Already refunded in Cashfree".' });
    const cashfree = require('../../services/cashfree');
    try {
      const r = await cashfree.createRefund({ orderId: txn.cfOrderId, refundId, amount, note: reason });
      status = r.refund_status === 'SUCCESS' ? 'processed' : 'pending';
    } catch (err) {
      txn.refund = { status: 'failed', amount, id: refundId, reason, error: err.message, at: new Date() };
      await txn.save();
      await audit(req, 'payment.refund', { targetType: 'transaction', targetId: txn._id, summary: `Refund of Rs ${amount} FAILED: ${err.message}`, success: false, meta: { reason } });
      return res.status(502).json({ msg: `Cashfree refused the refund: ${err.message}` });
    }
  }
  txn.refund = { status, amount, id: manual ? '' : refundId, reason, error, at: new Date(), planEnded: endPlan };
  await txn.save();
  if (endPlan) {
    const { revokeActive } = require('../../services/planHistory');
    const u = await User.findById(txn.userId);
    if (u && u.plan === txn.plan) {
      u.plan = 'Free';
      u.planExpiry = null;
      await u.save();
      await revokeActive(u._id);
    }
  }
  await audit(req, 'payment.refund', { targetType: 'transaction', targetId: txn._id, summary: `Refunded Rs ${amount} of ${txn.invoiceNumber || txn._id} (${status})${endPlan ? ', plan ended' : ''}`, meta: { reason, refundId, manual } });
  res.json({ msg: status === 'manual' ? `Refund of Rs ${amount} recorded.` : `Refund of Rs ${amount} sent to Cashfree (${status}). It reaches the customer in 5-7 working days.` });
}));

module.exports = router;
