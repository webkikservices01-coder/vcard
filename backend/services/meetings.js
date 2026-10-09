// Meetings the card's AI sets up (on a live call or in the chat). The AI agrees an exact day and
// time with the visitor and the meeting is scheduled on the spot: a video meeting room (Jitsi Meet,
// no account needed) plus a calendar invite (.ics) emailed to the visitor, the card owner and a
// copy to the Aicardly team (MEETING_COPY_EMAIL). If no time was agreed and the owner has a
// booking page (Calendly / Google Calendar, set in AI settings), the visitor gets that instead.
const crypto = require('crypto');
const User = require('../models/User');
const Enquiry = require('../models/Enquiry');
const VcardSettings = require('../models/VcardSettings');
const { sendMail, emailHtml } = require('../utils/mailer');
const { logEvent } = require('../utils/logger');
const background = require('../utils/background');

const SITE = (process.env.SITE_URL || 'https://aicardly.com').replace(/\/$/, '');
const COPY_TO = process.env.MEETING_COPY_EMAIL ?? 'webkikservices01@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clip = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const esc = (v) => String(v || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const waDigits = (v) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 10 && /^[6-9]/.test(d)) d = `91${d}`; // Indian mobile without the country code
  return d.length >= 8 && d.length <= 15 ? d : '';
};

// A booking page the owner can paste: Calendly, Google Calendar appointment pages, Cal.com, Zoho.
const BOOKING_HOSTS = /^https:\/\/([a-z0-9-]+\.)*(calendly\.com|cal\.com|calendar\.app\.google|calendar\.google\.com|zcal\.co|tidycal\.com|zoho\.(in|com)|bookings\.zoho\.(in|com)|outlook\.office\.com|outlook\.office365\.com)(\/|$)/i;
const cleanBookingUrl = (v) => {
  const u = clip(v, 500);
  return BOOKING_HOSTS.test(u) ? u : '';
};

// The visitor's own link: Calendly pre-fills their name and email.
function bookingLinkFor(bookingUrl, m) {
  if (!bookingUrl) return '';
  if (!/calendly\.com/i.test(bookingUrl)) return bookingUrl;
  const u = new URL(bookingUrl);
  if (m.name) u.searchParams.set('name', m.name);
  if (m.email) u.searchParams.set('email', m.email);
  return u.toString();
}

const TZ = 'Asia/Kolkata';
const MIN = 60 * 1000;
// "Thu, 8 Oct 2026, 4:00 pm IST" in India time.
const whenText = (d) => `${d.toLocaleString('en-IN', { timeZone: TZ, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })} IST`;
// Told to the AI so it can turn "kal 4 baje" into an exact time.
const nowContext = () => `Current date and time in India (IST, UTC+05:30): ${new Date().toLocaleString('en-IN', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}.`;

// Calendar invite (iCalendar). Gmail, Outlook and Apple Mail show it with Yes/No and add it to
// the calendar.
const icsDate = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (v) => String(v || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const fold = (line) => {
  const out = [];
  let s = line;
  while (s.length > 74) {
    out.push(s.slice(0, 74));
    s = ` ${s.slice(74)}`;
  }
  out.push(s);
  return out.join('\r\n');
};
function buildIcs({ uid, start, end, summary, description, url, organizer, attendees }) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Aicardly//AI Meetings//EN', 'CALSCALE:GREGORIAN', 'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(summary)}`, `DESCRIPTION:${icsText(description)}`, `LOCATION:${icsText(url)}`, `URL:${url}`,
    `ORGANIZER;CN=${icsText(organizer.name)}:mailto:${organizer.email}`,
    ...attendees.map((a) => `ATTENDEE;CN=${icsText(a.name)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${a.email}`),
    'STATUS:CONFIRMED', 'SEQUENCE:0',
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Meeting in 15 minutes', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].map(fold).join('\r\n');
}
// "Add to Google Calendar" link.
const googleCalLink = ({ start, end, summary, description, url }) => `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(summary)}&dates=${icsDate(start)}/${icsDate(end)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(url)}`;

