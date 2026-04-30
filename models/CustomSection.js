const mongoose = require('mongoose');

const customSectionSchema = new mongoose.Schema({
    vcardId:  { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    order:    { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CustomSection', customSectionSchema);
