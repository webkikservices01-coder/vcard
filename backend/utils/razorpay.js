// Razorpay Payment Links API (https://razorpay.com/docs/api/payments/payment-links/).
// Keys come from the environment: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET.
const crypto = require('crypto');
const axios = require('axios');

// RAZORPAY_API_BASE only for local tests against a mock server.
const API = process.env.RAZORPAY_API_BASE || 'https://api.razorpay.com/v1';
const isRazorpayConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const client = () =>
  axios.create({
    baseURL: API,
    timeout: 15000,
    auth: { username: process.env.RAZORPAY_KEY_ID, password: process.env.RAZORPAY_KEY_SECRET },
  });

const errMsg = (err) => err.response?.data?.error?.description || err.message;

// Creates a link that stops working at expiresAt. Razorpay's own SMS/email are off: we send ours.
async function createPaymentLink({ amount, referenceId, description, customer, expiresAt, callbackUrl, notes }) {
  try {
    const { data } = await client().post('/payment_links', {
      amount,
      currency: 'INR',
      accept_partial: false,
      reference_id: referenceId,
      description,
      customer,
      notify: { sms: false, email: false },
      reminder_enable: false,
      expire_by: Math.floor(new Date(expiresAt).getTime() / 1000),
      callback_url: callbackUrl,
      callback_method: 'get',
      notes,
    });
    return { id: data.id, url: data.short_url };
  } catch (err) {
    throw new Error(`Razorpay: ${errMsg(err)}`);
  }
}

async function fetchPaymentLink(id) {
  try {
    const { data } = await client().get(`/payment_links/${id}`);
    return data; // { status: created | paid | expired | cancelled, payments: [...] }
  } catch (err) {
    throw new Error(`Razorpay: ${errMsg(err)}`);
  }
}

// Best-effort: an old link is cancelled when a new one replaces it.
async function cancelPaymentLink(id) {
  try {
    await client().post(`/payment_links/${id}/cancel`);
    return true;
  } catch {
    return false;
  }
}

// X-Razorpay-Signature = HMAC-SHA256(raw body, webhook secret), hex.
function verifyRazorpaySignature(rawBody, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !rawBody || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = { isRazorpayConfigured, createPaymentLink, fetchPaymentLink, cancelPaymentLink, verifyRazorpaySignature };
