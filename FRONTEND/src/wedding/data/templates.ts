import monumentTaj from "../assets/monument-taj.jpg";
import monumentRedFort from "../assets/monument-redfort.jpg";
import monumentJaipur from "../assets/monument-jaipur.jpg";
import monumentBurj from "../assets/monument-burj.jpg";
import monumentMosque from "../assets/monument-mosque.jpg";
import monumentDesert from "../assets/monument-desert.jpg";
import monumentEiffel from "../assets/monument-eiffel.jpg";
import monumentProvence from "../assets/monument-provence.jpg";
import monumentParisCafe from "../assets/monument-paris-cafe.jpg";
import monumentBeverly from "../assets/monument-beverly.jpg";
import monumentVenice from "../assets/monument-venice.jpg";
import monumentAmalfi from "../assets/monument-amalfi.jpg";
import monumentTuscany from "../assets/monument-tuscany.jpg";
import sceneAyodhya from "../assets/scene-ayodhya.svg";
import sceneMeenakshi from "../assets/scene-meenakshi.svg";
import sceneNikkah from "../assets/scene-nikkah.svg";
import scenePastel from "../assets/scene-pastel.svg";
import { scene, type SceneKind } from "./scenes";
import type { OccasionId } from "./occasions";
import type { ArtKind } from "../components/wedding/reveal/OccasionArt";

// How the invite opens on a shared link: the classic "Open Invitation" cover, a shutter the
// guest pulls up, or a scratch card hiding the date.
export type Opening = "classic" | "shutter" | "scratch";
export type CoupleLook = "hindu" | "south" | "nikkah" | "modern";

export type Tier = "silver" | "gold" | "platinum";
export type Country = "india" | "uae" | "france" | "usa" | "italy";

export interface Template {
  slug: string;
  name: string;
  tagline: string;
  country: Country;
  countryLabel: string;
  tier: Tier;
  palette: string;
  hero: string;
  monuments: string[];
  monumentNames: string[];
  motif: string;
  script: string; // headline script (short greeting)
  scriptFont: "devanagari" | "arabic" | "serif";
  couple: { one: string; two: string; amp: string };
  date: string; // display
  eventDate: string; // ISO for countdown
  venue: { name: string; address: string };
  ceremonies: {
    icon: string;
    hi: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    img?: string;
  }[];
  story: string;
  features: string[];
  music?: string; // audio URL (optional)
  image?: string; // uploaded preview image
  video?: string; // uploaded preview video
  hashtag?: string; // couple wedding hashtag
  opening?: Opening; // default "classic"
  coupleArt?: CoupleLook; // animated bride & groom illustration in the hero (none when unset)
  isNew?: boolean;
  occasion?: OccasionId; // default "wedding"
  art?: ArtKind; // animated occasion illustration in the hero (birthday cake, diyas …)
}

// Colours + fonts of the occasion designs; turned into their [data-palette] CSS below.
interface Look {
  bg: [string, string, string, string];
  gold: string;
  goldLite: string;
  accent: string;
  deep: string;
  ink?: string;
  inkSoft?: string;
  heading?: string;
  display?: string;
  script?: string;
  extra?: string[];
  scene: SceneKind;
  seed: number;
}

const commonSilverFeatures = [
  "Hero + names + date",
  "Live countdown",
  "Venue with map",
  "Photo gallery",
  "Simple RSVP form",
];
const commonGoldFeatures = [
  ...commonSilverFeatures,
  "Background music toggle",
  "Ceremonies grid",
  "Family section",
  "Animated section reveals",
  "Floating petals / particles",
];
const commonPlatinumFeatures = [
  ...commonGoldFeatures,
  "Mandala / monogram entry loader",
  "3D parallax monument hero",
  "Live chat FAB with quick replies",
  "Guest wishes wall",
  "Story timeline",
  "3D photo tilt",
  "Cinematic transitions",
];

