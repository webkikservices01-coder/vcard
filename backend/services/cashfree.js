// Cashfree Payment Gateway: checkout orders (the plans page, the upgrade page) and payment links
// (sent by SMS to free-trial users whose 24 hours are up). Env: CASHFREE_ENV (production |
// sandbox), CASHFREE_CLIENT_ID, CASHFREE_CLIENT_SECRET.
const CF_ENV = process.env.CASHFREE_ENV === 'production' ? 'production' : 'sandbox';
// CASHFREE_API_BASE only for local tests against a mock server.
const CF_BASE_URL = process.env.CASHFREE_API_BASE || (CF_ENV === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg');
const CF_API_VERSION = '2025-01-01';

const cfHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-version': CF_API_VERSION,
  'x-client-id': process.env.CASHFREE_CLIENT_ID,
  'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
});

const isCashfreeConfigured = () => !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);

async function cf(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${CF_BASE_URL}${path}`, { method, headers: cfHeaders(), body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Cashfree ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Indian mobile as Cashfree wants it (10 digits starting 6 to 9), or '' if it isn't one.
function indianMobile(phone) {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}

const customerOf = (user) => ({
  customer_id: String(user._id),
  customer_name: user.name || 'Customer',
  customer_email: user.email || 'customer@aicardly.com',
  customer_phone: indianMobile(user.phone) || '9999999999',
});

const createOrder = ({ orderId, amount, user, returnUrl, tags }) =>
  cf('/orders', {
    method: 'POST',
    body: {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: customerOf(user),
      order_meta: { return_url: returnUrl },
      ...(tags ? { order_tags: tags } : {}),
    },
  });

const getOrder = (orderId) => cf(`/orders/${encodeURIComponent(orderId)}`);

// A payment link Cashfree sends to the customer itself (SMS when sendSms), so no SMS provider of
// our own is needed. link_status: ACTIVE | PAID | PARTIALLY_PAID | EXPIRED | CANCELLED.
const createLink = ({ linkId, amount, purpose, user, phone, sendSms, expiresAt, returnUrl, notifyUrl, notes }) =>
  cf('/links', {
    method: 'POST',
    body: {
      link_id: linkId,
      link_amount: amount,
      link_currency: 'INR',
      link_purpose: purpose.slice(0, 500),
      customer_details: { customer_phone: phone, customer_email: user.email, customer_name: user.name || 'Customer' },
      link_partial_payments: false,
      link_expiry_time: expiresAt.toISOString(),
      link_notify: { send_sms: !!sendSms, send_email: false },
      link_auto_reminders: true,
      link_meta: { return_url: returnUrl, notify_url: notifyUrl },
      ...(notes ? { link_notes: notes } : {}),
    },
  });

const getLink = (linkId) => cf(`/links/${encodeURIComponent(linkId)}`);

module.exports = { CF_ENV, CF_BASE_URL, cfHeaders, isCashfreeConfigured, indianMobile, createOrder, getOrder, createLink, getLink };
