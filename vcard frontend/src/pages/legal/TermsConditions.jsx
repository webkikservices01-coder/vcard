import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const TermsConditions = () => (
  <LegalLayout title="Terms & Conditions" updated="18 July 2026">
    <p>
      These Terms & Conditions ("Terms") govern your access to and use of Webcard.ai, the digital
      business card platform operated by <strong>{COMPANY.name}</strong> ("Company", "We", "Us", "Our").
      By creating an account, subscribing to a plan, or using any part of the Service, you agree to
      be bound by these Terms.
    </p>

    <H2>1. The Service</H2>
    <p>
      Webcard.ai lets you create, customize, and share a digital business card (a "vCard"), along with
      optional AI features such as an AI chat widget and voice assistant on plans that include them.
      Features available to your account depend on the plan you are subscribed to.
    </p>

    <H2>2. Account Registration</H2>
    <ul>
      <li>You must provide accurate information when creating an account.</li>
      <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
      <li>You are responsible for all activity that occurs under your account.</li>
    </ul>

    <H2>3. Plans & Pricing</H2>
    <p>
      All plan prices shown on the Plans page are final at the time of purchase. Upgrading unlocks the
      corresponding features immediately; downgrading takes effect from your next billing cycle.
      Payments are processed securely via Cashfree.
    </p>

    <H2>4. Content You Submit</H2>
    <p>
      You retain ownership of all content you upload to your vCard (name, bio, images, products,
      portfolio, testimonials, etc.). By uploading content, you grant {COMPANY.name} a limited license
      to host, display, and transmit that content solely to operate the Service. You are responsible
      for ensuring you have the rights to any content you upload.
    </p>

    <H2>5. Acceptable Use</H2>
    <p>You agree not to use the Service to:</p>
    <ul>
      <li>Impersonate any person or entity, or misrepresent your affiliation with one.</li>
      <li>Upload unlawful, defamatory, obscene, or infringing content.</li>
      <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service.</li>
      <li>Use the AI chat/voice features to generate spam, harassment, or abusive content.</li>
    </ul>

    <H2>6. AI Features</H2>
    <p>
      The AI chat widget and voice assistant are powered by third-party AI models. Responses are
      generated automatically and, while we tune them using your provided profile information, they
      may occasionally be inaccurate. {COMPANY.name} is not liable for decisions made based on AI-generated
      responses.
    </p>

    <H2>7. Suspension & Termination</H2>
    <p>
      We may suspend or terminate accounts that violate these Terms, engage in fraudulent payment
      activity, or misuse the Service. You may close your account at any time by contacting support.
    </p>

    <H2>8. Limitation of Liability</H2>
    <p>
      The Service is provided "as is". To the maximum extent permitted by law, {COMPANY.name} shall not
      be liable for any indirect, incidental, or consequential damages arising from your use of the
      Service.
    </p>

    <H2>9. Changes to These Terms</H2>
    <p>
      We may update these Terms from time to time. Continued use of the Service after changes are
      posted constitutes acceptance of the revised Terms.
    </p>

    <H2>10. Governing Law</H2>
    <p>These Terms are governed by the laws of India, with courts in Delhi having exclusive jurisdiction.</p>

    <H2>Contact Us</H2>
    <p>
      Questions about these Terms can be sent to{' '}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
    </p>
    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default TermsConditions;
