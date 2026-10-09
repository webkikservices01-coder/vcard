// /api/admin/leads: people who asked Aicardly's team to contact them (Cardy's lead form on the
// website). Status: new → contacted → closed.
const express = require('express');
const PlatformLead = require('../../models/PlatformLead');
const { requirePermission, exportReason } = require('../../middleware/admin/auth');
const { validate, z, idParams, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { sendCsv } = require('../../utils/csv');

const router = express.Router();
const STATUSES = ['new', 'contacted', 'closed'];

const query = z.object({ ...paging, q: search, status: z.enum(['', ...STATUSES]).optional().default('') });

function filter({ q, status }) {
  const f = {};
  if (status) f.status = status;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    f.$or = [{ name: re }, { email: re }, { phone: re }, { businessName: re }, { message: re }];
  }
  return f;
}

router.get('/', requirePermission('leads.view'), validate({ query }), async (req, res) => {
  const { page, limit } = req.v.query;
  const f = filter(req.v.query);
  const [leads, total, counts] = await Promise.all([
    PlatformLead.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PlatformLead.countDocuments(f),
    PlatformLead.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  res.json({ leads, total, page, pages: Math.max(1, Math.ceil(total / limit)), counts: Object.fromEntries(counts.map((c) => [c._id, c.n])) });
});

router.get('/export', requirePermission('export.csv'), exportReason, validate({ query }), async (req, res) => {
  const leads = await PlatformLead.find(filter(req.v.query)).sort({ createdAt: -1 }).limit(50000).lean();
  await audit(req, 'export.leads', { summary: `Exported ${leads.length} leads (CSV)` });
  sendCsv(res, 'aicardly-leads', leads, [
    { header: 'Date', value: (l) => l.createdAt },
    { header: 'Name', value: (l) => l.name },
    { header: 'Email', value: (l) => l.email },
    { header: 'Phone', value: (l) => l.phone },
    { header: 'Business', value: (l) => l.businessName },
    { header: 'Need', value: (l) => l.need },
    { header: 'Budget', value: (l) => l.budget },
    { header: 'Timeline', value: (l) => l.timeline },
    { header: 'Message', value: (l) => l.message },
    { header: 'Source', value: (l) => l.source },
    { header: 'Status', value: (l) => l.status },
  ]);
});

// Enquiries visitors sent to card owners through the form on a card (the owner gets them by
// email and in their dashboard). Read-only here.
const Enquiry = require('../../models/Enquiry');
const vCard = require('../../models/vCard');
router.get('/enquiries', requirePermission('leads.view'), validate({ query: z.object({ ...paging, q: search }) }), async (req, res) => {
  const { page, limit, q } = req.v.query;
  const f = {};
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    const cards = await vCard.find({ $or: [{ username: re }, { 'personalInfo.name': re }] }).select('_id').limit(500).lean();
    f.$or = [{ name: re }, { email: re }, { mobile: re }, { message: re }, { vcardId: { $in: cards.map((c) => c._id) } }];
  }
  const [rows, total] = await Promise.all([
    Enquiry.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('vcardId', 'username personalInfo.name userId').lean(),
    Enquiry.countDocuments(f),
  ]);
  res.json({
    enquiries: rows.map((e) => ({
      id: String(e._id),
      name: e.name,
      email: e.email,
      phone: e.mobile,
      message: e.message,
      read: !!e.read,
      test: e.cohort && e.cohort !== 'live',
      card: e.vcardId && { id: String(e.vcardId._id), username: e.vcardId.username, name: e.vcardId.personalInfo?.name || '', ownerId: e.vcardId.userId ? String(e.vcardId.userId) : '' },
      createdAt: e.createdAt,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});

router.put('/:id', requirePermission('leads.update'), validate({ params: idParams, body: z.object({ status: z.enum(STATUSES) }) }), async (req, res) => {
  const lead = await PlatformLead.findById(req.v.params.id);
  if (!lead) return res.status(404).json({ msg: 'Lead not found.' });
  const before = lead.status;
  lead.status = req.v.body.status;
  await lead.save();
  await audit(req, 'lead.update', { targetType: 'lead', targetId: lead._id, summary: `Lead ${lead.name}: ${before} → ${lead.status}` });
  res.json({ lead });
});

module.exports = router;
