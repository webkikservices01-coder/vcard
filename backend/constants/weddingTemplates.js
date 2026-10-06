// The wedding invitation templates on offer (their designs are in FRONTEND/src/wedding).
// Keep this list in sync with FRONTEND/src/wedding/data/templates.ts.
const WEDDING_TEMPLATES = [
  'india-taj-heritage',
  'india-shiv-parwati-divine',
  'luxury-silver-gold',
  'vogue-silver-gold',
  'india-royal-rajwada',
  'india-punjabi-anand-karaj',
  'india-marwari-rajasthani-phere',
  'india-tamil-iyer-muhurtham',
  'uae-burj-skyline',
  'france-eiffel-grand',
  'ayodhya-ram-mandir',
  'meenakshi-temple-kalyanam',
  'nikkah-moonlight',
  'blush-couple-story',
];

// How an invite opens ('' = the design's own) and the animated couple drawn in the hero
// ('' = the design's own, 'none' = hidden).
const WEDDING_OPENINGS = ['', 'classic', 'shutter', 'scratch'];
const WEDDING_COUPLE_ART = ['', 'none', 'hindu', 'south', 'nikkah', 'modern'];

const MAX_INVITES_PER_USER = 5;

module.exports = { WEDDING_TEMPLATES, WEDDING_OPENINGS, WEDDING_COUPLE_ART, MAX_INVITES_PER_USER };
