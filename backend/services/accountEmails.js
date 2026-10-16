// Account emails with a one-time link: email verification and password reset.
// Used by the sign-up / forgot-password flow (routes/auth.js) and by the admin panel.
const crypto = require('crypto');
const { sendMail, emailHtml } = require('../utils/mailer');
const { emailText } = require('./emailTemplates');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const VERIFY_HOURS = 24;
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Creates a fresh verification link for the user and emails it. Returns true when sent.
async function sendVerification(user) {
  const token = crypto.randomBytes(32).toString('hex');
  user.verifyTokenHash = sha256(token);
  user.verifyTokenExpiry = new Date(Date.now() + VERIFY_HOURS * 60 * 60 * 1000);
  await user.save();
  const first = user.firstName || user.name;
  const link = `${SITE}/verify-email?email=${encodeURIComponent(user.email)}&token=${token}`;
  const t = await emailText('verify', { name: first });
  return sendMail({
    to: user.email,
    subject: t.subject,
    text: `Hi ${first},\n\nPlease verify your email to activate your AiCardly account (link valid for ${VERIFY_HOURS} hours):\n${link}\n\nIf you didn't sign up, ignore this email.\n\n– Team AiCardly`,
    html: emailHtml({
      heading: t.heading,
      paragraphs: [
        t.intro,
        `This link works for ${VERIFY_HOURS} hours.`,
      ],
      button: { label: 'Verify my email', url: link },
      footer: "Didn't create this account? Just ignore this email.",
    }),
  });
}

// Creates a one-hour password reset link and emails it. Returns true when sent.
async function sendResetLink(user) {
  const token = crypto.randomBytes(32).toString('hex');
  user.resetTokenHash = sha256(token);
  user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();
  const link = `${SITE}/reset-password?email=${encodeURIComponent(user.email)}&token=${token}`;
  const t = await emailText('reset', { name: user.firstName || user.name });
  return sendMail({
    to: user.email,
    subject: t.subject,
    text: `Hi ${user.firstName || user.name},\n\nReset your password with this link (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, ignore this email.\n\n– Team AiCardly`,
    html: emailHtml({
      heading: t.heading,
      paragraphs: [t.intro, 'This link works for 1 hour.'],
      button: { label: 'Set a new password', url: link },
      footer: "Didn't ask for this? Ignore this email and your password stays the same.",
    }),
  });
}

module.exports = { sendVerification, sendResetLink, sha256, SITE };
