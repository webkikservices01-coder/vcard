// Invite Studio: eight wedding designs (from the "Invite Template Catalogue v2" design file).
// Each design has three colour palettes, its own fonts, opening, hero, interactive moment and
// signature section. StudioInvite.tsx draws them; the couple's own details come from the invite.

export type Palette = { name: string; base: string; surface: string; ink: string; a1: string; a2: string; metal: string };
export type Gesture = "tap" | "down" | "up" | "side";
export type OpenKind = "Doors" | "Curtain" | "Fabric" | "Thoranam" | "Envelope" | "Box" | "Sleeve";
export type RevealKind = "Cover" | "Petals" | "Seal" | "Flip" | "Peel" | "Ribbon" | "Plain";
export type HeroKind = "Jharokha" | "Miniature" | "Riad" | "Phulkari" | "Kolam" | "Garden" | "Crest" | "Letter";
export type WowKind = "jharokhas" | "bells" | "lanterns" | "phulkari" | "kolam" | "bouquet" | "champagne" | "press";
export type Step = { n: string; k: string; t: string; x: string };
export type Fn = { name: string; day: string; time: string; venue: string; art: string; sw: string[]; swLabel: string };

export type Design = {
  code: string;
  slug: string;
  name: string;
  sub: string;
  display: string;
  text: string;
  nameSize: number;
  nameCase: "uppercase" | "none";
  nameLs: string;
  hero: HeroKind;
  open: OpenKind;
  gesture: [Gesture, string];
  reveal: RevealKind;
  revealName: string;
  music: string;
  pals: Palette[];
  style: (P: Palette) => Partial<Tokens>;
  plate: (P: Palette) => Plate;
  // Sample content (the design showcase; a couple's own details replace it).
  n1: string;
  n2: string;
  nameAlt?: string;
  nameAltFont?: string;
  top: string;
  topFont: string;
  tagline: string;
  dateLong: string;
  city: string;
  target: string;
  cdLabel: string;
  fns: Fn[];
  venueName: string;
  venueAddr: string;
  park: string;
  her: string;
  him: string;
  heroArt: string;
  rsvpBy: string;
  rsvpTitle: string;
  yes: string;
  no: string;
  meals: [string, string, string];
  persona: string;
  wow: WowKind;
  wowLabel: string;
  sigName: string;
  sigText: string;
  sigSteps?: Step[];
  sigGrid?: { k: string; v: string }[];
  features: string[];
};

export type Plate = { top: string; bg: string; ink: string; font: string; size: string; radius: string; shadow: string };

export type Tokens = {
  tileRadius: string; tileBg: string; tileShadow: string; tileBorder: string; tileInk: string; tileSplit: boolean;
  divW: string; divH: string; divBg: string; divC: boolean;
  cardRadius: string; cardBorder: string; cardShadow: string; artRadius: string; btnRadius: string; btnBg: string; btnInk: string;
  venueRadius: string; venueBorder: string; dockRadius: string; dockBg: string; dockInk: string;
  aiRadius: string; aiBg: string; aiInk: string; aiH: string;
  formRadius: string; callShape: string; onA1: string; line: string; stripe: string; foil: string; qrDot: string; dateShadow: string;
  sealHi: string; sealC: string; sealLo: string; velvet: string; peelText: string; flipEdge: string; flipBg: string;
  coverClip: string;
  doorBg: string; doorLine: string; bells: boolean;
  silkA: string; silkB: string; silkC: string; clothBg: string; envBg: string; envFlap: string;
  numFont: string; fnFont: string; fnSize: string; fnCase: "uppercase" | "none"; fnLs: string;
  venueSize: string; rsvpSize: string; footSize: string; qrNameSize: string;
  petals: string[]; glints: boolean;
};

export const mix = (a: string, b: string, p: number) => `color-mix(in srgb, ${a} ${p}%, ${b})`;
export const foil = (m: string) =>
  `linear-gradient(110deg, ${mix(m, "#000", 62)} 0%, ${mix(m, "#fff", 35)} 34%, ${m} 50%, ${mix(m, "#fff", 22)} 64%, ${mix(m, "#000", 68)} 100%)`;
export const velvet = (c: string) =>
  `radial-gradient(120% 70% at 30% 15%, rgba(255,255,255,.16), transparent 55%), radial-gradient(100% 70% at 85% 95%, rgba(0,0,0,.28), transparent 60%), ${c}`;
const HEART = 'path("M110 200 C 40 150, 0 112, 12 66 C 24 22, 84 14, 110 58 C 136 14, 196 22, 208 66 C 220 112, 180 150, 110 200 Z")';

// Tokens every design starts from (design file `base`).
export const baseTokens = (P: Palette): Tokens => ({
  tileRadius: "8px", tileBg: P.surface, tileShadow: "inset 0 1px 3px rgba(70,45,25,.2), 0 1px 0 rgba(255,255,255,.9)", tileBorder: mix(P.metal, "transparent", 35), tileInk: P.ink, tileSplit: false,
  divW: "210px", divH: "1px", divBg: `linear-gradient(90deg, transparent, ${P.metal}, transparent)`, divC: true,
  cardRadius: "14px", cardBorder: `1px solid ${mix(P.metal, "transparent", 45)}`, cardShadow: "0 10px 28px rgba(60,40,25,.10)", artRadius: "120px 120px 6px 6px", btnRadius: "99px", btnBg: "transparent", btnInk: P.a1,
  venueRadius: "50%", venueBorder: "none", dockRadius: "24px", dockBg: mix(P.surface, "transparent", 75), dockInk: P.a1,
  aiRadius: "47% 53% 50% 48%", aiBg: `radial-gradient(circle at 38% 30%, ${mix(P.a1, "#fff", 50)}, ${P.a1} 50%, ${mix(P.a1, "#000", 70)})`, aiInk: P.surface, aiH: "52px",
  formRadius: "14px", callShape: "50%", onA1: P.surface, line: mix(P.metal, "transparent", 50), stripe: mix(P.a2, P.surface, 22), foil: foil(P.metal), qrDot: "0", dateShadow: "none",
  sealHi: mix(P.a1, "#fff", 55), sealC: P.a1, sealLo: mix(P.a1, "#000", 60), velvet: velvet(P.a1), peelText: "peel the jasmine", flipEdge: mix(P.a1, "#000", 78),
  flipBg: `linear-gradient(45deg,transparent 42%,${P.metal} 42% 58%,transparent 58%) 0 0/16px 16px, linear-gradient(-45deg,transparent 42%,${P.a2} 42% 58%,transparent 58%) 0 0/16px 16px, ${mix(P.a1, "#000", 78)}`,
  coverClip: "circle(50%)",
  doorBg: mix(P.a2, P.a1, 82), doorLine: mix(P.a1, "transparent", 45), bells: false,
  silkA: mix(P.a2, P.base, 45), silkB: mix(P.a2, "#fff", 45), silkC: mix(P.a2, P.ink, 72), clothBg: mix(P.a1, "#000", 78), envBg: mix(P.surface, P.a2, 85), envFlap: mix(P.surface, P.a2, 75),
  numFont: "'Cormorant Garamond', serif", fnFont: "'Cormorant Garamond', serif", fnSize: "28px", fnCase: "none", fnLs: "0",
  venueSize: "28px", rsvpSize: "30px", footSize: "28px", qrNameSize: "28px", petals: [], glints: false,
});

