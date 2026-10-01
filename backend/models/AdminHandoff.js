const mongoose = require('mongoose');

// One-time "sign in as this user" codes made in the admin panel (routes/admin/users.js) and
// redeemed by the site (POST /api/auth/impersonate). Only the SHA-256 of the code is stored;
// MongoDB deletes expired ones by itself.
const AdminHandoffSchema = new mongoose.Schema({
  codeHash: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

AdminHandoffSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AdminHandoff', AdminHandoffSchema);
