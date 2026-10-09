const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { POLICY_VERSION } = require('../constants/legal');
const { sendMail, emailHtml, isMailConfigured } = require('../utils/mailer');
const { logEvent } = require('../utils/logger');
const { authLimiter, forgotLimiter } = require('../middleware/rateLimiter');
const { toE164 } = require('../utils/phone');
const router = express.Router();

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normEmail = (e) => String(e || '').trim().toLowerCase();
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Case-insensitive, so accounts saved before emails were lower-cased are still found.
const findByEmail = (email) => User.findOne({ email: new RegExp(`^${escRe(email)}$`, 'i') });
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const signToken = (user) => jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const { sendVerification, sendResetLink } = require('../services/accountEmails');
const AdminHandoff = require('../models/AdminHandoff');
const { forgetAccountStatus } = require('../utils/accountStatus');

// Register
router.post('/register', authLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    try {
        const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
        // Stored in E.164 (+919812345678): the card is delivered to this WhatsApp number.
        const phone = toE164(req.body.phone);
        const { password, confirm, acceptTerms } = req.body;

        if (name.length < 2) return res.status(400).json({ msg: 'Please enter your full name.' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: 'Please enter a valid email address.' });
        if (!phone) return res.status(400).json({ msg: 'Please enter a valid mobile number, e.g. +91 98123 45678.' });
        if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
        if (confirm !== undefined && confirm !== password) return res.status(400).json({ msg: 'Passwords do not match.' });
        // DPDP: record that the user agreed to the Terms and Privacy Policy.
        if (acceptTerms !== true) return res.status(400).json({ msg: 'Please accept the Terms & Conditions and Privacy Policy.' });

        if (await findByEmail(email)) {
            logEvent(req, 'auth.register.exists', 'Sign-up with an email that already has an account', { level: 'warn', email });
            return res.status(400).json({ msg: 'An account with this email already exists. Please sign in, or reset your password.', code: 'EMAIL_EXISTS' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const nameParts = name.split(' ');
        // Email verification needs working email (SMTP). Without it, sign-ups go straight in
        // (as before) so nobody gets locked out; it switches on by itself once SMTP is set.
        const mustVerify = isMailConfigured();
        const user = await User.create({
            name,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email,
            phone,
            password: hashed,
            consentAt: new Date(),
            consentVersion: POLICY_VERSION,
            emailVerified: !mustVerify,
        });
        logEvent(req, 'auth.register', `New account: ${name}`, { userId: user._id, email });

        if (mustVerify) {
            const sent = await sendVerification(user);
            logEvent(req, 'auth.verify.sent', sent ? 'Verification email sent' : 'Verification email could not be sent', { level: sent ? 'info' : 'error', userId: user._id, email });
            return res.status(201).json({ verify: true, email, sent });
        }

        // Welcome email (best-effort; the account is already saved).
        sendMail({
            to: email,
            subject: 'Welcome to AiCardly 🎉',
            text: `Hi ${nameParts[0]},\n\nYour AiCardly account is ready. Sign in any time at ${SITE}/login to build your AI digital business card.\n\n– Team AiCardly`,
            html: emailHtml({
                heading: `Welcome, ${nameParts[0]}!`,
                paragraphs: [
                    'Your AiCardly account is ready. Build your AI digital business card, share it with a QR code or NFC tap, and let your AI assistant answer visitors 24/7.',
                    `You signed up with <b>${email}</b>.`,
                ],
                button: { label: 'Open my dashboard', url: `${SITE}/login` },
                footer: "Didn't create this account? Just ignore this email.",
            }),
        });

        res.status(201).json({ token: signToken(user), user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'An account with this email already exists. Please sign in, or reset your password.', code: 'EMAIL_EXISTS' });
        logEvent(req, 'auth.register.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not create the account. Please try again.' });
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    try {
        const { password } = req.body;
        if (!email || typeof password !== 'string') return res.status(400).json({ msg: 'Please enter your email and password.' });

        const found = await findByEmail(email);
        // A removed (soft-deleted) account behaves like no account at all.
        const user = found && !found.deletedAt ? found : null;
        if (!user || !(await bcrypt.compare(password, user.password))) {
            logEvent(req, 'auth.login.failed', user ? 'Wrong password' : 'No account with this email', { level: 'warn', email, userId: user?._id });
            return res.status(400).json({ msg: 'Invalid email or password.' });
        }
        if (user.isBlocked) {
            logEvent(req, 'auth.login.blocked', 'Login to a blocked account', { level: 'warn', email, userId: user._id });
            return res.status(403).json({ msg: 'Your account has been blocked. Please contact support.', code: 'ACCOUNT_BLOCKED' });
        }
        if (user.status === 'inactive') {
            logEvent(req, 'auth.login.blocked', 'Login to an inactive account', { level: 'warn', email, userId: user._id });
            return res.status(403).json({ msg: 'This account is inactive. Please contact support.' });
        }

        if (user.emailVerified === false) {
            logEvent(req, 'auth.login.unverified', 'Sign-in before verifying the email', { level: 'warn', email, userId: user._id });
            return res.status(403).json({ msg: 'Please verify your email first. We sent a link to your inbox (check spam too).', code: 'EMAIL_NOT_VERIFIED', email: user.email });
        }

        logEvent(req, 'auth.login', 'Signed in', { userId: user._id, email });
        res.json({ token: signToken(user), user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        logEvent(req, 'auth.login.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not sign in. Please try again.' });
    }
});

// Verify email with the emailed link. Signs the user in, so they carry on to set up their card.
router.post('/verify-email', forgotLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    try {
        const { token } = req.body;
        const user = await findByEmail(email);
        if (user && user.emailVerified !== false) {
            // Already verified (link clicked twice): just sign in.
            return res.json({ token: signToken(user), already: true });
        }
        const valid = user && user.verifyTokenHash && typeof token === 'string' && sha256(token) === user.verifyTokenHash && user.verifyTokenExpiry > new Date();
        if (!valid) {
            logEvent(req, 'auth.verify.invalid', 'Invalid or expired verification link', { level: 'warn', email, userId: user?._id });
            return res.status(400).json({ msg: 'This verification link is invalid or has expired. Please ask for a new one.', code: 'VERIFY_INVALID' });
        }
        user.emailVerified = true;
        user.verifyTokenHash = '';
        user.verifyTokenExpiry = null;
        await user.save();
        logEvent(req, 'auth.verify', 'Email verified', { userId: user._id, email: user.email });

        // Welcome email now that the address is confirmed (best-effort).
        const first = user.firstName || user.name;
        sendMail({
            to: user.email,
            subject: 'Welcome to AiCardly 🎉',
            text: `Hi ${first},\n\nYour email is verified and your AiCardly account is ready: ${SITE}/login\n\n– Team AiCardly`,
            html: emailHtml({
                heading: `Welcome, ${first}!`,
                paragraphs: ['Your email is verified and your AiCardly account is ready. Build your AI digital business card, share it with a QR code or NFC tap, and let your AI assistant answer visitors 24/7.'],
                button: { label: 'Open my dashboard', url: `${SITE}/login` },
            }),
        });
        res.json({ token: signToken(user) });
    } catch (err) {
        logEvent(req, 'auth.verify.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not verify the email. Please try again.' });
    }
});

// Send the verification link again. Same reply for any email, so it can't reveal accounts.
router.post('/resend-verification', forgotLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    const reply = { msg: 'If this email is waiting for verification, a new link is on its way. Check your inbox and spam folder.' };
    try {
        if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: 'Please enter a valid email address.' });
        const user = await findByEmail(email);
        if (!user || user.emailVerified !== false) return res.json(reply);
        const sent = await sendVerification(user);
        logEvent(req, 'auth.verify.resent', sent ? 'Verification email re-sent' : 'Verification email could not be re-sent', { level: sent ? 'info' : 'error', userId: user._id, email });
        res.json(reply);
    } catch (err) {
        logEvent(req, 'auth.verify.resend.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not send the link. Please try again.' });
    }
});

