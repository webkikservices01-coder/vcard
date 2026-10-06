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

const MODELS = {
  voice: process.env.AI_CALL_MODEL || 'gpt-realtime-mini',
  video: process.env.AI_VIDEO_CALL_MODEL || 'gpt-realtime', // takes camera pictures too
};
const MAX_SECONDS = Math.max(60, Math.min(1800, Number(process.env.AI_CALL_MAX_SECONDS) || 300));
const DAILY_MINUTES = Math.max(5, Number(process.env.AI_CALL_DAILY_MINUTES) || 60);
const VOICES = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];

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

function callInstructions(base, { mode, ownerName, greeting, aiName }) {
  return `${base}

=== LIVE ${mode === 'video' ? 'VIDEO' : 'VOICE'} CALL — these rules override anything above ===
- You are speaking on a live ${mode === 'video' ? 'video' : 'phone'} call, as ${aiName || 'the AI assistant'} for ${ownerName}. Everything you say is spoken aloud.
- Start the call yourself with a short, warm hello, for example: "${String(greeting || `Hi! I'm ${ownerName}'s AI assistant. How can I help you?`).replace(/"/g, "'").slice(0, 200)}"
- Speak naturally in 1–3 short sentences, then let the caller talk. No lists, no markdown, no emojis.
- Never read out web links, markers like [[...]] or long numbers digit by digit unless asked. Say "it's on the card" for links, projects, products and photos.
- Language: answer in the language the caller speaks — English, Hindi or Hinglish — and switch when they switch.
- If they want to book, buy or talk to ${ownerName} personally, tell them how to reach ${ownerName} (the contact details above) and offer to answer anything else.
- If the caller is silent or unclear, ask one short question. If they say bye, say a short goodbye.${mode === 'video' ? `
- VIDEO: you sometimes receive a still picture from the caller's camera. Use it only when it helps (for example, they show you a product, a document or a place). Do not describe or comment on the caller's looks, and never guess who a person is, their age, religion, caste or health.` : ''}
- You are an AI assistant, not ${ownerName}. If asked, say so honestly.`;
}

// GET /api/ai-call/:username/status → { voice, video } (the card shows call buttons for these)
router.get('/:username/status', async (req, res) => {
  try {
    const { calls } = await cardCalls(req.params.username);
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
    const instructions = callInstructions(buildSystemPrompt(persona, card, products, portfolio, testimonials, gallery, customSections), {
      mode,
      ownerName,
      greeting: persona.greeting,
      aiName: persona.aiName,
    });
    const model = MODELS[mode];
    const voice = VOICES.includes(persona.voiceName) ? persona.voiceName : 'marin';

    const r = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expires_after: { anchor: 'created_at', seconds: 120 }, // only to open the call
        session: { type: 'realtime', model, instructions, audio: { output: { voice } } },
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

// POST /api/ai-call/:username/end  { callId, seconds }
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
