const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan:        { type: String, required: true },
    amount:      { type: Number, required: true },
    billingType: { type: String, default: 'Yearly' },
    expireDays:  { type: Number, default: 365 },
    cfOrderId:        { type: String, default: '' },
    paymentSessionId: { type: String, default: '' },
    status:      { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    invoiceNumber: { type: String, default: '' },
    refrensInvoiceId: { type: String, default: '' },
    refrensPdfUrl:    { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
