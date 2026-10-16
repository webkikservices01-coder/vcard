const mongoose = require('mongoose');

// Customer stories on aicardly.com (admin panel → Content). Shown only when published, and a
// story can only be published with the customer's consent ticked.
const SiteTestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: '' }, // e.g. Founder
    company: { type: String, default: '' },
    quote: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    photo: { type: String, default: '' }, // https image URL
    cardLink: { type: String, default: '' }, // their live Aicardly card, e.g. /citi-glass
    consent: { type: Boolean, default: false }, // the customer agreed to be shown
    published: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteTestimonial', SiteTestimonialSchema);
