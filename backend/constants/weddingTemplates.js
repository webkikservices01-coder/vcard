// The Digital Invite designs on offer (their looks are in FRONTEND/src/wedding), each with its
// occasion (constants/occasions.js). Keep in sync with FRONTEND/src/wedding/data/templates.ts.
const TEMPLATE_OCCASION = {
  'india-taj-heritage': 'wedding',
  'india-shiv-parwati-divine': 'wedding',
  'luxury-silver-gold': 'wedding',
  'vogue-silver-gold': 'wedding',
  'india-royal-rajwada': 'wedding',
  'india-punjabi-anand-karaj': 'wedding',
  'india-marwari-rajasthani-phere': 'wedding',
  'india-tamil-iyer-muhurtham': 'wedding',
  'uae-burj-skyline': 'wedding',
  'france-eiffel-grand': 'wedding',
  'ayodhya-ram-mandir': 'wedding',
  'meenakshi-temple-kalyanam': 'wedding',
  'nikkah-moonlight': 'wedding',
  'blush-couple-story': 'wedding',
  // Invite Studio designs (FRONTEND/src/wedding/studio): their own renderer and colour palettes.
  'studio-rajputana-haveli': 'wedding',
  'studio-pichwai-lotus-temple': 'wedding',
  'studio-moroccan-riad-nikah': 'wedding',
  'studio-anand-karaj': 'wedding',
  'studio-south-indian-kalyanam': 'wedding',
  'studio-english-garden-chapel': 'wedding',
  'studio-royal-velvet-reception': 'wedding',
  'studio-minimal-letterpress': 'wedding',
  'engagement-rose-rings': 'engagement',
  'engagement-roka-marigold': 'engagement',
  'anniversary-golden-jubilee': 'anniversary',
  'birthday-balloon-bash': 'birthday',
  'birthday-gold-milestone': 'birthday',
  'diwali-diya-night': 'diwali',
  'diwali-wishes-rangoli': 'wishes',
  'griha-pravesh-toran': 'housewarming',
  'babyshower-godh-bharai': 'babyshower',
  'holi-wishes-colours': 'wishes',
  'eid-mubarak-crescent': 'wishes',
  'new-year-sparkle': 'wishes',
};
const WEDDING_TEMPLATES = Object.keys(TEMPLATE_OCCASION);
const occasionOf = (template) => TEMPLATE_OCCASION[template] || 'wedding';

// How an invite opens ('' = the design's own) and the animated couple drawn in the hero
// ('' = the design's own, 'none' = hidden).
const WEDDING_OPENINGS = ['', 'classic', 'shutter', 'scratch'];
const WEDDING_COUPLE_ART = ['', 'none', 'hindu', 'south', 'nikkah', 'modern'];

const MAX_INVITES_PER_USER = 10;

module.exports = { WEDDING_TEMPLATES, TEMPLATE_OCCASION, occasionOf, WEDDING_OPENINGS, WEDDING_COUPLE_ART, MAX_INVITES_PER_USER };