export const TEMPLATES: Template[] = [
  {
    slug: "india-taj-heritage",
    name: "Taj Heritage",
    tagline: "The Taj at dawn — every luxury feature unlocked",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "india-royal",
    hero: monumentTaj,
    monuments: [monumentTaj, monumentRedFort, monumentJaipur],
    monumentNames: ["Taj Mahal, Agra", "Red Fort, Delhi", "Hawa Mahal, Jaipur"],
    motif: "❦",
    script: "ॐ श्री गणेशाय नमः",
    scriptFont: "devanagari",
    couple: { one: "Vihaan", two: "Aditi", amp: "वेड्स" },
    date: "14 December 2026",
    eventDate: "2026-12-14T18:30:00",
    venue: {
      name: "The Oberoi Amarvilas",
      address: "Taj East Gate Rd, Agra, Uttar Pradesh",
    },
    ceremonies: [
      {
        icon: "🌼",
        hi: "हल्दी",
        name: "Haldi",
        date: "11 Dec",
        time: "10:00 AM",
        venue: "Amarvilas Garden",
      },
      {
        icon: "🌺",
        hi: "मेहंदी",
        name: "Mehendi",
        date: "12 Dec",
        time: "4:00 PM",
        venue: "Palace Courtyard",
      },
      {
        icon: "🎉",
        hi: "संगीत",
        name: "Sangeet",
        date: "13 Dec",
        time: "7:30 PM",
        venue: "The Grand Ballroom",
      },
      {
        icon: "💍",
        hi: "विवाह",
        name: "Shubh Vivah",
        date: "14 Dec",
        time: "6:30 PM",
        venue: "Amarvilas Lawn",
      },
      {
        icon: "🎊",
        hi: "रिसेप्शन",
        name: "Reception",
        date: "15 Dec",
        time: "8:00 PM",
        venue: "Moonlight Terrace",
      },
    ],
    story:
      "Ek prem kahani jo Yamuna ke kinare shuru hui, Taj ki chandani me amar ho gayi.",
    features: commonPlatinumFeatures,
  },
  {
    slug: "india-shiv-parwati-divine",
    name: "Shiv Parwati Divine",
    tagline:
      "Himalayan temple mandap, mythological art panels, falling-photos gallery",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "india-divine",
    hero: "https://images.unsplash.com/photo-1622811895287-7b541c50f51d?w=1600&q=80",
    monuments: [monumentJaipur, monumentTaj],
    monumentNames: ["Hawa Mahal, Jaipur", "Taj Mahal, Agra"],
    motif: "🔱",
    script: "|| ॐ नमः शिवाय ||",
    scriptFont: "devanagari",
    couple: { one: "Shiv", two: "Parwati", amp: "&" },
    date: "24th November, 2026",
    eventDate: "2026-11-24T19:00:00",
    venue: { name: "The Grand Kailash", address: "Rishikesh, Uttarakhand" },
    ceremonies: [
      {
        icon: "🌿",
        hi: "मेहंदी",
        name: "Mehendi Night",
        date: "22 Nov 2026",
        time: "4:00 PM",
        venue: "Courtyard Lawn",
        img: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=700&q=80",
      },
      {
        icon: "🎶",
        hi: "संगीत",
        name: "Sangeet Ceremony",
        date: "23 Nov 2026",
        time: "7:00 PM",
        venue: "Banquet Hall",
        img: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=700&q=80",
      },
      {
        icon: "🌼",
        hi: "हल्दी",
        name: "Haldi Ceremony",
        date: "24 Nov 2026",
        time: "10:00 AM",
        venue: "Poolside Garden",
        img: "https://images.unsplash.com/photo-1610047402547-8399b23a1968?w=700&q=80",
      },
      {
        icon: "💍",
        hi: "विवाह",
        name: "Wedding & Reception",
        date: "24 Nov 2026",
        time: "7:00 PM",
        venue: "The Grand Kailash",
        img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=80",
      },
    ],
    story:
      "Kailash ke shikharon se shuru hui ek divine prem kahani — Shiv aur Parwati ke milan jaisi, ananta aur pavitra.",
    features: [
      ...commonPlatinumFeatures,
      "Himalayan temple hero scene",
      "Ornate pillar invite card",
      "Baroque gold couple frame",
      "Falling photos gallery",
    ],
    hashtag: "#ShivKiParwati",
  },
  {
    slug: "luxury-silver-gold",
    name: "Ivory Atelier",
    tagline:
      "A private magazine-style wedding edition in pristine ivory, liquid silver and brushed champagne gold.",
    country: "usa",
    countryLabel: "Global",
    tier: "platinum",
    palette: "luxury-silver-gold",
    hero: "https://images.unsplash.com/photo-1779239358628-2665371ea4d7?w=1600&q=80",
    monuments: [monumentBeverly],
    monumentNames: ["Marble Salon at The Imperial Atelier"],
    motif: "-",
    script: "Private Edition",
    scriptFont: "serif",
    couple: { one: "Aurelia", two: "Sebastian", amp: "&" },
    date: "16 February 2027",
    eventDate: "2027-02-16T18:00:00",
    venue: {
      name: "The Imperial Atelier",
      address: "A private marble estate, New Delhi",
    },
    ceremonies: [
      {
        icon: "01",
        hi: "Welcome",
        name: "Silver Welcome Soiree",
        date: "14 Feb",
        time: "7:00 PM",
        venue: "The Reflecting Terrace",
      },
      {
        icon: "02",
        hi: "Vows",
        name: "Ivory Vow Ceremony",
        date: "16 Feb",
        time: "5:30 PM",
        venue: "The Grand Conservatory",
      },
      {
        icon: "03",
        hi: "Dinner",
        name: "Champagne Dinner Reception",
        date: "16 Feb",
        time: "8:00 PM",
        venue: "The Imperial Ballroom",
      },
    ],
    story:
      "Aurelia and Sebastian invite you into a celebration edited with restraint: ivory rooms, silver light, candlelit architecture and an evening that unfolds like a collector's issue.",
    features: [
      ...commonPlatinumFeatures,
      "Canva Pro editorial magazine layout",
      "Liquid silver and champagne foil motion",
      "Organic image masks with scroll parallax",
      "Glassmorphism event and RSVP modules",
    ],
    hashtag: "#AureliaSebastian",
  },
  {
    slug: "vogue-silver-gold",
    name: "The Editorial Vow",
    tagline:
      "A cinematic, magazine-bound wedding edition — liquid chrome typography, brushed white-gold hairlines, and a Ravello clifftop reserved in absolute privacy.",
    country: "italy",
    countryLabel: "Ravello, Amalfi Coast",
    tier: "platinum",
    palette: "vogue-silver-gold",
    hero: "https://images.unsplash.com/photo-1513323813850-c7318e3efc71?w=1600&q=80",
    monuments: [monumentAmalfi, monumentVenice, monumentTuscany],
    monumentNames: [
      "Villa Cimbrone, Ravello",
      "Grand Canal, Venice",
      "Val d'Orcia, Tuscany",
    ],
    motif: "—",
    script: "Riservato",
    scriptFont: "serif",
    couple: { one: "Seraphina", two: "Alexander", amp: "&" },
    date: "12 September 2027",
    eventDate: "2027-09-12T18:00:00",
    venue: {
      name: "Villa Cimbrone",
      address: "Via Santa Chiara 26, Ravello, Amalfi Coast, Italy",
    },
    ceremonies: [
      {
        icon: "01",
        hi: "Arrival",
        name: "Clifftop Welcome Reception",
        date: "10 Sep",
        time: "7:00 PM",
        venue: "Terrace of Infinity, Villa Cimbrone",
      },
      {
        icon: "02",
        hi: "Rehearsal",
        name: "Private Rehearsal Dinner",
        date: "11 Sep",
        time: "8:00 PM",
        venue: "The Crypt Cellar",
      },
      {
        icon: "03",
        hi: "Vows",
        name: "The Vow Ceremony",
        date: "12 Sep",
        time: "6:00 PM",
        venue: "Rose Garden Belvedere",
      },
      {
        icon: "04",
        hi: "Reception",
        name: "Black-Tie Reception & Orchestra",
        date: "12 Sep",
        time: "9:00 PM",
        venue: "The Grand Salon",
      },
      {
        icon: "05",
        hi: "Farewell",
        name: "Farewell Brunch on the Coast",
        date: "13 Sep",
        time: "11:00 AM",
        venue: "Loggia Overlooking the Tyrrhenian",
      },
    ],
    story:
      "Seraphina and Alexander request the pleasure of your company for a wedding edited with the same restraint they bring to everything they love: a clifftop reserved in its entirety, a guest list kept deliberately small, and an evening composed like the closing pages of a favourite issue — unhurried, luminous, and entirely theirs.",
    features: [
      ...commonPlatinumFeatures,
      "Liquid chrome kinetic typography",
      "Asymmetric editorial Chronicle timeline with unfolding image masks",
      "Glassmorphic Gala Details grid with brushed gold hover borders",
      "Magnetic multi-step RSVP Portal with floating labels",
      "Cinematic Bézier entrance choreography",
    ],
    hashtag: "#TheEditorialVow",
  },
  {
    slug: "india-royal-rajwada",
    name: "Royal Rajwada",
    tagline: "Red Fort grandeur, sangeet-ready warmth",
    country: "india",
    countryLabel: "India",
    tier: "gold",
    palette: "india-rajwada",
    hero: monumentRedFort,
    monuments: [monumentRedFort, monumentJaipur],
    monumentNames: ["Red Fort, Delhi", "Hawa Mahal, Jaipur"],
    motif: "❦",
    script: "शुभ विवाह",
    scriptFont: "devanagari",
    couple: { one: "Arjun", two: "Anaya", amp: "वेड्स" },
    date: "22 November 2026",
    eventDate: "2026-11-22T19:00:00",
    venue: {
      name: "The Leela Palace",
      address: "Diplomatic Enclave, New Delhi",
    },
    ceremonies: [
      {
        icon: "🌼",
        hi: "मेहंदी",
        name: "Mehendi",
        date: "20 Nov",
        time: "3:00 PM",
        venue: "Poolside Lawn",
      },
      {
        icon: "🎉",
        hi: "संगीत",
        name: "Sangeet",
        date: "21 Nov",
        time: "8:00 PM",
        venue: "Sheesh Mahal",
      },
      {
        icon: "💍",
        hi: "विवाह",
        name: "Vivah",
        date: "22 Nov",
        time: "7:00 PM",
        venue: "Diwan-e-Aam",
      },
      {
        icon: "🎊",
        hi: "रिसेप्शन",
        name: "Reception",
        date: "23 Nov",
        time: "8:00 PM",
        venue: "Royal Ballroom",
      },
    ],
    story:
      "Purani Dilli ki galiyon me pehli mulaaqat, Red Fort ki roshni me hameshaa ka waada.",
    features: commonGoldFeatures,
  },
  {
    slug: "india-punjabi-anand-karaj",
    name: "Punjabi Anand Karaj",
    tagline:
      "Dhol beats, marigold jaggo lanterns and a Gurdwara blessing at daybreak.",
    country: "india",
    countryLabel: "India",
    tier: "gold",
    palette: "india-punjabi",
    hero: "https://images.unsplash.com/photo-1623059508779-2542c6e83753?w=1600&q=80",
    monuments: [monumentRedFort, monumentJaipur],
    monumentNames: ["Gurdwara Sahib, Chandigarh", "Palace Lawns, Patiala"],
    motif: "🪔",
    script: "शुभ विवाह",
    scriptFont: "devanagari",
    couple: { one: "Harpreet", two: "Simran", amp: "&" },
    date: "6 December 2026",
    eventDate: "2026-12-06T08:00:00",
    venue: {
      name: "Taj Chandigarh",
      address: "Sector 17-A, Chandigarh, Punjab",
    },
    ceremonies: [
      {
        icon: "🪔",
        hi: "Jaggo",
        name: "Jaggo Night",
        date: "4 Dec",
        time: "9:00 PM",
        venue: "Family Courtyard",
      },
      {
        icon: "🌼",
        hi: "Mehendi",
        name: "Mehendi & Sangeet",
        date: "5 Dec",
        time: "5:00 PM",
        venue: "Lawns, Taj Chandigarh",
      },
      {
        icon: "🙏",
        hi: "आनंद कारज",
        name: "Anand Karaj",
        date: "6 Dec",
        time: "8:00 AM",
        venue: "Gurdwara Sahib",
      },
      {
        icon: "🎊",
        hi: "रिसेप्शन",
        name: "Reception",
        date: "6 Dec",
        time: "8:00 PM",
        venue: "Grand Ballroom",
      },
    ],
    story:
      "Four laavan around the Guru Granth Sahib at sunrise, then dhol and bhangra until the Punjab stars come out.",
    features: commonGoldFeatures,
    hashtag: "#HarpreetWedsSimran",
  },
  {
    slug: "india-marwari-rajasthani-phere",
    name: "Marwari Rajasthani Phere",
    tagline:
      "A Pithi Dastoor morning, camel-cart baraat, and seven phere beneath Jodhpur's blue-city sky.",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "india-marwari",
    hero: "https://images.unsplash.com/photo-1661924326425-c14a6426d989?w=1600&q=80",
    monuments: [monumentJaipur, monumentRedFort, monumentTaj],
    monumentNames: [
      "Umaid Bhawan Palace, Jodhpur",
      "Palace Courtyard",
      "Blue City Ramparts",
    ],
    motif: "☀",
    script: "शुभ विवाह",
    scriptFont: "devanagari",
    couple: { one: "Vikramaditya", two: "Ratna", amp: "&" },
    date: "11 December 2026",
    eventDate: "2026-12-11T19:00:00",
    venue: {
      name: "Umaid Bhawan Palace",
      address: "Circuit House Rd, Jodhpur, Rajasthan",
    },
    ceremonies: [
      {
        icon: "💛",
        hi: "पीठी दस्तूर",
        name: "Pithi Dastoor",
        date: "9 Dec",
        time: "10:00 AM",
        venue: "Palace Courtyard",
      },
      {
        icon: "🌼",
        hi: "मेहंदी",
        name: "Mehendi & Sangeet",
        date: "10 Dec",
        time: "6:00 PM",
        venue: "Umaid Gardens",
      },
      {
        icon: "🐫",
        hi: "बारात",
        name: "Camel-Cart Baraat",
        date: "11 Dec",
        time: "5:00 PM",
        venue: "Palace Gates",
      },
      {
        icon: "🔥",
        hi: "फेरे",
        name: "Saat Phere",
        date: "11 Dec",
        time: "7:00 PM",
        venue: "Umaid Bhawan Lawns",
      },
      {
        icon: "🎊",
        hi: "स्वागत",
        name: "Reception",
        date: "11 Dec",
        time: "9:00 PM",
        venue: "Palace Ballroom",
      },
    ],
    story:
      "A camel-cart baraat wound through Jodhpur's blue lanes to a palace where seven phere were taken beneath a desert moon.",
    features: commonPlatinumFeatures,
    hashtag: "#VikramadityaWedsRatna",
  },
  {
    slug: "india-tamil-iyer-muhurtham",
    name: "Tamil Iyer Muhurtham",
    tagline:
      "Nichayathartham betrothal, a Kashi Yatra pretend-pilgrimage, and an oonjal swing under temple gopurams.",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "india-tamil-iyer",
    hero: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?w=1600&q=80",
    monuments: [monumentTaj, monumentRedFort, monumentJaipur],
    monumentNames: [
      "ITC Grand Chola, Chennai",
      "Kapaleeshwarar-style Temple Mandapam",
      "Oonjal Courtyard",
    ],
    motif: "🔱",
    script: "शुभ विवाह",
    scriptFont: "devanagari",
    couple: { one: "Krishnan", two: "Meenakshi", amp: "&" },
    date: "29 January 2027",
    eventDate: "2027-01-29T09:00:00",
    venue: { name: "ITC Grand Chola", address: "Guindy, Chennai, Tamil Nadu" },
    ceremonies: [
      {
        icon: "🌼",
        hi: "நிச்சயதார்த்தம்",
        name: "Nichayathartham",
        date: "27 Jan",
        time: "11:00 AM",
        venue: "Family Residence",
      },
      {
        icon: "🪑",
        hi: "ஊஞ்சல்",
        name: "Oonjal Ceremony",
        date: "28 Jan",
        time: "5:00 PM",
        venue: "ITC Grand Chola Courtyard",
      },
      {
        icon: "🚶",
        hi: "காசி யாத்திரை",
        name: "Kashi Yatra",
        date: "29 Jan",
        time: "8:00 AM",
        venue: "Mandapam Entrance",
      },
      {
        icon: "🔥",
        hi: "முஹூர்த்தம்",
        name: "Muhurtham & Saptapadi",
        date: "29 Jan",
        time: "9:00 AM",
        venue: "Temple Mandapam",
      },
      {
        icon: "🎊",
        hi: "வரவேற்பு",
        name: "Reception",
        date: "29 Jan",
        time: "8:00 PM",
        venue: "Grand Chola Ballroom",
      },
    ],
    story:
      "The groom's mock pilgrimage to Kashi was gently interrupted by the bride's father — the oldest joke in Tamil weddings, and the sweetest.",
    features: commonPlatinumFeatures,
    hashtag: "#KrishnanWedsMeenakshi",
  },
  {
    slug: "uae-burj-skyline",
    name: "Burj Skyline",
    tagline: "Dubai skyline luxury — fireworks, marble, gold",
    country: "uae",
    countryLabel: "UAE",
    tier: "platinum",
    palette: "uae-skyline",
    hero: monumentBurj,
    monuments: [monumentBurj, monumentMosque, monumentDesert],
    monumentNames: [
      "Burj Khalifa, Dubai",
      "Sheikh Zayed Mosque",
      "Desert of Al Ain",
    ],
    motif: "✧",
    script: "بسم الله الرحمن الرحيم",
    scriptFont: "arabic",
    couple: { one: "Rashid", two: "Noor", amp: "&" },
    date: "05 February 2027",
    eventDate: "2027-02-05T19:30:00",
    venue: {
      name: "Armani Hotel, Burj Khalifa",
      address: "1 Sheikh Mohammed bin Rashid Blvd, Dubai",
    },
    ceremonies: [
      {
        icon: "🌙",
        hi: "Henna",
        name: "Henna Night",
        date: "02 Feb",
        time: "8:00 PM",
        venue: "Skydeck Lounge",
      },
      {
        icon: "☕",
        hi: "Milcha",
        name: "Milcha",
        date: "03 Feb",
        time: "11:00 AM",
        venue: "Royal Salon",
      },
      {
        icon: "🕌",
        hi: "Nikah",
        name: "Nikah",
        date: "04 Feb",
        time: "6:00 PM",
        venue: "Armani Pavilion",
      },
      {
        icon: "🎉",
        hi: "Walima",
        name: "Walima",
        date: "05 Feb",
        time: "8:00 PM",
        venue: "Burj Ballroom",
      },
      {
        icon: "🎆",
        hi: "Afterparty",
        name: "Skyline Bash",
        date: "06 Feb",
        time: "10:00 PM",
        venue: "At.mosphere, Level 122",
      },
    ],
    story: "From the Marina to the Burj — a love story written in city lights.",
    features: commonPlatinumFeatures,
  },
  {
    slug: "france-eiffel-grand",
    name: "Eiffel Grand",
    tagline: "Cinematic Paris — the tower, champagne particles, string quartet",
    country: "france",
    countryLabel: "France",
    tier: "platinum",
    palette: "france-eiffel",
    hero: monumentEiffel,
    monuments: [monumentEiffel, monumentProvence, monumentParisCafe],
    monumentNames: ["Eiffel Tower, Paris", "Provence", "Le Marais"],
    motif: "✦",
    script: "L'Amour Éternel",
    scriptFont: "serif",
    couple: { one: "Antoine", two: "Margaux", amp: "&" },
    date: "07 September 2027",
    eventDate: "2027-09-07T18:00:00",
    venue: { name: "Shangri-La Paris", address: "10 Avenue d'Iéna, Paris" },
    ceremonies: [
      {
        icon: "🥂",
        hi: "Apéro",
        name: "Welcome Apéritif",
        date: "05 Sep",
        time: "7:00 PM",
        venue: "Le Bar Botaniste",
      },
      {
        icon: "🎶",
        hi: "Répétition",
        name: "Rehearsal Dinner",
        date: "06 Sep",
        time: "8:00 PM",
        venue: "La Bauhinia",
      },
      {
        icon: "💒",
        hi: "Cérémonie",
        name: "Ceremony",
        date: "07 Sep",
        time: "6:00 PM",
        venue: "Eiffel View Terrace",
      },
      {
        icon: "🍾",
        hi: "Réception",
        name: "Reception",
        date: "07 Sep",
        time: "9:00 PM",
        venue: "Salon Impérial",
      },
      {
        icon: "🥐",
        hi: "Brunch",
        name: "Farewell Brunch",
        date: "08 Sep",
        time: "11:00 AM",
        venue: "Shang Palace",
      },
    ],
    story: "Sous la Tour Eiffel, deux âmes ont trouvé leur pour toujours.",
    features: commonPlatinumFeatures,
  },
  {
    slug: "ayodhya-ram-mandir",
    name: "Ayodhya Ram Mandir",
    tagline: "With the blessings of Prabhu Shri Ram, we invite you to our wedding",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "temple-saffron",
    hero: sceneAyodhya,
    monuments: [],
    monumentNames: [],
    motif: "🪔",
    script: "॥ श्री राम ॥",
    scriptFont: "devanagari",
    couple: { one: "Raghav", two: "Siya", amp: "वेड्स" },
    date: "18 February 2027",
    eventDate: "2027-02-18T19:00:00",
    venue: { name: "Ram Katha Park", address: "Ayodhya, Uttar Pradesh" },
    ceremonies: [
      { icon: "🌼", hi: "हल्दी", name: "Haldi", date: "16 Feb", time: "10:00 AM", venue: "Family Courtyard" },
      { icon: "🌿", hi: "मेहंदी", name: "Mehendi", date: "16 Feb", time: "4:00 PM", venue: "Garden Lawn" },
      { icon: "🎶", hi: "संगीत", name: "Sangeet", date: "17 Feb", time: "7:30 PM", venue: "Saryu Banquet" },
      { icon: "🔥", hi: "विवाह", name: "Shubh Vivah", date: "18 Feb", time: "7:00 PM", venue: "Ram Katha Park" },
    ],
    story: "Ram ji ki nagri mein, Saryu ke kinaare — do parivaar, ek bandhan.",
    features: [...commonPlatinumFeatures, "Shutter-up opening", "Scratch to reveal the date", "Animated dulha–dulhan with varmala"],
    hashtag: "#RaghavWedsSiya",
    opening: "shutter",
    coupleArt: "hindu",
    isNew: true,
  },
  {
    slug: "meenakshi-temple-kalyanam",
    name: "Meenakshi Temple Kalyanam",
    tagline: "With the blessings of Meenakshi Amman, we invite you to our Kalyanam",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "temple-meenakshi",
    hero: sceneMeenakshi,
    monuments: [],
    monumentNames: [],
    motif: "❁",
    script: "शुभ कल्याणम्",
    scriptFont: "devanagari",
    couple: { one: "Karthik", two: "Meenakshi", amp: "&" },
    date: "5 March 2027",
    eventDate: "2027-03-05T07:30:00",
    venue: { name: "Sri Meenakshi Kalyana Mandapam", address: "Madurai, Tamil Nadu" },
    ceremonies: [
      { icon: "🪔", hi: "निश्चयम्", name: "Nichayathartham", date: "3 Mar", time: "6:00 PM", venue: "Mandapam Hall" },
      { icon: "🎶", hi: "जानवासम्", name: "Janavasam", date: "4 Mar", time: "6:30 PM", venue: "Temple Street" },
      { icon: "🌺", hi: "मुहूर्तम्", name: "Muhurtham", date: "5 Mar", time: "7:30 AM", venue: "Kalyana Mandapam" },
      { icon: "🍃", hi: "विरुन्दु", name: "Wedding Feast", date: "5 Mar", time: "12:00 PM", venue: "Dining Hall" },
    ],
    story: "From temple bells in Madurai to a lifetime together — with the blessings of Meenakshi Amman.",
    features: [...commonPlatinumFeatures, "Scratch card opening", "Animated couple in silk saree & veshti"],
    hashtag: "#KarthikMeenaKalyanam",
    opening: "scratch",
    coupleArt: "south",
    isNew: true,
  },
  {
    slug: "nikkah-moonlight",
    name: "Nikkah Moonlight",
    tagline: "With the blessings of Allah, we invite you to our Nikkah",
    country: "india",
    countryLabel: "India",
    tier: "platinum",
    palette: "nikkah-emerald",
    hero: sceneNikkah,
    monuments: [],
    monumentNames: [],
    motif: "☪",
    script: "بسم الله الرحمن الرحيم",
    scriptFont: "arabic",
    couple: { one: "Daanish", two: "Adeena", amp: "&" },
    date: "12 April 2027",
    eventDate: "2027-04-12T19:30:00",
    venue: { name: "Noor Mahal Banquets", address: "Lucknow, Uttar Pradesh" },
    ceremonies: [
      { icon: "🌿", hi: "Mehndi", name: "Mehndi Night", date: "10 Apr", time: "7:00 PM", venue: "Courtyard" },
      { icon: "🌙", hi: "Nikkah", name: "Nikkah", date: "12 Apr", time: "7:30 PM", venue: "Noor Mahal" },
      { icon: "✨", hi: "Walima", name: "Walima", date: "13 Apr", time: "8:00 PM", venue: "Noor Mahal Lawn" },
    ],
    story: "Two hearts, one duaa — with the blessings of Allah and our families, we begin forever.",
    features: [...commonPlatinumFeatures, "Shutter-up opening", "Scratch to reveal the date", "Animated Nikkah couple"],
    hashtag: "#DaanishAdeenaNikkah",
    opening: "shutter",
    coupleArt: "nikkah",
    isNew: true,
  },
  {
    slug: "blush-couple-story",
    name: "Blush Couple Story",
    tagline: "Join us as we say yes to forever",
    country: "india",
    countryLabel: "India",
    tier: "gold",
    palette: "pastel-blush",
    hero: scenePastel,
    monuments: [],
    monumentNames: [],
    motif: "♡",
    script: "Save the Date",
    scriptFont: "serif",
    couple: { one: "Aarav", two: "Isha", amp: "&" },
    date: "20 January 2027",
    eventDate: "2027-01-20T18:00:00",
    venue: { name: "The Rose Garden Estate", address: "Chandigarh" },
    ceremonies: [
      { icon: "🌸", hi: "Mehendi", name: "Mehendi", date: "18 Jan", time: "3:00 PM", venue: "Garden Patio" },
      { icon: "🎶", hi: "Sangeet", name: "Sangeet", date: "19 Jan", time: "8:00 PM", venue: "Glass House" },
      { icon: "💍", hi: "Wedding", name: "Wedding", date: "20 Jan", time: "6:00 PM", venue: "Rose Garden" },
    ],
    story: "A coffee date that never ended — now we're making it forever.",
    features: [...commonGoldFeatures, "Scratch card opening", "Animated couple illustration"],
    hashtag: "#AaravMeetsIsha",
    opening: "scratch",
    coupleArt: "modern",
    isNew: true,
  },
];

