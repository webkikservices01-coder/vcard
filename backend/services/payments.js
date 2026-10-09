// Turning a paid Cashfree order or payment link into an active plan (shared by the plans page,
// the upgrade page, payment links and the webhook).
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const refrens = require('../utils/refrens');
const { logEvent } = require('../utils/logger');
const { recordPlan } = require('./planHistory');

const makeInvoiceNumber = (txn) => `INV-${new Date(txn.createdAt).getFullYear()}-${String(txn._id).slice(-6).toUpperCase()}`;

// Marks a transaction paid, activates the plan, and (best-effort) creates a Refrens invoice.
// Refrens failures never block payment confirmation; the local PDF invoice remains the fallback.
// Safe to call twice: a completed transaction is left alone.
async function markCompleted(txn) {
  // Claim it atomically, so the webhook and the browser's verify can't both activate the plan.
  const claimed = await Transaction.findOneAndUpdate(
    { _id: txn._id, status: { $ne: 'completed' } },
    { $set: { status: 'completed', invoiceNumber: makeInvoiceNumber(txn) } },
    { new: true }
  );
  if (!claimed) return false;
  txn = claimed;

  // Renewing the same plan early adds to the time left instead of restarting it.
  const user = await User.findById(txn.userId).select('plan planExpiry');
  const renewing = user && user.plan === txn.plan && user.planExpiry && new Date(user.planExpiry) > new Date();
  const expiry = renewing ? new Date(user.planExpiry) : new Date();
  expiry.setDate(expiry.getDate() + (txn.expireDays || 365));
  await User.findByIdAndUpdate(txn.userId, { $set: { plan: txn.plan, planExpiry: expiry } });
  // Plan history for the admin panel; never blocks the payment confirmation.
  recordPlan({
    userId: txn.userId, planName: txn.plan, tier: txn.plan, source: 'purchase',
    startAt: renewing ? new Date(user.planExpiry) : new Date(), endAt: expiry,
    amount: txn.amount, transactionId: txn._id,
  }).catch((err) => logEvent(null, 'plan.history.error', err.message, { level: 'error', userId: txn.userId }));
  logEvent(null, 'payment.paid', `Paid ₹${txn.amount} for ${txn.plan} (${txn.billingType}); plan active until ${expiry.toDateString()}`, { userId: txn.userId, meta: { orderId: txn.cfOrderId, linkId: txn.cfLinkId, source: txn.source, invoice: txn.invoiceNumber } });

  if (refrens.isConfigured()) {
    try {
      const u = await User.findById(txn.userId);
      const invoice = await refrens.createInvoice(txn, u);
      txn.refrensInvoiceId = invoice.id;
      txn.refrensPdfUrl = invoice.pdfUrl;
      await txn.save();
    } catch (err) {
      logEvent(null, 'invoice.refrens.failed', err.message, { level: 'error', userId: txn.userId, meta: { orderId: txn.cfOrderId } });
    }
  }
  return true;
}

module.exports = { markCompleted, makeInvoiceNumber };