// Forgot password: emails a one-hour reset link. Same reply whether or not the email has an
// account, so the form can't be used to find out who is registered.
router.post('/forgot-password', forgotLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    const reply = { msg: 'If an account exists for this email, a reset link is on its way. Check your inbox and spam folder.' };
    try {
        if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: 'Please enter a valid email address.' });
        const user = await findByEmail(email);
        if (!user) {
            logEvent(req, 'auth.forgot.unknown', 'Reset asked for an email with no account', { level: 'warn', email });
            return res.json(reply);
        }
        const sent = await sendResetLink(user);
        logEvent(req, 'auth.forgot', sent ? 'Reset link emailed' : 'Reset link created but the email was not sent', { level: sent ? 'info' : 'warn', userId: user._id, email: user.email });
        res.json(reply);
    } catch (err) {
        logEvent(req, 'auth.forgot.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not send the reset link. Please try again.' });
    }
});

// Reset password with the emailed token.
router.post('/reset-password', forgotLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    try {
        const { token, password, confirm } = req.body;
        if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
        if (confirm !== undefined && confirm !== password) return res.status(400).json({ msg: 'Passwords do not match.' });
        const user = await findByEmail(email);
        const valid = user && user.resetTokenHash && typeof token === 'string' && sha256(token) === user.resetTokenHash && user.resetTokenExpiry > new Date();
        if (!valid) {
            logEvent(req, 'auth.reset.invalid', 'Invalid or expired reset link', { level: 'warn', email, userId: user?._id });
            return res.status(400).json({ msg: 'This reset link is invalid or has expired. Please ask for a new one.' });
        }
        user.password = await bcrypt.hash(password, 10);
        user.resetTokenHash = '';
        user.resetTokenExpiry = null;
        // Signs out sessions that used the old password (other devices).
        user.tokensValidAfter = new Date();
        await user.save();
        forgetAccountStatus(user._id);
        logEvent(req, 'auth.reset', 'Password changed with a reset link', { userId: user._id, email: user.email });
        res.json({ msg: 'Password updated. You can sign in now.' });
    } catch (err) {
        logEvent(req, 'auth.reset.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not reset the password. Please try again.' });
    }
});

