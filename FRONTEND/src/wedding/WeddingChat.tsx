import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MessageCircleHeart, Send, X, Mic, Volume2, Square, CalendarHeart, MapPin, Phone, HeartHandshake } from "lucide-react";
import type { Template } from "./data/templates";
import type { InviteExtras } from "./rsvp";
import { occasionOf, namesLine } from "./data/occasions";
// Shared with Aicardly's other chats (Cardy, card AI): speech in/out.
import { useSpeechInput, speak, stopSpeaking, canSpeak } from "../components/platformChat/speech";

/* =========================================================
   WeddingChat — the AI assistant on every Digital Invite ("Your Wedding Manager", "Your Party
   Host" …, by occasion). Guests ask about the date, programme, venue, directions and RSVP; it
   answers only from the hosts' own details
   (POST /api/wedding/chat). Replies can come with buttons: RSVP, Map, Call, Functions.
   ========================================================= */

const API = import.meta.env.VITE_API_URL as string;
type Msg = { role: "user" | "assistant"; content: string; actions?: string[] };

// The details the assistant may use, from what is on screen (design previews, dashboard editor).
const draftOf = (t: Template, x: InviteExtras) => ({
  template: t.slug,
  coupleOne: t.couple.one,
  coupleTwo: t.couple.two,
  amp: t.couple.amp,
  tagline: t.tagline,
  date: t.date,
  eventDate: t.eventDate || "",
  venueName: t.venue.name,
  venueAddress: t.venue.address,
  mapUrl: x.mapUrl || "",
  story: (t.story || "").slice(0, 2000),
  hashtag: t.hashtag || "",
  ceremonies: (t.ceremonies || []).slice(0, 12).map((c) => ({ icon: c.icon || "", hi: c.hi || "", name: c.name, date: c.date || "", time: c.time || "", venue: c.venue || "" })),
  hostPhone: x.hostPhone || "",
  rsvpOpen: x.rsvpOpen !== false,
});

// When the assistant can't be reached: simple answers straight from the invite.
function localAnswer(q: string, t: Template, x: InviteExtras): Msg {
  const s = q.toLowerCase();
  const venue = [t.venue.name, t.venue.address].filter(Boolean).join(", ");
  if (/(kab|when|date|day|din|तारीख|कब)/.test(s) && t.date) return { role: "assistant", content: `${occasionOf(t).event.replace(/^the /, "The ")} is on ${t.date}${venue ? ` at ${venue}` : ""}. 💍`, actions: ["rsvp"] };
  if (/(where|venue|kahan|kahaan|address|map|location|reach|कहाँ|पता)/.test(s) && venue) return { role: "assistant", content: `The venue is ${venue}.`, actions: ["map"] };
  if (/(function|event|haldi|mehndi|sangeet|reception|schedule|program|कार्यक्रम)/.test(s) && t.ceremonies.length)
    return { role: "assistant", content: t.ceremonies.map((c) => `${c.icon || "•"} ${c.name}${c.date ? ` — ${c.date}` : ""}${c.time ? `, ${c.time}` : ""}${c.venue ? ` at ${c.venue}` : ""}`).join("\n"), actions: ["events"] };
  if (/(rsvp|confirm|coming|aa raha|aaunga|attend)/.test(s) && x.rsvpOpen !== false) return { role: "assistant", content: "You can reply with the RSVP form on this invite.", actions: ["rsvp"] };
  return { role: "assistant", content: `I can't reach the assistant right now.${x.hostPhone ? " You can call the hosts for anything else." : " Please try again in a moment."}`, actions: x.hostPhone ? ["call"] : [] };
}

// **bold** and line breaks from the assistant.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => (/^\*\*[^*]+\*\*$/.test(p) ? <b key={j}>{p.slice(2, -2)}</b> : <span key={j}>{p}</span>))}
        </span>
      ))}
    </>
  );
}

const scrollToFirst = (ids: string[]) => {
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return true;
    }
  }
  return false;
};

