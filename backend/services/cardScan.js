// "Scan your business card": the owner shows their old paper card (camera or a photo) and the AI
// reads it, then fills their Aicardly card everywhere at once: name, designation, company, a short
// line about them, phones, WhatsApp, email, website, address, social links and services. Saved
// straight away. The picture itself is never stored: it lives in memory for this one request.
const vCard = require('../models/vCard');
const Product = require('../models/Product');
const User = require('../models/User');
const { toE164 } = require('../utils/phone');

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const MEDIA = /^data:(image\/(jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

// Reads the photo: { mediaType, data } or { error }.
function readImage(dataUrl) {
  const m = MEDIA.exec(String(dataUrl || '').trim());
  if (!m) return { error: 'Please upload a photo of the card (JPG or PNG).' };
  const bytes = Math.floor((m[3].length * 3) / 4);
  if (bytes < 2000) return { error: 'This picture is too small to read. Please take a clearer photo.' };
  if (bytes > 4.5 * 1024 * 1024) return { error: 'This picture is too large. Please use a photo under 4 MB.' };
  return { mediaType: m[1], data: m[3] };
}

// Up to 3 photos of the same card (front, back): body.images, or the older body.image.
// Returns { images: [...] } or { error }. All together stay under Vercel's 4.5 MB request limit.
function readImages(body) {
  const list = Array.isArray(body?.images) ? body.images : body?.image ? [body.image] : [];
  if (!list.length) return { error: 'Please upload a photo of the card (JPG or PNG).' };
  if (list.length > 3) return { error: 'Please send up to 3 photos of one card (front and back).' };
  const images = [];
  for (const one of list) {
    const r = readImage(one);
    if (r.error) return r;
    images.push(r);
  }
  const total = images.reduce((n, i) => n + i.data.length, 0);
  if (total > 4.2 * 1024 * 1024) return { error: 'These photos are too large together. Please send them one at a time.' };
  return { images };
}

// The message for the AI: the photos, then the instructions.
const content = (images) => [
  ...images.map((i) => ({ type: 'image', source: { type: 'base64', media_type: i.mediaType, data: i.data } })),
  { type: 'text', text: images.length > 1 ? `${images.length} photos of the same card (for example front and back). Combine them.\n\n${PROMPT}` : PROMPT },
];

const PROMPT = `You are reading photos of ONE card: a visiting card, business card, shop or clinic card, or a membership / loyalty card. Extract the contact details someone would save from it.

Read carefully:
- The photo may be rotated (sideways or upside down), tilted, blurred, dark or shot at an angle. Turn it in your mind and read the text in whichever direction it runs.
- Read only the main card in the photo. Ignore other cards, papers or objects partly visible at the edges.
- When there are several photos (front and back of the same card), combine everything into one result. The front often has only a logo or brand; the back often has the person, phone, email, address or a list of services.

Return ONLY this JSON object, nothing else:
{"isCard": true, "kind": "person|business|membership", "name": "", "designation": "", "company": "", "tagline": "", "phones": [{"number": "", "label": ""}], "whatsapp": "", "emails": [""], "website": "", "address": "", "linkedin": "", "instagram": "", "facebook": "", "twitter": "", "youtube": "", "services": [{"title": "", "description": ""}]}

Rules:
- Copy exactly what is printed. Never guess, complete, translate or invent anything. If something is not printed, leave "" or [].
- kind: "person" when a person's name is printed; "business" for a shop, company or clinic card with no person; "membership" for loyalty, health, member or ID-style cards.
- name: the person's name as printed (normal capitalisation, e.g. "SHUBHAM KHURANA" -> "Shubham Khurana"). With no person on the card, use the business / brand name.
- designation: the person's title (CEO, Founder, Doctor, Manager…). "" when there is no person.
- company: the business or brand the card is for, as it is best known (the logo / brand name, e.g. "Webkik", "Medical Management", "98.4° Chemists"). If only a legal name is printed (e.g. "Global Healthline Pvt. Ltd."), use that. On membership cards, the company named in the contact or "return to" text counts.
- tagline: the slogan or line under the brand, if printed (e.g. "Website Development Agency", "We simplify your hospitalization journey in economical cost"). Max 20 words.
- phones: every contact phone number printed, in international form. Indian mobile: "+91 98765 43210". Indian landline: drop the leading 0 of the area code and add +91, e.g. "011-41984984" -> "+91 11 4198 4984". label: what the card calls it (Mobile, Office, Helpline, Toll free…) or "".
- Never treat card numbers, membership or customer numbers, barcode digits, account numbers, IDs, GST or PAN numbers, PIN codes, dates or prices as phone numbers.
- whatsapp: only a number clearly marked WhatsApp (word or icon), in the same international form.
- emails: as printed, lowercase. website: the web address only (drop "Website:" or "www" labels only if they are labels, keep "www." if it is part of the address).
- address: the full postal address in one line, including floor, building, area, city and PIN code if printed. For several branch areas without a full address (e.g. "Karol Bagh & Rajouri Garden, New Delhi"), give that text.
- services: services, products or specialities listed on the card (up to 10), in the order printed. title: the short name (e.g. "Web Development", "Heart Transplant"); description: the line printed with it, shortened to at most 20 words, or "" if none.
- Ignore terms and conditions, "holder's signature", barcodes, QR codes, card numbers and decorative text, except to take the company's phone, email, website and address from them.
- isCard: false only if no card or printed contact details are visible at all.`;

const titleCase = (v) => (v && v === v.toUpperCase() && /[A-Z]/.test(v) ? v.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()) : v);

function parse(text) {
  const raw = String(text || '');
  const m = raw.match(/\{[\s\S]*\}/);
  const j = JSON.parse(m ? m[0] : raw);
  const arr = (v, n, max) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => clip(x, n)).filter(Boolean).slice(0, max);
  const phones = (Array.isArray(j.phones) ? j.phones : j.phones ? [j.phones] : [])
    .map((p) => (typeof p === 'string' ? { number: clip(p, 30), label: '' } : { number: clip(p?.number, 30), label: clip(p?.label, 30) }))
    .filter((p) => (p.number.match(/\d/g) || []).length >= 8)
    .slice(0, 4);
  const services = (Array.isArray(j.services) ? j.services : [])
    .map((x) => (typeof x === 'string' ? { title: clip(x, 60), description: '' } : { title: clip(x?.title, 60), description: clip(x?.description, 200) }))
    .filter((x) => x.title)
    .slice(0, 10);
  return {
    isBusinessCard: (j.isCard ?? j.isBusinessCard) !== false,
    kind: ['person', 'business', 'membership'].includes(j.kind) ? j.kind : 'person',
    name: titleCase(clip(j.name, 80)), designation: clip(j.designation, 100), company: clip(j.company, 120), tagline: clip(j.tagline, 200),
    phones, phoneNumbers: phones.map((p) => p.number), whatsapp: clip(j.whatsapp, 30), emails: arr(j.emails, 120, 3).map((e) => e.toLowerCase()),
    website: clip(j.website, 200).replace(/^website\s*:\s*/i, ''), address: clip(j.address, 300),
    linkedin: clip(j.linkedin, 200), instagram: clip(j.instagram, 200), facebook: clip(j.facebook, 200), twitter: clip(j.twitter, 200), youtube: clip(j.youtube, 200),
    services,
  };
}

