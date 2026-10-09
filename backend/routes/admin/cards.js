// /api/admin/cards: every card with its owner, its latest "Get my card" order and delivery.
const express = require('express');
const vCard = require('../../models/vCard');
const { requirePermission, exportReason } = require('../../middleware/admin/auth');
const { validate, z, paging, search, escapeRegex, idParams } = require('../../middleware/admin/validate');
const { forgetAccountStatus } = require('../../utils/accountStatus');
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
  owner: z.enum(['', 'active', 'blocked', 'removed', 'deleted']).optional().default(''),
  visibility: z.enum(['', 'public', 'hidden']).optional().default(''),
  sort: z.enum(['createdAt', 'views', 'username', 'name']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Card links: lowercase letters, numbers and hyphens (same rule as the site's username check).
const VALID_SLUG = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SORT_FIELD = { createdAt: 'createdAt', views: 'viewCount', username: 'username', name: 'personalInfo.name' };

// One pipeline: card → owner → latest order (pending past 24h shown as EXPIRED) → filters.
function pipeline({ q, payment, delivered, from, to, owner, visibility, sort = 'createdAt', order = 'desc' }) {
  const match = {};
  if (from || to) match.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (visibility === 'hidden') match.adminHidden = true;
  const stages = [{ $match: match }, { $sort: { [SORT_FIELD[sort] || 'createdAt']: order === 'asc' ? 1 : -1, _id: -1 } }];
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
  if (owner === 'deleted') stages.push({ $match: { owner: null } });
  else if (owner === 'removed') stages.push({ $match: { 'owner.deletedAt': { $ne: null } } });
  else if (owner === 'blocked') stages.push({ $match: { 'owner.isBlocked': true, 'owner.deletedAt': null } });
  else if (owner === 'active') stages.push({ $match: { owner: { $ne: null }, 'owner.isBlocked': { $ne: true }, 'owner.deletedAt': null } });
  // Public = what visitors can open: not hidden, and the owner exists and isn't removed.
  if (visibility === 'public') stages.push({ $match: { adminHidden: { $ne: true }, owner: { $ne: null }, 'owner.deletedAt': null } });
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
  ownerDeleted: !c.owner,
  hidden: !!c.adminHidden,
  hiddenReason: c.adminHiddenReason || '',
  hiddenAt: c.adminHiddenAt || null,
  // What a visitor sees at the link right now.
  live: !c.adminHidden && !!c.owner && !c.owner.deletedAt,
  validLink: VALID_SLUG.test(String(c.username || '')),
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
  res.json({ cards: out.rows.map(view), total, page, pages: Math.max(1, Math.ceil(total / limit)), orphans: (await orphanIds()).length });
});

// Cards whose owner account no longer exists (deleted before cards were removed with the account).
async function orphanIds() {
  const rows = await vCard.aggregate([
    { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'u', pipeline: [{ $project: { _id: 1 } }] } },
    { $match: { u: { $size: 0 } } },
    { $project: { _id: 1 } },
  ]);
  return rows.map((r) => r._id);
}

// Delete every card left behind by a deleted account, with everything on it (DPDP erasure).
router.post('/cleanup-orphans', requirePermission('users.purge'), validate({ body: z.object({ reason: z.string().trim().min(3, 'please give a reason').max(500) }) }), async (req, res) => {
  const ids = await orphanIds();
  if (!ids.length) return res.json({ msg: 'No cards from deleted accounts. Nothing to clean up.', removed: 0 });
  const { deleteCardsCascade } = require('../../services/admin/users');
  const cards = await vCard.find({ _id: { $in: ids } }).select('username').lean();
  const removed = await deleteCardsCascade(ids);
  await audit(req, 'card.cleanup_orphans', { summary: `Deleted ${ids.length} card(s) of deleted accounts: ${cards.map((c) => c.username).join(', ')}`, meta: { removed, reason: req.v.body.reason } });
  res.json({ msg: `${ids.length} card${ids.length === 1 ? '' : 's'} from deleted accounts removed.`, removed: ids.length });
});

// One card in full: owner, links, content counts, latest order.
router.get('/:id', requirePermission('cards.view'), validate({ params: idParams }), async (req, res) => {
  const mongoose = require('mongoose');
  const [card] = await vCard.aggregate([{ $match: { _id: new mongoose.Types.ObjectId(req.v.params.id) } }, ...pipeline({}).slice(2)]);
  if (!card) return res.status(404).json({ msg: 'Card not found.' });
  const counts = {};
  for (const name of ['Product', 'Portfolio', 'Testimonial', 'Gallery', 'Enquiry']) {
    counts[name] = await require(`../../models/${name}`).countDocuments({ vcardId: card._id });
  }
  const full = await vCard.findById(card._id).select('dynamicLinks').lean();
  res.json({ card: { ...view(card), links: (full?.dynamicLinks || []).map((l) => ({ type: l.fieldType, title: l.title, url: l.url })), counts } });
});

// Hide / show a card (moderation). Hidden cards answer "not found" on the site.
router.post('/:id/visibility', requirePermission('cards.moderate'), validate({ params: idParams, body: z.object({ hidden: z.boolean(), reason: z.string().trim().min(3, 'please give a reason').max(500) }) }), async (req, res) => {
  const { hidden, reason } = req.v.body;
  const card = await vCard.findByIdAndUpdate(req.v.params.id, { $set: { adminHidden: hidden, adminHiddenReason: hidden ? reason : '', adminHiddenAt: hidden ? new Date() : null } }, { returnDocument: 'after' }).select('username userId');
  if (!card) return res.status(404).json({ msg: 'Card not found.' });
  forgetAccountStatus(card.userId);
  await audit(req, hidden ? 'card.hide' : 'card.show', { targetType: 'card', targetId: card._id, summary: `${hidden ? 'Hid' : 'Showed again'} card /${card.username}`, meta: { reason } });
  res.json({ msg: hidden ? `/${card.username} is hidden. Visitors see "not found".` : `/${card.username} is public again.` });
});

// Fix a card link (e.g. an old link with a space in it).
router.post('/:id/link', requirePermission('cards.moderate'), validate({ params: idParams, body: z.object({ username: z.string().trim().toLowerCase().min(3).max(30), reason: z.string().trim().min(3, 'please give a reason').max(500) }) }), async (req, res) => {
  const { username, reason } = req.v.body;
  if (!VALID_SLUG.test(username)) return res.status(400).json({ msg: 'Use only lowercase letters, numbers and hyphens (not at the start or end).' });
  if (await vCard.exists({ username, _id: { $ne: req.v.params.id } })) return res.status(409).json({ msg: 'Another card already uses this link.' });
  const before = await vCard.findById(req.v.params.id).select('username').lean();
  if (!before) return res.status(404).json({ msg: 'Card not found.' });
  await vCard.updateOne({ _id: req.v.params.id }, { $set: { username } });
  await audit(req, 'card.link', { targetType: 'card', targetId: req.v.params.id, summary: `Changed card link /${before.username} to /${username}`, meta: { reason, from: before.username, to: username } });
  res.json({ msg: `Link changed to /${username}. Tell the owner: the old link stops working.` });
});

router.get('/export', requirePermission('export.csv'), exportReason, validate({ query }), async (req, res) => {
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