// ---- Digital Invites: engagements, birthdays, Diwali, festival wishes and more ----------------
const LOOKS: Record<string, Look> = {
  "engagement-rose-rings": { bg: ["#2b0f1f", "#4d1a36", "#5e2444", "#1a0812"], gold: "#f1c7a4", goldLite: "#ffe6d2", accent: "#ff6f9c", deep: "#c83f6e", heading: '"Playfair Display", serif', display: '"Cormorant Garamond", serif', script: '"Great Vibes", cursive', scene: "petals", seed: 11, extra: ["#ffb3c9"] },
  "engagement-roka-marigold": { bg: ["#3a0a0a", "#6b1414", "#7a2410", "#250505"], gold: "#ffb627", goldLite: "#ffd97a", accent: "#ff7a1a", deep: "#d4430f", scene: "lights", seed: 12, extra: ["#ffcf33"] },
  "anniversary-golden-jubilee": { bg: ["#0b1530", "#16244d", "#1f3266", "#070d1f"], gold: "#e8c068", goldLite: "#f8e2a8", accent: "#f08aa8", deep: "#c4587b", heading: '"Playfair Display", serif', display: '"Cinzel", serif', script: '"Great Vibes", cursive', scene: "stars", seed: 13 },
  "birthday-balloon-bash": { bg: ["#2a1258", "#4b1f8f", "#6a2aa8", "#180a36"], gold: "#ffd34d", goldLite: "#fff0a8", accent: "#ff5fa2", deep: "#e0307c", ink: "#fff8ff", inkSoft: "#f0dcff", heading: '"Pacifico", cursive', display: '"Jost", sans-serif', script: '"Pacifico", cursive', scene: "confetti", seed: 14, extra: ["#5ec4ff", "#8cf0b0"] },
  "birthday-gold-milestone": { bg: ["#0c0b09", "#1d1a14", "#2a241a", "#060504"], gold: "#d9b25f", goldLite: "#f5dd9c", accent: "#e6c27a", deep: "#a8822f", heading: '"Cinzel", serif', display: '"Cinzel", serif', script: '"Great Vibes", cursive', scene: "stars", seed: 15 },
  "diwali-diya-night": { bg: ["#1a0b3b", "#2d1466", "#3e1c7a", "#0f0624"], gold: "#ffb627", goldLite: "#ffe08a", accent: "#ff4f9a", deep: "#d0267a", scene: "lights", seed: 16, extra: ["#ff7a1a"] },
  "diwali-wishes-rangoli": { bg: ["#4a0730", "#7a0f4f", "#8f1a3a", "#2c031c"], gold: "#ffc23d", goldLite: "#ffe49a", accent: "#ff7a1a", deep: "#e0480f", scene: "mandala", seed: 17, extra: ["#5ec4ff"] },
  "holi-wishes-colours": { bg: ["#2a0b44", "#41127a", "#5a1a8f", "#170628"], gold: "#ffd21f", goldLite: "#fff08a", accent: "#ff3d7f", deep: "#d4135d", heading: '"Yatra One", cursive', script: '"Yatra One", cursive', scene: "colours", seed: 18, extra: ["#18c37e", "#2f8cff", "#ff8a1f"] },
  "eid-mubarak-crescent": { bg: ["#04261f", "#073d31", "#0b5142", "#021712"], gold: "#e6c66a", goldLite: "#f7e4a6", accent: "#38c39a", deep: "#1f8f6c", heading: '"Amiri", serif', display: '"Cinzel", serif', script: '"Amiri", serif', scene: "stars", seed: 19 },
  "new-year-sparkle": { bg: ["#05070f", "#0d1430", "#151f4a", "#020308"], gold: "#e9c46a", goldLite: "#fbe7a8", accent: "#7aa8ff", deep: "#4c6fd1", heading: '"Cinzel", serif', display: '"Cinzel", serif', script: '"Great Vibes", cursive', scene: "stars", seed: 20, extra: ["#ff7aa2"] },
  "griha-pravesh-toran": { bg: ["#06302a", "#0b4a3f", "#125a4a", "#031c18"], gold: "#ffb627", goldLite: "#ffe08a", accent: "#ff7a1a", deep: "#d4430f", scene: "mandala", seed: 21, extra: ["#ffcf33"] },
  "babyshower-godh-bharai": { bg: ["#1a1840", "#2b2766", "#3a3480", "#0f0e28"], gold: "#f3d58a", goldLite: "#fff0c4", accent: "#ff9fc4", deep: "#e0709a", heading: '"Playfair Display", serif', display: '"Cormorant Garamond", serif', script: '"Great Vibes", cursive', scene: "stars", seed: 22, extra: ["#a8d8ff"] },
};
const heroOf = (slug: string) => {
  const l = LOOKS[slug];
  return scene(l.scene, { bg1: l.bg[0], bg2: l.bg[2], gold: l.gold, accent: l.accent, extra: l.extra }, l.seed);
};
const occasionFeatures = (...extra: string[]) => [...commonGoldFeatures, "Animated illustration", ...extra];

