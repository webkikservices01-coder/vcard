import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

// Business addendum between a card owner (Data Fiduciary for their visitors' data) and
// Webkik Services (Data Processor), under the Digital Personal Data Protection Act, 2023.
const H2 = ({ children }) => <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>;

const DataProcessingAddendum = () => (
  <LegalLayout title="Data Processing Addendum" updated="29 September 2026">
    <p>
      This Data Processing Addendum ("Addendum") forms part of the{' '}
      <Link to="/terms-conditions">Terms &amp; Conditions</Link> between you, the owner of an Aicardly card ("Owner", "you"), and{' '}
      <strong>{COMPANY.name}</strong> ("Webkik", "we"). It applies when your card collects personal data from visitors, through the
      enquiry form or the AI assistant, and you accept it in your dashboard before turning the AI assistant on.
    </p>

    <H2>1. Roles</H2>
    <ul>
      <li>
        For visitor data collected through your card, <strong>you are the Data Fiduciary</strong>: you decide why that data is
        collected and how you use it.
      </li>
      <li>
        <strong>Webkik is your Data Processor</strong>: we process that data only to run your card and its features, on your behalf
        and on your instructions as set out in this Addendum.
      </li>
      <li>For your own account data, Webkik is the Data Fiduciary, as described in our <Link to="/privacy-policy">Privacy Policy</Link>.</li>
    </ul>

    <H2>2. What we process for you</H2>
    <ul>
      <li><strong>Enquiries:</strong> name, phone, email and message that visitors send through your card.</li>
      <li>
        <strong>AI chats:</strong> visitors' messages, processed in real time to generate replies. We do not store chat text; we keep
        only counts, whether your offer was shown or clicked, and ratings (0–10) with optional comments.
      </li>
      <li><strong>Usage:</strong> card views, link taps and QR scans.</li>
    </ul>

    <H2>3. Our commitments as Processor</H2>
    <ul>
      <li>Process visitor data only to provide the Service to you, and not for our own marketing or to sell it.</li>
      <li>Show visitors a notice and collect their consent before the AI processes their messages or an enquiry is sent.</li>
      <li>Keep the data secure with reasonable safeguards: encryption in transit, access controls and rate limits.</li>
      <li>Use only sub-processors listed below, bound by written terms that protect the data at least as well as this Addendum.</li>
      <li>Tell you without undue delay, and in any case within 72 hours of becoming aware, of a personal data breach affecting your visitors, and help you notify the Data Protection Board and affected people.</li>
      <li>Help you respond to visitors who exercise their DPDP rights (access, correction, erasure, grievance).</li>
      <li>Delete visitor data when you delete it from your dashboard, and all of it within 90 days after your account is deleted, except what the law requires us to keep.</li>
    </ul>

    <H2>4. Sub-processors</H2>
    <ul>
      <li>Anthropic (Claude API): generates AI assistant replies.</li>
      <li>Vercel and MongoDB Atlas: application servers and database.</li>
      <li>Hostinger: website hosting.</li>
      <li>Cloudinary: storage for files you upload.</li>
      <li>Our email provider: delivers enquiry notifications to you.</li>
    </ul>
    <p>We will update this list on this page before adding a new sub-processor.</p>

    <H2>5. Your responsibilities as Fiduciary</H2>
    <ul>
      <li>Use enquiries and ratings only to respond to and serve the visitor, and in line with the DPDP Act.</li>
      <li>Don't use the AI assistant, knowledge base or card to ask visitors for sensitive data you don't need (health records, ID numbers, financial details).</li>
      <li>Keep what you publish on your card, and the AI's knowledge base, accurate and lawful.</li>
      <li>Respond to visitors' requests about their data, and forward to us any request you need our help with.</li>
      <li>If you are in a regulated profession (medical, legal, financial), follow your professional rules. The AI assistant is not a substitute for professional advice.</li>
    </ul>

    <H2>6. Transfers outside India</H2>
    <p>
      Some sub-processors may process data outside India. Transfers follow the DPDP Act and are not made to any country the Central
      Government has restricted.
    </p>

    <H2>7. Term</H2>
    <p>
      This Addendum lasts as long as you use the Service. Sections that by their nature should continue (deletion, confidentiality,
      breach notice) survive termination.
    </p>

    <H2>Contact</H2>
    <p>
      Grievance Officer, {COMPANY.name}, {COMPANY.addressLines.join(' ')} · <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>{' '}
      · <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>
    </p>
  </LegalLayout>
);

export default DataProcessingAddendum;
