const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject:    { type: String, required: true },
    category:   { type: String, default: 'General' },
    message:    { type: String, required: true },
    status:     { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
    attachFile: { type: String, default: '' },
    // Replies from the team (admin panel); each is also emailed to the user.
    replies: [{
        message:    { type: String, required: true },
        by:         { type: String, default: '' }, // admin name
        emailed:    { type: Boolean, default: false },
        at:         { type: Date, default: Date.now },
    }],
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