const OCCASION_TEMPLATES: Template[] = [
  {
    slug: "engagement-rose-rings", occasion: "engagement", art: "rings", name: "Rose & Rings", tagline: "Two hearts, one ring — join us as we make it official",
    country: "india", countryLabel: "Engagement", tier: "platinum", palette: "engagement-rose-rings", hero: heroOf("engagement-rose-rings"), monuments: [], monumentNames: [],
    motif: "♡", script: "We're Engaged", scriptFont: "serif", couple: { one: "Kabir", two: "Naina", amp: "&" }, date: "14 February 2027", eventDate: "2027-02-14T19:00:00",
    venue: { name: "The Rose Terrace", address: "Juhu, Mumbai" },
    ceremonies: [
      { icon: "💍", hi: "Ring Ceremony", name: "Ring Ceremony", date: "14 Feb", time: "7:00 PM", venue: "The Rose Terrace" },
      { icon: "🥂", hi: "Dinner", name: "Dinner & Dance", date: "14 Feb", time: "8:30 PM", venue: "Sea Lounge" },
    ],
    story: "From a rainy-day coffee to a lifetime of yeses — we're getting engaged and we'd love you there.",
    features: occasionFeatures("Scratch card opening", "Animated rings & roses"), hashtag: "#KabirNainaForever", opening: "scratch", isNew: true,
  },
  {
    slug: "engagement-roka-marigold", occasion: "engagement", art: "roka", name: "Roka Marigold", tagline: "With the blessings of our elders, we invite you to our Roka & Sagai",
    country: "india", countryLabel: "Engagement", tier: "platinum", palette: "engagement-roka-marigold", hero: heroOf("engagement-roka-marigold"), monuments: [], monumentNames: [],
    motif: "🪔", script: "॥ शुभ सगाई ॥", scriptFont: "devanagari", couple: { one: "Yash", two: "Tanvi", amp: "&" }, date: "22 January 2027", eventDate: "2027-01-22T18:30:00",
    venue: { name: "Marigold Banquets", address: "Rajouri Garden, New Delhi" },
    ceremonies: [
      { icon: "🙏", hi: "रोका", name: "Roka", date: "22 Jan", time: "11:00 AM", venue: "Family Residence" },
      { icon: "💍", hi: "सगाई", name: "Ring Ceremony", date: "22 Jan", time: "6:30 PM", venue: "Marigold Banquets" },
      { icon: "🍽️", hi: "भोज", name: "Dinner", date: "22 Jan", time: "8:30 PM", venue: "Marigold Banquets" },
    ],
    story: "Do parivaar, ek rishta — shagun ki thaali, genda phool aur dher saara pyaar.",
    features: occasionFeatures("Shutter-up opening", "Marigold garlands & shagun thali"), hashtag: "#YashKiTanvi", opening: "shutter", isNew: true,
  },
  {
    slug: "anniversary-golden-jubilee", occasion: "anniversary", art: "anniversary", name: "Golden Jubilee", tagline: "Celebrating fifty golden years of love, laughter and family",
    country: "india", countryLabel: "Anniversary", tier: "platinum", palette: "anniversary-golden-jubilee", hero: heroOf("anniversary-golden-jubilee"), monuments: [], monumentNames: [],
    motif: "✦", script: "50 Years of Togetherness", scriptFont: "serif", couple: { one: "Ramesh", two: "Sunita", amp: "&" }, date: "8 March 2027", eventDate: "2027-03-08T19:30:00",
    venue: { name: "The Grand Ballroom", address: "ITC Maurya, New Delhi" },
    ceremonies: [
      { icon: "🙏", hi: "पूजा", name: "Thanksgiving Puja", date: "8 Mar", time: "11:00 AM", venue: "Family Home" },
      { icon: "🥂", hi: "Dinner", name: "Anniversary Dinner", date: "8 Mar", time: "7:30 PM", venue: "The Grand Ballroom" },
    ],
    story: "Fifty years ago they said yes. Join their children and grandchildren to celebrate a love story that keeps getting better.",
    features: occasionFeatures("Gold laurel & hearts animation"), hashtag: "#50GoldenYears", opening: "classic", isNew: true,
  },
  {
    slug: "birthday-balloon-bash", occasion: "birthday", art: "cake", name: "Balloon Bash", tagline: "Balloons, cake and lots of fun — come celebrate with us!",
    country: "india", countryLabel: "Birthday", tier: "platinum", palette: "birthday-balloon-bash", hero: heroOf("birthday-balloon-bash"), monuments: [], monumentNames: [],
    motif: "🎈", script: "Let's Party!", scriptFont: "serif", couple: { one: "Myra", two: "turns 5", amp: "" }, date: "15 November 2026", eventDate: "2026-11-15T16:00:00",
    venue: { name: "Funky Monkeys Play Café", address: "Sector 29, Gurugram" },
    ceremonies: [
      { icon: "🎩", hi: "", name: "Magic Show & Games", date: "15 Nov", time: "4:00 PM", venue: "Play Zone" },
      { icon: "🎂", hi: "", name: "Cake Cutting", date: "15 Nov", time: "5:30 PM", venue: "Party Hall" },
      { icon: "🍕", hi: "", name: "Snacks & Return Gifts", date: "15 Nov", time: "6:00 PM", venue: "Party Hall" },
    ],
    story: "Our little princess is turning five! Join us for magic, music and a mountain of cake.",
    features: occasionFeatures("Scratch card opening", "Balloons, bunting & candle animation"), hashtag: "#MyraTurns5", opening: "scratch", isNew: true,
  },
  {
    slug: "birthday-gold-milestone", occasion: "birthday", art: "milestone", name: "Gold Milestone", tagline: "Cheers to thirty years — an evening of good music, great food and better company",
    country: "india", countryLabel: "Birthday", tier: "platinum", palette: "birthday-gold-milestone", hero: heroOf("birthday-gold-milestone"), monuments: [], monumentNames: [],
    motif: "✦", script: "Cheers to 30 Years", scriptFont: "serif", couple: { one: "Rohan", two: "turns 30", amp: "" }, date: "5 December 2026", eventDate: "2026-12-05T20:00:00",
    venue: { name: "Skyhigh Lounge", address: "Indiranagar, Bengaluru" },
    ceremonies: [
      { icon: "🥂", hi: "", name: "Cocktails", date: "5 Dec", time: "8:00 PM", venue: "Rooftop Bar" },
      { icon: "🎂", hi: "", name: "Cake & Toast", date: "5 Dec", time: "9:30 PM", venue: "Main Lounge" },
      { icon: "🎧", hi: "", name: "DJ Night", date: "5 Dec", time: "10:00 PM", venue: "Dance Floor" },
    ],
    story: "Thirty years, countless memories — let's make one more. Dress code: black & gold.",
    features: occasionFeatures("Shutter-up opening", "Gold number balloons from your age"), hashtag: "#Rohan30", opening: "shutter", isNew: true,
  },
  {
    slug: "diwali-diya-night", occasion: "diwali", art: "diya", name: "Diya Night", tagline: "Join us for an evening of diyas, sweets, taash and togetherness",
    country: "india", countryLabel: "Diwali Party", tier: "platinum", palette: "diwali-diya-night", hero: heroOf("diwali-diya-night"), monuments: [], monumentNames: [],
    motif: "🪔", script: "॥ शुभ दीपावली ॥", scriptFont: "devanagari", couple: { one: "The Malhotra Family", two: "", amp: "" }, date: "8 November 2026", eventDate: "2026-11-08T19:00:00",
    venue: { name: "Malhotra House", address: "Greater Kailash II, New Delhi" },
    ceremonies: [
      { icon: "🙏", hi: "लक्ष्मी पूजा", name: "Lakshmi Puja", date: "8 Nov", time: "7:00 PM", venue: "Puja Room" },
      { icon: "🪔", hi: "दीप", name: "Diya Lighting", date: "8 Nov", time: "7:45 PM", venue: "Garden" },
      { icon: "🃏", hi: "", name: "Taash & Games", date: "8 Nov", time: "8:30 PM", venue: "Living Room" },
      { icon: "🍽️", hi: "भोज", name: "Festive Dinner", date: "8 Nov", time: "9:30 PM", venue: "Terrace" },
    ],
    story: "Roshni, mithai aur apno ka saath — this Diwali, celebrate with us.",
    features: occasionFeatures("Shutter-up opening", "Glowing diyas & sky lanterns"), hashtag: "#MalhotraDiwali", opening: "shutter", isNew: true,
  },
  {
    slug: "diwali-wishes-rangoli", occasion: "wishes", art: "rangoli", name: "Rangoli Wishes", tagline: "May the festival of lights fill your home with joy, health and prosperity",
    country: "india", countryLabel: "Diwali Wishes", tier: "platinum", palette: "diwali-wishes-rangoli", hero: heroOf("diwali-wishes-rangoli"), monuments: [], monumentNames: [],
    motif: "🪔", script: "Happy Diwali", scriptFont: "serif", couple: { one: "The Sharma Family", two: "", amp: "" }, date: "", eventDate: "2026-11-08T18:00:00",
    venue: { name: "", address: "" }, ceremonies: [],
    story: "Is Deepavali, aapke ghar mein khushiyon ke deep jalein, Lakshmi ji ka vaas ho aur har din roshan ho. Shubh Deepavali!",
    features: ["Spinning rangoli animation", "Scratch to reveal the wish", "Share on WhatsApp", "Your photo & music", "Countdown to the festival"], opening: "scratch", isNew: true,
  },
  {
    slug: "holi-wishes-colours", occasion: "wishes", art: "holi", name: "Rang Barse", tagline: "Bura na mano, Holi hai! May your life be as colourful as the festival",
    country: "india", countryLabel: "Holi Wishes", tier: "platinum", palette: "holi-wishes-colours", hero: heroOf("holi-wishes-colours"), monuments: [], monumentNames: [],
    motif: "✿", script: "Happy Holi", scriptFont: "serif", couple: { one: "Neha & Family", two: "", amp: "" }, date: "", eventDate: "2027-03-22T09:00:00",
    venue: { name: "", address: "" }, ceremonies: [],
    story: "Gulal ki laali, pichkari ki dhaar, mithai ki mithaas aur apno ka pyaar — Holi ki dher saari shubhkamnayein!",
    features: ["Bursting colour animation", "Share on WhatsApp", "Your photo & music", "Countdown to the festival"], opening: "classic", isNew: true,
  },
  {
    slug: "eid-mubarak-crescent", occasion: "wishes", art: "crescent", name: "Eid Crescent", tagline: "May Allah bless you and your family with peace, happiness and prosperity",
    country: "india", countryLabel: "Eid Wishes", tier: "platinum", palette: "eid-mubarak-crescent", hero: heroOf("eid-mubarak-crescent"), monuments: [], monumentNames: [],
    motif: "☪", script: "Eid Mubarak", scriptFont: "serif", couple: { one: "The Khan Family", two: "", amp: "" }, date: "", eventDate: "2027-03-10T07:00:00",
    venue: { name: "", address: "" }, ceremonies: [],
    story: "Chaand raat ki roshni, sewaiyon ki mithaas aur dua mein aap — Eid ki dili mubarakbaad.",
    features: ["Crescent moon & lantern animation", "Shutter-up opening", "Share on WhatsApp", "Your photo & music"], opening: "shutter", isNew: true,
  },
  {
    slug: "new-year-sparkle", occasion: "wishes", art: "fireworks", name: "New Year Sparkle", tagline: "Wishing you a year full of new beginnings, big dreams and bright moments",
    country: "india", countryLabel: "New Year Wishes", tier: "platinum", palette: "new-year-sparkle", hero: heroOf("new-year-sparkle"), monuments: [], monumentNames: [],
    motif: "✦", script: "Happy New Year 2027", scriptFont: "serif", couple: { one: "Aditi & Karan", two: "", amp: "" }, date: "", eventDate: "2027-01-01T00:00:00",
    venue: { name: "", address: "" }, ceremonies: [],
    story: "Here's to 365 new chances — may 2027 bring you health, happiness and everything you've been wishing for.",
    features: ["Fireworks & champagne animation", "Scratch to reveal the wish", "Countdown to midnight", "Share on WhatsApp"], opening: "scratch", isNew: true,
  },
  {
    slug: "griha-pravesh-toran", occasion: "housewarming", art: "home", name: "Griha Pravesh Toran", tagline: "With the blessings of Lord Ganesha, we invite you to bless our new home",
    country: "india", countryLabel: "Griha Pravesh", tier: "platinum", palette: "griha-pravesh-toran", hero: heroOf("griha-pravesh-toran"), monuments: [], monumentNames: [],
    motif: "🪔", script: "॥ गृह प्रवेश ॥", scriptFont: "devanagari", couple: { one: "The Agarwal Family", two: "", amp: "" }, date: "20 December 2026", eventDate: "2026-12-20T09:00:00",
    venue: { name: "Agarwal Niwas, Flat 1204", address: "Prestige Lakeside, Whitefield, Bengaluru" },
    ceremonies: [
      { icon: "🙏", hi: "गणेश पूजा", name: "Ganesh Puja", date: "20 Dec", time: "9:00 AM", venue: "New Home" },
      { icon: "🔥", hi: "हवन", name: "Havan", date: "20 Dec", time: "10:30 AM", venue: "New Home" },
      { icon: "🍽️", hi: "भोज", name: "Lunch", date: "20 Dec", time: "1:00 PM", venue: "Clubhouse" },
    ],
    story: "A new door, a new beginning — your blessings will make our house a home.",
    features: occasionFeatures("Shutter-up opening", "Animated home with toran & diyas"), hashtag: "#AgarwalGrihaPravesh", opening: "shutter", isNew: true,
  },
  {
    slug: "babyshower-godh-bharai", occasion: "babyshower", art: "cradle", name: "Little Moon", tagline: "Join us to shower love and blessings on the mom-to-be",
    country: "india", countryLabel: "Baby Shower", tier: "platinum", palette: "babyshower-godh-bharai", hero: heroOf("babyshower-godh-bharai"), monuments: [], monumentNames: [],
    motif: "☾", script: "॥ गोद भराई ॥", scriptFont: "devanagari", couple: { one: "Riya", two: "Arjun", amp: "&" }, date: "17 January 2027", eventDate: "2027-01-17T12:00:00",
    venue: { name: "The Garden Courtyard", address: "Koregaon Park, Pune" },
    ceremonies: [
      { icon: "🙏", hi: "गोद भराई", name: "Godh Bharai", date: "17 Jan", time: "12:00 PM", venue: "Courtyard" },
      { icon: "🎀", hi: "", name: "Fun Games", date: "17 Jan", time: "1:00 PM", venue: "Lawn" },
      { icon: "🍽️", hi: "भोज", name: "Lunch", date: "17 Jan", time: "2:00 PM", venue: "Dining Hall" },
    ],
    story: "A little star is on the way! Come bless the mom-to-be and celebrate the newest member of our family.",
    features: occasionFeatures("Scratch card opening", "Cradle on the moon animation"), hashtag: "#RiyaArjunBaby", opening: "scratch", isNew: true,
  },
];
TEMPLATES.push(...OCCASION_TEMPLATES);

