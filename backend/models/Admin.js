const mongoose = require('mongoose');

// Admin panel accounts. Completely separate from site users (models/User.js): own collection,
// own login (/api/admin/auth), own JWT secret and cookies. See middleware/admin/.
const ROLES = ['super_admin', 'admin', 'support'];

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'support', index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: '' },
    // Lockout after repeated wrong passwords / 2FA codes.
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    // Optional TOTP 2FA. Secrets are stored encrypted (utils/adminCrypto.js).
    totpEnabled: { type: Boolean, default: false },
    totpSecretEnc: { type: String, default: '', select: false },
    totpPendingEnc: { type: String, default: '', select: false },
    // Bumped on password change, deactivation, role change or 2FA reset: older access tokens stop working.
    tokenVersion: { type: Number, default: 0 },
    passwordChangedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true }
);

// What the API may show about an admin (never the hash, secrets or lockout internals).
const toSafeAdmin = (a) =>
  a && {
    id: String(a._id),
    name: a.name,
    email: a.email,
    role: a.role,
    isActive: a.isActive,
    totpEnabled: !!a.totpEnabled,
    lastLoginAt: a.lastLoginAt || null,
    locked: !!(a.lockUntil && new Date(a.lockUntil) > new Date()),
    createdAt: a.createdAt,
  };

module.exports = mongoose.model('Admin', AdminSchema);
module.exports.ROLES = ROLES;
module.exports.toSafeAdmin = toSafeAdmin;
