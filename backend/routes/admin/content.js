// /api/admin/content: customer stories on aicardly.com (SiteTestimonial) and the reviews on
// customers' cards (Testimonial), which the team can remove when they're unsuitable.
const express = require('express');
const SiteTestimonial = require('../../models/SiteTestimonial');
const Testimonial = require('../../models/Testimonial');
const vCard = require('../../models/vCard');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');

const router = express.Router();
const url = z.union([z.literal(''), z.string().trim().url().max(500)]).optional().default('');
const story = z.object({
  name: z.string().trim().min(2).max(80),
  role: z.string().trim().max(80).optional().default(''),
  company: z.string().trim().max(120).optional().default(''),
  quote: z.string().trim().min(10).max(600),
  rating: z.coerce.number().int().min(1).max(5).optional().default(5),
  photo: url,
  cardLink: z.string().trim().max(120).regex(/^(\/[a-z0-9._-]+)?$/i, 'like /their-card').optional().default(''),
  consent: z.boolean(),
  published: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).max(1000).optional().default(0),
});

router.get('/testimonials', requirePermission('content.view'), async (req, res) => {
  res.json({ testimonials: await SiteTestimonial.find().sort({ order: 1, createdAt: -1 }).lean() });
});

router.post('/testimonials', requirePermission('content.manage'), validate({ body: story }), async (req, res) => {
  const b = req.v.body;
  if (b.published && !b.consent) return res.status(400).json({ msg: 'Tick "The customer agreed to be shown" before publishing.' });
  const t = await SiteTestimonial.create(b);
  await audit(req, 'content.testimonial.create', { targetType: 'testimonial', targetId: t._id, summary: `Story from ${t.name}${t.published ? ' (published)' : ''}` });
  res.status(201).json({ testimonial: t });
});

router.put('/testimonials/:id', requirePermission('content.manage'), validate({ params: idParams, body: story }), async (req, res) => {
  const t = await SiteTestimonial.findById(req.v.params.id);
  if (!t) return res.status(404).json({ msg: 'Not found.' });
  const b = req.v.body;
  if (b.published && !b.consent) return res.status(400).json({ msg: 'Tick "The customer agreed to be shown" before publishing.' });
  Object.assign(t, b);
  await t.save();
  await audit(req, 'content.testimonial.update', { targetType: 'testimonial', targetId: t._id, summary: `Story from ${t.name}: ${t.published ? 'published' : 'not shown'}` });
  res.json({ testimonial: t });
});

router.delete('/testimonials/:id', requirePermission('content.manage'), validate({ params: idParams }), async (req, res) => {
  const t = await SiteTestimonial.findByIdAndDelete(req.v.params.id);
  if (!t) return res.status(404).json({ msg: 'Not found.' });
  await audit(req, 'content.testimonial.delete', { targetType: 'testimonial', targetId: t._id, summary: `Deleted the story from ${t.name}` });
  res.json({ ok: true });
});

// Reviews on customers' cards, newest first, searchable by card or text.
router.get('/reviews', requirePermission('content.view'), validate({ query: z.object({ ...paging, q: search }) }), async (req, res) => {
  const { page, limit, q } = req.v.query;
  const f = {};
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const cards = await vCard.find({ $or: [{ username: re }, { 'personalInfo.name': re }] }).select('_id').limit(500).lean();
    f.$or = [{ name: re }, { review: re }, { vcardId: { $in: cards.map((c) => c._id) } }];
  }
  const [rows, total] = await Promise.all([
    Testimonial.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('vcardId', 'username personalInfo.name userId').lean(),
    Testimonial.countDocuments(f),
  ]);
  res.json({
    reviews: rows.map((r) => ({ id: String(r._id), name: r.name, review: r.review, rating: r.rating, createdAt: r.createdAt, card: r.vcardId && { username: r.vcardId.username, name: r.vcardId.personalInfo?.name || '', ownerId: r.vcardId.userId ? String(r.vcardId.userId) : '' } })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.delete('/reviews/:id', requirePermission('content.manage'), validate({ params: idParams, body: z.object({ reason: z.string().trim().min(3).max(500) }) }), async (req, res) => {
  const r = await Testimonial.findById(req.v.params.id).populate('vcardId', 'username');
  if (!r) return res.status(404).json({ msg: 'Review not found.' });
  await r.deleteOne();
  await audit(req, 'content.review.delete', { targetType: 'card', targetId: r.vcardId?._id, summary: `Removed the review by ${r.name} from /${r.vcardId?.username || '?'}`, meta: { reason: req.v.body.reason, review: r.review.slice(0, 300) } });
  res.json({ ok: true });
});

module.exports = router;