// Validates the details the AI collected. Returns { m } or { error }.
function parseMeeting(body) {
  const m = {
    name: clip(body.name, 80),
    whatsapp: clip(body.whatsapp, 30),
    email: clip(body.email, 120).toLowerCase(),
    purpose: clip(body.purpose, 200),
    preferredTime: clip(body.preferred_time ?? body.preferredTime, 120),
    notes: clip(body.notes, 800),
  };
  if (m.email && !EMAIL_RE.test(m.email)) m.email = '';
  if (!m.name || !waDigits(m.whatsapp)) return { error: 'Need the visitor\'s name and a valid WhatsApp number.' };
  // The exact time the AI agreed with the visitor (ISO 8601 with +05:30).
  const raw = clip(body.start_time ?? body.startTime, 40);
  if (raw) {
    const start = new Date(raw);
    if (Number.isNaN(start.getTime()) || !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(raw)) return { error: 'start_time must be an exact date and time like 2026-10-08T16:00:00+05:30. Ask for the day and time again.' };
    if (start.getTime() < Date.now() + 5 * MIN) return { error: 'That time has already passed. Ask for a time later than now.' };
    if (start.getTime() > Date.now() + 90 * 24 * 60 * MIN) return { error: 'Please pick a time within the next 3 months.' };
    const mins = Math.max(15, Math.min(120, Math.round(Number(body.duration_minutes) || 30)));
    m.startsAt = start;
    m.endsAt = new Date(start.getTime() + mins * MIN);
    m.preferredTime = whenText(start);
  }
  return { m };
}

