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
