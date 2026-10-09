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
    // Lifetime account (set from the admin panel): the plan never runs out, whatever planExpiry says.
    lifetime:  { type: Boolean, default: false },
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
    resetTokenExpiry: { type: Date, default: null },
    // Set from the admin panel. Blocked or removed (soft delete): can't sign in or use the app.
    // A removed user's public card is no longer shown.
    isBlocked:     { type: Boolean, default: false },
    blockedAt:     { type: Date, default: null },
    blockedReason: { type: String, default: '' },
    deletedAt:     { type: Date, default: null },
    // Marked in the admin panel as a team / test account: left out of the dashboard numbers.
    isTest:        { type: Boolean, default: false },
    // Free card deliveries granted by an admin: the next "Get my card" order skips the payment link.
    freeCardCredits: { type: Number, default: 0, min: 0 },
    // Sign-in tokens issued before this time stop working (password changed / reset, or an
    // admin signed the user out everywhere).
    tokensValidAfter: { type: Date, default: null },
    // 24-hour trial: when the upgrade link went out (services/trial.js). tokenHash opens the
    // no-login upgrade page /upgrade/<token>; cfLink* is the Cashfree link sent by SMS.
    upgrade: {
        tokenHash:  { type: String, default: '' },
        trialEndsAt: { type: Date, default: null }, // admin "End trial now": ends the trial earlier
        sentAt:     { type: Date, default: null },
        email:      { type: String, default: '' }, // sent | failed | skipped
        sms:        { type: String, default: '' }, // sent | failed | skipped (no Indian mobile)
        cfLinkId:   { type: String, default: '' },
        cfLinkUrl:  { type: String, default: '' },
        error:      { type: String, default: '' },
    },
}, { timestamps: true });

UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', UserSchema);
