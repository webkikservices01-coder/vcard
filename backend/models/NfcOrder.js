const mongoose = require('mongoose');

// Metal NFC card orders: from the order form on /metal-nfc-card, an AI Agent Pro plan (which
// includes a metal card), or added by the team. Admin panel → NFC orders moves them along:
// new → confirmed → design → printing → shipped → delivered (or cancelled).
const STATUSES = ['new', 'confirmed', 'design', 'printing', 'shipped', 'delivered', 'cancelled'];

const NfcOrderSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true }, // NFC-2026-0001
    source: { type: String, enum: ['form', 'pro-plan', 'manual'], default: 'form' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformLead', default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    cardLink: { type: String, default: '' }, // aicardly.com/<username> the card opens
    quantity: { type: Number, default: 1, min: 1 },
    design: { type: String, default: '' }, // finish, logo, name to engrave
    address: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    amount: { type: Number, default: 0 }, // ₹ agreed (incl. GST)
    paid: { type: Boolean, default: false },
    status: { type: String, enum: STATUSES, default: 'new', index: true },
    courier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    trackingUrl: { type: String, default: '' },
    expectedDelivery: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    notes: { type: String, default: '' }, // team notes (not shown to the customer)
    history: [
      {
        status: String,
        note: String,
        by: String,
        emailed: { type: Boolean, default: false },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('NfcOrder', NfcOrderSchema);
module.exports.STATUSES = STATUSES;
