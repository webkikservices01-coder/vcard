const mongoose = require('mongoose');

// A wedding invitation made in the dashboard (Wedding Invite tab), shown at /invite/<link>.
// `template` is one of constants/weddingTemplates.js; the couple's own text and photos are in
// the other fields — anything left empty falls back to the template's sample content.
const ceremonySchema = new mongoose.Schema({
  icon: { type: String, default: '' },
  hi: { type: String, default: '' }, // name in the template's script (e.g. हल्दी)
  name: { type: String, default: '' },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  venue: { type: String, default: '' },
}, { _id: false });

const timelineSchema = new mongoose.Schema({
  y: { type: String, default: '' },
  h: { type: String, default: '' },
  t: { type: String, default: '' },
}, { _id: false });

const weddingInviteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  link: { type: String, required: true, unique: true, lowercase: true, trim: true },
  template: { type: String, required: true },
  coupleOne: { type: String, default: '' },
  coupleTwo: { type: String, default: '' },
  amp: { type: String, default: '&' },
  script: { type: String, default: '' },
  tagline: { type: String, default: '' },
  date: { type: String, default: '' }, // shown as written, e.g. "18 February 2027"
  eventDate: { type: Date, default: null }, // for the countdown
  venueName: { type: String, default: '' },
  venueAddress: { type: String, default: '' },
  mapUrl: { type: String, default: '' },
  story: { type: String, default: '' },
  hashtag: { type: String, default: '' },
  ceremonies: { type: [ceremonySchema], default: undefined },
  timeline: { type: [timelineSchema], default: undefined },
  image: { type: String, default: '' }, // couple / cover photo
  photos: { type: [String], default: [] }, // "Our Moments" gallery
  music: { type: String, default: '' },
  video: { type: String, default: '' },
  hostPhone: { type: String, default: '' }, // shown for "Call / WhatsApp the family"
  published: { type: Boolean, default: true },
  rsvpOpen: { type: Boolean, default: true },
  showWishes: { type: Boolean, default: true },
  aiChat: { type: Boolean, default: true }, // AI assistant guests can ask about the wedding
  opening: { type: String, default: '' }, // '' = the design's own: classic | shutter | scratch
  coupleArt: { type: String, default: '' }, // '' = the design's own, 'none', or hindu | south | nikkah | modern
  views: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('WeddingInvite', weddingInviteSchema);
