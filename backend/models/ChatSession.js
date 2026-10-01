const mongoose = require('mongoose');

// One visitor conversation with a card's AI assistant, for the owner's funnel and NPS.
// Stores counts and outcomes only, never the message text (data minimisation).
const ChatSessionSchema = new mongoose.Schema({
  vcardId:    { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true, index: true },
  sessionId:  { type: String, required: true },
  // 'live' for normal visitors, or the dipstick test-group name from ?dipstick=<name>.
  cohort:     { type: String, default: 'live' },
  consentAt:  { type: Date, default: null },
  consentVersion: { type: String, default: '' },
  messages:   { type: Number, default: 0 },
  blocked:    { type: Number, default: 0 },
  offerShown: { type: Boolean, default: false },
  offerClicked: { type: Boolean, default: false },
  nps:        { type: Number, min: 0, max: 10, default: null },
  feedback:   { type: String, default: '' },
  lastAt:     { type: Date, default: Date.now },
}, { timestamps: true });

ChatSessionSchema.index({ vcardId: 1, sessionId: 1 }, { unique: true });
// Admin dashboard: chats per day.
ChatSessionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
