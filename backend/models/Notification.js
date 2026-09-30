const mongoose = require('mongoose');

// Every email / WhatsApp message sent for a card order, with its delivery status.
// WhatsApp status webhooks (sent → delivered → read, or failed) update it by providerMessageId.
const NotificationSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'CardOrder', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    channel: { type: String, enum: ['email', 'whatsapp'], required: true },
    type: { type: String, enum: ['payment_link', 'card_delivery', 'payment_reminder'], required: true },
    to: { type: String, default: '' },
    status: { type: String, enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'skipped'], default: 'queued' },
    providerMessageId: { type: String, default: '', index: true },
    error: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
