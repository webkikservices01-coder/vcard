const mongoose = require('mongoose');

const vcardSettingsSchema = new mongoose.Schema({
    vcardId:       { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true, unique: true },
    enquiryEmail:  { type: String, default: '' },
    analyticsId:   { type: String, default: '' },
    hideBranding:  { type: Boolean, default: false },
    showPhonebook: { type: Boolean, default: true },
    showShare:     { type: Boolean, default: true },
    showQr:        { type: Boolean, default: true },
    showQrOnShare: { type: Boolean, default: true },
    showViews:     { type: Boolean, default: true },
    showLanguage:  { type: Boolean, default: true },
    seoIndexing:   { type: Boolean, default: true },
    carouselMode:  { type: Boolean, default: true },
    showEnquiryForm: { type: Boolean, default: true },
    sectionOrder:  { type: [String], default: ['contact','products','portfolio','gallery','testimonials','custom','enquiry'] },
    orientation:   { type: String, enum: ['vertical', 'horizontal'], default: 'vertical' }
}, { timestamps: true });

module.exports = mongoose.model('VcardSettings', vcardSettingsSchema);
