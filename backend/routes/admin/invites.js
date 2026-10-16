// /api/admin/invites: every digital invite (weddings, birthdays, festival wishes …) with its
// owner, views and replies. The team can take an invite offline (and back) with a reason.
const express = require('express');
const WeddingInvite = require('../../models/WeddingInvite');
const WeddingRsvp = require('../../models/WeddingRsvp');
const User = require('../../models/User');
const { occasionOf } = require('../../constants/weddingTemplates');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');

const router = express.Router();
const query = z.object({ ...paging, q: search, state: z.enum(['', 'live', 'draft', 'hidden']).optional().default('') });

router.get('/', requirePermission('invites.view'), validate({ query }), async (req, res) => {
  const { page, limit, q, state } = req.v.query;
  const f = {};
  if (state === 'live') Object.assign(f, { published: true, adminHidden: { $ne: true } });
  if (state === 'draft') f.published = false;
  if (state === 'hidden') f.adminHidden = true;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const users = await User.find({ $or: [{ email: re }, { name: re }] }).select('_id').limit(300).lean();
    f.$or = [{ link: re }, { coupleOne: re }, { coupleTwo: re }, { template: re }, { userId: { $in: users.map((u) => u._id) } }];
  }
  const [rows, total, live, all] = await Promise.all([
    WeddingInvite.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('link template coupleOne coupleTwo amp date eventDate published adminHidden adminHiddenReason views userId createdAt').populate('userId', 'name email').lean(),
    WeddingInvite.countDocuments(f),
    WeddingInvite.countDocuments({ published: true, adminHidden: { $ne: true } }),
    WeddingInvite.countDocuments({}),
  ]);
  const counts = await WeddingRsvp.aggregate([{ $match: { inviteId: { $in: rows.map((r) => r._id) } } }, { $group: { _id: '$inviteId', replies: { $sum: { $cond: [{ $ne: ['$wish', true] }, 1, 0] } }, wishes: { $sum: { $cond: [{ $eq: ['$wish', true] }, 1, 0] } }, guests: { $sum: { $cond: [{ $and: [{ $eq: ['$attending', 'yes'] }, { $ne: ['$wish', true] }] }, '$guests', 0] } } } }]);
  const by = Object.fromEntries(counts.map((c) => [String(c._id), c]));
  res.json({
    invites: rows.map((i) => ({
      id: String(i._id),
      link: i.link,
      template: i.template,
      occasion: occasionOf(i.template),
      names: [i.coupleOne, i.coupleTwo].filter(Boolean).join(` ${i.amp || '&'} `),
      date: i.date || (i.eventDate ? new Date(i.eventDate).toISOString() : ''),
      state: i.adminHidden ? 'hidden' : i.published ? 'live' : 'draft',
      hiddenReason: i.adminHiddenReason || '',
      views: i.views || 0,
      replies: by[String(i._id)]?.replies || 0,
      wishes: by[String(i._id)]?.wishes || 0,
      guests: by[String(i._id)]?.guests || 0,
      owner: i.userId && { id: String(i.userId._id), name: i.userId.name, email: i.userId.email },
      createdAt: i.createdAt,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: { live, all },
  });
});

router.post('/:id/visibility', requirePermission('invites.moderate'), validate({ params: idParams, body: z.object({ hidden: z.boolean(), reason: z.string().trim().min(3).max(300) }) }), async (req, res) => {
  const invite = await WeddingInvite.findById(req.v.params.id);
  if (!invite) return res.status(404).json({ msg: 'Invite not found.' });
  invite.adminHidden = req.v.body.hidden;
  invite.adminHiddenReason = req.v.body.hidden ? req.v.body.reason : '';
  await invite.save();
  await audit(req, req.v.body.hidden ? 'invite.hide' : 'invite.show', { targetType: 'invite', targetId: invite._id, summary: `${req.v.body.hidden ? 'Took offline' : 'Put back online'} /invite/${invite.link}`, meta: { reason: req.v.body.reason } });
  res.json({ ok: true });
});

module.exports = router;
