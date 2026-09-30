const mongoose = require('mongoose');

// "Get my card" order: the owner pays for their card with a Razorpay Payment Link (valid 24h),
// then the finished card (PDF + image) is delivered to their WhatsApp and email.
const CardOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    amount: { type: Number, required: true }, // paise
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    // Where the link and messages went (copied from the user at order time).
    phone: { type: String, default: '' },
    email: { type: String, default: '' },

    paymentLinkId: { type: String, default: '', index: true },
    paymentLinkUrl: { type: String, default: '' },
    expiresAt: { type: Date, required: true, index: true },
    paidAt: { type: Date, default: null },
    razorpayPaymentId: { type: String, default: '' },
    reminderSentAt: { type: Date, default: null },

    delivery: {
      status: { type: String, enum: ['NOT_STARTED', 'PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'SKIPPED'], default: 'NOT_STARTED' },
      attempts: { type: Number, default: 0 },
      lastError: { type: String, default: '' },
      imageUrl: { type: String, default: '' },
      pdfUrl: { type: String, default: '' },
      deliveredAt: { type: Date, default: null },
      // Set while a delivery runs, so the webhook, the status check and the cron job never send twice.
      lockUntil: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

CardOrderSchema.index({ status: 1, expiresAt: 1 });

module.exports = mongoose.model('CardOrder', CardOrderSchema);
