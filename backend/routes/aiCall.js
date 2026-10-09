// Live AI calls from a public card: the visitor talks to the card's AI assistant by voice
// (Smart AI Card, AI Agent Pro) or in a video call where the AI also sees their camera
// (AI Agent Pro). Audio goes straight between the browser and OpenAI Realtime over WebRTC;
// this route only checks the plan and limits, writes the assistant's instructions from the
// card, and hands out a short-lived client secret (the API key never reaches the browser).
const express = require('express');
const router = express.Router();
const vCard = require('../models/vCard');
const User = require('../models/User');
const AiPersona = require('../models/AiPersona');
const AiCall = require('../models/AiCall');
const Product = require('../models/Product');
const Portfolio = require('../models/Portfolio');
const Testimonial = require('../models/Testimonial');
const Gallery = require('../models/Gallery');
const CustomSection = require('../models/CustomSection');
const { callFeatures } = require('../constants/plans');
const { aiCallLimiter } = require('../middleware/rateLimiter');
const { logEvent } = require('../utils/logger');
const { buildSystemPrompt, DEFAULT_PERSONA } = require('./ai');
const { voiceFor } = require('../services/voiceGender');
const background = require('../utils/background');
const { parseMeeting, recordMeeting, cleanBookingUrl, MEETING_TOOL, meetingRules } = require('../services/meetings');
const { parseRequest, sendInfo, WHATSAPP_TOOL, whatsappRules } = require('../services/whatsappInfo');

// The one tool the call AI has: write down a meeting the caller wants with the card owner. The
// browser runs it (POST /:username/meeting): services/meetings.js saves the lead, picks the link
// (the owner's booking page or a Jitsi room) and sends the emails.

const MODELS = {
  voice: process.env.AI_CALL_MODEL || 'gpt-realtime-mini',
  video: process.env.AI_VIDEO_CALL_MODEL || 'gpt-realtime', // takes camera pictures too
};
const MAX_SECONDS = Math.max(60, Math.min(1800, Number(process.env.AI_CALL_MAX_SECONDS) || 300));
const DAILY_MINUTES = Math.max(5, Number(process.env.AI_CALL_DAILY_MINUTES) || 60);

const cohortOf = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30) || 'live';
const startOfDay = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// What a card offers right now: { voice, video } for this owner's plan and switches.
async function cardCalls(username) {
  const card = await vCard.findOne({ username });
  if (!card) return { card: null, calls: { voice: false, video: false } };
  const owner = await User.findById(card.userId);
  const persona = (await AiPersona.findOne({ vcardId: card._id })) || DEFAULT_PERSONA;
  if (!owner || owner.deletedAt || owner.isBlocked || persona.enabled === false) return { card, owner, persona, calls: { voice: false, video: false } };
  const plan = callFeatures(owner);
  const configured = !!process.env.OPENAI_API_KEY;
  return {
    card,
    owner,
    persona,
    calls: {
      voice: configured && plan.voice && persona.voiceCall !== false,
      video: configured && plan.video && persona.videoCall !== false,
    },
  };
}

// Seconds of AI calls this card has used today (an unfinished call counts at its limit).
async function usedToday(vcardId) {
  const calls = await AiCall.find({ vcardId, createdAt: { $gte: startOfDay() } }).select('seconds maxSeconds').lean();
  return calls.reduce((s, c) => s + (c.seconds ?? c.maxSeconds), 0);
}

