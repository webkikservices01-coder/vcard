const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { POLICY_VERSION } = require('../constants/legal');
const { sendMail, emailHtml } = require('../utils/mailer');
const { logEvent } = require('../utils/logger');
const { authLimiter, forgotLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normEmail = (e) => String(e || '').trim().toLowerCase();
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Case-insensitive, so accounts saved before emails were lower-cased are still found.
const findByEmail = (email) => User.findOne({ email: new RegExp(`^${escRe(email)}$`, 'i') });
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Register
router.post('/register', authLimiter, async (req, res) => {
    const email = normEmail(req.body.email);
    try {
        const name = String(req.body.name || '').trim().replace(/\s+/g, ' ');
        const phone = String(req.body.phone || '').replace(/[^\d+]/g, '');
        const { password, confirm, acceptTerms } = req.body;

        if (name.length < 2) return res.status(400).json({ msg: 'Please enter your full name.' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ msg: 'Please enter a valid email address.' });
        if (phone && !/^\+?\d{10,13}$/.test(phone)) return res.status(400).json({ msg: 'Please enter a valid phone number.' });
        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
        if (confirm !== undefined && confirm !== password) return res.status(400).json({ msg: 'Passwords do not match.' });
        // DPDP: record that the user agreed to the Terms and Privacy Policy.
        if (acceptTerms !== true) return res.status(400).json({ msg: 'Please accept the Terms & Conditions and Privacy Policy.' });

        if (await findByEmail(email)) {
            logEvent(req, 'auth.register.exists', 'Sign-up with an email that already has an account', { level: 'warn', email });
            return res.status(400).json({ msg: 'An account with this email already exists. Please sign in, or reset your password.', code: 'EMAIL_EXISTS' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const nameParts = name.split(' ');
        const user = await User.create({
            name,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email,
            phone,
            password: hashed,
            consentAt: new Date(),
            consentVersion: POLICY_VERSION,
        });
        logEvent(req, 'auth.register', `New account: ${name}`, { userId: user._id, email });

        // Welcome email (best-effort; the account is already saved).
        sendMail({
            to: email,
            subject: 'Welcome to Aicardly 🎉',
            text: `Hi ${nameParts[0]},\n\nYour Aicardly account is ready. Sign in any time at ${SITE}/login to build your AI digital business card.\n\n– Team Aicardly`,
            html: emailHtml({
                heading: `Welcome, ${nameParts[0]}!`,
                paragraphs: [
                    'Your Aicardly account is ready. Build your AI digital business card, share it with a QR code or NFC tap, and let your AI assistant answer visitors 24/7.',
                    `You signed up with <b>${email}</b>.`,
                ],
                button: { label: 'Open my dashboard', url: `${SITE}/login` },
                footer: "Didn't create this account? Just ignore this email.",
            }),
        });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { name: user.name, email: user.email, plan: user.plan } });
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

        const user = await findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            logEvent(req, 'auth.login.failed', user ? 'Wrong password' : 'No account with this email', { level: 'warn', email, userId: user?._id });
            return res.status(400).json({ msg: 'Invalid email or password.' });
        }
        if (user.status === 'inactive') {
            logEvent(req, 'auth.login.blocked', 'Login to an inactive account', { level: 'warn', email, userId: user._id });
            return res.status(403).json({ msg: 'This account is inactive. Please contact support.' });
        }

        logEvent(req, 'auth.login', 'Signed in', { userId: user._id, email });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { name: user.name, email: user.email, plan: user.plan } });
    } catch (err) {
        logEvent(req, 'auth.login.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not sign in. Please try again.' });
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
        const token = crypto.randomBytes(32).toString('hex');
        user.resetTokenHash = sha256(token);
        user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        const link = `${SITE}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;
        const sent = await sendMail({
            to: user.email,
            subject: 'Reset your Aicardly password',
            text: `Hi ${user.firstName || user.name},\n\nReset your password with this link (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, ignore this email.\n\n– Team Aicardly`,
            html: emailHtml({
                heading: 'Reset your password',
                paragraphs: [`Hi ${user.firstName || user.name}, we got a request to reset your Aicardly password.`, 'This link works for 1 hour.'],
                button: { label: 'Set a new password', url: link },
                footer: "Didn't ask for this? Ignore this email and your password stays the same.",
            }),
        });
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
        if (typeof password !== 'string' || password.length < 6) return res.status(400).json({ msg: 'Password must be at least 6 characters.' });
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
        await user.save();
        logEvent(req, 'auth.reset', 'Password changed with a reset link', { userId: user._id, email: user.email });
        res.json({ msg: 'Password updated. You can sign in now.' });
    } catch (err) {
        logEvent(req, 'auth.reset.error', err.message, { level: 'error', email });
        res.status(500).json({ msg: 'Could not reset the password. Please try again.' });
    }
});

module.exports = router;
