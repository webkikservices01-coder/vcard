// /api/admin/cards: every card with its owner, its latest "Get my card" order and delivery.
const express = require('express');
const vCard = require('../../models/vCard');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { sendCsv } = require('../../utils/csv');

const router = express.Router();
const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const fmt = (d) => (d ? new Date(d).toISOString() : '');

const query = z.object({
  ...paging,
  q: search,
  payment: z.enum(['', 'none', 'PENDING_PAYMENT', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED']).optional().default(''),
  delivered: z.enum(['', 'yes', 'no']).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

// One pipeline: card → owner → latest order (pending past 24h shown as EXPIRED) → filters.
function pipeline({ q, payment, delivered, from, to }) {
  const match = {};
  if (from || to) match.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  const stages = [{ $match: match }, { $sort: { createdAt: -1 } }];
  stages.push(
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'owner', pipeline: [{ $project: { name: 1, email: 1, phone: 1, isBlocked: 1, deletedAt: 1 } }] } },
    { $set: { owner: { $first: '$owner' } } }
  );
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    stages.push({ $match: { $or: [{ username: re }, { 'personalInfo.name': re }, { 'personalInfo.company': re }, { 'owner.email': re }, { 'owner.name': re }, { 'owner.phone': re }] } });
  }
  stages.push(
    { $lookup: { from: 'cardorders', localField: '_id', foreignField: 'card', as: 'order', pipeline: [{ $sort: { createdAt: -1 } }, { $limit: 1 }] } },
    { $set: { order: { $first: '$order' } } },
    {
      $set: {
        paymentStatus: {
          $switch: {
            branches: [
              { case: { $eq: [{ $ifNull: ['$order', null] }, null] }, then: 'none' },
              { case: { $and: [{ $eq: ['$order.status', 'PENDING_PAYMENT'] }, { $lte: ['$order.expiresAt', '$$NOW'] }] }, then: 'EXPIRED' },
            ],
            default: '$order.status',
          },
        },
        isDelivered: { $in: [{ $ifNull: ['$order.delivery.status', ''] }, ['SENT', 'DELIVERED', 'READ']] },
      },
    }
  );
  if (payment) stages.push({ $match: { paymentStatus: payment } });
  if (delivered) stages.push({ $match: { isDelivered: delivered === 'yes' } });
  return stages;
}

const view = (c) => ({
  id: String(c._id),
  username: c.username,
  url: `${SITE}/${c.username}`,
  theme: c.theme,
  name: c.personalInfo?.name || '',
  designation: c.personalInfo?.designation || '',
  company: c.personalInfo?.company || '',
  bio: c.personalInfo?.bio || '',
  profilePic: c.personalInfo?.profilePic || '',
  views: c.viewCount || 0,
  scans: c.scanCount || 0,
  owner: c.owner && { id: String(c.owner._id), name: c.owner.name, email: c.owner.email, phone: c.owner.phone, status: c.owner.deletedAt ? 'removed' : c.owner.isBlocked ? 'blocked' : 'active' },
  paymentStatus: c.paymentStatus,
  delivered: !!c.isDelivered,
  deliveryStatus: c.order?.delivery?.status || '',
  deliveredAt: c.order?.delivery?.deliveredAt || null,
  previewImage: c.order?.delivery?.imageUrl || '',
  orderId: c.order ? String(c.order._id) : '',
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

router.get('/', requirePermission('cards.view'), validate({ query }), async (req, res) => {
  const { page, limit } = req.v.query;
  const [out] = await vCard.aggregate([
    ...pipeline(req.v.query),
    { $facet: { rows: [{ $skip: (page - 1) * limit }, { $limit: limit }], total: [{ $count: 'n' }] } },
  ]);
  const total = out.total[0]?.n || 0;
  res.json({ cards: out.rows.map(view), total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.get('/export', requirePermission('export.csv'), validate({ query }), async (req, res) => {
  const rows = (await vCard.aggregate([...pipeline(req.v.query), { $limit: 50000 }])).map(view);
  await audit(req, 'export.cards', { summary: `Exported ${rows.length} cards (CSV)`, meta: { filters: req.v.query } });
  sendCsv(res, 'aicardly-cards', rows, [
    { header: 'Card', value: (c) => c.url },
    { header: 'Name on card', value: (c) => c.name },
    { header: 'Designation', value: (c) => c.designation },
    { header: 'Company', value: (c) => c.company },
    { header: 'Template', value: (c) => c.theme },
    { header: 'Owner', value: (c) => c.owner?.name },
    { header: 'Owner email', value: (c) => c.owner?.email },
    { header: 'Owner phone', value: (c) => c.owner?.phone },
    { header: 'Created', value: (c) => fmt(c.createdAt) },
    { header: 'Payment', value: (c) => c.paymentStatus },
    { header: 'Delivered', value: (c) => (c.delivered ? 'yes' : 'no') },
    { header: 'Delivered at', value: (c) => fmt(c.deliveredAt) },
    { header: 'Views', value: (c) => c.views },
  ]);
});

module.exports = router;
