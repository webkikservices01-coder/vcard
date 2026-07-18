import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const RefundPolicy = () => (
  <LegalLayout title="Refund Policy" updated="18 July 2026">
    <p>
      This Refund Policy applies to all paid plans (Digital Card, Smart AI Card, AI Agent Pro)
      purchased on Webcard.ai, operated by <strong>{COMPANY.name}</strong>.
    </p>

    <H2>1. Digital Subscription Service</H2>
    <p>
      Webcard.ai is a digital subscription service — your plan is activated instantly upon successful
      payment, giving you immediate access to the features included in that plan. Because access is
      granted immediately, refunds are limited as described below.
    </p>

    <H2>2. Eligibility for Refund</H2>
    <ul>
      <li>
        <strong>Duplicate or failed payment:</strong> if you were charged more than once for the same
        plan, or charged but your plan was not activated due to a technical error, you are eligible
        for a full refund of the duplicate/failed amount.
      </li>
      <li>
        <strong>Within 24 hours, unused:</strong> if you request a refund within 24 hours of purchase
        and have not used any paid feature (no AI chat/voice interactions, no upgraded content added),
        we will review the request and may issue a full or partial refund at our discretion.
      </li>
      <li>
        <strong>Service outage:</strong> if a verified, prolonged outage on our end prevented you from
        using a plan you paid for, we will offer a refund or plan extension for the affected period.
      </li>
    </ul>

    <H2>3. Non-Refundable Cases</H2>
    <ul>
      <li>Change of mind after actively using paid features (AI chat, voice assistant, premium themes) for more than 24 hours.</li>
      <li>Partial-month refunds for early cancellation of a monthly or yearly plan.</li>
      <li>Refund requests made after the plan's billing period has ended.</li>
      <li>Third-party payment gateway charges/fees, where applicable.</li>
    </ul>

    <H2>4. How to Request a Refund</H2>
    <p>
      Email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a> with your registered email address and
      transaction/order ID (visible under Dashboard → Transactions). We aim to respond within 2
      business days.
    </p>

    <H2>5. Refund Processing Time</H2>
    <p>
      Approved refunds are processed back to your original payment method via Cashfree within
      5–7 business days, depending on your bank/payment provider.
    </p>

    <H2>Contact Us</H2>
    <p>
      For refund requests, reach us at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
    </p>
    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default RefundPolicy;
