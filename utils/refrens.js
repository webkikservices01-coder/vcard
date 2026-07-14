// Refrens invoicing integration — https://www.refrens.com/api/docs/
// REFRENS_BASE_URL defaults to Refrens' standard API host; override via env if that's wrong.
const REFRENS_BASE_URL = process.env.REFRENS_BASE_URL || 'https://api.refrens.com';

const isConfigured = () => Boolean(
    process.env.REFRENS_APP_ID && process.env.REFRENS_APP_SECRET && process.env.REFRENS_URL_KEY
);

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const res = await fetch(`${REFRENS_BASE_URL}/authentication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            strategy: 'app-secret',
            appId: process.env.REFRENS_APP_ID,
            appSecret: process.env.REFRENS_APP_SECRET,
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Refrens authentication failed');

    cachedToken = data.accessToken;
    tokenExpiresAt = Date.now() + 50 * 60 * 1000; // refresh a bit before the ~1h token expiry
    return cachedToken;
}

// Creates a Refrens invoice for a completed transaction. Returns { id, pdfUrl, link } or throws.
async function createInvoice(txn, user) {
    const token = await getAccessToken();

    const res = await fetch(`${REFRENS_BASE_URL}/businesses/${process.env.REFRENS_URL_KEY}/invoices`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
            billedTo: {
                name: user?.name || 'Customer',
                email: user?.email || undefined,
                phone: user?.phone || undefined,
                country: 'IN',
            },
            items: [{
                name: `${txn.plan} Plan (${txn.billingType || 'Yearly'})`,
                rate: txn.amount,
                quantity: 1,
            }],
            currency: 'INR',
            ...(user?.email && {
                email: {
                    to: { name: user?.name || 'Customer', email: user.email },
                },
            }),
        }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Refrens invoice creation failed');

    return { id: data._id, pdfUrl: data.share?.pdf || '', link: data.share?.link || '' };
}

module.exports = { isConfigured, createInvoice };
