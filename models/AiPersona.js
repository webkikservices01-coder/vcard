const mongoose = require('mongoose');

const AiPersonaSchema = new mongoose.Schema({
  vcardId:   { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true, unique: true },
  enabled:   { type: Boolean, default: true },
  aiName:    { type: String, default: 'AI Assistant' },
  tone:      { type: String, enum: ['formal', 'friendly', 'casual'], default: 'friendly' },
  greeting:  { type: String, default: 'Hi! How can I help you today?' },
  aboutText: { type: String, default: '' },
  faqs:      [{ question: String, answer: String }],
}, { timestamps: true });

module.exports = mongoose.model('AiPersona', AiPersonaSchema);
