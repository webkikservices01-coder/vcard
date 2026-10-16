const mongoose = require('mongoose');

// The team's wording for an automatic email (admin panel → Email templates). Only what is set
// here replaces the built-in text; links, buttons and details stay as the code builds them.
// Placeholders like {name} are filled in when the email is sent (services/emailTemplates.js).
const EmailTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    subject: { type: String, default: '' },
    heading: { type: String, default: '' },
    intro: { type: String, default: '' }, // first paragraph
    enabled: { type: Boolean, default: true }, // false = this email is not sent (only for optional emails)
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
