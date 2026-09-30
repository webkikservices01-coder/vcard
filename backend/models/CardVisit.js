const mongoose = require('mongoose');

// Live visitor counter for public cards: who is on the card right now, and views per day.

// One row per open card tab, refreshed while the page polls; MongoDB deletes it 10 minutes
// after the last refresh. "Viewing now" = rows refreshed in the last minute.
const CardPresenceSchema = new mongoose.Schema({
  vcardId:  { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
  visitor:  { type: String, required: true }, // random id kept in the visitor's session storage
  lastSeen: { type: Date, default: Date.now },
});
CardPresenceSchema.index({ vcardId: 1, visitor: 1 }, { unique: true });
CardPresenceSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 600 });

// Views per card per day (India time), for "Today".
const CardDayViewSchema = new mongoose.Schema({
  vcardId: { type: mongoose.Schema.Types.ObjectId, ref: 'vCard', required: true },
  day:     { type: String, required: true }, // YYYY-MM-DD in IST
  count:   { type: Number, default: 0 },
});
CardDayViewSchema.index({ vcardId: 1, day: 1 }, { unique: true });

module.exports = {
  CardPresence: mongoose.model('CardPresence', CardPresenceSchema),
  CardDayView: mongoose.model('CardDayView', CardDayViewSchema),
};
