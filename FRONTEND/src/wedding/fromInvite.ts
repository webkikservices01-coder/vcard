import { getTemplate, type CoupleLook, type Opening, type Template } from "./data/templates";
import { occasionOf } from "./data/occasions";

const OPENINGS: Opening[] = ["classic", "shutter", "scratch"];
const LOOKS: CoupleLook[] = ["hindu", "south", "nikkah", "modern"];
import type { InviteExtras } from "./rsvp";

// A saved invite (API / dashboard form) as the template it is drawn with. The couple's own text
// replaces the template's sample text everywhere — an empty field stays empty (its section is
// hidden) rather than showing the sample couple's details.
export type InviteDoc = {
  link?: string;
  template: string;
  coupleOne?: string;
  coupleTwo?: string;
  amp?: string;
  script?: string;
  tagline?: string;
  date?: string;
  eventDate?: string | Date | null;
  venueName?: string;
  venueAddress?: string;
  mapUrl?: string;
  story?: string;
  hashtag?: string;
  ceremonies?: Template["ceremonies"];
  timeline?: { y: string; h: string; t: string }[];
  image?: string;
  photos?: string[];
  music?: string;
  video?: string;
  hostPhone?: string;
  rsvpOpen?: boolean;
  showWishes?: boolean;
  aiChat?: boolean;
  opening?: string; // "" = the design's own opening
  coupleArt?: string; // "" = the design's own, "none" = hide
  wishes?: { n: string; w: string }[];
};

// Files saved on the server itself (local development) come back as /uploads/…
const API = (import.meta.env.VITE_API_URL as string) || "";
const media = (u?: string) => (u && u.startsWith("/uploads/") ? API + u : u || undefined);

const longDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export function inviteToTemplate(doc: InviteDoc, preview = false): { template: Template; extras: InviteExtras } | null {
  const base = getTemplate(doc.template);
  if (!base) return null;
  const when = doc.eventDate ? new Date(doc.eventDate) : null;
  const valid = when && !isNaN(when.getTime());
  const o = occasionOf(base);
  const ownOne = (doc.coupleOne || "").trim();
  const one = ownOne || base.couple.one;
  // A birthday's milestone / a family's second line is optional: empty stays empty once names are typed.
  const two = (doc.coupleTwo || "").trim() || (o.couple || !ownOne ? base.couple.two : "");
  const template: Template = {
    ...base,
    couple: { one, two, amp: (doc.amp || "").trim() || (o.couple ? "&" : "") },
    script: (doc.script || "").trim() || base.script,
    // Wedding designs' own taglines describe the design, so they get a standard invite line.
    tagline: (doc.tagline || "").trim() || (base.occasion ? base.tagline : "Together with our families, we invite you to celebrate with us"),
    date: (doc.date || "").trim() || (valid ? longDate(when!) : ""),
    eventDate: valid ? when!.toISOString() : "",
    venue: { name: (doc.venueName || "").trim(), address: (doc.venueAddress || "").trim() },
    story: (doc.story || "").trim(),
    hashtag: (doc.hashtag || "").trim(),
    ceremonies: (doc.ceremonies || []).filter((c) => c && c.name),
    image: media(doc.image),
    music: media(doc.music),
    video: media(doc.video),
    // The couple's own photos stand in for the template's destination pictures.
    monuments: doc.photos?.length ? doc.photos.map((p) => media(p) as string) : base.monuments,
    monumentNames: doc.photos?.length ? doc.photos.map(() => "") : base.monumentNames,
    opening: OPENINGS.includes(doc.opening as Opening) ? (doc.opening as Opening) : base.opening,
    coupleArt: doc.coupleArt === "none" ? undefined : LOOKS.includes(doc.coupleArt as CoupleLook) ? (doc.coupleArt as CoupleLook) : base.coupleArt,
  };
  return {
    template,
    extras: {
      link: doc.link,
      preview,
      rsvpOpen: doc.rsvpOpen !== false,
      wishes: doc.showWishes === false ? [] : doc.wishes || [],
      photos: doc.photos || [],
      timeline: (doc.timeline || []).filter((t) => t && t.h),
      mapUrl: doc.mapUrl || "",
      hostPhone: doc.hostPhone || "",
      aiChat: doc.aiChat !== false,
    },
  };
}