const socialUrl = (platform, v) => {
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/\.(com|in|co|me|net|org)\b/i.test(v)) return `https://${v.replace(/^\/+/, '')}`;
  const h = v.replace(/^@/, '');
  return { linkedin: `https://www.linkedin.com/in/${h}`, instagram: `https://instagram.com/${h}`, facebook: `https://facebook.com/${h}`, twitter: `https://x.com/${h}`, youtube: `https://youtube.com/@${h}` }[platform] || v;
};
const website = (v) => (!v ? '' : /^https?:\/\//i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`);
const key = (type, url) => `${type}|${String(url).toLowerCase().replace(/[\s()-]/g, '').replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}`;

const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 26);
async function freeUsername(name, userId) {
  const base = slug(name).length >= 3 ? slug(name) : `card-${String(userId).slice(-6)}`;
  for (let i = 0; i < 20; i++) {
    const u = i ? `${base}-${i + 1}` : base;
    if (!(await vCard.exists({ username: u }))) return u;
  }
  return `${base}-${Date.now().toString(36)}`;
}

// Puts what was read on the user's card. Empty fields are filled; fields they already filled are
// kept (unless overwrite). New contact links and services are added, never duplicated.
// Returns { card, filled: ['Name', 'Phone', …], kept: [...] }.
async function applyScan(userId, d, { overwrite = false } = {}) {
  let card = await vCard.findOne({ userId });
  if (!card) card = new vCard({ userId, username: await freeUsername(d.name || d.company, userId), personalInfo: {}, dynamicLinks: [] });
  const filled = [];
  const kept = [];
  const info = card.personalInfo || {};
  const setInfo = (field, value, label) => {
    if (!value) return;
    if (!info[field] || overwrite) {
      if (info[field] !== value) {
        info[field] = value;
        filled.push(label);
      }
    } else if (info[field] !== value) kept.push(label);
  };
  setInfo('name', d.name, 'Name');
  setInfo('designation', d.designation, 'Designation');
  setInfo('company', d.company, 'Company');
  setInfo('bio', d.tagline, 'About line');
  card.personalInfo = info;

  const links = [...(card.dynamicLinks || [])].map((l) => (l.toObject ? l.toObject() : l));
  const have = new Set(links.map((l) => key(l.fieldType, l.url)));
  const add = (fieldType, url, title, label) => {
    if (!url) return;
    const k = key(fieldType, url);
    if (have.has(k)) return;
    have.add(k);
    links.push({ fieldType, title: title || fieldType, url });
    filled.push(label);
  };
  d.phones.forEach((p, i) => add('Mobile / Phone', toE164(p.number) || p.number, p.label || (i ? 'Phone' : 'Call me'), 'Phone'));
  add('WhatsApp', d.whatsapp ? toE164(d.whatsapp) || d.whatsapp : '', 'WhatsApp me', 'WhatsApp');
  d.emails.forEach((e) => add('Email', e.toLowerCase(), 'Email me', 'Email'));
  add('Website', website(d.website), 'Website', 'Website');
  add('Location', d.address, 'Our office', 'Address');
  for (const [p, type] of [['linkedin', 'LinkedIn'], ['instagram', 'Instagram'], ['facebook', 'Facebook'], ['twitter', 'Twitter'], ['youtube', 'YouTube']]) add(type, socialUrl(p, d[p]), type, type);
  card.dynamicLinks = links;
  await card.save();

  // Services from the card (as Services on the card), when they're not there yet.
  if (d.services.length) {
    const existing = await Product.find({ vcardId: card._id }).select('title').lean();
    const titles = new Set(existing.map((p) => p.title.toLowerCase()));
    const fresh = d.services.filter((s) => !titles.has(s.title.toLowerCase()));
    if (fresh.length) {
      await Product.insertMany(fresh.map((s, i) => ({ vcardId: card._id, kind: 'service', title: s.title, description: s.description, link: website(d.website), order: existing.length + i })));
      filled.push(`${fresh.length} service${fresh.length > 1 ? 's' : ''}`);
    }
  }

  // The account's own phone, if it had none (used for WhatsApp delivery and payments).
  const firstMobile = d.whatsapp || d.phones.find((p) => /^\+?91[\s-]*[6-9]/.test(p.number))?.number;
  if (firstMobile) await User.updateOne({ _id: userId, $or: [{ phone: '' }, { phone: null }, { phone: { $exists: false } }] }, { $set: { phone: toE164(firstMobile) || '' } });

  return { card, filled: [...new Set(filled)], kept: [...new Set(kept)] };
}

module.exports = { readImage, readImages, content, PROMPT, parse, applyScan };
