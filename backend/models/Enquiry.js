const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    vcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    name:    { type: String, required: true },
    email:   { type: String, default: '' },
    mobile:  { type: String, default: '' },
    message: { type: String, required: true },
    read:    { type: Boolean, default: false },
    // When the visitor agreed to share these details with the card owner (DPDP consent).
    consentAt: { type: Date, default: null },
    cohort:  { type: String, default: 'live' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
