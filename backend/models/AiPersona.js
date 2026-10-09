const mongoose = require('mongoose');

const AiPersonaSchema = new mongoose.Schema({
  vcardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true, unique: true },
  enabled:   { type: Boolean, default: true },
  aiName:    { type: String, default: 'AI Assistant' },
  tone:      { type: String, enum: ['formal', 'friendly', 'casual'], default: 'friendly' },
  greeting:  { type: String, default: 'Hi! How can I help you today?' },
  aboutText: { type: String, default: '' },
  faqs:      [{ question: String, answer: String }],
  // Longer reference notes the assistant answers from (policies, packages, process...).
  knowledge: [{ title: String, content: String }],
  // Profession preset from constants/niches.json.
  niche:          { type: String, default: 'general' },
  // Consulting mode: understand the visitor's need, then recommend the right service / offer.
  consultingMode: { type: Boolean, default: false },
  // Extra words/topics the owner never wants the assistant to discuss.
  blockedTopics:  [String],
  // Final offering shown at the end of a conversation (e.g. "Book a free consultation").
  offer: {
    title: { type: String, default: '' },
    url:   { type: String, default: '' },
    cta:   { type: String, default: '' },
  },
  // Ask visitors for a 0-10 rating (NPS) at the end of a chat.
  npsEnabled: { type: Boolean, default: true },
  // Live AI calls on the card (the plan decides which exist; the owner can switch them off).
  voiceCall: { type: Boolean, default: true },
  videoCall: { type: Boolean, default: true },
  // 'auto' = matches the owner (male name -> male voice). voicePicked: the owner chose one voice.
  voiceName: { type: String, default: 'auto' },
  voicePicked: { type: Boolean, default: false },
  voiceGender: { type: String, default: '' },    // guessed from the owner's first name (cached)
  voiceGenderFor: { type: String, default: '' }, // the first name it was guessed for
  // The owner's booking page (Calendly / Google Calendar appointments): the AI gives it to visitors
  // who want a meeting (services/meetings.js).
  bookingUrl: { type: String, default: '' }, // the AI's speaking voice on calls
  // Owner accepted the Data Processing Addendum for visitor data handled by the assistant.
  dpaAcceptedAt: { type: Date, default: null },
  dpaVersion:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AiPersona', AiPersonaSchema);
