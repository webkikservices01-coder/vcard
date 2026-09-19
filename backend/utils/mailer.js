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

// Best-effort notification — never throws, so a lead is saved to the DB
// regardless of whether email delivery is configured or succeeds.
const sendMail = async ({ to, subject, text }) => {
  const t = getTransporter();
  if (!t) {
    console.log(`[mailer] SMTP not configured — skipping email "${subject}" to ${to}`);
    return;
  }
  try {
    await t.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
  } catch (err) {
    console.error('[mailer] send failed:', err.message);
  }
};

module.exports = { sendMail };
