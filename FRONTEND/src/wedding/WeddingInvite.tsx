import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Template } from "./data/templates";
import { RsvpProvider, useInvite, type InviteExtras } from "./rsvp";
import { loadWeddingFonts } from "./fonts";
import { WeddingChat } from "./WeddingChat";
import { AnimatedInviteCard } from "./components/wedding/AnimatedInviteCard";
import { ShivParwatiInvite } from "./components/wedding/templates/ShivParwatiInvite";
import { LuxurySilverGold } from "./components/wedding/templates/LuxurySilverGold";
import { VogueSilverGold } from "./components/wedding/templates/VogueSilverGold";
import { Countdown, EntryLoader, Fireworks, MusicToggle, Petals, Reveal, ScrollProgress, TiltFrame } from "./components/wedding/widgets";
import { ShutterIntro } from "./components/wedding/reveal/ShutterIntro";
import { ScratchIntro } from "./components/wedding/reveal/ScratchIntro";
import { ScratchCard } from "./components/wedding/reveal/ScratchCard";
import { CoupleArt } from "./components/wedding/reveal/CoupleArt";
import { OccasionArt } from "./components/wedding/reveal/OccasionArt";
import { occasionOf, namesLine, initialsOf, type OccasionMeta } from "./data/occasions";
import "./wedding-theme.css";

/* =========================================================
   WeddingInvite — Aicardly's Digital Invite renderer (weddings, engagements, birthdays, Diwali,
   housewarmings, baby showers and festival wishes; ported from the Dream Wedding templates).
   Every template reads its colours from data-palette; the occasion (data/occasions.ts) sets
   the words, and festival wishes become a greeting card (no RSVP, venue or programme).
   The three "designer" wedding templates have their own components.
   ========================================================= */

const SAMPLE_TIMELINE = [
  { y: "2022", h: "First Meeting", t: "A chance encounter that changed everything." },
  { y: "2024", h: "The Proposal", t: "Under a sky full of stars, one knee, one yes." },
  { y: "2026", h: "Forever Begins", t: "Together with our families, we invite you." },
];
const SAMPLE_WISHES = [
  { n: "Priya S.", w: "Blessings for a lifetime of laughter and love." },
  { n: "The Sharmas", w: "So happy to celebrate with you both — see you there!" },
  { n: "R. Menon", w: "Two beautiful souls, one incredible journey. Congrats!" },
];
const SAMPLE_WISHES_ANY = [
  { n: "Priya S.", w: "So happy for you — can't wait to celebrate together!" },
  { n: "The Sharmas", w: "Wishing you joy, health and lots of love. See you there!" },
  { n: "R. Menon", w: "Count us in! Sending our warmest wishes." },
];
// The line on the "Save the Date" scratch card.
const SAVE_LINE: Record<string, string> = { wedding: "We are getting married", engagement: "We're getting engaged", anniversary: "Our anniversary", birthday: "The party is on", babyshower: "Baby shower" };

export function WeddingInvite({ template, extras }: { template: Template; extras: InviteExtras }) {
  useEffect(loadWeddingFonts, []);
  return (
    <RsvpProvider extras={extras}>
      <div data-vertical="wedding">
        <InviteBody template={template} />
        <MadeWithAicardly occasion={occasionOf(template)} />
        {extras.aiChat !== false && <WeddingChat template={template} extras={extras} />}
      </div>
    </RsvpProvider>
  );
}

