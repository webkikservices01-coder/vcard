// WhatsApp Business Cloud API (Meta). Template messages only: they can be sent to anyone at any
// time (free-form text needs the customer to have messaged in the last 24h).
// Env: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN,
//      WHATSAPP_API_VERSION (default v21.0), WA_TEMPLATE_LANG (default en).
const crypto = require('crypto');
const axios = require('axios');

const isWhatsAppConfigured = () => !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

const TEMPLATES = {
  payment_link: () => process.env.WA_TEMPLATE_PAYMENT_LINK || 'payment_link_template',
  card_delivery: () => process.env.WA_TEMPLATE_CARD_DELIVERY || 'card_delivery_template',
  payment_reminder: () => process.env.WA_TEMPLATE_REMINDER || 'payment_reminder_template',
  // AI "send me your services on WhatsApp" (services/whatsappInfo.js):
  // card_info body: {{1}} visitor name, {{2}} owner name, {{3}} the details, {{4}} card link
  card_info: () => process.env.WA_TEMPLATE_CARD_INFO || 'card_info',
  // lead_alert body: {{1}} owner first name, {{2}} visitor name, {{3}} visitor number, {{4}} what they asked
  lead_alert: () => process.env.WA_TEMPLATE_LEAD_ALERT || 'lead_alert',
};

// type: payment_link | card_delivery | payment_reminder
// body: values for {{1}}, {{2}}, … in the template body.
// document: { link, filename } for a template with a DOCUMENT header.
// Returns the WhatsApp message id; throws with Meta's error message on failure.
async function sendTemplate({ to, type, body = [], document }) {
  if (!isWhatsAppConfigured()) throw new Error('WhatsApp is not configured');
  const components = [];
  if (document) components.push({ type: 'header', parameters: [{ type: 'document', document }] });
  if (body.length) components.push({ type: 'body', parameters: body.map((text) => ({ type: 'text', text: String(text) })) });
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  try {
    const { data } = await axios.post(
      // WHATSAPP_API_BASE only for local tests against a mock server.
      `${process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'}/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: String(to).replace(/^\+/, ''),
        type: 'template',
        template: { name: TEMPLATES[type](), language: { code: process.env.WA_TEMPLATE_LANG || 'en' }, components },
      },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }, timeout: 15000 }
    );
    return data.messages?.[0]?.id || '';
  } catch (err) {
    const e = err.response?.data?.error;
    throw new Error(e ? `WhatsApp ${e.code}: ${e.error_data?.details || e.message}` : err.message);
  }
}

// X-Hub-Signature-256 = "sha256=" + HMAC-SHA256(raw body, app secret).
function verifyWhatsAppSignature(rawBody, header) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !rawBody || !header) return false;
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(header));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { isWhatsAppConfigured, sendTemplate, verifyWhatsAppSignature };
