// The automatic emails the team can reword in the admin panel (Email templates). Each email keeps
// its links, buttons and details; the team can change the subject, the heading and the first
// paragraph. Placeholders in braces ({name}) are filled in when the email goes out.
const EmailTemplate = require('../models/EmailTemplate');

const CATALOG = {
  verify: {
    label: 'Verify email (sign-up)',
    when: 'Right after someone signs up, with the link to confirm their email.',
    vars: ['name'],
    subject: 'Verify your email for Aicardly',
    heading: 'Verify your email, {name}',
    intro: 'Thanks for signing up to Aicardly! Please confirm this is your email address to activate your account.',
  },
  reset: {
    label: 'Reset password',
    when: 'When someone asks for a password reset (or an admin sends a reset link).',
    vars: ['name'],
    subject: 'Reset your Aicardly password',
    heading: 'Reset your password',
    intro: 'Hi {name}, we got a request to reset your Aicardly password.',
  },
  welcome: {
    label: 'Welcome',
    when: 'When a new account is ready.',
    vars: ['name', 'email'],
    subject: 'Welcome to Aicardly 🎉',
    heading: 'Welcome, {name}!',
    intro: 'Your Aicardly account is ready. Build your AI digital business card, share it with a QR code or NFC tap, and let your AI assistant answer visitors 24/7.',
  },
  trialEnded: {
    label: 'Free trial ended',
    when: 'When the 24-hour free trial is over and the card is paused (with the payment link).',
    vars: ['name', 'hours'],
    subject: 'Please upgrade your card, {name}: your Aicardly free trial has ended',
    heading: 'Please upgrade your card',
    intro: 'Hi {name}, your {hours}-hour free trial is over, so your Aicardly card is <b>paused</b> for now. Anyone opening your link sees that it\'s paused.',
  },
  enquiryOwner: {
    label: 'New enquiry (to the card owner)',
    when: 'When a visitor sends the form on a card.',
    vars: ['name', 'visitor'],
    subject: 'New enquiry from {visitor} on your Aicardly card',
    heading: 'New enquiry from {visitor}',
    intro: '',
  },
  enquiryVisitor: {
    label: 'Enquiry sent (to the visitor)',
    when: 'Confirmation to the visitor who sent the form on a card.',
    vars: ['visitor', 'owner'],
    subject: 'Your message to {owner} was sent',
    heading: 'Your message was sent',
    intro: '',
  },
  cardReady: {
    label: 'Card delivered',
    when: 'When a paid "Get my card" order is delivered (card PDF and image).',
    vars: ['name'],
    subject: 'Your Aicardly card is here 🎉',
    heading: '',
    intro: '',
  },
  rsvp: {
    label: 'New RSVP (to the hosts)',
    when: 'When a guest replies to a digital invite.',
    vars: ['guest', 'answer'],
    subject: 'New RSVP from {guest}: {answer}',
    heading: '',
    intro: '',
  },
  nfcShipped: {
    label: 'Metal card shipped',
    when: 'When an NFC order is marked shipped (the courier and tracking are added below it).',
    vars: ['name', 'number', 'courier', 'tracking'],
    subject: 'Your Aicardly metal card is on its way ({number})',
    heading: 'Your metal card is on its way, {name}',
    intro: 'Good news: your Aicardly metal NFC card has been shipped.',
  },
  nfcDelivered: {
    label: 'Metal card delivered',
    when: 'When an NFC order is marked delivered.',
    vars: ['name', 'number'],
    subject: 'Your Aicardly metal card was delivered ({number})',
    heading: 'Enjoy your new card, {name}!',
    intro: 'Your Aicardly metal NFC card has been delivered. Tap it on any phone to open your digital card.',
  },
};

const fill = (text, vars) => String(text || '').replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== null ? String(vars[k]) : m));

let cache = { at: 0, rows: {} };
async function overrides() {
  if (Date.now() - cache.at < 30 * 1000) return cache.rows;
  try {
    const rows = await EmailTemplate.find().lean();
    cache = { at: Date.now(), rows: Object.fromEntries(rows.map((r) => [r.key, r])) };
  } catch {
    /* database hiccup: built-in wording */
  }
  return cache.rows;
}
const forget = () => {
  cache = { at: 0, rows: {} };
};

// Wording for one email: the team's text where set, else the code's own (def), filled with vars.
// Returns { subject, heading, intro, enabled }.
async function emailText(key, vars = {}, def = {}) {
  const base = CATALOG[key] || {};
  const o = (await overrides())[key] || {};
  const pick = (field) => fill(o[field] || def[field] || base[field] || '', vars);
  return { subject: pick('subject'), heading: pick('heading'), intro: pick('intro'), enabled: o.enabled !== false };
}

module.exports = { CATALOG, emailText, fill, forget };