// Saves the lead, picks the link and sends the emails (in the background).
// source: 'voice call' | 'video call' | 'chat'
async function recordMeeting({ req, card, persona, m, source, cohort }) {
  const scheduled = !!m.startsAt;
  // A fixed time gets a meeting room; otherwise the owner's booking page, if any.
  m.bookingUrl = scheduled ? '' : bookingLinkFor(cleanBookingUrl(persona?.bookingUrl), m);
  m.meetingUrl = m.bookingUrl || `https://meet.jit.si/Aicardly-${card.username}-${crypto.randomBytes(5).toString('hex')}`;
  const linkWord = m.bookingUrl ? 'Booking link (pick a time)' : 'Meeting link';

  const ownerName = card.personalInfo?.name || card.title || 'the card owner';
  const message = [
    `Meeting request from the AI ${source}`,
    m.email ? `Email: ${m.email}` : '',
    `Purpose: ${m.purpose || '-'}`,
    scheduled ? `Scheduled: ${m.preferredTime}` : `Preferred time: ${m.preferredTime || '-'}`,
    m.notes ? `Notes: ${m.notes}` : '',
    `${linkWord}: ${m.meetingUrl}`,
  ].filter(Boolean).join('\n');
  // The visitor agreed with the AI to share these details with the owner (it asks first).
  await Enquiry.create({ vcardId: card._id, name: m.name, mobile: m.whatsapp, ...(m.email ? { email: m.email } : {}), message, consentAt: new Date(), cohort: cohort || 'live' });
  logEvent(req, 'ai.meeting', `AI ${source} on /${card.username} noted a meeting with ${m.name}`, { userId: card.userId });

  const waText = scheduled
    ? `Hi ${m.name}, this is ${ownerName}. Our meeting is set for ${m.preferredTime}. Join here: ${m.meetingUrl}`
    : m.bookingUrl
    ? `Hi ${m.name}, this is ${ownerName}. Thanks for talking to my AI assistant. Please pick a time for our meeting here: ${m.meetingUrl}`
    : `Hi ${m.name}, this is ${ownerName}. Thanks for talking to my AI assistant. Here is our meeting link${m.preferredTime ? ` for ${m.preferredTime}` : ''}: ${m.meetingUrl}`;
  const toCaller = `https://wa.me/${waDigits(m.whatsapp)}?text=${encodeURIComponent(waText)}`;
  const details = [
    `<b>WhatsApp:</b> ${esc(m.whatsapp)}`,
    m.email ? `<b>Email:</b> ${esc(m.email)}` : '',
    `<b>Purpose:</b> ${esc(m.purpose) || '-'}`,
    scheduled ? `<b>When:</b> ${esc(m.preferredTime)}` : `<b>Preferred time:</b> ${esc(m.preferredTime) || '-'}`,
  ].filter(Boolean).join('<br>');
  const cardLink = `<a href="${SITE}/${esc(card.username)}" style="color:#E70C65">aicardly.com/${esc(card.username)}</a>`;

  background((async () => {
    const [settings, owner] = await Promise.all([
      VcardSettings.findOne({ vcardId: card._id }).select('enquiryEmail').lean(),
      User.findById(card.userId).select('email name firstName').lean(),
    ]);
    const ownerTo = [...new Set([owner?.email, settings?.enquiryEmail].map((e) => String(e || '').trim().toLowerCase()).filter((e) => EMAIL_RE.test(e)))];
    const mails = [];
    const fromEmail = String(process.env.SMTP_FROM || process.env.SMTP_USER || 'webkikservices01@gmail.com').replace(/^.*<([^>]+)>.*$/, '$1');

    // The calendar invite for a fixed time: sent to everyone, so it lands in their calendars.
    let invite = null;
    let gcal = '';
    if (scheduled) {
      const summary = `Meeting: ${m.name} & ${ownerName}`;
      const description = `${m.purpose ? `About: ${m.purpose}\n` : ''}Join the video meeting: ${m.meetingUrl}\n\nWhatsApp: ${m.whatsapp}${m.email ? `\nEmail: ${m.email}` : ''}\nSet up by ${ownerName}'s AI assistant on aicardly.com/${card.username}`;
      const attendees = [...ownerTo.map((e) => ({ name: ownerName, email: e })), ...(m.email ? [{ name: m.name, email: m.email }] : [])];
      const ics = buildIcs({ uid: `${crypto.randomBytes(8).toString('hex')}@aicardly.com`, start: m.startsAt, end: m.endsAt, summary, description, url: m.meetingUrl, organizer: { name: `${ownerName} (Aicardly)`, email: fromEmail }, attendees });
      invite = { method: 'REQUEST', filename: 'meeting.ics', content: ics };
      gcal = googleCalLink({ start: m.startsAt, end: m.endsAt, summary, description, url: m.meetingUrl });
    }

    // 1. The card owner (+ a copy to the Aicardly team).
    const ownerMail = {
      subject: scheduled ? `Meeting scheduled: ${m.name}, ${m.preferredTime}` : `Meeting request from ${m.name} (via your AI ${source})`,
      text: `Hi ${owner?.firstName || owner?.name || ''},\n\n${m.name} talked to your AI assistant (${source}) on aicardly.com/${card.username} and wants a meeting.\n\nWhatsApp: ${m.whatsapp}\n${m.email ? `Email: ${m.email}\n` : ''}Purpose: ${m.purpose || '-'}\nPreferred time: ${m.preferredTime || '-'}\n${m.notes ? `Notes: ${m.notes}\n` : ''}\n${linkWord}: ${m.meetingUrl}\n\nMessage them on WhatsApp in one tap: ${toCaller}\n\n– Team Aicardly`,
      html: emailHtml({
        heading: scheduled ? `Meeting scheduled with ${esc(m.name)}` : `Meeting request from ${esc(m.name)}`,
        paragraphs: [
          scheduled
            ? `Your AI assistant scheduled a meeting with ${esc(m.name)} on a <b>${esc(source)}</b> from your card ${cardLink}. The calendar invite is attached${m.email ? ` and ${esc(m.name)} got it too` : ''}.`
            : `${esc(m.name)} talked to your AI assistant on a <b>${esc(source)}</b> from your card ${cardLink} and wants a meeting.`,
          details,
          m.notes ? `<b>AI notes:</b><br>${esc(m.notes)}` : '',
          `<b>${linkWord}:</b> <a href="${esc(m.meetingUrl)}" style="color:#E70C65">${esc(m.meetingUrl)}</a>`,
          scheduled
            ? `Can't make it? Message ${esc(m.name)} on WhatsApp to change the time: <a href="${esc(toCaller)}" style="color:#E70C65">open WhatsApp</a>.${gcal ? ` <a href="${esc(gcal)}" style="color:#E70C65">Add to Google Calendar</a>` : ''}`
            : m.bookingUrl
            ? `${m.email ? 'We\'ve emailed them your booking page too. ' : ''}Once they pick a time, ${/calendly/i.test(m.bookingUrl) ? 'Calendly' : 'your booking page'} sends the invite to both of you.`
            : 'Tip: add your Calendly or Google Calendar booking link in AI settings and visitors will pick a time themselves.',
        ].filter(Boolean),
        button: scheduled ? { label: 'Join the meeting', url: m.meetingUrl } : { label: `Message ${esc(m.name)} on WhatsApp`, url: toCaller },
      }),
      ...(invite ? { icalEvent: invite } : {}),
    };
    if (ownerTo.length) mails.push({ to: ownerTo.join(', '), ...ownerMail });
    const copy = String(COPY_TO || '').trim().toLowerCase();
    if (EMAIL_RE.test(copy) && !ownerTo.includes(copy)) {
      mails.push({ to: copy, ...ownerMail, subject: `[Copy] ${ownerMail.subject} on /${card.username}` });
    }

    // 2. The visitor, when they gave an email.
    if (m.email) {
      mails.push({
        to: m.email,
        replyTo: ownerTo[0],
        subject: scheduled ? `Meeting confirmed with ${ownerName}: ${m.preferredTime}` : m.bookingUrl ? `Pick a time to meet ${ownerName}` : `Your meeting link with ${ownerName}`,
        text: scheduled ? `Hi ${m.name},\n\nYour meeting with ${ownerName} is set for ${m.preferredTime}.\nJoin here: ${m.meetingUrl}\n\nThe calendar invite is attached.\n\n– ${ownerName} (via Aicardly)` : `Hi ${m.name},\n\nThanks for talking to ${ownerName}'s AI assistant. ${m.bookingUrl ? 'Pick a time that suits you here:' : 'Here is your meeting link:'}\n${m.meetingUrl}\n\n${m.preferredTime ? `You asked for: ${m.preferredTime}. ` : ''}${ownerName} will confirm.\n\n– ${ownerName} (via Aicardly)`,
        html: emailHtml({
          heading: scheduled ? 'Your meeting is confirmed ✅' : m.bookingUrl ? `Pick a time to meet ${esc(ownerName)}` : `Your meeting with ${esc(ownerName)}`,
          paragraphs: [
            `Hi ${esc(m.name)}, thanks for talking to ${esc(ownerName)}'s AI assistant.`,
            scheduled ? `Your meeting with <b>${esc(ownerName)}</b> is set for <b>${esc(m.preferredTime)}</b>. It's a video meeting: open the link at that time on your phone or computer (no app or account needed). The calendar invite is attached.${gcal ? ` <a href="${esc(gcal)}" style="color:#E70C65">Add to Google Calendar</a>` : ''}` : m.bookingUrl ? 'Choose a day and time that suits you. You\'ll get a calendar invite as soon as you book.' : `Here is your meeting link${m.preferredTime ? ` for <b>${esc(m.preferredTime)}</b>` : ''}. ${esc(ownerName)} will confirm the time with you on WhatsApp.`,
            m.purpose ? `<b>About:</b> ${esc(m.purpose)}` : '',
          ].filter(Boolean),
          button: { label: scheduled ? 'Join the meeting' : m.bookingUrl ? 'Book a time' : 'Open meeting link', url: m.meetingUrl },
          footer: `You shared these details with ${esc(ownerName)} on their Aicardly card ${cardLink}.`,
        }),
        ...(invite ? { icalEvent: invite } : {}),
      });
    }
    for (const mail of mails) await sendMail(mail);
  })());

  return { meetingUrl: m.meetingUrl, booking: !!m.bookingUrl, scheduled, startsAt: m.startsAt || null, when: scheduled ? m.preferredTime : '', invited: scheduled && !!m.email, name: m.name, preferredTime: m.preferredTime };
}