function InviteBody({ template }: { template: Template }) {
  const ctx = useInvite();
  // The "Open Invitation" cover on a shared link (it also starts the music on tap);
  // skipped in previews so the design is visible at once.
  const [entered, setEntered] = useState(!!ctx.preview && !(ctx.playOpening && template.opening && template.opening !== "classic"));

  const song = template.music ? (
    <div className="fixed right-3 top-3 z-[70]" data-palette={template.palette}>
      <MusicToggle musicUrl={template.music} />
    </div>
  ) : null;
  if (template.slug === "india-shiv-parwati-divine") return (<><ScrollProgress />{song}<ShivParwatiInvite template={template} /></>);
  if (template.slug === "luxury-silver-gold") return (<><ScrollProgress />{song}<LuxurySilverGold template={template} /></>);
  if (template.slug === "vogue-silver-gold") return (<><ScrollProgress />{song}<VogueSilverGold template={template} /></>);

  const scriptFontStack =
    template.scriptFont === "devanagari"
      ? "'Yatra One', 'Tiro Devanagari Hindi', serif"
      : template.scriptFont === "arabic"
        ? "'Amiri', 'Cormorant Garamond', serif"
        : "'Cormorant Garamond', serif";
  const o = occasionOf(template);
  const isWedding = o.id === "wedding";
  const names = namesLine(template);
  const sample = ctx.preview && !ctx.link;
  const timeline = ctx.timeline?.length ? ctx.timeline : sample && isWedding ? SAMPLE_TIMELINE : [];
  const wishes = !o.rsvp ? [] : ctx.wishes?.length ? ctx.wishes : sample ? (isWedding ? SAMPLE_WISHES : SAMPLE_WISHES_ANY) : [];
  // Greeting cards: guests send a wish back on WhatsApp (to the sender's number when given).
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  const wishBack = ctx.hostPhone
    ? `https://wa.me/${ctx.hostPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`${template.script} to you too! 🙏`)}`
    : `https://wa.me/?text=${encodeURIComponent(`${template.script}! ✨ ${pageUrl}`)}`;
  const ownPhotos = !!ctx.photos?.length;
  // Section kicker: Hindi on Devanagari designs, a short English line on the others.
  const hiOr = (hindi: string, other: string) => (template.scriptFont === "devanagari" ? hindi : other);
  const mapHref = ctx.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${template.venue.name} ${template.venue.address}`)}`;

  return (
    <div
      data-palette={template.palette}
      className="relative min-h-screen overflow-x-hidden"
      style={{
        fontFamily: "var(--wt-body)",
        color: "var(--wt-ink)",
        background: `
          radial-gradient(1100px 620px at 50% -8%, color-mix(in oklab, var(--wt-gold) 18%, transparent), transparent 60%),
          radial-gradient(700px 500px at 88% 22%, color-mix(in oklab, var(--wt-accent) 16%, transparent), transparent 60%),
          linear-gradient(165deg, var(--wt-bg-1) 0%, var(--wt-bg-2) 34%, var(--wt-bg-3) 70%, var(--wt-bg-4) 100%)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      <ScrollProgress />
      {!entered &&
        (template.opening === "shutter" ? (
          <ShutterIntro template={template} onEnter={() => setEntered(true)} />
        ) : template.opening === "scratch" ? (
          <ScratchIntro template={template} look={template.coupleArt} onEnter={() => setEntered(true)} />
        ) : (
          <EntryLoader template={template} onEnter={() => setEntered(true)} />
        ))}
      {/* Previews skip the opening; this replays it. */}
      {entered && ctx.preview && template.opening && template.opening !== "classic" && (
        <button type="button" onClick={() => setEntered(false)} className="fixed left-3 top-[72px] z-[65] rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg" style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))" }}>
          ▶ Play {template.opening} opening
        </button>
      )}
      <Petals color="var(--wt-accent)" count={24} />
      {(template.slug === "uae-burj-skyline" || template.art === "fireworks") && <Fireworks />}

      {/* Sticky nav */}
      <nav className="fixed inset-x-0 top-0 z-[60] backdrop-blur-lg" style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid color-mix(in oklab, var(--wt-gold) 30%, transparent)" }}>
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold" style={{ background: "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))", color: "var(--wt-bg-1)", fontFamily: "var(--wt-display)" }}>
              {initialsOf(template)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold tracking-widest" style={{ fontFamily: "var(--wt-display)" }}>
                {o.rsvp ? names : template.script}
              </div>
              {template.date && (
                <div className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-gold-lite)" }}>
                  {template.date}
                </div>
              )}
            </div>
          </div>
          <div className="ml-auto hidden gap-6 md:flex" style={{ fontFamily: "var(--wt-label)" }}>
            {(o.rsvp ? [["Home", "home"], ["Story", "story"], ["Events", "events"], ["Venue", "venue"], ["RSVP", "rsvp"]] : []).map(([l, id]) => (
              <a key={id} href={`#${id}`} className="site-nav-link text-[13px] uppercase tracking-[0.2em] opacity-80 transition hover:opacity-100" style={{ color: "var(--wt-ink)" }}>
                {l}
              </a>
            ))}
          </div>
          {template.music && (
            <div className="ml-auto md:ml-0">
              <MusicToggle musicUrl={template.music} />
            </div>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section id="home" className="relative grid min-h-screen place-items-center overflow-hidden text-center" style={{ perspective: "1400px" }}>
        <div className="absolute inset-0 z-0">
          <div className="wt-kb absolute inset-0" style={{ backgroundImage: `url(${template.image || template.hero})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0.15) 40%, var(--wt-bg-1) 95%)" }} />
        </div>

        <div className="relative z-10 px-6 pt-32 pb-24">
          <Reveal immediate delay={60}>
            <p className="wt-shimmer-gold text-lg tracking-[0.2em]" style={{ fontFamily: o.rsvp ? scriptFontStack : "var(--wt-label)" }}>
              {o.rsvp ? template.script : o.invited}
            </p>
          </Reveal>

          {template.art && (
            <Reveal immediate delay={160} className="mx-auto mt-2 w-[min(330px,80vw)]">
              <OccasionArt kind={template.art} label={template.couple.two} size={330} className="h-auto w-full" />
            </Reveal>
          )}

          {template.coupleArt && !template.art && template.slug !== "india-royal-reel" && (
            <Reveal immediate delay={160} className="mx-auto mt-2 w-[min(340px,82vw)]">
              <CoupleArt look={template.coupleArt} size={340} className="h-auto w-full" />
            </Reveal>
          )}

          {!template.coupleArt && !template.art && template.slug !== "india-royal-reel" && (
            <Reveal immediate delay={180} className="mx-auto mt-6 w-[min(300px,72vw)]">
              <div className="relative aspect-[3/4] overflow-hidden transition-transform duration-500 hover:scale-[1.03]" style={{ borderRadius: "180px 180px 22px 22px", border: "6px solid var(--wt-gold-lite)", boxShadow: "0 0 0 9px color-mix(in oklab, var(--wt-accent) 30%, transparent), 0 34px 90px rgba(0,0,0,.6)" }}>
                <TiltFrame src={template.image || template.hero} className="h-full w-full" />
              </div>
            </Reveal>
          )}

          {template.slug === "india-royal-reel" && (
            <Reveal immediate delay={180}>
              <AnimatedInviteCard coupleOne={template.couple.one} coupleTwo={template.couple.two} dateLabel={template.date.toUpperCase()} venueLabel={[template.venue.name, template.venue.address].filter(Boolean).join(", ")} videoUrl={template.video} />
            </Reveal>
          )}

          {!o.couple && (
            <Reveal immediate delay={280}>
              <h1 className="mt-6 wt-text-gradient font-bold" style={{ fontFamily: "var(--wt-heading)", fontSize: o.rsvp ? "clamp(44px, 10.5vw, 96px)" : "clamp(46px, 12vw, 112px)", lineHeight: 1.08, letterSpacing: "0.01em", filter: "drop-shadow(0 6px 22px rgba(0,0,0,.55))", overflowWrap: "anywhere" }}>
                {o.rsvp ? template.couple.one : template.script}
              </h1>
              {o.rsvp && template.couple.two && (
                <span className="mt-3 inline-block rounded-full px-5 py-1.5 text-sm font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "var(--wt-label)", border: "1px solid var(--wt-gold)", color: "var(--wt-gold-lite)", background: "color-mix(in oklab, var(--wt-bg-1) 55%, transparent)" }}>
                  {template.couple.two}
                </span>
              )}
              {!o.rsvp && template.couple.one && (
                <p className="mt-3 text-2xl" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-gold-lite)" }}>
                  — from {template.couple.one}
                </p>
              )}
            </Reveal>
          )}

          {o.couple && template.slug !== "india-royal-reel" && (
            <Reveal immediate delay={280}>
              <h1 className="mt-8 wt-text-gradient font-bold" style={{ fontFamily: "var(--wt-heading)", fontSize: "clamp(48px, 11vw, 108px)", lineHeight: 1.02, letterSpacing: "0.02em", filter: "drop-shadow(0 6px 22px rgba(0,0,0,.55))" }}>
                {template.couple.one}
                <span className="my-1 block text-2xl md:text-3xl" style={{ fontFamily: "var(--wt-display)", color: "var(--wt-accent)", letterSpacing: "0.15em", filter: "drop-shadow(0 2px 10px color-mix(in oklab, var(--wt-accent) 40%, transparent))" }}>
                  {template.couple.amp}
                </span>
                {template.couple.two}
              </h1>
            </Reveal>
          )}

          <Reveal immediate delay={420}>
            <p className="mt-5 text-xs uppercase tracking-[0.4em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-ink-soft)" }}>
              {template.tagline}
            </p>
          </Reveal>

          {(template.coupleArt || template.art) && template.image && (
            <Reveal immediate delay={480}>
              <div className="mx-auto mt-6 h-32 w-32 overflow-hidden rounded-full" style={{ border: "4px solid var(--wt-gold-lite)", boxShadow: "0 0 0 6px color-mix(in oklab, var(--wt-accent) 35%, transparent), 0 18px 40px rgba(0,0,0,.5)" }}>
                <img src={template.image} alt={names} className="h-full w-full object-cover" />
              </div>
            </Reveal>
          )}

          {template.date && template.slug !== "india-royal-reel" && (
            <Reveal immediate delay={520}>
              <span className="mt-6 inline-block rounded-full px-7 py-3 text-sm font-bold tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5 hover:scale-105" style={{ fontFamily: "var(--wt-display)", background: "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))", color: "var(--wt-bg-1)", boxShadow: "0 12px 30px rgba(0,0,0,.45)" }}>
                {template.date}
              </span>
            </Reveal>
          )}

          {template.eventDate && (
            <Reveal immediate delay={620}>
              <Countdown eventDate={template.eventDate} />
            </Reveal>
          )}

          {template.video && template.slug !== "india-royal-reel" && (
            <div className="mx-auto mt-8 max-w-md">
              <div className="overflow-hidden rounded-[2rem] border-2" style={{ borderColor: "var(--wt-accent)", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
                <video controls playsInline src={template.video} className="h-full w-full bg-black" style={{ minHeight: "220px" }} />
              </div>
            </div>
          )}

          {(o.rsvp ? ctx.rsvpOpen !== false : true) && (
            <Reveal immediate delay={720} className="mt-8">
              <a href={o.rsvp ? "#rsvp" : wishBack} target={o.rsvp ? undefined : "_blank"} rel={o.rsvp ? undefined : "noopener noreferrer"} className="inline-block rounded-full px-8 py-3.5 text-sm uppercase tracking-[0.2em] text-white transition-transform hover:-translate-y-1 hover:scale-105" style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))", boxShadow: "0 14px 34px rgba(0,0,0,.4)" }}>
                {o.rsvp ? o.cta : ctx.hostPhone ? o.cta : "Share this wish"}
              </a>
            </Reveal>
          )}
        </div>

        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-2xl" style={{ color: "var(--wt-gold-lite)", animation: "wt-down 1.6s ease-in-out infinite" }}>
          ▾
        </div>
      </section>

      {/* SAVE THE DATE: scratch card (designs that open with the shutter) */}
      {template.opening === "shutter" && template.date && (
        <SectionShell id="save-the-date" hi={hiOr("शुभ मुहूर्त", "Mark your calendar")} title="Save the Date">
          <Reveal className="mx-auto w-[min(360px,88vw)]">
            <ScratchCard className="rounded-3xl" label="Scratch to reveal">
              <div className="grid aspect-[16/10] place-items-center rounded-3xl px-4 text-center" style={{ background: "linear-gradient(160deg, var(--wt-bg-2), var(--wt-bg-1))", border: "2px solid var(--wt-gold-lite)" }}>
                <div>
                  <div className="text-[11px] uppercase tracking-[0.35em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-gold-lite)" }}>
                    {SAVE_LINE[o.id] || "Save the date"}
                  </div>
                  <div className="mt-2 font-bold leading-tight" style={{ fontFamily: "var(--wt-display)", fontSize: "clamp(28px, 8vw, 40px)", color: "#fff" }}>
                    {template.date}
                  </div>
                  {template.venue.name && (
                    <div className="mt-2 text-sm italic" style={{ color: "var(--wt-ink-soft)" }}>
                      {template.venue.name}
                    </div>
                  )}
                </div>
              </div>
            </ScratchCard>
          </Reveal>
        </SectionShell>
      )}

      {/* STORY */}
      {(template.story || timeline.length > 0) && (
        <SectionShell id="story" hi={o.rsvp ? hiOr(o.couple ? "हमारी कहानी" : "कुछ शब्द", o.couple ? "Our journey" : "A few words") : hiOr("शुभकामनाएं", "With love")} title={o.storyTitle}>
          {template.story && (
            <Reveal className="mx-auto max-w-3xl text-center text-lg leading-relaxed">
              <p style={{ color: "var(--wt-ink-soft)", whiteSpace: "pre-line", ...(o.rsvp ? {} : { fontSize: "1.35em", fontStyle: "italic" }) }}>{template.story}</p>
              {!o.rsvp && template.couple.one && (
                <p className="mt-5 text-2xl" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-gold-lite)" }}>
                  — {template.couple.one}
                </p>
              )}
            </Reveal>
          )}
          {timeline.length > 0 && (
            <div className={`mx-auto mt-12 grid max-w-4xl gap-6 ${timeline.length >= 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {timeline.map((s, i) => (
                <Reveal key={i} delay={i * 110}>
                  <div className="rounded-3xl p-6 text-center backdrop-blur transition-all duration-500 hover:-translate-y-1.5" style={{ background: "color-mix(in oklab, var(--wt-bg-3) 60%, transparent)", border: "1px solid color-mix(in oklab, var(--wt-gold) 30%, transparent)" }}>
                    {s.y && (
                      <div className="text-3xl font-bold" style={{ fontFamily: "var(--wt-display)", color: "var(--wt-gold-lite)" }}>
                        {s.y}
                      </div>
                    )}
                    <div className="mt-2 text-xl" style={{ fontFamily: "var(--wt-heading)", color: "var(--wt-ink)" }}>
                      {s.h}
                    </div>
                    {s.t && (
                      <p className="mt-3 text-sm" style={{ color: "var(--wt-ink-soft)" }}>
                        {s.t}
                      </p>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </SectionShell>
      )}

      {/* CEREMONIES / EVENTS */}
      {o.rsvp && template.ceremonies.length > 0 && (
        <SectionShell id="events" hi={hiOr("कार्यक्रम", "Celebrations")} title={o.eventsTitle}>
          <div className="grid gap-6 md:grid-cols-2">
            {template.ceremonies.map((c, i) => (
              <Reveal key={`${c.name}-${i}`} delay={i * 90}>
                <div className="group relative min-h-[240px] overflow-hidden rounded-3xl border p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-500 hover:-translate-y-2" style={{ borderColor: "color-mix(in oklab, var(--wt-gold) 30%, transparent)", background: "linear-gradient(160deg, color-mix(in oklab, var(--wt-bg-2) 90%, transparent), color-mix(in oklab, var(--wt-bg-3) 70%, transparent))" }}>
                  <div className="absolute right-4 top-4 text-3xl opacity-80">{c.icon || "✦"}</div>
                  <div className="mt-14 space-y-1">
                    {c.hi && (
                      <div className="text-lg" style={{ fontFamily: scriptFontStack, color: "var(--wt-gold-lite)" }}>
                        {c.hi}
                      </div>
                    )}
                    <div className="text-2xl font-bold" style={{ fontFamily: "var(--wt-display)", color: "#fff" }}>
                      {c.name}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-ink-soft)" }}>
                      {c.date && (
                        <span>
                          <b style={{ color: "var(--wt-gold-lite)", fontWeight: 500 }}>Date</b> · {c.date}
                        </span>
                      )}
                      {c.time && (
                        <span>
                          <b style={{ color: "var(--wt-gold-lite)", fontWeight: 500 }}>Time</b> · {c.time}
                        </span>
                      )}
                    </div>
                    {c.venue && (
                      <div className="mt-1 italic" style={{ color: "var(--wt-ink-soft)" }}>
                        {c.venue}
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </SectionShell>
      )}

      {/* PHOTOS (the couple's own) / DESTINATIONS (template pictures) */}
      {template.monuments.length > 0 && (
      <SectionShell id="moments" hi={ownPhotos ? hiOr("यादें", "Memories") : hiOr("स्थान", "Places")} title={ownPhotos ? "Our Moments" : "Our Destinations"}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {template.monuments.map((m, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="group relative aspect-[4/3] overflow-hidden rounded-3xl border-2 shadow-[0_24px_60px_rgba(0,0,0,0.4)] transition-transform duration-500 hover:scale-[1.03]" style={{ borderColor: "var(--wt-gold)" }}>
                <div className={ownPhotos ? "absolute inset-0" : "wt-kb absolute inset-0"} style={{ backgroundImage: `url(${m})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                {template.monumentNames[i] && (
                  <>
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,.85))" }} />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-center text-lg font-bold tracking-widest" style={{ fontFamily: "var(--wt-display)", color: "#fff" }}>
                      {template.monumentNames[i]}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </SectionShell>
      )}

      {/* VENUE */}
      {o.rsvp && (template.venue.name || template.venue.address) && (
        <SectionShell id="venue" hi={hiOr("मुख्य आयोजन स्थल", "Where it happens")} title="The Venue">
          <Reveal className="mx-auto max-w-2xl rounded-3xl border-2 p-10 text-center shadow-[0_34px_90px_rgba(0,0,0,0.5)]" style={{ background: "linear-gradient(160deg, var(--wt-bg-2), var(--wt-bg-3))", borderColor: "var(--wt-gold)" }}>
            <div className="text-4xl">📍</div>
            <h3 className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--wt-display)", color: "var(--wt-gold-lite)" }}>
              {template.venue.name}
            </h3>
            <p className="mt-2 text-lg" style={{ color: "var(--wt-ink-soft)" }}>
              {template.venue.address}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={mapHref} target="_blank" rel="noreferrer" className="inline-block rounded-full px-7 py-3 text-sm uppercase tracking-[0.25em]" style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))", color: "var(--wt-bg-1)", boxShadow: "0 14px 30px rgba(0,0,0,.4)" }}>
                Open on Map
              </a>
              {ctx.hostPhone && (
                <a href={`tel:${ctx.hostPhone.replace(/[^\d+]/g, "")}`} className="inline-block rounded-full px-7 py-3 text-sm uppercase tracking-[0.25em]" style={{ fontFamily: "var(--wt-label)", border: "1px solid var(--wt-gold)", color: "var(--wt-gold-lite)" }}>
                  {o.couple ? "Call the family" : "Call the host"}
                </a>
              )}
            </div>
          </Reveal>
        </SectionShell>
      )}

      {/* GUEST WISHES (real messages from RSVPs) */}
      {wishes.length > 0 && (
        <SectionShell id="wishes" hi={hiOr("शुभकामनाएं", "Duas & wishes")} title={o.wishesTitle}>
          <div className="grid gap-5 md:grid-cols-3">
            {wishes.map((w, i) => (
              <Reveal key={i} delay={(i % 3) * 110}>
                <div className="rounded-3xl p-6" style={{ background: "color-mix(in oklab, var(--wt-bg-3) 60%, transparent)", border: "1px solid color-mix(in oklab, var(--wt-gold) 25%, transparent)" }}>
                  <p className="text-lg italic" style={{ color: "var(--wt-ink)" }}>
                    “{w.w}”
                  </p>
                  <p className="mt-4 text-sm uppercase tracking-[0.2em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-gold-lite)" }}>
                    — {w.n}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </SectionShell>
      )}

      {/* RSVP */}
      {o.rsvp && ctx.rsvpOpen !== false && (
        <SectionShell id="rsvp" hi={hiOr("आपकी उपस्थिति", "Join us")} title={o.rsvpTitle}>
          <RsvpForm occasion={o} />
        </SectionShell>
      )}

      {/* Greeting cards: send a wish back / share it */}
      {!o.rsvp && (
        <section className="relative py-16 text-center">
          <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-3 px-5">
            <a href={wishBack} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-[#25D366] px-7 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg">
              {ctx.hostPhone ? `Reply to ${template.couple.one.split(" ")[0] || "them"}` : "Share on WhatsApp"}
            </a>
            <a href="/invites" className="inline-block rounded-full px-7 py-3 text-sm uppercase tracking-[0.2em]" style={{ fontFamily: "var(--wt-label)", border: "1px solid var(--wt-gold)", color: "var(--wt-gold-lite)" }}>
              Make your own greeting
            </a>
          </div>
        </section>
      )}

      <footer className="pb-28 pt-10 text-center">
        <div className="text-3xl font-bold" style={{ fontFamily: "var(--wt-heading)", color: "var(--wt-gold-lite)" }}>
          {o.rsvp ? names : template.script}
        </div>
        {!o.rsvp && template.couple.one && (
          <p className="mt-1 text-sm uppercase tracking-[0.3em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-ink-soft)" }}>
            from {template.couple.one}
          </p>
        )}
        {template.hashtag && (
          <p className="mt-2 text-xl" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-accent)" }}>
            {template.hashtag}
          </p>
        )}
      </footer>
    </div>
  );
}

// Guest reply: name, phone, how many, coming or not, and a wish (shown on the wishes wall).
export function RsvpForm({ dark = true, occasion }: { dark?: boolean; occasion?: OccasionMeta }) {
  const { send } = useInvite();
  const [f, setF] = useState({ name: "", phone: "", guests: "1", attending: "yes", message: "" });
  const [state, setState] = useState<{ busy?: boolean; done?: string; error?: string }>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ busy: true });
    try {
      setState({ done: await send(f) });
    } catch (err) {
      setState({ error: (err as Error).message });
    }
  };
  const field = {
    background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    border: "1px solid var(--wt-gold)",
    color: "var(--wt-ink)",
    fontFamily: "var(--wt-body)",
  };
  const label = (t: string) => (
    <span className="mb-1 block text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "var(--wt-label)", color: "var(--wt-gold-lite)" }}>
      {t}
    </span>
  );
  if (state.done)
    return (
      <div className="mx-auto max-w-xl rounded-3xl p-8 text-center" style={{ border: "1px solid var(--wt-gold)" }}>
        <div className="text-4xl">💐</div>
        <p className="mt-3 text-2xl" style={{ fontFamily: "var(--wt-display)", color: "var(--wt-gold-lite)" }}>
          Thank you, {f.name.split(" ")[0] || "dear guest"}!
        </p>
        <p className="mt-2" style={{ color: "var(--wt-ink-soft)" }}>
          {state.done}
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="mx-auto grid max-w-xl gap-4">
      <label className="block">
        {label("Your Name")}
        <input required minLength={2} maxLength={80} value={f.name} onChange={set("name")} placeholder="Full name" className="w-full rounded-xl px-4 py-3 outline-none" style={field} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          {label("Phone / WhatsApp")}
          <input type="tel" maxLength={30} value={f.phone} onChange={set("phone")} placeholder="+91 98…" className="w-full rounded-xl px-4 py-3 outline-none" style={field} />
        </label>
        <label className="block">
          {label("Guests")}
          <select value={f.guests} onChange={set("guests")} className="w-full rounded-xl px-4 py-3 outline-none" style={field}>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i} value={i + 1} style={{ color: "#111" }}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Will you attend?">
        {[["yes", "Joyfully attending"], ["maybe", "Maybe"], ["no", "Can't make it"]].map(([v, t]) => (
          <button key={v} type="button" role="radio" aria-checked={f.attending === v} onClick={() => setF((x) => ({ ...x, attending: v }))} className="rounded-xl px-2 py-3 text-[11px] uppercase tracking-[0.15em]" style={{ fontFamily: "var(--wt-label)", border: "1px solid var(--wt-gold)", background: f.attending === v ? "linear-gradient(135deg, var(--wt-gold-lite), var(--wt-gold))" : "transparent", color: f.attending === v ? "var(--wt-bg-1)" : "var(--wt-ink)" }}>
            {t}
          </button>
        ))}
      </div>
      <label className="block">
        {label("Your Wishes (optional)")}
        <textarea rows={3} maxLength={500} value={f.message} onChange={set("message")} placeholder={occasion?.wishPlaceholder || "A blessing for the couple…"} className="w-full rounded-xl px-4 py-3 outline-none" style={field} />
      </label>
      {state.error && (
        <p role="alert" className="rounded-xl px-4 py-2 text-sm" style={{ background: "rgba(220,38,38,.15)", color: "#fecaca" }}>
          {state.error}
        </p>
      )}
      <button type="submit" disabled={state.busy} className="mt-2 rounded-full py-3.5 text-sm uppercase tracking-[0.25em] text-white disabled:opacity-60" style={{ fontFamily: "var(--wt-label)", background: "linear-gradient(135deg, var(--wt-accent), var(--wt-accent-deep))", boxShadow: "0 14px 34px rgba(0,0,0,.4)" }}>
        {state.busy ? "Sending…" : occasion?.sendLabel || "Send Blessings"}
      </button>
    </form>
  );
}

function SectionShell({ id, hi, title, children }: { id: string; hi: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="mb-12 text-center">
          <p className="text-2xl" style={{ fontFamily: "var(--wt-script)", color: "var(--wt-accent)" }}>
            {hi}
          </p>
          <h2 className="mt-1 wt-text-gradient font-bold" style={{ fontFamily: "var(--wt-display)", fontSize: "clamp(30px, 5.4vw, 52px)", letterSpacing: "0.02em" }}>
            {title}
          </h2>
          <div className="mx-auto mt-4 h-px w-32" style={{ background: "linear-gradient(90deg, transparent, var(--wt-gold), transparent)" }} />
        </Reveal>
        {children}
      </div>
    </section>
  );
}

// Small credit at the very bottom: brings new hosts to Aicardly.
function MadeWithAicardly({ occasion }: { occasion: OccasionMeta }) {
  return (
    <a
      href="/invites"
      className="block py-4 text-center text-[11px] uppercase tracking-[0.3em]"
      style={{ background: "#0b0b10", color: "rgba(255,255,255,.6)", fontFamily: "Inter, sans-serif" }}
    >
      Made with <b style={{ color: "#fff" }}>Aicardly</b> · Create your free {occasion.rsvp ? `${occasion.label.toLowerCase()} invite` : "digital greeting"} →
    </a>
  );
}
