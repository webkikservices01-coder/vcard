import { createContext, useContext, type ReactNode } from "react";

// What every template's RSVP form calls. On a live invite it posts the reply to the couple
// (POST /api/wedding/public/<link>/rsvp); in the showcase / dashboard preview it only pretends.
export type RsvpReply = {
  name: string;
  phone?: string;
  email?: string;
  guests?: number | string;
  attending?: "yes" | "no" | "maybe" | string;
  message?: string;
};

export type InviteExtras = {
  link?: string; // set on a live invite
  preview?: boolean; // showcase / dashboard preview: nothing is sent
  rsvpOpen?: boolean;
  wishes?: { n: string; w: string }[];
  photos?: string[];
  timeline?: { y: string; h: string; t: string }[];
  mapUrl?: string;
  hostPhone?: string;
  aiChat?: boolean; // the AI assistant guests can chat with (on unless the couple switched it off)
  playOpening?: boolean; // design showcase: show the opening (shutter / scratch / cover) even in preview
};

type Ctx = InviteExtras & { send: (r: RsvpReply) => Promise<string> };

const API = import.meta.env.VITE_API_URL as string;

const RsvpCtx = createContext<Ctx>({
  preview: true,
  send: async () => "Thank you!",
});

export function RsvpProvider({ extras, children }: { extras: InviteExtras; children: ReactNode }) {
  const send = async (r: RsvpReply) => {
    if (extras.preview || !extras.link) return "This is a preview — replies are sent from your shared link.";
    const res = await fetch(`${API}/api/wedding/public/${encodeURIComponent(extras.link)}/rsvp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(r.name || "").trim(),
        phone: r.phone || "",
        email: r.email || "",
        guests: Number(r.guests) || 1,
        attending: ["yes", "no", "maybe"].includes(String(r.attending)) ? r.attending : "yes",
        message: r.message || "",
      }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.msg || "Could not send your reply. Please try again.");
    return body.msg || "Thank you!";
  };
  return <RsvpCtx.Provider value={{ ...extras, send }}>{children}</RsvpCtx.Provider>;
}

export const useInvite = () => useContext(RsvpCtx);
