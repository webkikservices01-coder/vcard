const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    vcardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    coverImage:  { type: String, default: '' },
    url:         { type: String, default: '' },
    order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
