const nodemailer = require('nodemailer');

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
};

const isMailConfigured = () => !!getTransporter();

// Best-effort — never throws, so the caller's work (a sign-up, a saved lead) always completes.
// Returns true when the email was handed to the SMTP server. Every attempt is logged
// (mail.sent / mail.failed / mail.skipped) for the admin Logs page.
const sendMail = async ({ to, subject, text, html }) => {
  // Required here, not at the top: logger → AppLog model, loaded after mongoose is set up.
  const { logEvent } = require('./logger');
  const t = getTransporter();
  if (!t) {
    logEvent(null, 'mail.skipped', `Email not sent (SMTP not configured): "${subject}"`, { level: 'warn', email: to });
    return false;
  }
  try {
    const from = process.env.SMTP_FROM || `Aicardly <${process.env.SMTP_USER}>`;
    const info = await t.sendMail({ from, to, subject, text, html });
    logEvent(null, 'mail.sent', `Email sent: "${subject}"`, { email: to, meta: { messageId: info.messageId } });
    return true;
  } catch (err) {
    logEvent(null, 'mail.failed', `Email failed: "${subject}" – ${err.message}`, { level: 'error', email: to });
    return false;
  }
};

// Simple branded HTML email: heading, paragraphs, optional button.
const emailHtml = ({ heading, paragraphs = [], button, footer }) => `<!doctype html>
<html><body style="margin:0;background:#f6f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#E70C65;padding:18px 24px;color:#ffffff;font-size:20px;font-weight:bold">Aicardly</td></tr>
<tr><td style="padding:24px">
<h1 style="margin:0 0 12px;font-size:20px">${heading}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;color:#374151">${p}</p>`).join('')}
${button ? `<p style="margin:20px 0"><a href="${button.url}" style="display:inline-block;background:#E70C65;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${button.label}</a></p>` : ''}
${footer ? `<p style="margin:16px 0 0;font-size:12px;color:#6b7280">${footer}</p>` : ''}
</td></tr>
<tr><td style="padding:14px 24px;background:#faf8f9;font-size:12px;color:#6b7280">Aicardly by Webkik Services · aicardly.com</td></tr>
</table></td></tr></table></body></html>`;

module.exports = { sendMail, emailHtml, isMailConfigured };
