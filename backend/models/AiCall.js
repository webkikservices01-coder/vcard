const mongoose = require('mongoose');

// One live AI call (voice or video) a visitor made from a public card. Minutes are counted per
// card per day so the calls stay within budget; a call that was never ended counts at its limit.
const AiCallSchema = new mongoose.Schema({
  vcardId:    { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true, index: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // card owner
  mode:       { type: String, enum: ['voice', 'video'], required: true },
  model:      { type: String, default: '' },
  maxSeconds: { type: Number, required: true },
  seconds:    { type: Number, default: null }, // set when the call ends
  endedAt:    { type: Date, default: null },
  cohort:     { type: String, default: 'live' },
  // Meetings the AI noted on the call (save_meeting_request): the caller's details and the link.
  whatsappSends: { type: Number, default: 0 }, // send_whatsapp_info calls on this call
  meetings: [{
    name: String, whatsapp: String, email: String, purpose: String, preferredTime: String, notes: String,
    meetingUrl: String, bookingUrl: String, at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

AiCallSchema.index({ vcardId: 1, createdAt: -1 });

module.exports = mongoose.model('AiCall', AiCallSchema);
