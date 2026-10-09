import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const TermsConditions = () => (
  <LegalLayout title="Terms & Conditions" updated="9 October 2026">
    <p>
      These Terms & Conditions ("Terms") govern your access to and use of Aicardly, the digital
      business card platform operated by <strong>{COMPANY.name}</strong> ("Company", "We", "Us", "Our").
      By creating an account, subscribing to a plan, or using any part of the Service, you agree to
      be bound by these Terms.
    </p>

    <H2>1. The Service</H2>
    <p>
      Aicardly lets you create, customize, and share a digital business card (your "card"), along with
      optional AI features such as an AI chatbot and AI voice and video calls on plans that include
      them, digital invitations, and a premium metal NFC card sold as a physical product. Features
      available to your account depend on the plan you are subscribed to.
    </p>

    <H2>2. Account Registration</H2>
    <ul>
      <li>You must be at least 18 years old, or have a parent's or guardian's consent, to create an account.</li>
      <li>You must provide accurate information when creating an account and keep it up to date.</li>
      <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
      <li>You are responsible for all activity that occurs under your account.</li>
    </ul>

    <H2>3. Plans & Pricing</H2>
    <p>
      Plan prices shown on the Plans page are before GST; 18% GST is added at checkout and shown
      separately on your invoice. The total you pay is shown before payment. Upgrading unlocks the
      corresponding features immediately; downgrading takes effect from your next billing cycle.
      Payments are processed securely via Cashfree.
    </p>
    <ul>
      <li>
        <strong>Free trial:</strong> new accounts get a 24-hour free trial with no credit card. After 24 hours
        the card pauses until you choose a paid plan. There is no free plan.
      </li>
      <li>
        <strong>Billing period:</strong> monthly plans run for one month and yearly plans for one year from the
        date of payment. When a plan ends and is not renewed, the card pauses; your content is kept.
      </li>
      <li>
        <strong>Usage limits:</strong> each plan has limits (number of cards, card themes, AI chats a month,
        AI call minutes) as listed on the <a href="/pricing">Pricing</a> page. We may pause a feature once
        its limit is reached until the next period or an upgrade.
      </li>
      <li>
        <strong>Price changes:</strong> we may change plan prices. A new price applies from your next renewal,
        never to a period you have already paid for.
      </li>
      <li>
        Refunds and cancellations are covered by our <a href="/refund-policy">Refund Policy</a> and{' '}
        <a href="/cancellation-policy">Cancellation Policy</a>.
      </li>
    </ul>

    <H2>3A. Physical Products (Metal NFC Card)</H2>
    <ul>
      <li>
        Metal NFC cards are made to order with the name, logo and details you approve. Please check them
        carefully before approving; we engrave exactly what you approve.
      </li>
      <li>
        Prices are given as a quote before you pay. The card included with the AI Agent Pro plan is
        provided while that plan is active and paid for at least one full billing period.
      </li>
      <li>
        Delivery, shipping charges, damage in transit and replacements are covered by our{' '}
        <a href="/shipping-policy">Shipping Policy</a>; returns and refunds by our{' '}
        <a href="/refund-policy">Refund Policy</a>.
      </li>
      <li>
        The NFC chip opens your Aicardly card link. It works with most modern NFC-enabled phones; we can't
        guarantee it works with every phone model or phone case.
      </li>
    </ul>

    <H2>4. Content You Submit</H2>
    <p>
      You retain ownership of all content you upload to your card (name, bio, images, products,
      portfolio, testimonials, etc.). By uploading content, you grant {COMPANY.name} a limited license
      to host, display, and transmit that content solely to operate the Service. You are responsible
      for ensuring you have the rights to any content you upload, including photos of other people,
      logos, and testimonials (which must be genuine and shared with the person's consent).
    </p>
    <p>
      Anything you put on your public card can be seen by anyone who has the link. Do not add
      information you don't want to be public.
    </p>

    <H2>5. Acceptable Use</H2>
    <p>You agree not to use the Service to:</p>
    <ul>
      <li>Impersonate any person or entity, or misrepresent your affiliation with one.</li>
      <li>Upload unlawful, defamatory, obscene, or infringing content.</li>
      <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service.</li>
      <li>Use the AI chat/voice features to generate spam, harassment, or abusive content.</li>
      <li>Post false or misleading claims, fake reviews or fake testimonials.</li>
      <li>Collect visitors' personal data through your card without telling them how you will use it.</li>
      <li>Send unsolicited bulk messages to leads captured through your card.</li>
    </ul>

    <H2>6. AI Features</H2>
    <p>
      The AI chat widget and voice assistant are powered by third-party AI models. Responses are
      generated automatically and, while we tune them using your provided profile information, they
      may occasionally be inaccurate. {COMPANY.name} is not liable for decisions made based on AI-generated
      responses. As the card owner you are responsible for the information you give your AI
      assistant and for any meetings or follow-ups it arranges on your behalf. How AI data is
      handled is explained in <a href="/ai-data-privacy">How our AI uses data</a>.
    </p>

    <H2>6A. Leads and Visitor Data</H2>
    <p>
      Enquiries, chats and contact details that visitors share on your card are stored so you can see
      them in your dashboard. You may use them only to reply to that visitor about their enquiry, and
      you must follow applicable Indian data-protection law. Our handling of personal data is described
      in the <a href="/privacy-policy">Privacy Policy</a>.
    </p>

    <H2>6B. Availability</H2>
    <p>
      We aim to keep the Service available at all times but do not guarantee uninterrupted access.
      Planned maintenance or outages outside our control (hosting, payment or AI providers) may cause
      short interruptions. Prolonged outages on our side are covered in the Refund Policy.
    </p>

    <H2>7. Suspension & Termination</H2>
    <p>
      We may suspend or terminate accounts that violate these Terms, engage in fraudulent payment
      activity, or misuse the Service. Where possible we will tell you why first and give you a chance
      to fix it. You may close your account at any time by contacting support; your content is then
      deleted as described in the Privacy Policy.
    </p>

    <H2>8. Limitation of Liability</H2>
    <p>
      The Service is provided "as is". To the maximum extent permitted by law, {COMPANY.name} shall not
      be liable for any indirect, incidental, or consequential damages arising from your use of the
      Service. Our total liability for any claim is limited to the amount you paid us in the 12 months
      before the claim.
    </p>

    <H2>9. Changes to These Terms</H2>
    <p>
      We may update these Terms from time to time. For important changes we will tell you by email or
      in the dashboard before they take effect. Continued use of the Service after changes are posted
      constitutes acceptance of the revised Terms.
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