// "Sign in as this user" from the admin panel: the panel creates a one-time code (valid for a
// minute, stored hashed) and opens the site with it in the URL fragment; this swaps it for a
// short session. The token carries imp (the admin's id), so the dashboard shows a banner.
router.post('/impersonate', authLimiter, async (req, res) => {
    try {
        const code = typeof req.body.code === 'string' ? req.body.code : '';
        if (!/^[a-f0-9]{64}$/.test(code)) return res.status(400).json({ msg: 'This link is invalid or has expired.' });
        const handoff = await AdminHandoff.findOneAndDelete({ codeHash: sha256(code), expiresAt: { $gt: new Date() } }).lean();
        if (!handoff) return res.status(400).json({ msg: 'This link is invalid or has expired. Open it again from the admin panel.' });
        const user = await User.findById(handoff.user).select('name email deletedAt').lean();
        if (!user || user.deletedAt) return res.status(404).json({ msg: 'This account no longer exists.' });
        const token = jwt.sign({ userId: String(user._id), imp: String(handoff.admin) }, process.env.JWT_SECRET, { expiresIn: '2h' });
        logEvent(req, 'auth.impersonate', `Admin signed in as ${user.email}`, { level: 'warn', userId: user._id, email: user.email });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        logEvent(req, 'auth.impersonate.error', err.message, { level: 'error' });
        res.status(500).json({ msg: 'Could not sign in. Please try again.' });
    }
});

module.exports = router;