// The tool the AI calls (OpenAI Realtime format; the chat converts it for Claude).
const MEETING_TOOL = {
  type: 'function',
  name: 'save_meeting_request',
  description: 'Book a meeting with the card owner at the agreed time, after the visitor agreed to share their details. Creates the video meeting link and emails the calendar invite to the visitor and the owner. Returns the link and the confirmed time.',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Visitor\'s name' },
      whatsapp: { type: 'string', description: 'Visitor\'s WhatsApp number, digits with country code if given' },
      email: { type: 'string', description: 'Visitor\'s email for the calendar invite (optional; empty if they did not give one)' },
      purpose: { type: 'string', description: 'What the meeting is about' },
      start_time: { type: 'string', description: 'Exact agreed start in ISO 8601 with the India offset, e.g. 2026-10-08T16:00:00+05:30' },
      duration_minutes: { type: 'number', description: 'Length in minutes (default 30)' },
      preferred_time: { type: 'string', description: 'Only when no exact time could be agreed: what the visitor said' },
      notes: { type: 'string', description: 'Short notes of what the visitor needs (2 to 4 points)' },
    },
    required: ['name', 'whatsapp', 'purpose'],
  },
};

const meetingRules = (ownerName, { booking, spoken }) => {
  const who = spoken ? 'caller' : 'visitor';
  const done = spoken
    ? `say "Done! Your meeting with ${ownerName} is booked for <day, date and time>. The meeting link is on your screen and the calendar invite is in your email." (mention the email only if they gave one)`
    : 'confirm the day, date and time, give the link as a markdown link [Join the meeting](link) and say the calendar invite is in their email (only if they gave one)';
  const fallback = booking
    ? ` If they really cannot choose a time, call save_meeting_request without start_time: it returns ${ownerName}'s booking page to pick a time${spoken ? ' (a green button on their screen)' : ' (give it as [Pick a time](link))'}.`
    : '';
  return `- MEETINGS: ${nowContext()} If the ${who} wants a meeting, demo, appointment or a call with ${ownerName}, book it yourself: ask one at a time for their name, their WhatsApp number, their email (so the calendar invite reaches them), what it is about, and which day and time suits them (suggest Monday to Saturday, 10 AM to 7 PM IST if they ask). ${spoken ? 'Read the number and the email back once to confirm. ' : ''}Turn their day and time into an exact date and time (for example "kal 4 baje" means tomorrow at 4:00 PM) and say it back in full, for example "Thursday, 8 October, 4 PM". Then ask "Shall I book it and share these details with ${ownerName}?" and only after a yes call save_meeting_request with start_time in ISO 8601 with +05:30 (and short notes of what they need). If it returns an error, sort it out with the ${who} and try again.
- When it succeeds the meeting is booked: ${done}.${fallback} Never say a meeting is booked before the tool succeeds.`;
};

module.exports = { nowContext, buildIcs, parseMeeting, recordMeeting, cleanBookingUrl, bookingLinkFor, waDigits, MEETING_TOOL, meetingRules };