function callInstructions(base, { mode, ownerName, greeting, aiName, booking, gender }) {
  return `${base}

=== LIVE ${mode === 'video' ? 'VIDEO' : 'VOICE'} CALL — these rules override anything above ===
- You are speaking on a live ${mode === 'video' ? 'video' : 'phone'} call, as ${aiName || 'the AI assistant'} for ${ownerName}. Everything you say is spoken aloud.
- Start the call yourself with a short, warm hello, for example: "${String(greeting || `Hi! I'm ${ownerName}'s AI assistant. How can I help you?`).replace(/"/g, "'").slice(0, 200)}"
- Speak naturally in 1–3 short sentences, then let the caller talk. No lists, no markdown, no emojis.
- Never read out web links, markers like [[...]] or long numbers digit by digit unless asked. Say "it's on the card" for links, projects, products and photos.
- Language: speak Hinglish by default, the natural mix of Hindi and English Indians use on calls (for example: "Haan ji, bilkul! Aap kis cheez ke baare mein jaanna chahte hain?"). If the caller speaks only English, reply in simple Indian English; if only Hindi, reply in Hindi. Switch when they switch. Pronounce Hindi words naturally, like a native Indian speaker, and say numbers and prices the Indian way (for example "do hazaar rupaye").
- Keep each reply short (one or two sentences) so the call feels quick, and stop as soon as the caller starts speaking.
${meetingRules(ownerName, { booking, spoken: true })}
${whatsappRules(ownerName, { spoken: true })}
- If they want to buy or talk to ${ownerName} personally right now, tell them how to reach ${ownerName} (the contact details above) and offer to answer anything else.
- If the caller is silent or unclear, ask one short question. If they say bye, say a short goodbye.${mode === 'video' ? `
- VIDEO: you sometimes receive a still picture from the caller's camera. Use it only when it helps (for example, they show you a product, a document or a place). Do not describe or comment on the caller's looks, and never guess who a person is, their age, religion, caste or health.` : ''}
- You speak with a ${gender === 'male' ? 'male' : 'female'} voice, so in Hindi use ${gender === 'male' ? 'masculine forms ("main bata sakta hoon", "main aapki help karta hoon")' : 'feminine forms ("main bata sakti hoon", "main aapki help karti hoon")'}.
- You are an AI assistant, not ${ownerName}. If asked, say so honestly.`;
}

// GET /api/ai-call/:username/status → { voice, video } (the card shows call buttons for these)
router.get('/:username/status', async (req, res) => {
  try {
    const { card, owner, persona, calls } = await cardCalls(req.params.username);
    // Work out the auto voice (male/female from the owner's name) now, so the call starts fast.
    if (calls.voice && persona?._id) background(voiceFor(persona, card.personalInfo?.name || owner?.name));
    res.json({ ...calls, maxSeconds: MAX_SECONDS });
  } catch {
    res.json({ voice: false, video: false });
  }
});

// POST /api/ai-call/:username/start  { mode: voice|video, consent: true, cohort }
router.post('/:username/start', aiCallLimiter, async (req, res) => {
  try {
    const mode = req.body.mode === 'video' ? 'video' : 'voice';
    if (req.body.consent !== true) return res.status(428).json({ msg: 'Please accept the call notice to continue.', needConsent: true });
    const { card, owner, persona, calls } = await cardCalls(req.params.username);
    if (!card) return res.status(404).json({ msg: 'Card not found' });
    if (!calls[mode]) {
      return res.status(403).json({ msg: mode === 'video' ? 'AI video calls are not available on this card.' : 'AI calls are not available on this card.' });
    }
    const used = await usedToday(card._id);
    const left = DAILY_MINUTES * 60 - used;
    if (left < 30) {
      logEvent(req, 'ai.call.limit', `AI calls on /${card.username} reached today's limit`, { level: 'warn', userId: card.userId });
      return res.status(429).json({ msg: `${card.personalInfo?.name || 'This card'}'s AI is busy on calls right now. Please try again later or use the chat.` });
    }
    const maxSeconds = Math.min(MAX_SECONDS, left);

    const [products, portfolio, testimonials, gallery, customSections] = await Promise.all([
      Product.find({ vcardId: card._id }).sort('order'),
      Portfolio.find({ vcardId: card._id }).sort('order'),
      Testimonial.find({ vcardId: card._id }),
      Gallery.find({ vcardId: card._id }).sort('order'),
      CustomSection.find({ vcardId: card._id }).sort('order'),
    ]);
    const ownerName = card.personalInfo?.name || owner.name || 'the card owner';
    // The voice matches the owner unless they picked one (male name -> male voice).
    const { voice, gender } = await voiceFor(persona, ownerName);
    const instructions = callInstructions(buildSystemPrompt(persona, card, products, portfolio, testimonials, gallery, customSections), {
      mode,
      ownerName,
      greeting: persona.greeting,
      aiName: persona.aiName,
      booking: !!cleanBookingUrl(persona.bookingUrl),
      gender,
    });
    const model = MODELS[mode];

    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: 120 }, // only to open the call
        session: {
          type: 'realtime',
          model,
          instructions,
          audio: {
            input: {
              // Phones and laptops on speaker: filter room noise and the AI's own echo, and only
              // treat clear speech as the caller talking (so the AI isn't cut off by noise).
              noise_reduction: { type: 'far_field' },
              turn_detection: { type: 'server_vad', threshold: 0.7, prefix_padding_ms: 300, silence_duration_ms: 650, create_response: true, interrupt_response: true },
            },
            output: { voice },
          },
          tools: [MEETING_TOOL, WHATSAPP_TOOL],
          tool_choice: 'auto',
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.value) {
      logEvent(req, 'ai.call.error', `Could not open an AI call on /${card.username}: ${r.status} ${data.error?.message || ''}`.slice(0, 400), { level: 'error', userId: card.userId });
      return res.status(502).json({ msg: 'The AI call could not start right now. Please try the chat instead.' });
    }
    const call = await AiCall.create({ vcardId: card._id, userId: card.userId, mode, model, maxSeconds, cohort: cohortOf(req.body.cohort) });
    logEvent(req, 'ai.call.start', `AI ${mode} call started on /${card.username}`, { userId: card.userId });
    res.json({ callId: String(call._id), clientSecret: data.value, model, maxSeconds, voice });
  } catch (err) {
    logEvent(req, 'ai.call.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'The AI call could not start right now. Please try again.' });
  }
});

