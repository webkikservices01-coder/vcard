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
const sendMail = async ({ to, subject, text, html, attachments, replyTo, icalEvent }) => {
  // Required here, not at the top: logger → AppLog model, loaded after mongoose is set up.
  const { logEvent } = require('./logger');
  const t = getTransporter();
  if (!t) {
    logEvent(null, 'mail.skipped', `Email not sent (SMTP not configured): "${subject}"`, { level: 'warn', email: to });
    return false;
  }
  try {
    const from = process.env.SMTP_FROM || `AiCardly <${process.env.SMTP_USER}>`;
    // The logo goes inside the email (cid:), so it shows even where remote images are blocked.
    const files = [...(attachments || [])];
    if (html && html.includes(`cid:${LOGO_CID}`)) files.push({ filename: 'aicardly-logo.png', path: LOGO_FILE, cid: LOGO_CID, contentDisposition: 'inline' });
    const info = await t.sendMail({
      from, to, subject, text, html, attachments: files,
      ...(icalEvent ? { icalEvent } : {}), // calendar invite (Gmail/Outlook show Add to calendar)
      replyTo: replyTo || BRAND.contact,
      headers: { 'X-Entity-Ref-ID': `${Date.now()}`, 'Auto-Submitted': 'auto-generated' },
    });
    logEvent(null, 'mail.sent', `Email sent: "${subject}"`, { email: to, meta: { messageId: info.messageId } });
    return true;
  } catch (err) {
    logEvent(null, 'mail.failed', `Email failed: "${subject}" – ${err.message}`, { level: 'error', email: to });
    return false;
  }
};

// Simple branded HTML email: heading, paragraphs, optional button.
// Brand details shown on every email. Social links can be changed with env vars
// (SOCIAL_INSTAGRAM, SOCIAL_THREADS, SOCIAL_FACEBOOK, SOCIAL_LINKEDIN, SOCIAL_YOUTUBE); empty = not shown.
const BRAND = {
  name: 'AiCardly',
  site: (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, ''),
  contact: process.env.CONTACT_EMAIL || 'supportaicardly@gmail.com',
};
const SOCIALS = [
  ['Instagram', process.env.SOCIAL_INSTAGRAM ?? 'https://www.instagram.com/aicardly/'],
  ['Threads', process.env.SOCIAL_THREADS ?? 'https://www.threads.net/@aicardly'],
  ['YouTube', process.env.SOCIAL_YOUTUBE ?? ''],
  // Aicardly's own pages (the old defaults pointed at Webkik's).
  ['Facebook', process.env.SOCIAL_FACEBOOK ?? 'https://www.facebook.com/share/19ZQsqTj1Z/'],
  ['LinkedIn', process.env.SOCIAL_LINKEDIN ?? 'https://www.linkedin.com/in/ai-cardly-360718442/'],
].filter(([, url]) => /^https:\/\//.test(url));

// The Aicardly logo (served by this backend at /brand/email-logo.png). Its cell is white with a
// pink "A" as alt text, so it still reads as the logo where email images are blocked.
const LOGO_CID = 'aicardly-logo';
const LOGO_FILE = require('path').join(__dirname, '..', 'assets', 'brand', 'email-logo.png');
const LOGO_URL = process.env.EMAIL_LOGO_URL || `cid:${LOGO_CID}`;
const logoHtml = `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="width:40px;height:40px;border-radius:11px;background:#ffffff;text-align:center;vertical-align:middle"><img src="${LOGO_URL}" width="40" height="40" alt="A" style="display:block;width:40px;height:40px;border:0;border-radius:11px;color:#E70C65;font-size:22px;font-weight:800;line-height:40px;text-align:center;font-family:Arial,Helvetica,sans-serif"></td>
<td style="padding-left:10px;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:.2px;font-family:Arial,Helvetica,sans-serif">Ai<span style="font-weight:700">Cardly</span></td>
</tr></table>`;

const footerHtml = () => `<tr><td style="padding:20px 24px 22px;background:#faf8f9;border-top:1px solid #f0e6eb;text-align:center;font-family:Arial,Helvetica,sans-serif">
${SOCIALS.length ? `<p style="margin:0 0 12px">${SOCIALS.map(([label, url]) => `<a href="${url}" style="display:inline-block;margin:0 4px 6px;padding:6px 12px;border-radius:999px;background:#ffffff;border:1px solid #f3c6da;color:#E70C65;font-size:12px;font-weight:bold;text-decoration:none">${label}</a>`).join('')}</p>` : ''}
<p style="margin:0 0 4px;font-size:12px;color:#6b7280">Questions? Write to <a href="mailto:${BRAND.contact}" style="color:#E70C65;text-decoration:none;font-weight:bold">${BRAND.contact}</a></p>
<p style="margin:0;font-size:12px;color:#9ca3af">${BRAND.name} by Webkik Services · <a href="${BRAND.site}" style="color:#9ca3af">${BRAND.site.replace(/^https?:\/\//, '')}</a></p>
</td></tr>`;

const emailHtml = ({ heading, paragraphs = [], button, footer }) => `<!doctype html>
<html><body style="margin:0;background:#f6f4f5;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.05)">
<tr><td style="background:#E70C65;background-image:linear-gradient(135deg,#E70C65,#9B1FE8);padding:18px 24px">${logoHtml}</td></tr>
<tr><td style="padding:26px 24px 24px">
<h1 style="margin:0 0 12px;font-size:21px;color:#111827">${heading}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#374151">${p}</p>`).join('')}
${button ? `<p style="margin:22px 0"><a href="${button.url}" style="display:inline-block;background:#E70C65;color:#ffffff;text-decoration:none;font-weight:bold;padding:13px 24px;border-radius:10px">${button.label}</a></p>
<p style="margin:0 0 12px;font-size:12px;line-height:1.5;color:#6b7280">Button not working? Copy this link into your browser:<br><a href="${button.url}" style="color:#E70C65;word-break:break-all">${button.url}</a></p>` : ''}
${footer ? `<p style="margin:16px 0 0;font-size:12px;color:#6b7280">${footer}</p>` : ''}
</td></tr>
${footerHtml()}
</table></td></tr></table></body></html>`;

module.exports = { sendMail, emailHtml, isMailConfigured };
