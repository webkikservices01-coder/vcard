// "Send me your services on WhatsApp": the card's AI (on a call or in the chat) sends the visitor
// the owner's services and card link, and tells the owner.
//   - WhatsApp Business API configured (utils/whatsapp.js): sent automatically. The visitor gets
//     template WA_TEMPLATE_CARD_INFO, the owner gets WA_TEMPLATE_LEAD_ALERT.
//   - Not configured: the visitor gets a one-tap WhatsApp button to the owner's number with the
//     services already written in, so both of them have it once they press send.
// Either way the owner gets the lead by email (and the Aicardly team a copy).
const User = require('../models/User');
const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const VcardSettings = require('../models/VcardSettings');
const { sendMail, emailHtml } = require('../utils/mailer');
const { sendTemplate, isWhatsAppConfigured } = require('../utils/whatsapp');
const { logEvent } = require('../utils/logger');
const background = require('../utils/background');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const COPY_TO = process.env.MEETING_COPY_EMAIL ?? 'webkikservices01@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const waDigits = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && /^[6-9]/.test(d)) d = `91${d}`; // Indian mobile without the country code
  return d.length >= 8 && d.length <= 15 ? d : '';
};

// The owner's WhatsApp: the card's WhatsApp link, else the phone they signed up with.
function ownerWhatsApp(card, owner) {
  const link = (card.dynamicLinks || []).find((l) => /whatsapp/i.test(l.fieldType || ''));
  const fromLink = link?.url ? waDigits(String(link.url).match(/(?:wa\.me\/|phone=)?(\+?\d[\d\s-]{7,})/)?.[1]) : '';
  return fromLink || waDigits(owner?.phone);
}

// The services/products list, one per line ("Website design – ₹15,000").
async function servicesList(card) {
  const products = await Product.find({ vcardId: card._id }).sort('order').select('title price').limit(12).lean();
  const items = [...(card.services || []), ...products].map((s) => [clip(s.title, 60), clip(s.price, 30)].filter(Boolean).join(' – ')).filter(Boolean);
  return [...new Set(items)].slice(0, 12);
}

function parseRequest(body) {
  const r = {
    name: clip(body.name, 80),
    whatsapp: clip(body.whatsapp, 30),
    topic: clip(body.topic, 120) || 'services',
    summary: clip(body.summary, 600),
  };
  if (!r.name || !waDigits(r.whatsapp)) return { error: 'Need the visitor\'s name and a valid WhatsApp number.' };
  return { r };
}

