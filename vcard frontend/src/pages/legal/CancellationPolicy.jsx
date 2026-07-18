import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const CancellationPolicy = () => (
  <LegalLayout title="Cancellation Policy" updated="18 July 2026">
    <p>
      This Cancellation Policy explains how you can cancel your Webcard.ai subscription, operated by{' '}
      <strong>{COMPANY.name}</strong>.
    </p>

    <H2>1. Cancelling Your Plan</H2>
    <p>
      You may cancel auto-renewal for your plan at any time from Dashboard → Plans, or by contacting
      our support team. Cancelling stops future billing — it does not immediately revoke access.
    </p>

    <H2>2. Access After Cancellation</H2>
    <p>
      When you cancel, your plan (and its features — AI chat, voice assistant, premium themes, etc.)
      remains active until the end of the billing period you already paid for. After that date, your
      account reverts to the free tier: your vCard and its public link stay live, but paid features
      are disabled.
    </p>

    <H2>3. Your Data After Cancellation</H2>
    <p>
      We do not delete your vCard, products, portfolio, or gallery content when a plan expires — only
      the plan-gated features (AI chat/voice, hide-branding, etc.) are turned off. Your public card
      link continues to work on the free tier.
    </p>

    <H2>4. Cancelling Mid-Cycle</H2>
    <p>
      Cancelling in the middle of a billing period does not generate a prorated refund for the unused
      portion — see our <a href="/refund-policy">Refund Policy</a> for the limited cases where a refund
      applies.
    </p>

    <H2>5. Account Deletion</H2>
    <p>
      If you want your account and all associated data permanently deleted (rather than just letting a
      plan lapse), email us and we will process the deletion within a reasonable timeframe, subject to
      any legal record-keeping requirements.
    </p>

    <H2>How to Cancel</H2>
    <p>
      Go to Dashboard → Plans and use the cancel option, or email{' '}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> / call{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a> with your registered email address.
    </p>
    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default CancellationPolicy;