// [data-palette] rules for the occasion designs (same variables as wedding-theme.css).
if (typeof document !== "undefined" && !document.getElementById("occasion-palettes")) {
  const css = Object.entries(LOOKS)
    .map(([slug, l]) => {
      const v: Record<string, string | undefined> = {
        "bg-1": l.bg[0], "bg-2": l.bg[1], "bg-3": l.bg[2], "bg-4": l.bg[3], gold: l.gold, "gold-lite": l.goldLite, frame: l.goldLite,
        accent: l.accent, "accent-deep": l.deep, ink: l.ink, "ink-soft": l.inkSoft, veil: `${l.bg[0]}b3`,
        heading: l.heading, display: l.display, script: l.script,
      };
      return `[data-palette="${slug}"]{${Object.entries(v).filter(([, x]) => x).map(([k, x]) => `--wt-${k}:${x}`).join(";")}}`;
    })
    .join("\n");
  const el = document.createElement("style");
  el.id = "occasion-palettes";
  el.textContent = css;
  document.head.appendChild(el);
}

export interface InviteOverrides {
  coupleOne?: string;
  coupleTwo?: string;
  amp?: string;
  date?: string;
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
  story?: string;
  tagline?: string;
  script?: string; // headline greeting line, e.g. "शुभ विवाह"
  hashtag?: string; // couple wedding hashtag
  ceremonies?: Template["ceremonies"]; // full replacement list of events
  monumentNames?: string[]; // labels for the destination photos
  music?: string; // data URL (uploaded) or external URL
  image?: string; // uploaded preview image
  video?: string; // uploaded preview video
}

