const mongoose = require('mongoose');

// One row per admin sign-in, holding the refresh token only as a SHA-256 hash. The token is
// rotated on every refresh; a revoked token being used again means it leaked, so all of that
// admin's sessions are ended (services/admin/session.js).
const AdminSessionSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);
// MongoDB removes a session a day after it ends.
AdminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 24 * 3600 });

module.exports = mongoose.model('AdminSession', AdminSessionSchema);