// POST /api/ai-call/:username/meeting  { callId, name, whatsapp, email, purpose, preferred_time, notes }
// Run by the browser when the call AI calls save_meeting_request.
router.post('/:username/meeting', aiCallLimiter, async (req, res) => {
  try {
    const id = String(req.body.callId || '');
    if (!/^[a-f0-9]{24}$/.test(id)) return res.status(400).json({ msg: 'Bad call id' });
    const card = await vCard.findOne({ username: req.params.username }).select('_id userId username personalInfo');
    const call = card && (await AiCall.findOne({ _id: id, vcardId: card._id }));
    if (!call) return res.status(404).json({ msg: 'Call not found' });
    if (Date.now() - call.createdAt.getTime() > 2 * 3600 * 1000) return res.status(400).json({ msg: 'This call has ended.' });
    if ((call.meetings || []).length >= 3) return res.status(429).json({ msg: 'Meetings already noted for this call.' });

    const parsed = parseMeeting(req.body);
    if (parsed.error) return res.status(400).json({ msg: parsed.error });
    const persona = (await AiPersona.findOne({ vcardId: card._id }).select('bookingUrl').lean()) || {};
    const out = await recordMeeting({ req, card, persona, m: parsed.m, source: `${call.mode} call`, cohort: call.cohort });
    call.meetings.push(parsed.m);
    await call.save();
    res.json({ ok: true, ...out });
  } catch (err) {
    logEvent(req, 'ai.call.meeting.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'Could not save the meeting.' });
  }
});

// POST /api/ai-call/:username/end  { callId, seconds }
// POST /api/ai-call/:username/whatsapp  { callId, name, whatsapp, topic, summary }
// Run by the browser when the call AI calls send_whatsapp_info.
router.post('/:username/whatsapp', aiCallLimiter, async (req, res) => {
  try {
    const id = String(req.body.callId || '');
    if (!/^[a-f0-9]{24}$/.test(id)) return res.status(400).json({ msg: 'Bad call id' });
    const card = await vCard.findOne({ username: req.params.username }).select('_id userId username title personalInfo dynamicLinks services');
    const call = card && (await AiCall.findOne({ _id: id, vcardId: card._id }));
    if (!call) return res.status(404).json({ msg: 'Call not found' });
    if (Date.now() - call.createdAt.getTime() > 2 * 3600 * 1000) return res.status(400).json({ msg: 'This call has ended.' });
    if ((call.whatsappSends || 0) >= 3) return res.status(429).json({ msg: 'Already sent on WhatsApp for this call.' });
    const parsed = parseRequest(req.body);
    if (parsed.error) return res.status(400).json({ msg: parsed.error });
    await AiCall.updateOne({ _id: call._id }, { $inc: { whatsappSends: 1 } });
    const out = await sendInfo({ req, card, r: parsed.r, source: `${call.mode} call`, cohort: call.cohort });
    res.json({ ok: true, ...out });
  } catch (err) {
    logEvent(req, 'ai.call.whatsapp.error', err.message, { level: 'error' });
    res.status(500).json({ msg: 'Could not send it on WhatsApp.' });
  }
});

router.post('/:username/end', async (req, res) => {
  try {
    const id = String(req.body.callId || '');
    if (!/^[a-f0-9]{24}$/.test(id)) return res.status(400).json({ msg: 'Bad call id' });
    const call = await AiCall.findById(id);
    if (!call || call.endedAt) return res.json({ ok: true });
    call.seconds = Math.max(0, Math.min(call.maxSeconds, Math.round(Number(req.body.seconds) || 0)));
    call.endedAt = new Date();
    await call.save();
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

module.exports = router;
module.exports.cardCalls = cardCalls;
