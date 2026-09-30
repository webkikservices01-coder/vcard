const mongoose = require('mongoose');

// Webhook events already handled (Razorpay x-razorpay-event-id, WhatsApp status ids), so a
// provider's retries or duplicates never run twice. Kept 30 days.
const WebhookEventSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  eventId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 },
});
WebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

// Returns true the first time an event is seen, false for repeats.
WebhookEventSchema.statics.firstTime = async function (provider, eventId) {
  if (!eventId) return true;
  await this.init(); // the unique index must exist, or two copies of an event could both pass
  try {
    await this.create({ provider, eventId });
    return true;
  } catch (err) {
    if (err.code === 11000) return false;
    throw err;
  }
};

module.exports = mongoose.model('WebhookEvent', WebhookEventSchema);