const pl = (top: string, bg: string, ink: string, font: string, size: string, radius = "4px", shadow = "none"): Plate => ({ top, bg, ink, font, size, radius, shadow });
const st = (a: [string, string, string, string][]): Step[] => a.map(([n, k, t, x]) => ({ n, k, t, x }));

export const DESIGNS: Design[] = [
  {
    code: "W1", slug: "studio-rajputana-haveli", name: "Rajputana Haveli", sub: "Hindu · Rajasthani",
    display: "'Cinzel', serif", text: "'Cormorant Garamond', serif", nameSize: 38, nameCase: "uppercase", nameLs: ".08em",
    hero: "Jharokha", open: "Doors", gesture: ["tap", "Pull the brass knocker"], reveal: "Cover", revealName: "Scratch the gold coin", music: "Sarangi and soft dhol",
    pals: [
      { name: "Ivory & Saffron", base: "#F3EADB", surface: "#FAF4E9", ink: "#3B2A1C", a1: "#9A4A1F", a2: "#D4A97A", metal: "#A88442" },
      { name: "Rose Sandstone", base: "#F3E6E0", surface: "#FBF4F0", ink: "#3B2228", a1: "#8A3A4A", a2: "#D9A9A0", metal: "#B9816B" },
      { name: "Indigo Dusk", base: "#E9E8E4", surface: "#F6F5F1", ink: "#262B3A", a1: "#34416B", a2: "#C9A27E", metal: "#A88442" },
    ],
    style: (P) => ({ doorBg: mix(P.a2, P.a1, 82), doorLine: mix(P.a1, "transparent", 45), aiRadius: "12px 12px 24px 24px", aiBg: `radial-gradient(circle at 50% 60%, #FFE3A6, transparent 70%), ${P.metal}`, aiInk: P.ink, aiH: "58px", numFont: "'Cinzel', serif", fnFont: "'Cinzel', serif", fnSize: "24px", fnCase: "uppercase", fnLs: ".08em", venueSize: "26px", rsvpSize: "26px", footSize: "22px", qrNameSize: "24px", petals: ["#C2416B", "#E39A3B", "#E9A6A0"] }),
    plate: (P) => pl("130px", foil(P.metal), mix(P.metal, "#000", 30), "'Cinzel', serif", "14px", "3px", "0 6px 14px rgba(0,0,0,.25)"),
    n1: "Devika", n2: "Aditya", top: "॥ श्री गणेशाय नमः ॥", topFont: "'Tiro Devanagari Hindi', serif",
    tagline: "With joy, the Rathore and Singhania families invite you to the wedding of their children.", dateLong: "Saturday, 13 February 2027", city: "Jaipur", target: "2027-02-13T19:30:00+05:30", cdLabel: "Until the pheras",
    fns: [
      { name: "Mehendi", day: "Fri, 12 Feb", time: "3:00 PM", venue: "Zenana Courtyard", art: "mehendi · marigold swing", sw: ["#7A8F3A", "#E1953A", "#F3E3C3"], swLabel: "Greens, marigold" },
      { name: "Sangeet", day: "Fri, 12 Feb", time: "8:00 PM", venue: "Sheesh Mahal Terrace", art: "sangeet · lanterns, mirrors", sw: ["#9A3B5A", "#2F4A7A", "#B8913F"], swLabel: "Jewel tones" },
      { name: "Pheras", day: "Sat, 13 Feb", time: "7:30 PM", venue: "Mandap Courtyard", art: "mandap · elephants, torans", sw: ["#F3E3C3", "#A88442", "#B23A48"], swLabel: "Ivory, gold, red" },
    ],
    venueName: "Haveli Chandramahal", venueAddr: "Amer Road, Jaipur, Rajasthan 302002", park: "Valet parking at the Hathi Pol gate.", her: "Leheriya lehenga", him: "Bandhgala & safa", heroArt: "painted courtyard · fountain",
    rsvpBy: "Kindly reply by 10 January", rsvpTitle: "Will you join us?", yes: "Yes", no: "No", meals: ["Veg", "Jain", "Non-veg"], persona: "Rathore Family Concierge",
    wow: "jharokhas", wowLabel: "Open the jharokhas", sigName: "The Baraat Route", sigText: "the groom’s procession, stop by stop.",
    sigSteps: st([
      ["1", "6:00 PM · Hathi Pol", "The ghodi arrives", "Aditya mounts the white mare under the elephant gate."],
      ["2", "6:20 PM · Chand Bazaar", "Dhol and dance", "The baraat dances down the bazaar lane. Comfortable shoes help."],
      ["3", "7:00 PM · Suraj Pol", "Milni", "The two families meet and exchange garlands at the haveli gate."],
      ["4", "7:30 PM · Mandap Courtyard", "Jaimala", "Varmala on the courtyard steps, then the pheras."],
    ]),
    features: ["Sandstone doors open with a knocker", "Open six jharokha windows", "Baraat route, stop by stop", "Scratch the gold coin for the date", "Three colour palettes", "RSVP, wishes, AI host"],
  },
  {
    code: "W2", slug: "studio-pichwai-lotus-temple", name: "Pichwai Lotus Temple", sub: "Hindu · Pichwai",
    display: "'Cormorant Garamond', serif", text: "'Cormorant Garamond', serif", nameSize: 44, nameCase: "none", nameLs: "0",
    hero: "Miniature", open: "Doors", gesture: ["tap", "Tap the temple bell"], reveal: "Petals", revealName: "Lotus blooms open", music: "Temple bells, bansuri",
    pals: [
      { name: "Lapis & Gold Leaf", base: "#F5EEDD", surface: "#FBF7EC", ink: "#1F2A44", a1: "#24407A", a2: "#D9822B", metal: "#B8913F" },
      { name: "Rani & Gold", base: "#F5E8E4", surface: "#FCF5F2", ink: "#3A1E2A", a1: "#8C2F5A", a2: "#E0A33B", metal: "#B8913F" },
      { name: "Peacock", base: "#E8EDE6", surface: "#F5F7F2", ink: "#1E2E2C", a1: "#1F5A5A", a2: "#D9822B", metal: "#B08A45" },
    ],
    style: (P) => ({ doorBg: P.a1, doorLine: mix(P.metal, "transparent", 30), bells: true, tileRadius: "4px", tileBg: P.a1, tileShadow: `0 0 0 3px ${P.surface}, 0 0 0 4px ${P.metal}`, tileBorder: P.metal, tileInk: P.surface, divW: "200px", cardRadius: "4px", cardBorder: `5px solid ${P.a1}`, cardShadow: `inset 0 0 0 2px ${P.metal}, 0 10px 24px rgba(30,40,70,.12)`, artRadius: "50% 50% 4px 4px / 40% 40% 4px 4px", btnRadius: "4px", venueRadius: "50% 50% 6px 6px / 40% 40% 6px 6px", venueBorder: `6px solid ${P.a1}`, dockBg: P.a1, dockInk: P.surface, dockRadius: "14px", aiRadius: "50% 50% 10px 10px", aiBg: `radial-gradient(circle at 35% 30%, #fff8, transparent 45%), ${P.metal}`, aiInk: P.a1, formRadius: "4px", callShape: "50% 50% 50% 50% / 60% 60% 40% 40%", fnFont: "'Tiro Devanagari Hindi', serif", fnSize: "30px", venueSize: "32px", rsvpSize: "34px", footSize: "30px", qrNameSize: "30px", qrDot: "1px" }),
    plate: (P) => pl("180px", P.a1, P.metal, "'Cormorant Garamond', serif", "18px", "2px", `0 0 0 1px ${P.metal}, 0 6px 14px rgba(0,0,0,.25)`),
    n1: "Gauri", n2: "Madhav", nameAlt: "गौरी & माधव", nameAltFont: "'Tiro Devanagari Hindi', serif", top: "॥ श्री गणेशाय नमः ॥", topFont: "'Tiro Devanagari Hindi', serif",
    tagline: "The Joshi and Purohit families seek your blessings at the wedding of", dateLong: "Sunday, 7 March 2027", city: "Nathdwara", target: "2027-03-07T18:45:00+05:30", cdLabel: "Until the vivah",
    fns: [
      { name: "हल्दी · Haldi", day: "Sat, 6 Mar", time: "10:00 AM", venue: "Kadamba Grove", art: "haldi · kadamba shade", sw: ["#E8B83A", "#F3E7C4", "#7A8F3A"], swLabel: "Yellows" },
      { name: "मेहंदी · Mehendi", day: "Sat, 6 Mar", time: "4:00 PM", venue: "Lotus Pond Pavilion", art: "mehendi · lotus pond", sw: ["#1F6B5C", "#E0A33B", "#F3E7C4"], swLabel: "Green, saffron" },
      { name: "विवाह · Vivah", day: "Sun, 7 Mar", time: "6:45 PM", venue: "Shrinath Courtyard", art: "vivah · temple, garlands", sw: ["#B23A48", "#B8913F", "#F3E7C4"], swLabel: "Red, gold, cream" },
    ],
    venueName: "Kadamba Bagh", venueAddr: "Temple Road, Nathdwara, Rajasthan 313301", park: "Parking at the Bagh gate; e-carts to the courtyard.", her: "Bandhani lehenga", him: "Angrakha & pagdi", heroArt: "Pichwai · couple under the kadamba tree",
    rsvpBy: "कृपया उत्तर दें · Kindly reply", rsvpTitle: "Will you bless us?", yes: "Yes", no: "No", meals: ["Satvik", "Jain", "Veg"], persona: "Joshi Family Concierge",
    wow: "bells", wowLabel: "Ring the bells", sigName: "Blessings from our Elders", sigText: "grandparents and elders, each with a line of blessing.",
    sigSteps: st([
      ["DJ", "Dadaji · Joshi family", "“May your home always have music.”", "Recorded as a voice note"],
      ["NJ", "Naniji · Purohit family", "“Be patient, be kind, laugh often.”", "Recorded as a voice note"],
      ["MP", "Mamaji · Purohit family", "“Shri Nathji’s blessings on you both.”", "Written at Nathdwara"],
    ]),
    features: ["Temple doors open with bells", "Ring five bells to bloom lotuses", "Blessings from the elders", "Lotus reveals the date", "Hindi names in Devanagari", "RSVP, wishes, AI host"],
  },
  {
    code: "W3", slug: "studio-moroccan-riad-nikah", name: "Moroccan Riad Nikah", sub: "Muslim · Moroccan",
    display: "'Pinyon Script', cursive", text: "'Amiri', serif", nameSize: 54, nameCase: "none", nameLs: "0",
    hero: "Riad", open: "Curtain", gesture: ["down", "Drag the cord down"], reveal: "Seal", revealName: "Wax seal cracks", music: "Oud and qanun",
    pals: [
      { name: "Blush & Champagne", base: "#F4E6DF", surface: "#FBF3EE", ink: "#3D2620", a1: "#9A4A33", a2: "#D9C2A3", metal: "#C2A16E" },
      { name: "Mint Zellige", base: "#E7EEEA", surface: "#F4F8F5", ink: "#1F302C", a1: "#2F6B63", a2: "#D9C2A3", metal: "#B89A62" },
      { name: "Midnight Sand", base: "#ECE6DC", surface: "#F7F3EC", ink: "#232A3D", a1: "#2E3B5C", a2: "#C9A27E", metal: "#B89A62" },
    ],
    style: (P) => ({ silkA: mix(P.a2, P.base, 45), silkB: mix(P.a2, "#fff", 45), silkC: mix(P.a2, P.ink, 72), tileRadius: "31px 31px 4px 4px", tileShadow: "0 4px 10px rgba(60,40,30,.10)", tileBorder: P.metal, divW: "220px", divH: "12px", divBg: `conic-gradient(from 45deg, ${P.a1} 0 25%, ${P.metal} 0 50%, ${P.a1} 0 75%, ${P.surface} 0) 0 0/12px 12px`, divC: false, cardRadius: "150px 150px 10px 10px/120px 120px 10px 10px", artRadius: "140px 140px 4px 4px/110px 110px 4px 4px", btnRadius: "6px", venueRadius: "150px 150px 6px 6px", formRadius: "8px", callShape: "75px 75px 10px 10px", numFont: "'Amiri', serif", fnFont: "'Pinyon Script', cursive", fnSize: "38px", venueSize: "36px", rsvpSize: "40px", footSize: "38px", qrNameSize: "38px", qrDot: "50%", glints: true }),
    plate: (P) => pl("250px", P.surface, P.a1, "'Pinyon Script', cursive", "26px", "2px 2px 14px 14px", "0 6px 16px rgba(0,0,0,.15)"),
    n1: "Inaya", n2: "Rehan", top: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ", topFont: "'Amiri', serif",
    tagline: "With the blessings of Allah, the Siddiqui and Ansari families invite you to the Nikah of", dateLong: "Friday, 20 November 2026", city: "Lucknow", target: "2026-11-20T17:00:00+05:30", cdLabel: "Until the Nikah",
    fns: [
      { name: "Mehndi", day: "Wed, 18 Nov", time: "6:00 PM", venue: "Lantern Courtyard", art: "mehndi · brass lanterns", sw: ["#7A8F3A", "#E8B83A", "#F3E7C4"], swLabel: "Greens, gold" },
      { name: "Nikah", day: "Fri, 20 Nov", time: "5:00 PM", venue: "Riad Hall", art: "nikah · arched hall", sw: ["#F3EEE2", "#D9C2A3", "#C2A16E"], swLabel: "Ivory, sand" },
      { name: "Walima", day: "Sat, 21 Nov", time: "8:00 PM", venue: "Palm Garden", art: "walima · palm courtyard", sw: ["#2E3B5C", "#9A4A33", "#C2A16E"], swLabel: "Deep tones" },
    ],
    venueName: "Dar-ul-Noor Riad", venueAddr: "Kaiserbagh, Lucknow, Uttar Pradesh 226001", park: "Valet at the main darwaza. Prayer room on site.", her: "Gharara in sand", him: "Sherwani in ivory", heroArt: "palm courtyard · crystal chandelier",
    rsvpBy: "Kindly respond by 1 November", rsvpTitle: "Will you join us?", yes: "Accept", no: "Decline", meals: ["Standard", "Veg", "Kids"], persona: "Siddiqui Family Concierge",
    wow: "lanterns", wowLabel: "Light the lanterns", sigName: "Your Guide to the Nikah", sigText: "what happens during the ceremony, for guests attending their first Nikah.",
    sigSteps: st([
      ["1", "4:45 PM", "Arrival", "Guests are seated; the families sit at the front."],
      ["2", "5:00 PM", "Khutbah", "The Qazi gives a short sermon on marriage."],
      ["3", "5:15 PM", "Ijab-o-Qubool", "Inaya and Rehan each give their consent three times."],
      ["4", "5:30 PM", "Nikahnama", "The marriage contract is signed before two witnesses."],
      ["5", "5:45 PM", "Dua & Mubarakbaad", "A prayer for the couple, then congratulations."],
    ]),
    features: ["Silk curtains part on a cord", "Light seven brass lanterns", "A guide to the Nikah", "Wax seal reveals the date", "Bismillah in Arabic", "RSVP, wishes, AI host"],
  },
  {
    code: "W4", slug: "studio-anand-karaj", name: "Anand Karaj Golden Morning", sub: "Sikh · Punjabi",
    display: "'Lora', serif", text: "'Lora', serif", nameSize: 44, nameCase: "none", nameLs: "0",
    hero: "Phulkari", open: "Fabric", gesture: ["side", "Swipe to unfold the phulkari"], reveal: "Flip", revealName: "Flip calendar", music: "Shabad on rabab, morning",
    pals: [
      { name: "Ivory & Marigold", base: "#F7F1E3", surface: "#FFFBF0", ink: "#3A2A18", a1: "#965410", a2: "#C2416B", metal: "#B8913F" },
      { name: "Peach Phulkari", base: "#F7ECE4", surface: "#FFF8F3", ink: "#3A2420", a1: "#A3473A", a2: "#E39A3B", metal: "#B8913F" },
      { name: "Sky Morning", base: "#EAEEF0", surface: "#F7F9FA", ink: "#1F2E3A", a1: "#2F5A7A", a2: "#E3A33B", metal: "#B08A45" },
    ],
    style: (P) => ({ clothBg: mix(P.a1, "#000", 78), tileRadius: "10px", tileShadow: `inset 0 -3px 0 ${P.a2}, 0 4px 10px rgba(60,40,20,.08)`, divW: "220px", divH: "2px", divBg: `repeating-linear-gradient(90deg, ${P.a2} 0 8px, transparent 8px 13px)`, cardRadius: "18px", cardBorder: `1.5px dashed ${mix(P.a2, "transparent", 60)}`, artRadius: "150px 150px 10px 10px", btnRadius: "12px", venueRadius: "24px", dockBg: P.a1, dockInk: P.surface, aiRadius: "50% 50% 50% 50% / 40% 40% 60% 60%", aiBg: foil(P.metal), aiInk: P.ink, aiH: "58px", formRadius: "18px", callShape: "50% 50% 50% 50% / 42% 42% 58% 58%", numFont: "'Lora', serif", fnFont: "'Lora', serif", fnSize: "28px", venueSize: "28px", rsvpSize: "30px", footSize: "30px", qrNameSize: "28px", qrDot: "2px" }),
    plate: (P) => pl("640px", mix(P.a1, "#000", 78), P.metal, "'Lora', serif", "17px", "6px", `inset 0 0 0 2px ${mix(P.a1, "#000", 78)}, inset 0 0 0 3px ${P.a2}`),
    n1: "Noor", n2: "Jasraj", nameAlt: "ਨੂਰ ਤੇ ਜਸਰਾਜ", nameAltFont: "'Noto Serif Gurmukhi', serif", top: "ੴ", topFont: "'Noto Serif Gurmukhi', serif",
    tagline: "With the grace of Waheguru, the Gill and Sandhu families invite you to the Anand Karaj of", dateLong: "Sunday, 24 January 2027", city: "Amritsar", target: "2027-01-24T09:30:00+05:30", cdLabel: "Until the laavan",
    fns: [
      { name: "Jaago", day: "Fri, 22 Jan", time: "9:00 PM", venue: "Haveli Lawns", art: "jaago · lit gagar, dancing", sw: ["#C2416B", "#E39A3B", "#2F7A5A"], swLabel: "Bright, festive" },
      { name: "Anand Karaj", day: "Sun, 24 Jan", time: "9:30 AM", venue: "Gurdwara Sahib", art: "anand karaj · domes at dawn", sw: ["#F3E7C4", "#E8B83A", "#E9A6A0"], swLabel: "Pastels, heads covered" },
      { name: "Reception", day: "Sun, 24 Jan", time: "7:30 PM", venue: "Ranjit Hall", art: "reception · phulkari drapes", sw: ["#6E2639", "#B8913F", "#1F3B5C"], swLabel: "Rich, evening" },
    ],
    venueName: "Gurdwara Sahib, Rani Ka Bagh", venueAddr: "Rani Ka Bagh, Amritsar, Punjab 143001", park: "Parking behind the langar hall. Rumals at the entrance.", her: "Phulkari dupatta", him: "Achkan & pagg", heroArt: "white domes in morning light",
    rsvpBy: "Kindly reply by 5 January", rsvpTitle: "Will you join us?", yes: "Yes", no: "No", meals: ["Langar", "Veg", "Non-veg"], persona: "Gill Family Concierge",
    wow: "phulkari", wowLabel: "Stitch the phulkari", sigName: "The Four Laavan", sigText: "the four rounds of the Anand Karaj, explained for guests.",
    sigSteps: st([
      ["1", "First lav", "Duty", "A commitment to a life of righteous duty, with Waheguru at the centre."],
      ["2", "Second lav", "Love", "Letting go of ego; love for the divine and each other."],
      ["3", "Third lav", "Detachment", "Finding contentment together, free of worldly attachment."],
      ["4", "Fourth lav", "Union", "Peace and union with the divine; the marriage is complete."],
    ]),
    features: ["Phulkari cloth unfolds", "Stitch the phulkari with your finger", "The four laavan explained", "Flip calendar reveals the date", "Gurmukhi names", "RSVP, wishes, AI host"],
  },
  {
    code: "W5", slug: "studio-south-indian-kalyanam", name: "South Indian Kalyanam", sub: "Hindu · Tamil",
    display: "'Cormorant Garamond', serif", text: "'Cormorant Garamond', serif", nameSize: 44, nameCase: "none", nameLs: "0",
    hero: "Kolam", open: "Thoranam", gesture: ["up", "Swipe up to lift the thoranam"], reveal: "Peel", revealName: "Peel the jasmine sticker", music: "Nadaswaram and thavil",
    pals: [
      { name: "Brick & Turmeric", base: "#F7F3EA", surface: "#FFFDF7", ink: "#3A1E14", a1: "#9B3A26", a2: "#D9A21E", metal: "#B8913F" },
      { name: "Peacock Silk", base: "#E8EEEA", surface: "#F6F9F6", ink: "#16302C", a1: "#1F5A55", a2: "#D9A21E", metal: "#B8913F" },
      { name: "Mango Rani", base: "#F6EAE6", surface: "#FFF8F5", ink: "#3A1A26", a1: "#8C2F5A", a2: "#7FA04A", metal: "#B8913F" },
    ],
    style: (P) => ({ tileRadius: "4px", tileBg: P.a1, tileShadow: `inset 0 4px 0 ${P.metal}, inset 0 -4px 0 ${P.metal}`, tileBorder: "transparent", tileInk: P.surface, divW: "220px", divH: "12px", divBg: `radial-gradient(circle, #fff 0 3px, ${mix(P.metal, "transparent", 70)} 3.5px, transparent 4.5px) 0 50%/13px 12px repeat-x`, divC: false, cardRadius: "10px", cardShadow: `inset 0 -8px 0 ${P.a1}, inset 0 -10px 0 ${P.metal}, 0 10px 24px rgba(60,30,20,.10)`, artRadius: "8px", btnRadius: "8px", venueRadius: "8px", venueBorder: `1px solid ${P.metal}`, dockBg: foil(P.metal), dockInk: P.ink, dockRadius: "99px", aiRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", aiBg: "radial-gradient(ellipse at 50% 75%, #fff6d8, #ffc65c 45%, #f08a2a 85%)", aiInk: P.ink, aiH: "60px", formRadius: "10px", callShape: "50%", numFont: "'Cormorant Garamond', serif", fnFont: "'Cormorant Garamond', serif", fnSize: "30px", venueSize: "28px", rsvpSize: "34px", footSize: "32px", qrNameSize: "32px" }),
    plate: (P) => pl("92px", P.surface, P.a1, "'Cormorant Garamond', serif", "18px", "0 0 12px 12px", `0 0 0 1px ${P.metal}`),
    n1: "Lakshmi", n2: "Karthik", nameAlt: "லக்ஷ்மி & கார்த்திக்", nameAltFont: "'Noto Serif Tamil', serif", top: "சுப முகூர்த்தம்", topFont: "'Noto Serif Tamil', serif",
    tagline: "The Iyer and Subramanian families request your presence at the Kalyanam of", dateLong: "Thursday, 11 February 2027", city: "Madurai", target: "2027-02-11T07:30:00+05:30", cdLabel: "Until the muhurtham",
    fns: [
      { name: "Nichayathartham", day: "Wed, 10 Feb", time: "6:30 PM", venue: "Thoranam Hall", art: "nichayathartham · plantain arch", sw: ["#1F5A55", "#D9A21E", "#F3E7C4"], swLabel: "Silk, any colour" },
      { name: "Muhurtham", day: "Thu, 11 Feb", time: "7:30 AM", venue: "Kalyana Mandapam", art: "muhurtham · mandapam, lamps", sw: ["#9B3A26", "#D9A21E", "#F7F3EA"], swLabel: "Kanjeevaram, veshti" },
      { name: "Reception", day: "Thu, 11 Feb", time: "7:00 PM", venue: "Lotus Lawns", art: "reception · jasmine canopy", sw: ["#8C2F5A", "#B8913F", "#1F3B5C"], swLabel: "Evening wear" },
    ],
    venueName: "Sri Kamakshi Kalyana Mandapam", venueAddr: "East Masi Street, Madurai, Tamil Nadu 625001", park: "Parking on North Veli Street; shuttle every 15 min.", her: "Kanjeevaram, jasmine", him: "Veshti & angavastram", heroArt: "gopuram · jasmine strings",
    rsvpBy: "Kindly reply by 20 January", rsvpTitle: "Will you join us?", yes: "Yes", no: "No", meals: ["Banana leaf", "Jain", "Kids"], persona: "Iyer Family Concierge",
    wow: "kolam", wowLabel: "Draw a kolam", sigName: "Kalyanam, Step by Step", sigText: "the rituals of the morning, in order.",
    sigSteps: st([
      ["1", "7:00 AM", "Kashi Yatra", "Karthik pretends to leave for Kashi; Lakshmi’s father persuades him to marry instead."],
      ["2", "7:10 AM", "Oonjal", "The couple sit on a swing while women sing and circle them with lamps."],
      ["3", "7:20 AM", "Kanyadaanam", "Lakshmi sits on her father’s lap and is given in marriage."],
      ["4", "7:30 AM", "Mangalya Dharanam", "Karthik ties the thali at the auspicious moment."],
      ["5", "7:40 AM", "Saptapadi", "Seven steps together around the sacred fire."],
    ]),
    features: ["Leaf thoranam lifts like a curtain", "Draw a kolam that mirrors eight ways", "The Kalyanam step by step", "Peel the jasmine for the date", "Tamil names", "RSVP, wishes, AI host"],
  },
  {
    code: "W6", slug: "studio-english-garden-chapel", name: "English Garden Chapel", sub: "Christian · Western",
    display: "'Great Vibes', cursive", text: "'Lora', serif", nameSize: 52, nameCase: "none", nameLs: "0",
    hero: "Garden", open: "Envelope", gesture: ["tap", "Tap the wax seal"], reveal: "Cover", revealName: "Scratch the heart", music: "String quartet",
    pals: [
      { name: "Ivory & Blush", base: "#F6F1E8", surface: "#FCF9F3", ink: "#33302C", a1: "#56684F", a2: "#E2B8B0", metal: "#B9816B" },
      { name: "Dusty Blue", base: "#ECEEF0", surface: "#F8F9FA", ink: "#2A303A", a1: "#45607A", a2: "#C9D3DE", metal: "#A9A08F" },
      { name: "Champagne", base: "#F3EDE2", surface: "#FBF8F2", ink: "#34302A", a1: "#6E5A3E", a2: "#E3CFAE", metal: "#B89A62" },
    ],
    style: (P) => ({ envBg: mix(P.surface, P.a2, 85), envFlap: mix(P.surface, P.a2, 75), sealHi: mix(P.a2, "#fff", 50), sealC: P.a2, sealLo: mix(P.a2, "#000", 55), tileRadius: "50%", tileBg: "rgba(255,255,255,.6)", tileShadow: "0 6px 14px rgba(60,50,40,.08)", tileBorder: "rgba(255,255,255,.9)", divW: "200px", divH: "10px", divBg: "radial-gradient(circle at 40% 35%, #fff, #EDE6DA 55%, #CFC4B2 75%, transparent 80%) 0 50%/10px 10px repeat-x", divC: false, cardRadius: "4px", artRadius: "2px", btnRadius: "99px", venueRadius: "50%", aiBg: `radial-gradient(circle at 38% 30%, ${mix(P.a2, "#fff", 50)}, ${P.a2} 50%, ${mix(P.a2, "#000", 70)})`, aiInk: P.ink, formRadius: "4px", coverClip: HEART, numFont: "'Lora', serif", fnFont: "'Great Vibes', cursive", fnSize: "40px", venueSize: "40px", rsvpSize: "44px", footSize: "40px", qrNameSize: "40px", qrDot: "50%", petals: ["#E2B8B0", "#F2D6CF", "#FFFFFF"] }),
    plate: (P) => pl("486px", "transparent", P.ink, "'Great Vibes', cursive", "30px"),
    n1: "Olivia", n2: "James", top: "Together with their families", topFont: "'Lora', serif",
    tagline: "request the pleasure of your company at their marriage.", dateLong: "Saturday, 12 June 2027", city: "The Cotswolds", target: "2027-06-12T14:00:00+01:00", cdLabel: "Until we say I do",
    fns: [
      { name: "Ceremony", day: "Sat, 12 Jun", time: "2:00 PM", venue: "St Mary’s Chapel", art: "white chapel · climbing roses", sw: ["#F3EEE2", "#E2B8B0", "#56684F"], swLabel: "Garden formal" },
      { name: "Drinks on the lawn", day: "Sat, 12 Jun", time: "3:30 PM", venue: "Rose Garden", art: "lawn · swans on the lake", sw: ["#E2B8B0", "#C9D3DE", "#F3EEE2"], swLabel: "Block heels" },
      { name: "Dinner & dancing", day: "Sat, 12 Jun", time: "6:30 PM", venue: "The Orangery", art: "orangery · candles, lace", sw: ["#56684F", "#B9816B", "#33302C"], swLabel: "Black tie optional" },
    ],
    venueName: "Ashcombe Manor", venueAddr: "Ashcombe, Gloucestershire GL54 3AA", park: "Parking in the paddock; overnight cars welcome.", her: "Tea-length dress", him: "Linen suit", heroArt: "climbing roses · white chapel, swans",
    rsvpBy: "Kindly reply by 1 May", rsvpTitle: "Kindly reply", yes: "Delighted", no: "Regretfully", meals: ["Lamb", "Fish", "Vegetarian"], persona: "Olivia & James’s Concierge",
    wow: "bouquet", wowLabel: "Catch the bouquet", sigName: "Order of Service", sigText: "the ceremony, from processional to recessional.",
    sigSteps: st([
      ["1", "2:00 PM", "Processional", "Olivia walks in with her father to Pachelbel’s Canon."],
      ["2", "2:10 PM", "Welcome", "Reverend Hughes welcomes guests."],
      ["3", "2:15 PM", "Readings", "Charlotte reads Sonnet 116."],
      ["4", "2:25 PM", "Vows & rings", "Olivia and James exchange vows they wrote themselves."],
      ["5", "2:40 PM", "Recessional", "Out into the rose garden to the Beatles."],
    ]),
    features: ["Envelope with a wax seal", "Catch the bouquet", "Order of service", "Scratch the heart for the date", "Drifting rose petals", "RSVP, wishes, AI host"],
  },
  {
    code: "W7", slug: "studio-royal-velvet-reception", name: "Royal Velvet Reception", sub: "Reception · Modern Indian",
    display: "'Playfair Display', serif", text: "'Cormorant Garamond', serif", nameSize: 44, nameCase: "none", nameLs: "0",
    hero: "Crest", open: "Box", gesture: ["up", "Swipe up to lift the lid"], reveal: "Ribbon", revealName: "Tear the ribbon", music: "Jazz trio, champagne pop",
    pals: [
      { name: "Wine & Champagne", base: "#F5EFE6", surface: "#FBF7F0", ink: "#2E1A20", a1: "#6E2639", a2: "#E4CFA6", metal: "#B8913F" },
      { name: "Emerald Velvet", base: "#EEF0EA", surface: "#F8F9F5", ink: "#17271F", a1: "#1F4D3E", a2: "#E4CFA6", metal: "#B8913F" },
      { name: "Midnight Navy", base: "#ECEDF0", surface: "#F7F8FA", ink: "#1A2033", a1: "#23304F", a2: "#E4CFA6", metal: "#B8A07A" },
    ],
    style: (P) => ({ tileRadius: "6px", tileBg: `linear-gradient(180deg, ${mix(P.a1, "#fff", 88)} 0 50%, ${mix(P.a1, "#000", 82)} 50% 100%)`, tileShadow: "0 6px 12px rgba(40,15,20,.25)", tileBorder: mix(P.metal, "transparent", 40), tileInk: P.a2, tileSplit: true, divW: "200px", divH: "3px", divBg: `linear-gradient(${P.metal},${P.metal}) 0 0/100% 1px no-repeat, linear-gradient(${P.metal},${P.metal}) 0 100%/100% 1px no-repeat`, btnRadius: "4px", btnBg: P.a1, btnInk: P.a2, venueRadius: "4px", venueBorder: `8px solid ${P.metal}`, dockBg: velvet(P.a1), dockInk: P.a2, dockRadius: "99px", aiRadius: "50%", aiBg: foil(P.metal), aiInk: P.a1, formRadius: "4px", callShape: "50%", numFont: "'Playfair Display', serif", fnFont: "'Playfair Display', serif", fnSize: "26px", venueSize: "30px", rsvpSize: "32px", footSize: "30px", qrNameSize: "28px", qrDot: "1px", glints: true }),
    plate: (P) => pl("548px", foil(P.metal), P.a1, "'Playfair Display', serif", "15px", "2px", "0 4px 10px rgba(0,0,0,.3)"),
    n1: "Tara", n2: "Kunal", top: "The Kapoor and Mehta families request the pleasure of your company", topFont: "'Cormorant Garamond', serif",
    tagline: "for an evening of dinner, dancing and champagne in honour of the newlyweds.", dateLong: "Saturday, 5 December 2026", city: "Mumbai", target: "2026-12-05T19:00:00+05:30", cdLabel: "Until the first toast",
    fns: [
      { name: "Cocktails", day: "Sat, 5 Dec", time: "7:00 PM", venue: "Crystal Foyer", art: "crystal foyer", sw: ["#6E2639", "#E4CFA6", "#1A1A1A"], swLabel: "Black tie" },
      { name: "Reception dinner", day: "Sat, 5 Dec", time: "8:30 PM", venue: "Grand Ballroom", art: "grand ballroom", sw: ["#6E2639", "#B8913F", "#F5EFE6"], swLabel: "Wine and gold" },
      { name: "After-party", day: "Sat, 5 Dec", time: "11:30 PM", venue: "The Champagne Room", art: "champagne room", sw: ["#1A1A1A", "#E4CFA6", "#B8913F"], swLabel: "Sequins welcome" },
    ],
    venueName: "The Regent Ballroom", venueAddr: "Marine Drive, Mumbai, Maharashtra 400020", park: "Valet all evening at the Marine Drive entrance.", her: "Velvet gown or saree", him: "Tuxedo or bandhgala", heroArt: "crystal chandelier",
    rsvpBy: "Kindly reply by 15 November", rsvpTitle: "An evening with us", yes: "Accept", no: "Decline", meals: ["Veg", "Non-veg", "Vegan"], persona: "Kapoor–Mehta Concierge",
    wow: "champagne", wowLabel: "Pour the champagne", sigName: "The Evening", sigText: "how the night unfolds.",
    sigSteps: st([
      ["1", "7:00 PM", "Cocktails", "Champagne and canapés in the Crystal Foyer."],
      ["2", "8:30 PM", "The grand entrance", "Tara and Kunal walk down the ballroom staircase."],
      ["3", "9:00 PM", "Toasts & dinner", "Speeches from both families, then dinner."],
      ["4", "11:30 PM", "After-party", "The band plays on in the Champagne Room."],
    ]),
    features: ["Velvet box with a gold crest", "Pour the champagne tower", "How the evening unfolds", "Tear the ribbon for the date", "Foil shimmer and chandelier glints", "RSVP, wishes, AI host"],
  },
  {
    code: "W8", slug: "studio-minimal-letterpress", name: "Minimal Modern Letterpress", sub: "Modern · Any faith",
    display: "'Italiana', serif", text: "'Jost', sans-serif", nameSize: 40, nameCase: "none", nameLs: ".06em",
    hero: "Letter", open: "Sleeve", gesture: ["up", "Swipe up to slide the card out"], reveal: "Plain", revealName: "Plain, debossed", music: "Solo piano",
    pals: [
      { name: "Stone & Olive", base: "#E9E6DF", surface: "#F7F5EF", ink: "#2B2B29", a1: "#5A6340", a2: "#C9C4B6", metal: "#8C8B83" },
      { name: "Clay", base: "#EEE6DE", surface: "#F9F5F1", ink: "#2E2824", a1: "#8A5A44", a2: "#D6C3B4", metal: "#9A8B80" },
      { name: "Slate", base: "#E6E8E8", surface: "#F6F7F7", ink: "#252A2E", a1: "#3E4E58", a2: "#C4CBD0", metal: "#8A9096" },
    ],
    style: (P) => ({ tileRadius: "2px", tileBg: P.base, tileShadow: "inset 1px 1px 2px rgba(0,0,0,.14), inset -1px -1px 1px rgba(255,255,255,.8)", tileBorder: "transparent", divW: "90px", divH: "1px", divBg: mix(P.ink, "transparent", 40), divC: false, btnRadius: "2px", venueRadius: "2px", dockBg: mix(P.surface, "transparent", 85), dockRadius: "12px", dockInk: P.ink, aiRadius: "50%", aiBg: P.surface, aiInk: P.a1, formRadius: "2px", callShape: "50%", numFont: "'Italiana', serif", fnFont: "'Italiana', serif", fnSize: "28px", fnLs: ".04em", venueSize: "30px", rsvpSize: "32px", footSize: "28px", qrNameSize: "28px", dateShadow: "1px 1px 0 rgba(255,255,255,.8), -1px -1px 0 rgba(0,0,0,.1)" }),
    plate: (P) => pl("612px", "transparent", P.ink, "'Jost', sans-serif", "11px"),
    n1: "Mira", n2: "Sam", top: "are getting married", topFont: "'Jost', sans-serif",
    tagline: "Join us for a long weekend among the coffee hills.", dateLong: "Saturday, 10 April 2027", city: "Coorg", target: "2027-04-10T16:30:00+05:30", cdLabel: "Until the ceremony",
    fns: [
      { name: "Welcome dinner", day: "Fri, 9 Apr", time: "7:30 PM", venue: "The Long Table", art: "the long table", sw: ["#5A6340", "#C9C4B6", "#2B2B29"], swLabel: "Relaxed" },
      { name: "Ceremony", day: "Sat, 10 Apr", time: "4:30 PM", venue: "Estate Clearing", art: "estate clearing", sw: ["#F7F5EF", "#C9C4B6", "#5A6340"], swLabel: "Neutrals, flats" },
      { name: "Brunch", day: "Sun, 11 Apr", time: "11:00 AM", venue: "The Verandah", art: "the verandah", sw: ["#E9E6DF", "#8A5A44", "#5A6340"], swLabel: "Casual" },
    ],
    venueName: "Halli Estate", venueAddr: "Madikeri, Kodagu, Karnataka 571201", park: "Cars from Mangaluru and Bengaluru on Friday.", her: "Slip dress, flats", him: "Linen, no tie", heroArt: "eucalyptus",
    rsvpBy: "RSVP by 1 March", rsvpTitle: "Will you come?", yes: "Yes", no: "No", meals: ["Veg", "Non-veg", "Vegan"], persona: "Mira & Sam’s Concierge",
    wow: "press", wowLabel: "Press your name", sigName: "Good to Know", sigText: "short typographic notes for the weekend.",
    sigGrid: [
      { k: "Arrive", v: "Friday by 4 PM" }, { k: "Leave", v: "Sunday after brunch" }, { k: "Rooms", v: "Estate cottages, all booked" },
      { k: "Bring", v: "A warm layer and walking shoes" }, { k: "Phones", v: "Off during the ceremony" }, { k: "Gifts", v: "None, please. Just come." },
    ],
    features: ["Card slides out of a vellum sleeve", "Letterpress your own name", "Good-to-know notes", "Debossed monogram", "Typography-led, any faith", "RSVP, wishes, AI host"],
  },
];

export const designBySlug = (slug: string) => DESIGNS.find((d) => d.slug === slug);

// Every token for one design + palette.
export const tokensOf = (d: Design, P: Palette): Tokens => ({ ...baseTokens(P), ...d.style(P) });

// Google Fonts the studio designs use (added once, with the other invite fonts).
export const STUDIO_FONTS =
  "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Great+Vibes&family=Italiana&family=Jost:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Noto+Serif+Gurmukhi:wght@400;500&family=Noto+Serif+Tamil:wght@400;500&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Tiro+Devanagari+Hindi&family=Manrope:wght@400;500;600;700&display=swap";

export function loadStudioFonts() {
  if (typeof document === "undefined" || document.getElementById("studio-fonts")) return;
  const link = document.createElement("link");
  link.id = "studio-fonts";
  link.rel = "stylesheet";
  link.href = STUDIO_FONTS;
  document.head.appendChild(link);
}
