import LegalLayout from './LegalLayout';
import { COMPANY } from '../../components/PublicFooter';

const H2 = ({ children }) => (
  <h2 style={{ color: 'var(--surface-text)' }}>{children}</h2>
);

// Physical goods: the premium metal NFC card. Digital plans are not shipped.
const ShippingPolicy = () => (
  <LegalLayout title="Shipping Policy" updated="9 October 2026">
    <p>
      This Shipping Policy applies to physical products sold by <strong>{COMPANY.name}</strong> under
      the Aicardly brand, currently the premium metal NFC business card. Digital plans (Digital Card,
      Smart AI Card, AI Agent Pro) are activated online and are not shipped.
    </p>

    <H2>1. Where We Ship</H2>
    <p>We ship to addresses anywhere in India. We do not ship outside India at the moment.</p>

    <H2>2. Production and Delivery Time</H2>
    <ul>
      <li>Your card is engraved after you approve the design (name, logo, finish).</li>
      <li>Delivery usually takes <strong>5–7 working days</strong> from design approval.</li>
      <li>Remote areas, public holidays and courier delays can add a few days. We will tell you if we expect a delay.</li>
    </ul>

    <H2>3. Shipping Charges</H2>
    <p>
      Any shipping charge is included in the quote you receive before you pay. There are no hidden
      charges at delivery. The metal card included with the AI Agent Pro plan is shipped at no extra cost.
    </p>

    <H2>4. Tracking</H2>
    <p>
      Once your card is dispatched we send the courier name and tracking number by WhatsApp or email.
    </p>

    <H2>5. Wrong Address or Failed Delivery</H2>
    <p>
      Please check your delivery address and phone number. If a parcel comes back because the address
      was wrong or nobody was available after repeated attempts, we can re-send it; the extra courier
      charge is payable by you.
    </p>

    <H2>6. Damaged, Defective or Wrong Cards</H2>
    <ul>
      <li>
        <strong>Damaged in transit:</strong> tell us within 48 hours of delivery, with photos of the card and
        the package. We will send a free replacement.
      </li>
      <li>
        <strong>NFC chip not working:</strong> if the chip does not open your card within 30 days of delivery,
        we will test it with you and replace the card free of charge if it is faulty.
      </li>
      <li>
        <strong>Our mistake in engraving:</strong> if the card does not match the design you approved, we will
        re-make it free of charge.
      </li>
    </ul>

    <H2>7. Returns</H2>
    <p>
      Each metal card is custom-engraved for you, so it cannot be returned or refunded for a change of
      mind, or for spelling or design errors in details you approved. A re-print with corrected details
      can be ordered at the usual price. Refunds for faulty or undelivered cards follow our{' '}
      <a href="/refund-policy">Refund Policy</a>.
    </p>

    <H2>Contact Us</H2>
    <p>
      For order, delivery or replacement questions, write to{' '}
      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or call/WhatsApp{' '}
      <a href={COMPANY.phoneHref}>{COMPANY.phone}</a>.
    </p>
    <p className="text-xs pt-2" style={{ opacity: 0.7 }}>
      {COMPANY.name} · {COMPANY.addressLines.join(' ')} · GSTIN: {COMPANY.gst}
    </p>
  </LegalLayout>
);

export default ShippingPolicy;
