// Digital Invites: every occasion shares one renderer and editor; these are the words that change.
// Keep the ids in sync with BACKEND/constants/occasions.js.
export type OccasionId = "wedding" | "engagement" | "anniversary" | "birthday" | "diwali" | "housewarming" | "babyshower" | "wishes";

export interface OccasionMeta {
  id: OccasionId;
  label: string; // filter chip / badge
  emoji: string;
  couple: boolean; // two names (couple) or one host / sender
  rsvp: boolean; // false = a greeting card: no RSVP, venue or programme
  manager: string; // the AI assistant's name
  event: string; // "the wedding", "the party"
  invited: string; // line on the opening cover
  eventsTitle: string;
  storyTitle: string;
  storyHint: string; // dashboard hint for the story box
  cta: string; // hero button
  rsvpTitle: string;
  sendLabel: string; // RSVP submit button
  wishPlaceholder: string;
  wishesTitle: string;
  nameOne: string; // dashboard field labels
  nameTwo: string;
  dateLabel: string;
  linkJoin: string; // makes the link: rohan-weds-priya, aarav-birthday …
  chips: string[]; // chat suggestions
  functions: { icon: string; hi: string; name: string }[]; // "add typical" preset
  share: string; // WhatsApp share line
}

const base = {
  rsvpTitle: "Kindly RSVP",
  sendLabel: "Send Blessings",
  wishPlaceholder: "A blessing for the hosts…",
  wishesTitle: "Guest Wishes",
  storyTitle: "Our Story",
  dateLabel: "Date & time *",
};

