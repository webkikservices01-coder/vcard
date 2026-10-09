const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan:        { type: String, required: true },
    amount:      { type: Number, required: true }, // charged, GST included
    base:        { type: Number, default: null },  // plan price before GST (null on older payments)
    gst:         { type: Number, default: 0 },     // GST added (18%)
    billingType: { type: String, default: 'Yearly' },
    expireDays:  { type: Number, default: 365 },
    cfOrderId:        { type: String, default: '' },
    paymentSessionId: { type: String, default: '' },
    cfLinkId:    { type: String, default: '', index: true }, // Cashfree payment link
    source:      { type: String, default: '' },              // plans | upgrade-page | sms-link
    status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    invoiceNumber: { type: String, default: '' },
    refrensInvoiceId: { type: String, default: '' },
    refrensPdfUrl:    { type: String, default: '' },
    // Refund (admin panel). Cashfree refunds via its API; payments it can't refund (payment links)
    // are refunded in the Cashfree dashboard and recorded here as "manual".
    refund: {
        status:  { type: String, enum: ['', 'pending', 'processed', 'failed', 'manual'], default: '' },
        amount:  { type: Number, default: 0 },
        id:      { type: String, default: '' },
        reason:  { type: String, default: '' },
        error:   { type: String, default: '' },
        at:      { type: Date, default: null },
        planEnded: { type: Boolean, default: false },
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
