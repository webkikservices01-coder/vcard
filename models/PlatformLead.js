const mongoose = require('mongoose');

// Anonymous, pre-signup leads captured by the platform chatbot's guided flow
// (e.g. enterprise / white-label AI Agent Pro enquiries). Distinct from
// SupportTicket (requires a logged-in user) and Enquiry (scoped to a vCard's
// own visitors) — this is a marketing-site lead with no account yet.
const PlatformLeadSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, default: '' },
  phone:        { type: String, default: '' },
  businessName: { type: String, default: '' },
  need:         { type: String, default: '' },
  budget:       { type: String, default: '' },
  timeline:     { type: String, default: '' },
  message:      { type: String, default: '' },
  source:       { type: String, default: 'chatbot' },
  status:       { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('PlatformLead', PlatformLeadSchema);