// source: 'voice call' | 'video call' | 'chat'
async function sendInfo({ req, card, r, source, cohort }) {
  const owner = await User.findById(card.userId).select('name firstName email phone').lean();
  const ownerName = card.personalInfo?.name || card.title || owner?.name || 'the card owner';
  const cardUrl = `${SITE}/${card.username}`;
  const items = await servicesList(card);
  const visitorNo = waDigits(r.whatsapp);
  const ownerNo = ownerWhatsApp(card, owner);

  // One-line version for WhatsApp templates (no new lines allowed in template values).
  // The card's own list when it has one (complete and exact); else what the AI summarised.
  const infoLine = clip(items.length ? items.join(' | ') : r.summary || `Everything about ${ownerName} is on the card`, 900);

  let sent = false;
  let ownerAlerted = false;
  let error = '';
  if (isWhatsAppConfigured()) {
    try {
      await sendTemplate({ to: visitorNo, type: 'card_info', body: [r.name, ownerName, infoLine, cardUrl] });
      sent = true;
    } catch (err) {
      error = err.message;
    }
    if (ownerNo) {
      try {
        await sendTemplate({ to: ownerNo, type: 'lead_alert', body: [clip(ownerName.split(' ')[0], 40), r.name, `+${visitorNo}`, clip(`${r.topic} (via your AI ${source})`, 200)] });
        ownerAlerted = true;
      } catch (err) {
        error = error || err.message;
      }
    }
  }

  // Not sent automatically: a one-tap message from the visitor to the owner, details written in.
  const text = [
    `Hi ${ownerName.split(' ')[0]}, I'm ${r.name}. I spoke with your AI assistant and would like details about ${r.topic}.`,
    r.summary && !items.length ? `\n${r.summary}` : '',
    items.length ? `\nServices:\n${items.map((i) => `• ${i}`).join('\n')}` : '',
    `\nCard: ${cardUrl}`,
  ].filter(Boolean).join('\n');
  // ( ) and ' encoded too, so the link survives markdown in the chat.
  const tapLink = ownerNo ? `https://wa.me/${ownerNo}?text=${encodeURIComponent(text).replace(/[()']/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)}` : '';

  const message = [`WhatsApp request from the AI ${source}: ${r.topic}`, sent ? 'Sent to their WhatsApp automatically.' : 'They were shown a button to message you on WhatsApp.', r.summary ? `Sent: ${r.summary}` : ''].filter(Boolean).join('\n');
  // The visitor agreed with the AI to share their number with the owner (it asks first).
  await Enquiry.create({ vcardId: card._id, name: r.name, mobile: r.whatsapp, message, consentAt: new Date(), cohort: cohort || 'live' });
  logEvent(req, 'ai.whatsapp', `AI ${source} on /${card.username}: WhatsApp ${r.topic} for ${r.name} (${sent ? 'sent' : 'tap link'}${error ? `; ${error}` : ''})`, { userId: card.userId, level: error ? 'warn' : 'info' });

  // Email the owner (+ a copy to the Aicardly team) with a one-tap reply on WhatsApp.
  const replyLink = `https://wa.me/${visitorNo}?text=${encodeURIComponent(`Hi ${r.name}, this is ${ownerName}. Thanks for your interest in ${r.topic}! ${items.length ? `\n\n${items.map((i) => `• ${i}`).join('\n')}\n` : ''}\nMy card: ${cardUrl}`)}`;
  background((async () => {
    const settings = await VcardSettings.findOne({ vcardId: card._id }).select('enquiryEmail').lean();
    const ownerTo = [...new Set([owner?.email, settings?.enquiryEmail].map((e) => String(e || '').trim().toLowerCase()).filter((e) => EMAIL_RE.test(e)))];
    const mail = {
      subject: `${r.name} asked for your ${r.topic} on WhatsApp`,
      text: `${r.name} (WhatsApp +${visitorNo}) asked your AI assistant (${source}) on ${cardUrl} for ${r.topic} on WhatsApp.\n${sent ? 'We sent it to their WhatsApp automatically.' : 'They got a button to message you on WhatsApp.'}\n\nReply to them on WhatsApp: ${replyLink}\n\n– Team Aicardly`,
      html: emailHtml({
        heading: `${esc(r.name)} wants your ${esc(r.topic)}`,
        paragraphs: [
          `${esc(r.name)} asked your AI assistant on a <b>${esc(source)}</b> from <a href="${cardUrl}" style="color:#E70C65">aicardly.com/${esc(card.username)}</a> to send ${esc(r.topic)} on WhatsApp.`,
          `<b>WhatsApp:</b> +${esc(visitorNo)}`,
          sent ? 'We sent your services and card link to their WhatsApp automatically.' : 'They got a one-tap button to message you on WhatsApp with your services written in. Reply to them so the conversation starts.',
          r.summary ? `<b>What the AI shared:</b><br>${esc(r.summary)}` : '',
        ].filter(Boolean),
        button: { label: `Reply to ${esc(r.name)} on WhatsApp`, url: replyLink },
      }),
    };
    if (ownerTo.length) await sendMail({ to: ownerTo.join(', '), ...mail });
    const copy = String(COPY_TO || '').trim().toLowerCase();
    if (EMAIL_RE.test(copy) && !ownerTo.includes(copy)) await sendMail({ to: copy, ...mail, subject: `[Copy] ${mail.subject} on /${card.username}` });
  })());

  return { sent, ownerAlerted, tapLink, topic: r.topic, name: r.name };
}

// The tool the AI calls (OpenAI Realtime format; the chat converts it for Claude).
const WHATSAPP_TOOL = {
  type: 'function',
  name: 'send_whatsapp_info',
  description: 'Send the visitor the owner\'s services / details and card link on WhatsApp and tell the owner, after the visitor agreed to share their number with the owner.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Visitor\'s name' },
      whatsapp: { type: 'string', description: 'Visitor\'s WhatsApp number, digits with country code if given' },
      topic: { type: 'string', description: 'What they want, in a few words, e.g. "services and prices", "brochure", "address"' },
      summary: { type: 'string', description: 'The details to send, in 2 to 5 short lines, in the visitor\'s language, only from the card' },
    },
    required: ['name', 'whatsapp', 'topic'],
  },
};

const whatsappRules = (ownerName, { spoken }) => {
  const who = spoken ? 'caller' : 'visitor';
  return `- WHATSAPP: if the ${who} asks you to send something on WhatsApp (services, prices, brochure, address, details, the card), do it: ask their name and WhatsApp number (${spoken ? 'read the number back once' : 'one at a time'}), ask "Shall I send it and share your number with ${ownerName}?" and only after a yes call send_whatsapp_info with a short summary of what they asked, taken only from the card. If it returns sent: true, say it's on their WhatsApp now and ${ownerName} has been told. If sent is false, ${spoken ? 'say "Tap the green WhatsApp button on your screen and press send: you\'ll have all the details and ' + ownerName + ' gets your message too."' : 'say: tap the "Open WhatsApp" button below and press send, they will have all the details and ' + ownerName + ' gets the message too. Do not write any link yourself; the button is added for you.'}`;
};

module.exports = { parseRequest, sendInfo, ownerWhatsApp, waDigits, WHATSAPP_TOOL, whatsappRules };
