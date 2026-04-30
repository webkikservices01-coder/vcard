const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    vcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    name:    { type: String, required: true },
    review:  { type: String, required: true },
    rating:  { type: Number, min: 1, max: 5, default: 5 },
    photo:   { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
