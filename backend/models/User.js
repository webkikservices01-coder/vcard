const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName:  { type: String, default: '' },
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    phone:     { type: String, default: '' },
    password:  { type: String, required: true },
    plan:      { type: String, default: 'Free Trial' },
    planExpiry:{ type: Date, default: null },
    status:    { type: String, enum: ['active', 'inactive'], default: 'active' },
    cardLimit: { type: Number, default: 1 },
    isAdmin:   { type: Boolean, default: false },
    // Terms + Privacy Policy accepted at sign-up (DPDP consent record).
    consentAt:      { type: Date, default: null },
    consentVersion: { type: String, default: '' },
    // Email verification. false = signed up but hasn't clicked the emailed link yet (can't sign in).
    // Accounts from before verification existed have no value and count as verified.
    emailVerified:     { type: Boolean },
    verifyTokenHash:   { type: String, default: '' },
    verifyTokenExpiry: { type: Date, default: null },
    // Password reset: SHA-256 of the emailed token (never the token itself) and when it expires.
    resetTokenHash:   { type: String, default: '' },
    resetTokenExpiry: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
