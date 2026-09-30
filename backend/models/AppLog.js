const mongoose = require('mongoose');

// Important app events (sign-ups, logins, emails, payments, enquiries, errors) for the admin
// Logs page. Kept for 30 days. Never stores passwords, tokens or message bodies.
const AppLogSchema = new mongoose.Schema({
  type:   { type: String, required: true, index: true }, // e.g. auth.register, mail.failed, payment.paid
  level:  { type: String, enum: ['info', 'warn', 'error'], default: 'info', index: true },
  msg:    { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  email:  { type: String, default: '' },
  ip:     { type: String, default: '' },
  path:   { type: String, default: '' },
  meta:   { type: mongoose.Schema.Types.Mixed, default: undefined },
  createdAt: { type: Date, default: Date.now },
});
AppLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

module.exports = mongoose.model('AppLog', AppLogSchema);
