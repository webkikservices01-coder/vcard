import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

// Written to the Digital Personal Data Protection Act, 2023 (DPDP Act) and the DPDP Rules, 2025.
const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

const Mail = () => <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>;

const PrivacyPolicy = () => (
  <LegalLayout title="Privacy Policy" updated="29 September 2026">
    <p>
      Aicardly (<a href="https://aicardly.com">aicardly.com</a>) is a product of <strong>{COMPANY.name}</strong> ("Webkik",
      "we", "us", "our"). This Privacy Policy explains what personal data we collect when you use Aicardly (the
      "Service"), why we collect it, how we protect it, and the rights you have under the Digital Personal Data
      Protection Act, 2023 ("DPDP Act") and the rules made under it. For the personal data described here,
      {' '}{COMPANY.name} is the <strong>Data Fiduciary</strong>.
    </p>

    <H2>1. Who this policy covers</H2>
    <ul>
      <li><strong>Card owners</strong>: people who create an account and a digital business card on Aicardly.</li>
      <li>
        <strong>Visitors</strong>: people who open a card, scan its QR or NFC tag, send an enquiry through a card, or chat
        with a card's AI assistant.
      </li>
    </ul>

    <H2>2. Personal data we collect</H2>
    <ul>
      <li><strong>Account data:</strong> name, email, mobile number and password (stored only as a one-way encrypted hash).</li>
      <li>
        <strong>Card content:</strong> the details you choose to publish on your card, such as photo, designation, company, bio,
        phone numbers, WhatsApp, email, address, social links, services, portfolio items and PDFs, reels, gallery,
        testimonials and highlights.
      </li>
      <li>
        <strong>Enquiries:</strong> when a visitor fills a card's contact form, their name, phone, email and message.
      </li>
      <li>
        <strong>AI chats:</strong> messages visitors type into a card's AI assistant are processed in real time to generate a reply,
        after the visitor accepts a notice. We do not store the chat text. We keep only the time, message count, whether the owner's
        offer was shown or clicked, and any 0–10 rating and comment the visitor chooses to give. See{' '}
        <Link to="/ai-data-privacy">How our AI uses data</Link>.
      </li>
      <li>
        <strong>Usage data:</strong> card views, link taps and QR scans (to show analytics to the card owner), plus technical
        data such as IP address, browser and device type, kept in server logs for security.
      </li>
      <li>
        <strong>Payment data:</strong> if you buy a paid plan or a metal NFC card, payments are handled by our payment
        partner (Cashfree). We receive the payment status and order details. We never see or store your card, UPI or
        bank credentials.
      </li>
      <li>
        <strong>Shipping data:</strong> for NFC card orders, your delivery name, address and phone number.
      </li>
    </ul>

    <H2>3. Why we use it (purpose and legal basis)</H2>
    <p>
      We process personal data only for the purposes listed below, on the basis of your <strong>consent</strong> or for a
      <strong> legitimate use</strong> permitted under Section 7 of the DPDP Act (for example, where you have voluntarily
      given data for a specific purpose and have not said you do not consent to that use).
    </p>
    <ul>
      <li>To create, host and display your digital business card and dashboard.</li>
      <li>To let visitors contact you and to deliver enquiries to you by dashboard and email.</li>
      <li>To run the AI assistant on your card, which answers visitors using the information you have published.</li>
      <li>To process payments, deliver NFC cards and issue invoices.</li>
      <li>To send service messages such as login, password reset, order and support replies.</li>
      <li>To keep the Service secure, prevent spam and abuse, and fix problems.</li>
      <li>To meet legal, tax and accounting obligations.</li>
    </ul>
    <p>We do not sell personal data, and we do not use it for third-party advertising.</p>

    <H2>4. Your public card</H2>
    <p>
      Everything you publish on your card is visible to anyone who has its link, QR code or NFC tag, and it can be saved
      to their phone contacts. Only add details you are comfortable sharing publicly. You can edit or remove any of it at
      any time from your dashboard.
    </p>

    <H2>5. Visitor data received by card owners</H2>
    <p>
      When a visitor sends an enquiry through a card, after ticking a consent box, the details are shared with that card's owner so
      they can reply. For this data the card owner is the Data Fiduciary and we act as their processor under our{' '}
      <Link to="/data-processing-addendum">Data Processing Addendum</Link>. The card owner should handle it in line with the DPDP Act. Visitors can
      ask us to delete an enquiry they sent by writing to <Mail />.
    </p>

    <H2>6. Who we share data with (Data Processors)</H2>
    <p>
      We use trusted service providers who process data only on our instructions and under contracts that require them to
      protect it:
    </p>
    <ul>
      <li><strong>Hosting and database:</strong> Hostinger, Vercel and MongoDB Atlas, to run the website, servers and database.</li>
      <li><strong>Media storage:</strong> Cloudinary, for photos, videos and PDFs you upload.</li>
      <li>
        <strong>AI:</strong> Anthropic (Claude), to generate AI assistant replies. Only the card's published details and
        the chat conversation are sent.
      </li>
      <li><strong>Payments:</strong> Cashfree Payments.</li>
      <li><strong>Email:</strong> our email service provider, to send enquiries and service emails.</li>
      <li>
        <strong>Website previews:</strong> the WordPress.com mShots service, which receives the public website links in your
        portfolio to create preview images.
      </li>
      <li>
        <strong>Authorities:</strong> government or law-enforcement bodies, only where required by law or to protect rights
        and safety.
      </li>
    </ul>
    <p>
      Some of these providers may store data outside India. Any such transfer follows the DPDP Act and is not made to any
      country the Central Government has restricted.
    </p>

    <H2>7. How long we keep data</H2>
    <ul>
      <li>Account and card data: for as long as your account is active.</li>
      <li>
        When you ask us to delete your account, we erase your personal data within 90 days, except records we must keep
        by law.
      </li>
      <li>Enquiries: until the card owner deletes them, or the account is deleted.</li>
      <li>Chat records (counts and ratings, no chat text): as long as the card's account is active.</li>
      <li>Security logs: up to 1 year.</li>
      <li>Payment and invoice records: for the period required by tax and accounting laws.</li>
    </ul>

    <H2>8. Your rights under the DPDP Act</H2>
    <ul>
      <li>
        <strong>Access:</strong> get a summary of the personal data we hold about you and how we process it, and the names
        of those we have shared it with.
      </li>
      <li><strong>Correction and completion:</strong> fix inaccurate or incomplete data. Most details can be edited directly in your dashboard.</li>
      <li><strong>Erasure:</strong> ask us to delete your personal data when it is no longer needed for the purpose it was given for.</li>
      <li>
        <strong>Withdraw consent:</strong> withdraw your consent at any time, as easily as you gave it. Processing already
        done before withdrawal stays lawful. Some features may stop working once consent is withdrawn.
      </li>
      <li><strong>Grievance redressal:</strong> raise a complaint with us about how your data is handled.</li>
      <li>
        <strong>Nominate:</strong> nominate a person to exercise these rights on your behalf in case of your death or
        incapacity.
      </li>
    </ul>
    <p>
      To use any of these rights, email <Mail /> from your registered email address. We may need to verify your identity
      before acting on a request. We reply within 30 days.
    </p>

    <H2>9. Children</H2>
    <p>
      Aicardly is meant for people aged 18 and above. We do not knowingly process personal data of children (under 18)
      without verifiable consent from a parent or lawful guardian, and we do not track, monitor or target advertising at
      children. If you believe a child has used the Service without such consent, contact us and we will delete the data.
    </p>

    <H2>10. Security</H2>
    <p>
      We use reasonable security safeguards, including HTTPS encryption, hashed passwords, access controls, rate limiting
      and restricted access to production systems. No system is completely secure. If a personal data breach happens, we
      will inform the Data Protection Board of India and affected users as required by the DPDP Act.
    </p>

    <H2>11. Cookies and local storage</H2>
    <p>
      We use only essential browser storage: to keep you signed in, remember your theme and similar preferences, and keep
      the Service secure. We do not use advertising cookies or third-party ad trackers.
    </p>

    <H2>12. Grievance Officer</H2>
    <p>For any question, request or complaint about your personal data, contact our Grievance Officer:</p>
    <ul>
      <li><strong>{COMPANY.name}</strong>, Attn: Grievance Officer</li>
      <li>{COMPANY.addressLines.join(' ')}</li>
      <li>Email: <Mail /></li>
      <li>Phone: <a href={COMPANY.phoneHref}>{COMPANY.phone}</a> (Mon–Sat, 10 am – 7 pm IST)</li>
    </ul>
    <p>
      We acknowledge complaints within 72 hours and aim to resolve them within 30 days. If you are not satisfied with our
      response, you may complain to the <strong>Data Protection Board of India</strong>.
    </p>

    <H2>13. Changes to this policy</H2>
    <p>
      We may update this policy from time to time. The "Last updated" date above shows the latest version. For important
      changes, we will notify registered users by email or on the dashboard.
    </p>

    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default PrivacyPolicy;