export function mergeTemplateWithOverrides(
  template: Template,
  overrides: InviteOverrides,
): Template {
  return {
    ...template,
    couple: {
      one: overrides.coupleOne ?? template.couple.one,
      two: overrides.coupleTwo ?? template.couple.two,
      amp: overrides.amp ?? template.couple.amp,
    },
    date: overrides.date ?? template.date,
    eventDate: overrides.eventDate ?? template.eventDate,
    venue: {
      name: overrides.venueName ?? template.venue.name,
      address: overrides.venueAddress ?? template.venue.address,
    },
    story: overrides.story ?? template.story,
    tagline: overrides.tagline ?? template.tagline,
    script: overrides.script ?? template.script,
    hashtag: overrides.hashtag ?? template.hashtag,
    ceremonies: overrides.ceremonies ?? template.ceremonies,
    monumentNames: overrides.monumentNames ?? template.monumentNames,
    music: overrides.music ?? template.music,
    image: overrides.image ?? template.image,
    video: overrides.video ?? template.video,
  };
}

export const getTemplate = (slug: string) =>
  TEMPLATES.find((t) => t.slug === slug);
export const templatesByTier = (tier: Tier) =>
  TEMPLATES.filter((t) => t.tier === tier);
export const templatesByCountry = (c: Country) =>
  TEMPLATES.filter((t) => t.country === c);

export const COUNTRIES: { id: Country; label: string; blurb: string }[] = [
  { id: "india", label: "India", blurb: "Rajwada, marigold and mandala" },
  { id: "uae", label: "UAE", blurb: "Lantern, dune and skyline gold" },
  { id: "france", label: "France", blurb: "Champagne, lavender and Eiffel" },
  { id: "usa", label: "USA", blurb: "Chapel bells, coast and Beverly glam" },
  { id: "italy", label: "Italy", blurb: "Cypress, Amalfi and Venetian opera" },
];

export const TIERS: {
  id: Tier;
  label: string;
  blurb: string;
  count: number;
}[] = [
  {
    id: "silver",
    label: "Silver",
    blurb: "Clean, elegant, essentials only — no music",
    count: 10,
  },
  {
    id: "gold",
    label: "Gold",
    blurb: "Background music, ceremonies, families — richer motion",
    count: 20,
  },
  {
    id: "platinum",
    label: "Platinum",
    blurb: "Music, chatbot, 3D parallax, wishes — everything unlocked",
    count: 35,
  },
];
