const mongoose = require('mongoose');

// A guest's reply on a wedding invitation. The message (if any) also appears on the invite's
// "Guest Wishes" wall when the couple keeps that switched on.
const weddingRsvpSchema = new mongoose.Schema({
  inviteId: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingInvite', required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  guests: { type: Number, default: 1, min: 1, max: 20 },
  attending: { type: String, enum: ['yes', 'no', 'maybe'], default: 'yes' },
  message: { type: String, default: '' },
  hidden: { type: Boolean, default: false }, // the couple took the wish off the wall
}, { timestamps: true });

weddingRsvpSchema.index({ inviteId: 1, createdAt: -1 });

module.exports = mongoose.model('WeddingRsvp', weddingRsvpSchema);
