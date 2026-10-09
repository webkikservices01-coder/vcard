// Admin audit trail (models/AdminAuditLog.js). Writing never breaks the admin's request.
const AdminAuditLog = require('../../models/AdminAuditLog');
const { clientIp } = require('../../utils/logger');

async function audit(req, action, { targetType = '', targetId = '', summary = '', meta, success = true, admin } = {}) {
  const who = admin || req?.admin || {};
  try {
    await AdminAuditLog.create({
      admin: who.id || who._id || null,
      adminEmail: who.email || '',
      adminRole: who.role || '',
      action,
      targetType,
      targetId: targetId ? String(targetId) : '',
      summary: String(summary).slice(0, 500),
      // Exports carry the reason the admin typed (middleware/admin/auth.js exportReason).
      meta: req?.exportReason ? { ...(meta || {}), reason: req.exportReason } : meta,
      ip: clientIp(req),
      userAgent: String(req?.get?.('user-agent') || '').slice(0, 300),
      success,
    });
  } catch (err) {
    console.error('[admin-audit] could not save:', err.message);
  }
}

module.exports = { audit };
