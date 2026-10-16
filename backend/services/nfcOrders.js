// Metal NFC card orders (models/NfcOrder.js): numbering, the order from the website form, and
// the "shipped" / "delivered" emails to the customer.
const NfcOrder = require('../models/NfcOrder');
const { sendMail, emailHtml } = require('../utils/mailer');
const { emailText } = require('./emailTemplates');
const { logEvent } = require('../utils/logger');

const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// NFC-2026-0001, NFC-2026-0002 … (retries if two orders arrive at the same moment).
async function nextNumber() {
  const year = new Date().getFullYear();
  const last = await NfcOrder.findOne({ number: new RegExp(`^NFC-${year}-`) }).sort({ number: -1 }).select('number').lean();
  const n = last ? Number(last.number.split('-')[2]) + 1 : 1;
  return `NFC-${year}-${String(n).padStart(4, '0')}`;
}

async function createOrder(data, by = '') {
  for (let i = 0; i < 4; i++) {
    try {
      return await NfcOrder.create({ ...data, number: await nextNumber(), history: [{ status: 'new', note: data.source === 'form' ? 'Order form on the website' : 'Added in the admin panel', by }] });
    } catch (err) {
      if (err.code !== 11000 || i === 3) throw err;
    }
  }
  return null;
}

// From the /metal-nfc-card order form (routes/ai.js platform-lead, source "metal-card").
async function orderFromLead(lead) {
  try {
    if (await NfcOrder.exists({ lead: lead._id })) return null;
    return await createOrder({ source: 'form', lead: lead._id, name: lead.name, phone: lead.phone, email: lead.email, company: lead.businessName, design: [lead.need, lead.message].filter(Boolean).join('\n') }, 'website');
  } catch (err) {
    logEvent(null, 'nfc_order.create.failed', err.message, { level: 'error' });
    return null;
  }
}

async function notifyCustomer(order, status) {
  const key = status === 'shipped' ? 'nfcShipped' : 'nfcDelivered';
  const first = String(order.name || '').split(' ')[0];
  const t = await emailText(key, { name: first, number: order.number, courier: order.courier, tracking: order.trackingNumber });
  if (!t.enabled) return false;
  const when = order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'short' }) : '';
  const lines = status === 'shipped'
    ? [order.courier && `<b>Courier:</b> ${esc(order.courier)}`, order.trackingNumber && `<b>Tracking number:</b> ${esc(order.trackingNumber)}`, when && `<b>Expected delivery:</b> ${esc(when)}`].filter(Boolean).join('<br>')
    : '';
  try {
    return await sendMail({
      to: order.email,
      subject: t.subject,
      text: `${t.heading}\n\n${t.intro.replace(/<[^>]+>/g, '')}\n${status === 'shipped' ? `\nCourier: ${order.courier || '-'}\nTracking: ${order.trackingNumber || '-'}${order.trackingUrl ? `\nTrack it: ${order.trackingUrl}` : ''}${when ? `\nExpected: ${when}` : ''}\n` : ''}\nOrder ${order.number}\n\n– Team Aicardly`,
      html: emailHtml({
        heading: esc(t.heading),
        paragraphs: [t.intro, lines, `Order <b>${esc(order.number)}</b>`].filter(Boolean),
        ...(status === 'shipped' && order.trackingUrl ? { button: { label: 'Track my card', url: order.trackingUrl } } : {}),
        footer: 'Questions about your order? Just reply to this email.',
      }),
    });
  } catch (err) {
    logEvent(null, 'nfc_order.email.failed', err.message, { level: 'warn' });
    return false;
  }
}

module.exports = { createOrder, orderFromLead, notifyCustomer };
