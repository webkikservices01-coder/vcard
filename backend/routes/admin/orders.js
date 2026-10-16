// /api/admin/orders: metal NFC card orders. New orders come from the /metal-nfc-card order form
// (services/nfcOrders.js) or are added here. The team moves each one along and adds the courier
// and tracking; the customer gets an email when it ships and when it's delivered.
const express = require('express');
const NfcOrder = require('../../models/NfcOrder');
const { STATUSES } = require('../../models/NfcOrder');
const PlatformLead = require('../../models/PlatformLead');
const { requirePermission, exportReason } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { sendCsv } = require('../../utils/csv');
const { createOrder: newOrder, notifyCustomer } = require('../../services/nfcOrders');

const router = express.Router();

const text = (n) => z.string().trim().max(n).optional().default('');
const address = z.object({ line1: text(160), line2: text(160), city: text(80), state: text(80), pincode: z.string().trim().regex(/^(\d{6})?$/, 'must be 6 digits').optional().default('') }).partial().optional();
const orderBody = z.object({
  name: z.string().trim().min(2).max(80),
  phone: text(30),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email().max(200)]).optional().default(''),
  company: text(120),
  cardLink: text(200),
  quantity: z.coerce.number().int().min(1).max(500).optional().default(1),
  design: text(1000),
  address,
  amount: z.coerce.number().min(0).max(10000000).optional().default(0),
  paid: z.boolean().optional().default(false),
  notes: text(2000),
});

const query = z.object({ ...paging, q: search, status: z.enum(['', ...STATUSES]).optional().default('') });
function filter({ q, status }) {
  const f = {};
  if (status) f.status = status;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    f.$or = [{ number: re }, { name: re }, { email: re }, { phone: re }, { company: re }, { trackingNumber: re }, { cardLink: re }];
  }
  return f;
}

router.get('/', requirePermission('orders.view'), validate({ query }), async (req, res) => {
  const { page, limit } = req.v.query;
  const f = filter(req.v.query);
  const [orders, total, counts] = await Promise.all([
    NfcOrder.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    NfcOrder.countDocuments(f),
    NfcOrder.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  res.json({ orders, total, page, pages: Math.max(1, Math.ceil(total / limit)), counts: Object.fromEntries(counts.map((c) => [c._id, c.n])), statuses: STATUSES });
});

router.get('/export', requirePermission('export.csv'), exportReason, validate({ query }), async (req, res) => {
  const rows = await NfcOrder.find(filter(req.v.query)).sort({ createdAt: -1 }).limit(50000).lean();
  await audit(req, 'export.orders', { summary: `Exported ${rows.length} NFC orders (CSV)` });
  sendCsv(res, 'aicardly-nfc-orders', rows, [
    { header: 'Order', value: (o) => o.number },
    { header: 'Date', value: (o) => o.createdAt },
    { header: 'Status', value: (o) => o.status },
    { header: 'Name', value: (o) => o.name },
    { header: 'Phone', value: (o) => o.phone },
    { header: 'Email', value: (o) => o.email },
    { header: 'Company', value: (o) => o.company },
    { header: 'Quantity', value: (o) => o.quantity },
    { header: 'Amount (₹)', value: (o) => o.amount },
    { header: 'Paid', value: (o) => (o.paid ? 'Yes' : 'No') },
    { header: 'Address', value: (o) => [o.address?.line1, o.address?.line2, o.address?.city, o.address?.state, o.address?.pincode].filter(Boolean).join(', ') },
    { header: 'Courier', value: (o) => o.courier },
    { header: 'Tracking', value: (o) => o.trackingNumber },
    { header: 'Expected delivery', value: (o) => o.expectedDelivery },
    { header: 'Delivered', value: (o) => o.deliveredAt },
  ]);
});

router.get('/:id', requirePermission('orders.view'), validate({ params: idParams }), async (req, res) => {
  const order = await NfcOrder.findById(req.v.params.id).lean();
  if (!order) return res.status(404).json({ msg: 'Order not found.' });
  res.json({ order, statuses: STATUSES });
});

// New order by hand (phone / WhatsApp order), or from a "metal card order form" lead.
router.post('/', requirePermission('orders.manage'), validate({ body: orderBody.extend({ leadId: z.string().regex(/^[a-f0-9]{24}$/).optional() }) }), async (req, res) => {
  const { leadId, ...data } = req.v.body;
  if (leadId && (await NfcOrder.exists({ lead: leadId }))) return res.status(400).json({ msg: 'An order already exists for this lead.' });
  const order = await newOrder({ ...data, source: leadId ? 'form' : 'manual', lead: leadId || null }, req.admin.email);
  if (leadId) await PlatformLead.updateOne({ _id: leadId }, { $set: { status: 'contacted' } });
  await audit(req, 'order.create', { targetType: 'order', targetId: order._id, summary: `New NFC order ${order.number} for ${order.name}` });
  res.status(201).json({ order });
});

router.put('/:id', requirePermission('orders.manage'), validate({ params: idParams, body: orderBody.partial() }), async (req, res) => {
  const order = await NfcOrder.findById(req.v.params.id);
  if (!order) return res.status(404).json({ msg: 'Order not found.' });
  const { address: addr, ...rest } = req.v.body;
  Object.assign(order, rest);
  if (addr) order.address = { ...(order.address?.toObject?.() || order.address || {}), ...addr };
  await order.save();
  await audit(req, 'order.update', { targetType: 'order', targetId: order._id, summary: `Edited NFC order ${order.number}`, meta: { fields: Object.keys(req.v.body) } });
  res.json({ order });
});

// Move the order on. Shipped needs a courier and tracking number; the customer can be emailed.
router.post('/:id/status', requirePermission('orders.manage'), validate({
  params: idParams,
  body: z.object({
    status: z.enum(STATUSES),
    note: text(500),
    courier: text(80),
    trackingNumber: text(80),
    trackingUrl: z.union([z.literal(''), z.string().trim().url().max(500)]).optional().default(''),
    expectedDelivery: z.union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]).optional().default(''),
    email: z.boolean().optional().default(true),
  }),
}), async (req, res) => {
  const order = await NfcOrder.findById(req.v.params.id);
  if (!order) return res.status(404).json({ msg: 'Order not found.' });
  const b = req.v.body;
  if (b.status === 'shipped' && !(b.courier || order.courier) && !(b.trackingNumber || order.trackingNumber)) return res.status(400).json({ msg: 'Add the courier and tracking number to mark it shipped.' });
  const before = order.status;
  order.status = b.status;
  if (b.courier) order.courier = b.courier;
  if (b.trackingNumber) order.trackingNumber = b.trackingNumber;
  if (b.trackingUrl) order.trackingUrl = b.trackingUrl;
  if (b.expectedDelivery) order.expectedDelivery = new Date(`${b.expectedDelivery}T12:00:00+05:30`);
  if (b.status === 'delivered') order.deliveredAt = new Date();
  let emailed = false;
  if (b.email && ['shipped', 'delivered'].includes(b.status) && order.email) emailed = await notifyCustomer(order, b.status);
  order.history.push({ status: b.status, note: b.note, by: req.admin.email, emailed });
  await order.save();
  await audit(req, 'order.status', { targetType: 'order', targetId: order._id, summary: `NFC order ${order.number}: ${before} → ${b.status}${emailed ? ' (customer emailed)' : ''}` });
  res.json({ order, emailed });
});

module.exports = router;