export const OCCASIONS: Record<OccasionId, OccasionMeta> = {
  wedding: {
    ...base, id: "wedding", label: "Wedding", emoji: "💍", couple: true, rsvp: true, manager: "Your Wedding Manager", event: "the wedding",
    invited: "You are invited", eventsTitle: "Wedding Events", storyHint: "A few lines about you two", cta: "RSVP with Blessings",
    wishPlaceholder: "A blessing for the couple…", nameOne: "First name", nameTwo: "Second name", dateLabel: "Wedding date & time *", linkJoin: "weds",
    chips: ["When is the wedding?", "Where is the venue?", "What are the functions?", "How do I RSVP?", "Dress code?"],
    functions: [
      { icon: "🌼", hi: "हल्दी", name: "Haldi" }, { icon: "🌿", hi: "मेहंदी", name: "Mehndi" }, { icon: "🎶", hi: "संगीत", name: "Sangeet" },
      { icon: "🔥", hi: "फेरे", name: "Wedding Ceremony" }, { icon: "🥂", hi: "स्वागत", name: "Reception" },
    ],
    share: "You're invited to our wedding! 💍",
  },
  engagement: {
    ...base, id: "engagement", label: "Engagement", emoji: "💍", couple: true, rsvp: true, manager: "Your Engagement Host", event: "the engagement",
    invited: "Join us as we get engaged", eventsTitle: "The Celebrations", storyHint: "How you met, the proposal…", cta: "RSVP with Blessings",
    wishPlaceholder: "A blessing for the couple…", nameOne: "First name", nameTwo: "Second name", dateLabel: "Engagement date & time *", linkJoin: "engagement",
    chips: ["When is the engagement?", "Where is the venue?", "What is the programme?", "How do I RSVP?", "Dress code?"],
    functions: [{ icon: "🙏", hi: "रोका", name: "Roka" }, { icon: "💍", hi: "सगाई", name: "Ring Ceremony" }, { icon: "🥂", hi: "डिनर", name: "Dinner & Dance" }],
    share: "You're invited to our engagement! 💍",
  },
  anniversary: {
    ...base, id: "anniversary", label: "Anniversary", emoji: "💞", couple: true, rsvp: true, manager: "Your Anniversary Host", event: "the anniversary celebration",
    invited: "Celebrate our love story with us", eventsTitle: "The Celebration", storyTitle: "Our Journey", storyHint: "Your years together, in a few lines", cta: "RSVP with Love",
    wishPlaceholder: "A wish for the couple…", nameOne: "First name", nameTwo: "Second name", dateLabel: "Celebration date & time *", linkJoin: "anniversary",
    chips: ["When is the celebration?", "Where is the venue?", "What is the programme?", "How do I RSVP?"],
    functions: [{ icon: "🙏", hi: "पूजा", name: "Thanksgiving Puja" }, { icon: "🥂", hi: "डिनर", name: "Anniversary Dinner" }, { icon: "💃", hi: "संगीत", name: "Music & Dance" }],
    share: "Join us for our anniversary celebration! 💞",
  },
  birthday: {
    ...base, id: "birthday", label: "Birthday", emoji: "🎂", couple: false, rsvp: true, manager: "Your Party Host", event: "the birthday party",
    invited: "You're invited to the party", eventsTitle: "Party Plan", storyTitle: "About the Birthday Star", storyHint: "A few fun lines about the birthday star", cta: "RSVP for the Party",
    sendLabel: "Count Me In", wishPlaceholder: "A birthday wish…", wishesTitle: "Birthday Wishes", nameOne: "Birthday star's name", nameTwo: "Milestone (optional)", dateLabel: "Party date & time *", linkJoin: "birthday",
    chips: ["When is the party?", "Where is the party?", "What's the plan?", "How do I RSVP?", "Theme / dress code?"],
    functions: [{ icon: "🎈", hi: "", name: "Welcome & Games" }, { icon: "🎂", hi: "", name: "Cake Cutting" }, { icon: "🍕", hi: "", name: "Dinner" }, { icon: "💃", hi: "", name: "Dance Party" }],
    share: "You're invited to a birthday party! 🎂",
  },
  diwali: {
    ...base, id: "diwali", label: "Diwali Party", emoji: "🪔", couple: false, rsvp: true, manager: "Your Diwali Host", event: "the Diwali celebration",
    invited: "Join us for Diwali", eventsTitle: "Festive Evening", storyTitle: "A Note from Us", storyHint: "A warm note to your guests", cta: "RSVP for Diwali",
    wishPlaceholder: "Diwali wishes for the family…", wishesTitle: "Festive Wishes", nameOne: "Host / family name", nameTwo: "", linkJoin: "diwali",
    chips: ["When is the party?", "Where is it?", "What's planned?", "How do I RSVP?", "Dress code?"],
    functions: [{ icon: "🙏", hi: "लक्ष्मी पूजा", name: "Lakshmi Puja" }, { icon: "🪔", hi: "दीप", name: "Diya Lighting" }, { icon: "🃏", hi: "", name: "Taash & Games" }, { icon: "🍽️", hi: "भोज", name: "Festive Dinner" }],
    share: "You're invited to our Diwali celebration! 🪔",
  },
  housewarming: {
    ...base, id: "housewarming", label: "Griha Pravesh", emoji: "🏡", couple: false, rsvp: true, manager: "Your Griha Pravesh Host", event: "the Griha Pravesh",
    invited: "Bless our new home", eventsTitle: "Programme", storyTitle: "Our New Home", storyHint: "A line about your new home", cta: "RSVP with Blessings",
    wishPlaceholder: "A blessing for the new home…", nameOne: "Host / family name", nameTwo: "", dateLabel: "Griha Pravesh date & time *", linkJoin: "griha-pravesh",
    chips: ["When is the Griha Pravesh?", "What's the address?", "What is the programme?", "How do I RSVP?"],
    functions: [{ icon: "🙏", hi: "गणेश पूजा", name: "Ganesh Puja" }, { icon: "🔥", hi: "हवन", name: "Havan" }, { icon: "🍽️", hi: "भोज", name: "Lunch" }],
    share: "Please bless our new home — Griha Pravesh invite 🏡",
  },
  babyshower: {
    ...base, id: "babyshower", label: "Baby Shower", emoji: "🍼", couple: true, rsvp: true, manager: "Your Baby Shower Host", event: "the baby shower",
    invited: "A little one is on the way", eventsTitle: "The Celebration", storyTitle: "Our Little Story", storyHint: "A sweet note about your little one", cta: "RSVP with Blessings",
    wishPlaceholder: "A blessing for the mom-to-be and baby…", nameOne: "Mom-to-be", nameTwo: "Dad-to-be", dateLabel: "Baby shower date & time *", linkJoin: "baby-shower",
    chips: ["When is the baby shower?", "Where is it?", "What is the programme?", "How do I RSVP?"],
    functions: [{ icon: "🙏", hi: "गोद भराई", name: "Godh Bharai" }, { icon: "🎀", hi: "", name: "Fun Games" }, { icon: "🍽️", hi: "भोज", name: "Lunch" }],
    share: "You're invited to our baby shower! 🍼",
  },
  wishes: {
    ...base, id: "wishes", label: "Festival Wishes", emoji: "✨", couple: false, rsvp: false, manager: "Your Greeting Helper", event: "this greeting",
    invited: "A special wish for you", eventsTitle: "", storyTitle: "Our Wishes", storyHint: "Your festive message", cta: "Send Wishes Back",
    wishPlaceholder: "", wishesTitle: "Wishes", nameOne: "From (your name / family)", nameTwo: "", dateLabel: "Festival date (optional)", linkJoin: "wishes",
    chips: ["Who sent this?", "What's the message?"],
    functions: [],
    share: "A special festive wish for you ✨",
  },
};

export const OCCASION_ORDER: OccasionId[] = ["wedding", "engagement", "birthday", "diwali", "wishes", "anniversary", "housewarming", "babyshower"];

export const occasionOf = (t?: { occasion?: OccasionId } | null): OccasionMeta => OCCASIONS[t?.occasion || "wedding"] || OCCASIONS.wedding;

// The names as shown: "Rohan & Priya" for couples, just "Aarav" (or "The Sharma Family") otherwise;
// a birthday's second field is its milestone ("turns 30"), shown separately.
export const namesLine = (t: { occasion?: OccasionId; couple: { one: string; two: string; amp: string } }) =>
  occasionOf(t).couple ? [t.couple.one, t.couple.two].filter((s) => s && s.trim()).join(` ${t.couple.amp || "&"} `) : t.couple.one;
export const initialsOf = (t: { occasion?: OccasionId; couple: { one: string; two: string } }) =>
  occasionOf(t).couple ? `${t.couple.one[0] || ""}${t.couple.two[0] || ""}` : t.couple.one.replace(/^the\s+/i, "").match(/\p{L}/u)?.[0] || "✦";
