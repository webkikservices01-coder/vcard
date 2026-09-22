import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" updated="18 July 2026">
    <p>
      This Privacy Policy explains how <strong>{COMPANY.name}</strong> ("Company", "We", "Us", "Our")
      collects, uses, and protects your information when you use Webcard.ai (the "Service"). By using
      the Service, you agree to the collection and use of information as described here.
    </p>

    <H2>1. Information We Collect</H2>
    <ul>
      <li><strong>Account data:</strong> name, email, phone number, and password (stored encrypted).</li>
      <li><strong>vCard content:</strong> profile details, images, products, portfolio, and links you add to your card.</li>
      <li><strong>Payment data:</strong> processed directly by our payment partner, Cashfree — we do not store your card details.</li>
      <li><strong>Usage data:</strong> profile views, link taps, and QR scans on your card, collected to power your analytics dashboard.</li>
      <li><strong>Chat/voice data:</strong> messages sent to your AI chat widget or voice assistant, used to generate responses and improve accuracy for your card.</li>
    </ul>

    <H2>2. How We Use Your Information</H2>
    <ul>
      <li>To create and operate your digital vCard and dashboard.</li>
      <li>To process payments and activate your subscribed plan.</li>
      <li>To power the AI chat widget and voice assistant using your profile data.</li>
      <li>To send you service-related communications (receipts, support replies).</li>
      <li>To improve the Service and troubleshoot issues.</li>
    </ul>

    <H2>3. Sharing of Information</H2>
    <p>We do not sell your personal data. We share information only with:</p>
    <ul>
      <li><strong>Payment processing:</strong> Cashfree, to complete transactions.</li>
      <li><strong>AI providers:</strong> the underlying AI model provider, to generate chat/voice replies.</li>
      <li><strong>Legal requirements:</strong> if required by law or to protect our rights.</li>
    </ul>

    <H2>4. Public vCard Visibility</H2>
    <p>
      Content you choose to add to your public vCard (name, bio, contact links, products, portfolio,
      gallery, testimonials) is visible to anyone who visits your card's public link. Do not add
      information you don't want publicly visible.
    </p>

    <H2>5. Cookies</H2>
    <p>
      We use essential cookies/local storage to keep you signed in and remember your preferences.
      We do not use third-party advertising trackers.
    </p>

    <H2>6. Data Security</H2>
    <p>
      We use industry-standard measures (encrypted passwords, secure connections) to protect your data.
      No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
    </p>

    <H2>7. Your Rights</H2>
    <p>
      You can access, update, or delete your vCard content at any time from your dashboard. To request
      full account deletion, contact us using the details below.
    </p>

    <H2>8. Children's Privacy</H2>
    <p>The Service is not directed at anyone under the age of 13, and we do not knowingly collect data from children.</p>

    <H2>9. Changes to This Policy</H2>
    <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the date above.</p>

    <H2>Contact Us</H2>
    <p>
      For privacy-related questions, contact us at{' '}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
    </p>
    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default PrivacyPolicy;
