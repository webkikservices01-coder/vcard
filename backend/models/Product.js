const mongoose = require('mongoose');

// A link shown on the public card: only web addresses. "example.com" becomes
// "https://example.com"; anything that isn't http(s) (javascript:, data:, ...) is dropped.
const webLink = (v) => {
    const s = String(v || '').trim();
    if (!s) return '';
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s.replace(/^\/+/, '')}`;
    try {
        const u = new URL(withScheme);
        return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
    } catch {
        return '';
    }
};

// The card's products and services (dashboard: Products tab / Services tab) render in separate
// sections on the public card; a service opens the owner's website when tapped.
const productSchema = new mongoose.Schema({
    vcardId:     { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
    kind:        { type: String, enum: ['product', 'service'], default: 'product' },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    price:       { type: String, default: '' },
    coverImage:  { type: String, default: '' },
    link:        { type: String, default: '', set: webLink },
    order:       { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
module.exports.webLink = webLink;
