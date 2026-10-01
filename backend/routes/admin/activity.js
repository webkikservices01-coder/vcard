// /api/admin: audit log, support tickets, app logs and AI usage.
const express = require('express');
const AdminAuditLog = require('../../models/AdminAuditLog');
const SupportTicket = require('../../models/SupportTicket');
const AppLog = require('../../models/AppLog');
const AiUsageLog = require('../../models/AiUsageLog');
const { requirePermission } = require('../../middleware/admin/auth');
const { validate, z, idParams, objectId, paging, search, escapeRegex } = require('../../middleware/admin/validate');
const { audit } = require('../../services/admin/audit');
const { isMailConfigured } = require('../../utils/mailer');

const router = express.Router();

// ─── Audit log ───────────────────────────────────────────────────────────────
router.get('/audit', requirePermission('audit.view'), validate({ query: z.object({
  ...paging,
  q: search,
  action: z.string().trim().max(60).regex(/^[\w.]*$/).optional().default(''),
  admin: objectId.optional(),
  targetId: z.string().trim().max(40).optional().default(''),
  success: z.enum(['', 'true', 'false']).optional().default(''),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
}) }), async (req, res) => {
  const { page, limit, q, action, admin, targetId, success, from, to } = req.v.query;
  const f = {};
  if (action) f.action = new RegExp(`^${escapeRegex(action)}`);
  if (admin) f.admin = admin;
  if (targetId) f.targetId = targetId;
  if (success) f.success = success === 'true';
  if (from || to) f.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    f.$or = [{ summary: re }, { adminEmail: re }, { ip: re }];
  }
  const [logs, total] = await Promise.all([
    AdminAuditLog.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    AdminAuditLog.countDocuments(f),
  ]);
  res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

// ─── Support tickets ─────────────────────────────────────────────────────────
const TICKET_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

router.get('/support', requirePermission('support.view'), validate({ query: z.object({ ...paging, status: z.enum(['', ...TICKET_STATUSES]).optional().default('') }) }), async (req, res) => {
  const { page, limit, status } = req.v.query;
  const f = status ? { status } : {};
  const [tickets, total] = await Promise.all([
    SupportTicket.find(f).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name email phone').lean(),
    SupportTicket.countDocuments(f),
  ]);
  res.json({ tickets, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.put('/support/:id', requirePermission('support.update'), validate({ params: idParams, body: z.object({ status: z.enum(TICKET_STATUSES) }) }), async (req, res) => {
  const ticket = await SupportTicket.findById(req.v.params.id);
  if (!ticket) return res.status(404).json({ msg: 'Ticket not found.' });
  const before = ticket.status;
  ticket.status = req.v.body.status;
  await ticket.save();
  await audit(req, 'support.update', { targetType: 'ticket', targetId: ticket._id, summary: `Ticket "${ticket.subject}": ${before} → ${ticket.status}` });
  res.json({ ticket });
});

// ─── App logs (30 days) ──────────────────────────────────────────────────────
router.get('/logs', requirePermission('logs.view'), validate({ query: z.object({
  type: z.string().trim().max(60).regex(/^[\w.]*$/).optional().default(''),
  level: z.enum(['', 'info', 'warn', 'error']).optional().default(''),
  q: search,
  limit: z.coerce.number().int().min(10).max(500).default(200),
}) }), async (req, res) => {
  const { type, level, q, limit } = req.v.query;
  const f = {};
  if (type) f.type = new RegExp(`^${escapeRegex(type)}`);
  if (level) f.level = level;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    f.$or = [{ msg: re }, { email: re }, { type: re }];
  }
  const [logs, counts] = await Promise.all([
    AppLog.find(f).sort({ createdAt: -1 }).limit(limit).lean(),
    AppLog.aggregate([{ $match: { createdAt: { $gte: new Date(Date.now() - 864e5) } } }, { $group: { _id: '$level', n: { $sum: 1 } } }]),
  ]);
  res.json({ logs, last24h: Object.fromEntries(counts.map((c) => [c._id, c.n])), mail: isMailConfigured() });
});

// ─── AI usage ────────────────────────────────────────────────────────────────
router.get('/ai-usage', requirePermission('logs.view'), validate({ query: z.object({ ...paging, limit: z.coerce.number().int().min(1).max(100).default(50) }) }), async (req, res) => {
  const { page, limit } = req.v.query;
  const [logs, total, totals] = await Promise.all([
    AiUsageLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('userId', 'name email').populate('vcardId', 'username').lean(),
    AiUsageLog.countDocuments(),
    AiUsageLog.aggregate([{ $group: { _id: null, inputTokens: { $sum: '$inputTokens' }, outputTokens: { $sum: '$outputTokens' }, costUsd: { $sum: '$costUsd' } } }]),
  ]);
  res.json({ logs, total, page, pages: Math.max(1, Math.ceil(total / limit)), summary: totals[0] || { inputTokens: 0, outputTokens: 0, costUsd: 0 } });
});

router.get('/ai-usage/export', requirePermission('export.csv'), async (req, res) => {
  const logs = await AiUsageLog.find().sort({ createdAt: -1 }).limit(100000).populate('userId', 'name email').populate('vcardId', 'username').lean();
  // exceljs is big: loaded only when someone exports, not when the server starts.
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('AI Usage');
  sheet.columns = [
    { header: 'Date', key: 'date', width: 20 },
    { header: 'Route', key: 'route', width: 14 },
    { header: 'User', key: 'user', width: 26 },
    { header: 'vCard', key: 'vcard', width: 18 },
    { header: 'Model', key: 'model', width: 20 },
    { header: 'Input Tokens', key: 'inputTokens', width: 16 },
    { header: 'Output Tokens', key: 'outputTokens', width: 16 },
    { header: 'Cost (USD)', key: 'costUsd', width: 14 },
  ];
  sheet.getRow(1).font = { bold: true };
  let totalInput = 0;
  let totalOutput = 0;
  let totalCost = 0;
  for (const log of logs) {
    totalInput += log.inputTokens;
    totalOutput += log.outputTokens;
    totalCost += log.costUsd;
    sheet.addRow({
      date: new Date(log.createdAt).toISOString(),
      route: log.route,
      user: log.userId ? `${log.userId.name} (${log.userId.email})` : '—',
      vcard: log.vcardId?.username || '—',
      model: log.model,
      inputTokens: log.inputTokens,
      outputTokens: log.outputTokens,
      costUsd: Number(log.costUsd.toFixed(6)),
    });
  }
  sheet.addRow({});
  sheet.addRow({ date: 'TOTAL', inputTokens: totalInput, outputTokens: totalOutput, costUsd: Number(totalCost.toFixed(6)) }).font = { bold: true };
  await audit(req, 'export.ai_usage', { summary: `Exported ${logs.length} AI usage rows (xlsx)` });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="ai-usage-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
});

module.exports = router;
