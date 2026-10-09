const mongoose = require('mongoose');

const vCardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, unique: true }, // Jaise: mycardlink.site/marketer-esskay
    // Hidden from the public by an admin (card moderation): the link shows "not found".
    adminHidden: { type: Boolean, default: false },
    adminHiddenReason: { type: String, default: '' },
    adminHiddenAt: { type: Date, default: null },
    theme: { type: String, default: 'webkik-signature' }, // WebCard template id (see FRONTEND/src/webcard)
    // Look of the chosen template: one of its 5 colour palettes, light/dark ('' = the template's
    // own mode), and whether the live visitor counter shows on the card.
    themeOptions: {
        palette: { type: Number, default: 0, min: 0, max: 4 },
        mode:    { type: String, enum: ['', 'light', 'dark'], default: '' },
        counter: { type: Boolean, default: true },
    },
    personalInfo: {
        name: String,
        designation: String,
        company: String,
        bio: String,
        profilePic: String,
        bannerImage: String
    },
    
    // YEH NAYA BLOCK HAI: Jo sabhi Social, Email, Phone aur Custom URLs ko dynamically save karega
    dynamicLinks: [{
        fieldType: String,
        title: String,
        url: String
    }],

    services: [{ title: String, description: String, price: String }],

    // Extra content the WebCard templates can show (followers row, stats, reels, timeline, ...).
    extras: {
        followers:  [{ platform: String, count: String, url: String }],
        stats:      [{ value: String, label: String }],
        skills:     [String],
        languages:  [String],
        brands:     [String],
        experience: [{ years: String, role: String, org: String }],
        timings:    [{ day: String, hours: String }],
        reels:      [{ url: String, title: String }],
    },

    // AI chatbot replies used on the free plan (the owner has no Smart AI Card / AI Agent Pro plan).
    aiTrialUsed: { type: Number, default: 0 },

    viewCount: { type: Number, default: 0 },
    scanCount:  { type: Number, default: 0 },

    customTheme: {
        layout:            { type: String, default: 'classic' },
        bg:                { type: String, default: '#ffffff' },
        bgImage:           { type: String, default: '' },
        bannerColor:       { type: String, default: '#111827' },
        bannerImage:       { type: String, default: '' },
        nameColor:         { type: String, default: '#111827' },
        designationColor:  { type: String, default: '#6b7280' },
        contactBg:         { type: String, default: '#111827' },
        contactText:       { type: String, default: '#ffffff' },
        sectionBg:         { type: String, default: '#f9fafb' },
        border:            { type: String, default: '#e5e7eb' },
        accent:            { type: String, default: '#111827' },
        subTextColor:      { type: String, default: '#FFFFFF' }, // Added here
        linkBg:            { type: String, default: '#3B82F6' }, // Added here
        cardBg:            { type: String },
        text:              { type: String },
    }
}, { timestamps: true });

module.exports = mongoose.model('vCard', vCardSchema);