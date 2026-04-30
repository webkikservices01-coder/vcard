const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    vcardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    type:      { type: String, enum: ['image', 'video'], default: 'image' },
    url:       { type: String, required: true },
    thumbnail: { type: String, default: '' },
    order:     { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