export function WeddingChat({ template, extras }: { template: Template; extras: InviteExtras }) {
  const key = `wedding-chat-${extras.link || "preview-" + template.slug}`;
  const hello = template.scriptFont === "devanagari" ? "Namaste! 🙏" : template.scriptFont === "arabic" ? "Assalamu alaikum! 🌙" : "Hello! 💐";
  const o = occasionOf(template);
  const names = namesLine(template);
  const CHIPS = o.chips;
  const greeting = o.rsvp
    ? `${hello} I'm ${o.manager} for ${names}. Ask me about the date, programme, venue or RSVP — in English or Hindi.`
    : `${hello} I'm ${o.manager}. ${names} sent you this wish — ask me anything about it.`;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(key) || "null");
      if (Array.isArray(saved) && saved.length) return saved.slice(-30);
    } catch {
      /* nothing saved */
    }
    return [{ role: "assistant", content: greeting }];
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [consented, setConsented] = useState(() => {
    try {
      return !!localStorage.getItem("wedding-chat-consent");
    } catch {
      return false;
    }
  });
  const [pending, setPending] = useState("");
  const [speaking, setSpeaking] = useState(-1);
  const end = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (msgs.some((m) => m.role === "user")) sessionStorage.setItem(key, JSON.stringify(msgs.slice(-30)));
    } catch {
      /* storage blocked */
    }
  }, [msgs, key]);
  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy, open, pending]);
  useEffect(() => () => stopSpeaking(), []);

  const ask = useCallback(
    async (text: string, history: Msg[]) => {
      const next: Msg[] = [...history, { role: "user", content: text }];
      setMsgs(next);
      setInput("");
      setBusy(true);
      try {
        const res = await fetch(`${API}/api/wedding/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map(({ role, content }) => ({ role, content })),
            consent: true,
            ...(extras.link && !extras.preview ? { link: extras.link } : { draft: draftOf(template, extras) }),
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok) setMsgs([...next, { role: "assistant", content: body.reply, actions: body.actions || [] }]);
        else if (res.status === 429) setMsgs([...next, { role: "assistant", content: body.msg || "Too many messages. Please wait a few minutes." }]);
        else setMsgs([...next, localAnswer(text, template, extras)]);
      } catch {
        setMsgs([...next, localAnswer(text, template, extras)]);
      } finally {
        setBusy(false);
      }
    },
    [extras, template],
  );

  const send = (raw: string) => {
    const text = raw.trim().slice(0, 600);
    if (!text || busy) return;
    if (!consented) {
      setPending(text);
      setInput("");
      return;
    }
    ask(text, msgs);
  };
  const accept = () => {
    try {
      localStorage.setItem("wedding-chat-consent", String(Date.now()));
    } catch {
      /* storage blocked */
    }
    setConsented(true);
    const t = pending;
    setPending("");
    if (t) ask(t, msgs);
  };

  const onVoice = useCallback(
    (text: string, final: boolean) => {
      setInput(text);
      if (final && text.trim()) setTimeout(() => send(text), 250);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [consented, msgs, busy],
  );
  const voice = useSpeechInput(onVoice);
  const [lang, setLang] = useState("en-IN");

  const mapHref = extras.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${template.venue.name} ${template.venue.address}`)}`;
  const action = (a: string): ReactNode => {
    const btn = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold";
    const style = { border: "1px solid var(--wt-gold)", color: "var(--wt-gold-lite)" };
    if (a === "rsvp")
      return (
        <button key={a} type="button" className={btn} style={style} onClick={() => { setOpen(false); scrollToFirst(["rsvp"]); }}>
          <HeartHandshake className="h-3.5 w-3.5" /> RSVP
        </button>
      );
    if (a === "map")
      return (
        <a key={a} href={mapHref} target="_blank" rel="noreferrer" className={btn} style={style}>
          <MapPin className="h-3.5 w-3.5" /> Open map
        </a>
      );
    if (a === "call" && extras.hostPhone)
      return (
        <a key={a} href={`tel:${extras.hostPhone.replace(/[^\d+]/g, "")}`} className={btn} style={style}>
          <Phone className="h-3.5 w-3.5" /> Call the family
        </a>
      );
    if (a === "events")
      return (
        <button key={a} type="button" className={btn} style={style} onClick={() => { setOpen(false); scrollToFirst(["events", "gala", "invite"]); }}>
          <CalendarHeart className="h-3.5 w-3.5" /> See functions
        </button>
      );
    return null;
  };

  return (
    <div data-palette={template.palette} className="wedding-chat" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Chat with ${o.manager}`}
          className="wt-fab-pop fixed bottom-[76px] right-4 z-[8000] flex items-center gap-2 rounded-full py-3 pl-3 pr-4 text-sm font-semibold text-white shadow-2xl"
          style={{ background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))", boxShadow: "0 14px 40px rgba(0,0,0,.45)" }}
        >
          <MessageCircleHeart className="h-5 w-5" /> {o.manager}
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-label={o.manager}
          className="wt-panel-in fixed inset-x-2 bottom-2 z-[9500] flex max-h-[min(640px,calc(100dvh-16px))] flex-col overflow-hidden rounded-3xl sm:inset-x-auto sm:right-4 sm:w-[380px]"
          style={{ background: "linear-gradient(170deg, var(--wt-bg-2), var(--wt-bg-1))", border: "1px solid color-mix(in oklab, var(--wt-gold) 45%, transparent)", color: "var(--wt-ink)", boxShadow: "0 30px 80px rgba(0,0,0,.55)" }}
        >
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid color-mix(in oklab, var(--wt-gold) 25%, transparent)" }}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))", color: "var(--wt-bg-1)" }}>
              {o.couple ? `${template.couple.one[0] || ""}${template.couple.two[0] || ""}` : o.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{o.manager}</p>
              <p className="text-[11px]" style={{ color: "var(--wt-ink-soft)" }}>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" /> {names} · online
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-1.5 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm text-white" style={{ background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))" }}>
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[90%]">
                  <div className="wt-msg-in rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid color-mix(in oklab, var(--wt-gold) 20%, transparent)" }}>
                    <Rich text={m.content} />
                  </div>
                  {(m.actions?.length || 0) > 0 && <div className="mt-2 flex flex-wrap gap-2">{m.actions!.map(action)}</div>}
                  {i > 0 && canSpeak() && (
                    <button
                      type="button"
                      onClick={() => {
                        if (speaking === i) {
                          stopSpeaking();
                          setSpeaking(-1);
                          return;
                        }
                        setSpeaking(i);
                        speak(m.content.replace(/\*\*/g, ""), () => setSpeaking(-1));
                      }}
                      className="mt-1 inline-flex items-center gap-1 text-[11px] opacity-60 hover:opacity-100"
                    >
                      {speaking === i ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />} {speaking === i ? "Stop" : "Listen"}
                    </button>
                  )}
                </div>
              ),
            )}
            {pending && (
              <>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2 text-sm text-white" style={{ background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))" }}>
                  {pending}
                </div>
                <div className="rounded-2xl p-3.5 text-xs leading-relaxed" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid var(--wt-gold)" }}>
                  <b className="block text-sm">Before we chat</b>
                  Your questions go to an AI service so it can answer for the hosts. Please don't share ID or bank numbers here. See our{" "}
                  <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline">Privacy Policy</a>.
                  <button type="button" onClick={accept} className="mt-2 block rounded-full px-3 py-1.5 text-xs font-semibold" style={{ border: "1px solid var(--wt-gold)", color: "var(--wt-gold-lite)" }}>
                    I agree, continue
                  </button>
                </div>
              </>
            )}
            {busy && (
              <div className="inline-flex gap-1 rounded-2xl px-3.5 py-3" style={{ background: "rgba(255,255,255,0.07)" }} aria-label="Typing">
                <span className="wt-dot" />
                <span className="wt-dot" style={{ animationDelay: ".15s" }} />
                <span className="wt-dot" style={{ animationDelay: ".3s" }} />
              </div>
            )}
            <div ref={end} />
          </div>

          {msgs.length < 3 && !pending && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {CHIPS.map((c) => (
                <button key={c} type="button" onClick={() => send(c)} className="rounded-full px-3 py-1.5 text-xs" style={{ border: "1px solid color-mix(in oklab, var(--wt-gold) 55%, transparent)", color: "var(--wt-ink)" }}>
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 px-3 pb-3 pt-2"
          >
            <div className="flex min-w-0 flex-1 items-center rounded-full pl-1 pr-3" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid color-mix(in oklab, var(--wt-gold) 35%, transparent)" }}>
              {voice.supported && (
                <>
                  <button type="button" onClick={() => (voice.listening ? voice.stop() : voice.start(lang))} aria-label={voice.listening ? "Stop listening" : "Ask by voice"} className="grid h-9 w-9 shrink-0 place-items-center rounded-full" style={voice.listening ? { background: "var(--wt-accent)" } : undefined}>
                    {voice.listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setLang((l) => (l === "en-IN" ? "hi-IN" : "en-IN"))} className="mr-1 text-[10px] font-bold opacity-70" aria-label="Voice language">
                    {lang === "en-IN" ? "EN" : "हिं"}
                  </button>
                </>
              )}
              <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={600} placeholder={`Ask about ${o.event}…`} className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] outline-none sm:text-sm" style={{ color: "var(--wt-ink)" }} />
            </div>
            <button type="submit" disabled={!input.trim() || busy} aria-label="Send" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))" }}>
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
