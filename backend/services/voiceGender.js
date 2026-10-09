// The AI's speaking voice on calls. With voice "auto" (the default) it matches the card owner:
// a man's card gets a male voice, a woman's card a female one. The owner's gender is guessed
// once from their name (Claude Haiku) and kept on the persona (voiceGender + voiceGenderFor).
const AiPersona = require('../models/AiPersona');

const VOICES = ['marin', 'cedar', 'alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
const MALE = ['cedar', 'ash', 'echo', 'verse', 'ballad'];
const AUTO = { male: 'cedar', female: 'marin' };
const MODEL = process.env.VOICE_GENDER_MODEL || 'claude-sonnet-5'; // once per card, so accuracy over cost

// "Dr. Ravineet Singh Marwah" -> "Ravineet"
const TITLES = new Set(['dr', 'mr', 'mrs', 'ms', 'miss', 'shri', 'smt', 'er', 'ca', 'adv', 'prof', 'sri']);
const wordsOf = (name) => String(name || '').toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
const firstName = (name) => wordsOf(name).find((w) => !TITLES.has(w)) || '';

async function guessGender(name) {
  const words = wordsOf(name);
  // Sikh names: Kaur is only women's, Singh only men's (the first name is often both).
  if (words.includes('kaur') || ['mrs', 'ms', 'miss', 'smt'].includes(words[0])) return 'female';
  if (words.includes('singh') || ['mr', 'shri'].includes(words[0])) return 'male';
  const first = firstName(name);
  if (!first || !process.env.ANTHROPIC_API_KEY) return '';
  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: 'You classify Indian personal names by the gender they are usually given to (for example Ravineet, Umandeep, Shubham, Arjun are male; Sakshi, Neha, Priya are female). If it is a business or brand name, or truly unisex, say unknown. Reply with exactly one word: male, female or unknown.',
      messages: [{ role: 'user', content: `Name: ${String(name).slice(0, 80)}` }],
    });
    const word = (r.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').toLowerCase().replace(/[^a-z]/g, '');
    return word === 'male' || word === 'female' ? word : '';
  } catch (err) {
    console.error('[voiceGender]', err.message);
    return '';
  }
}

// -> { voice, gender } for this call. persona is a document or plain object; ownerName the card's name.
async function voiceFor(persona, ownerName) {
  const picked = persona?.voicePicked && VOICES.includes(persona.voiceName) ? persona.voiceName : '';
  if (picked) return { voice: picked, gender: MALE.includes(picked) ? 'male' : 'female' };
  const key = wordsOf(ownerName).join(' ').slice(0, 80);
  let gender = persona?.voiceGenderFor === key ? persona.voiceGender || '' : null;
  if (gender === null) {
    gender = await guessGender(ownerName);
    if (persona?._id) await AiPersona.updateOne({ _id: persona._id }, { $set: { voiceGender: gender, voiceGenderFor: key } }).catch(() => {});
  }
  return { voice: AUTO[gender] || AUTO.female, gender: gender || 'female' };
}

module.exports = { VOICES, voiceFor, guessGender };
