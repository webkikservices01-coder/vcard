const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject:    { type: String, required: true },
    category:   { type: String, default: 'General' },
    message:    { type: String, required: true },
    status:     { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    attachFile: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
