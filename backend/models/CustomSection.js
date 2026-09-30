const mongoose = require('mongoose');

const customSectionSchema = new mongoose.Schema({
    vcardId:  { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    title:    { type: String, required: true },
    // HTML/CSS (shown in an isolated shadow root on the card). Optional when the section has files.
    content:  { type: String, default: '' },
    // Documents visitors can open or download: PDFs, Word, PowerPoint, Excel, images...
    files:    [{ name: String, url: String, size: Number }],
    order:    { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('CustomSection', customSectionSchema);
