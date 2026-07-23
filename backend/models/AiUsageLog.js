const mongoose = require('mongoose');

const AiUsageLogSchema = new mongoose.Schema({
  route:         { type: String, enum: ['chat', 'voice-fill', 'jarvis'], required: true },
  vcardId:       { type: mongoose.Schema.Types.ObjectId, ref: 'vCard' },
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  model:         { type: String, required: true },
  inputTokens:   { type: Number, required: true },
  outputTokens:  { type: Number, required: true },
  costUsd:       { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('AiUsageLog', AiUsageLogSchema);
