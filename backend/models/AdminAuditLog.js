const mongoose = require('mongoose');

// Every admin action and admin sign-in attempt: who, what, on which record, when, from where.
// Kept permanently. Never contains passwords, tokens or secrets.
const AdminAuditLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null, index: true },
  adminEmail: { type: String, default: '' },
  adminRole: { type: String, default: '' },
  action: { type: String, required: true, index: true }, // e.g. user.block, plan.grant, auth.login
  targetType: { type: String, default: '' }, // user | card | order | transaction | plan | admin | ticket
  targetId: { type: String, default: '', index: true },
  summary: { type: String, default: '' },
  meta: { type: mongoose.Schema.Types.Mixed, default: undefined },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  success: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('AdminAuditLog', AdminAuditLogSchema);
