const mongoose = require('mongoose');

// Settings the team changes from the admin panel (Settings and Website chatbot pages), one
// document per group (key). Read through services/siteSettings.js, which caches them.
const SiteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: String, default: '' },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
