import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  Send,
  Users,
} from "lucide-react";
import type { Template } from "../../../data/templates";
import { useInvite } from "../../../rsvp";

const palette = {
  ivory: "#fbfaf6",
  cream: "#f1eee6",
  parchment: "#e8e1d5",
  white: "#ffffff",
  ink: "#242220",
  graphite: "#615d57",
  silver: "#c8ced3",
  silverDeep: "#8b939b",
  champagne: "#c5a46e",
  rose: "#b99689",
  line: "rgba(197, 164, 110, 0.28)",
};

const eventIcons = [CalendarDays, Clock3, Users, MapPin];

function useReveal(threshold = 0.18) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible] as const;
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`lsg-reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--lsg-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

function useScrollMotion() {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setScroll(window.scrollY));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return scroll;
}

function Countdown({ target }: { target: string }) {
  const getTime = useCallback(() => {
    const distance = Math.max(0, new Date(target).getTime() - Date.now());
    return [
      ["Days", Math.floor(distance / 864e5)],
      ["Hours", Math.floor(distance / 36e5) % 24],
      ["Mins", Math.floor(distance / 6e4) % 60],
      ["Secs", Math.floor(distance / 1e3) % 60],
    ] as const;
  }, [target]);

  const [time, setTime] = useState(getTime);

  useEffect(() => {
    const timer = window.setInterval(() => setTime(getTime()), 1000);
    return () => window.clearInterval(timer);
  }, [getTime]);

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {time.map(([label, value]) => (
        <div key={label} className="lsg-count">
          <span>{String(value).padStart(2, "0")}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

function LuxuryButton({
  children,
  href,
  type = "button",
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
}) {
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const onMove = (clientX: number, clientY: number) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = (clientX - rect.left - rect.width / 2) * 0.18;
    const y = (clientY - rect.top - rect.height / 2) * 0.18;
    setStyle({ transform: `translate3d(${x}px, ${y}px, 0)` });
  };

  const common = {
    ref: ref as never,
    className: "lsg-button",
    style,
    onMouseMove: (event: MouseEvent<HTMLElement>) =>
      onMove(event.clientX, event.clientY),
    onMouseLeave: () => setStyle({ transform: "translate3d(0, 0, 0)" }),
  };

  if (href) {
    return (
      <a {...common} href={href}>
        {children}
        <ChevronRight size={16} />
      </a>
    );
  }

  return (
    <button {...common} type={type}>
      {children}
      <Send size={15} />
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-3xl text-center">
      <p className="lsg-eyebrow">{eyebrow}</p>
      <h2 className="lsg-section-title">{title}</h2>
      {copy && <p className="lsg-copy mx-auto mt-5 max-w-2xl">{copy}</p>}
    </Reveal>
  );
}

function LuxuryHero({
  template,
  scroll,
}: {
  template: Template;
  scroll: number;
}) {
  const names = `${template.couple.one} ${template.couple.amp} ${template.couple.two}`;

  return (
    <section id="home" className="lsg-hero">
      <div className="lsg-marble" />
      <div className="lsg-load" aria-hidden="true">
        <span>{template.couple.one[0]}</span>
        <span>{template.couple.two[0]}</span>
      </div>

      <nav className="lsg-nav">
        <a href="#home" className="lsg-monogram" aria-label={names}>
          {template.couple.one[0]}
          {template.couple.two[0]}
        </a>
        <div className="lsg-nav-links">
          {["Story", "Events", "Venue", "RSVP"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </div>
      </nav>

      <div className="lsg-hero-grid">
        <div className="lsg-hero-copy">
          <Reveal>
            <p className="lsg-eyebrow">The Private Edition</p>
          </Reveal>
          <Reveal delay={130}>
            <h1 className="lsg-title">
              <span>{template.couple.one}</span>
              <em>{template.couple.amp}</em>
              <span>{template.couple.two}</span>
            </h1>
          </Reveal>
          <Reveal delay={260}>
            <p className="lsg-standfirst">{template.tagline}</p>
          </Reveal>
          <Reveal delay={360}>
            <div className="lsg-hero-actions">
              <LuxuryButton href="#rsvp">Reserve Attendance</LuxuryButton>
              <span>{template.date}</span>
            </div>
          </Reveal>
        </div>

        <Reveal className="lsg-media-wrap" delay={180}>
          <div
            className="lsg-media-shell"
            style={{ "--parallax": `${scroll * -0.035}px` } as CSSProperties}
          >
            <img
              src={template.image || template.hero}
              alt={`${names} wedding editorial`}
            />
          </div>
          <div className="lsg-media-caption">
            <span>{template.venue.name}</span>
            <span>{template.venue.address}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StoryTimeline({ template }: { template: Template }) {
  const beats = [
    {
      label: "First Proof",
      title: "A conversation with staying power",
      copy: "What began as a composed evening became the rare kind of ease that makes a room feel private.",
    },
    {
      label: "The Proposal",
      title: "Quiet architecture, luminous answer",
      copy: "No spectacle, only intention: a silver dusk, a champagne toast, and a yes that needed no rehearsal.",
    },
    {
      label: "The Invitation",
      title: "A wedding edited like a keepsake",
      copy: template.story,
    },
  ];

  return (
    <section id="story" className="lsg-section">
      <SectionHeader
        eyebrow="Our Story"
        title="A narrative in restraint, light, and immaculate timing"
        copy="Designed as an editorial timeline with polished pacing, layered reveals, and just enough motion to feel cinematic."
      />

      <div className="lsg-timeline">
        {beats.map((beat, index) => (
          <Reveal
            key={beat.label}
            delay={index * 120}
            className="lsg-timeline-row"
          >
            <div className="lsg-timeline-index">
              {String(index + 1).padStart(2, "0")}
            </div>
            <article className="lsg-panel lsg-draw">
              <p>{beat.label}</p>
              <h3>{beat.title}</h3>
              <span>{beat.copy}</span>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function EventsGrid({ template }: { template: Template }) {
  return (
    <section id="events" className="lsg-section lsg-section-cream">
      <SectionHeader
        eyebrow="Events & Venues"
        title="A composed itinerary for a black-tie celebration"
        copy="Each event module uses frosted glass, fine metallic borders, and disciplined spacing for fast scanning on mobile or desktop."
      />

      <div className="lsg-event-grid">
        {template.ceremonies.map((event, index) => {
          const Icon = eventIcons[index % eventIcons.length];

          return (
            <Reveal key={event.name} delay={index * 95}>
              <article className="lsg-panel lsg-event lsg-draw">
                <div className="lsg-event-icon">
                  <Icon size={20} />
                </div>
                <p>{event.date}</p>
                <h3>{event.name}</h3>
                <dl>
                  <div>
                    <dt>Time</dt>
                    <dd>{event.time}</dd>
                  </div>
                  <div>
                    <dt>Venue</dt>
                    <dd>{event.venue}</dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function VenueFeature({
  template,
  scroll,
}: {
  template: Template;
  scroll: number;
}) {
  const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    `${template.venue.name} ${template.venue.address}`,
  )}`;

  return (
    <section id="venue" className="lsg-section lsg-venue">
      <Reveal className="lsg-venue-image">
        <div style={{ "--parallax": `${scroll * -0.025}px` } as CSSProperties}>
          <img
            src={template.monuments[0] || template.hero}
            alt={template.monumentNames[0] || template.venue.name}
          />
        </div>
      </Reveal>

      <Reveal delay={180}>
        <article className="lsg-panel lsg-venue-card lsg-draw">
          <p className="lsg-eyebrow">The Venue</p>
          <h2>{template.venue.name}</h2>
          <span>{template.venue.address}</span>
          <p>
            {template.monumentNames[0] ||
              "A private atelier setting composed for luminous vows and an evening reception."}
          </p>
          <LuxuryButton href={mapUrl}>Open Map</LuxuryButton>
        </article>
      </Reveal>
    </section>
  );
}

function RsvpExperience({ template }: { template: Template }) {
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", guests: "2" });
  const invite = useInvite();
  const [error, setError] = useState("");
  const nextDisabled =
    step === 0 ? form.name.trim().length < 2 : form.email.trim().length < 5;

  if (sent) {
    return (
      <section id="rsvp" className="lsg-section lsg-section-cream">
        <Reveal>
          <article className="lsg-panel lsg-rsvp lsg-draw text-center">
            <div className="lsg-check">
              <Check size={24} />
            </div>
            <p className="lsg-eyebrow">RSVP Received</p>
            <h2>Thank you, {form.name || "dear guest"}.</h2>
            <span>
              Your attendance has been noted for {template.date}. We can't
              wait to celebrate with you.
            </span>
          </article>
        </Reveal>
      </section>
    );
  }

  return (
    <section id="rsvp" className="lsg-section lsg-section-cream">
      <SectionHeader
        eyebrow="Kindly RSVP"
        title="We would love to see you"
        copy="Three quick steps to let us know you are coming."
      />

      <Reveal className="mx-auto max-w-2xl">
        <form
          className="lsg-panel lsg-rsvp lsg-draw"
          onSubmit={(event) => {
            event.preventDefault();
            if (nextDisabled && step < 2) return;
            if (step < 2) {
              setStep(step + 1);
              return;
            }
            setError("");
            invite
              .send({ name: form.name, email: form.email, guests: parseInt(form.guests, 10) || 1, attending: "yes" })
              .then(() => setSent(true))
              .catch((err: Error) => setError(err.message));
          }}
        >
          <div
            className="lsg-progress"
            style={
              { "--progress": `${((step + 1) / 3) * 100}%` } as CSSProperties
            }
          />

          {step === 0 && (
            <label className="lsg-field">
              <span>Guest name</span>
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Full name"
              />
            </label>
          )}

          {step === 1 && (
            <label className="lsg-field">
              <span>Email address</span>
              <input
                autoFocus
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
                placeholder="name@example.com"
              />
            </label>
          )}

          {step === 2 && (
            <label className="lsg-field">
              <span>Party size</span>
              <select
                value={form.guests}
                onChange={(event) =>
                  setForm({ ...form, guests: event.target.value })
                }
              >
                {[1, 2, 3, 4, 5, 6].map((guestCount) => (
                  <option key={guestCount} value={guestCount}>
                    {guestCount} {guestCount === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="lsg-rsvp-footer">
            <span>Step {step + 1} of 3</span>
            <LuxuryButton type="submit">
              {step < 2 ? "Continue" : "Send RSVP"}
            </LuxuryButton>
          </div>
          {error && (
            <span role="alert" className="block pt-3 text-sm text-red-700">{error}</span>
          )}
          {nextDisabled && step < 2 && (
            <span className="sr-only">
              Complete the current field to continue.
            </span>
          )}
        </form>
      </Reveal>
    </section>
  );
}

export function LuxurySilverGold({ template }: { template: Template }) {
  const scroll = useScrollMotion();
  const year = useMemo(
    () => new Date(template.eventDate).getFullYear(),
    [template.eventDate],
  );

  return (
    <div className="lsg-root">
      <style>{`
        .lsg-root {
          --serif: "Playfair Display", "Cormorant Garamond", Georgia, serif;
          --sans: Inter, "Helvetica Neue", Arial, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 14% 12%, rgba(255, 255, 255, 0.96), transparent 28%),
            radial-gradient(circle at 86% 18%, rgba(200, 206, 211, 0.36), transparent 24%),
            linear-gradient(135deg, ${palette.white}, ${palette.ivory} 48%, ${palette.cream});
          color: ${palette.ink};
          font-family: var(--sans);
        }
        .lsg-root * { box-sizing: border-box; }
        .lsg-root ::selection { background: ${palette.champagne}; color: ${palette.white}; }
        .lsg-marble {
          position: fixed;
          inset: 0;
          pointer-events: none;
          opacity: 0.62;
          background-image:
            linear-gradient(115deg, transparent 0 46%, rgba(168, 156, 140, 0.12) 47%, transparent 49%),
            linear-gradient(72deg, transparent 0 56%, rgba(139, 147, 155, 0.12) 57%, transparent 59%),
            radial-gradient(circle at 45% 35%, rgba(255,255,255,0.7), transparent 28%);
          background-size: 620px 620px, 480px 480px, 100% 100%;
          mix-blend-mode: multiply;
        }
        .lsg-load {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          place-items: center;
          grid-auto-flow: column;
          gap: 0.28em;
          pointer-events: none;
          background: ${palette.ivory};
          color: ${palette.champagne};
          font-family: var(--serif);
          font-size: clamp(3rem, 10vw, 8rem);
          animation: lsg-load 1.35s cubic-bezier(.76,0,.24,1) forwards;
        }
        .lsg-nav {
          position: fixed;
          inset: 18px 18px auto;
          z-index: 70;
          display: flex;
          align-items: center;
          gap: 24px;
          max-width: 1180px;
          margin: 0 auto;
          padding: 10px 14px;
          border: 1px solid rgba(255,255,255,0.52);
          background: rgba(255,255,255,0.52);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 60px rgba(36,34,32,0.08);
        }
        .lsg-monogram {
          display: grid;
          width: 42px;
          height: 42px;
          place-items: center;
          border: 1px solid ${palette.line};
          border-radius: 999px;
          background: linear-gradient(135deg, ${palette.white}, ${palette.silver}, ${palette.champagne});
          color: ${palette.ink};
          font-family: var(--serif);
          text-decoration: none;
        }
        .lsg-nav-links {
          margin-left: auto;
          display: flex;
          gap: clamp(14px, 3vw, 42px);
        }
        .lsg-nav-links a,
        .lsg-eyebrow,
        .lsg-hero-actions span,
        .lsg-count small,
        .lsg-event p,
        .lsg-timeline-index,
        .lsg-field span,
        .lsg-rsvp-footer span {
          color: ${palette.graphite};
          font-family: var(--sans);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.32em;
          text-transform: uppercase;
        }
        .lsg-nav-links a {
          text-decoration: none;
          transition: color 320ms ease, opacity 320ms ease;
        }
        .lsg-nav-links a:hover { color: ${palette.champagne}; opacity: 0.82; }
        .lsg-hero {
          position: relative;
          min-height: 100vh;
          padding: 126px 5vw 72px;
        }
        .lsg-hero-grid {
          position: relative;
          z-index: 2;
          display: grid;
          min-height: calc(100vh - 198px);
          max-width: 1180px;
          margin: 0 auto;
          grid-template-columns: minmax(0, 0.92fr) minmax(320px, 1.08fr);
          align-items: center;
          gap: clamp(34px, 6vw, 92px);
        }
        .lsg-title {
          margin: 18px 0 0;
          max-width: 780px;
          font-family: var(--serif);
          font-size: clamp(4rem, 10.5vw, 9.8rem);
          font-weight: 500;
          line-height: 0.86;
          letter-spacing: 0;
        }
        .lsg-title span,
        .lsg-title em {
          display: block;
          background: linear-gradient(105deg, ${palette.ink} 0%, ${palette.silverDeep} 34%, ${palette.white} 48%, ${palette.champagne} 66%, ${palette.ink} 100%);
          background-size: 240% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: lsg-foil 8s linear infinite;
        }
        .lsg-title em {
          margin: 0.12em 0;
          font-size: 0.34em;
          font-style: italic;
          line-height: 1;
        }
        .lsg-standfirst,
        .lsg-copy {
          color: ${palette.graphite};
          font-size: clamp(1rem, 1.55vw, 1.2rem);
          font-weight: 300;
          line-height: 1.9;
        }
        .lsg-standfirst { max-width: 580px; margin-top: 28px; }
        .lsg-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 18px;
          margin-top: 34px;
        }
        .lsg-button {
          position: relative;
          isolation: isolate;
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.72);
          border-radius: 999px;
          padding: 13px 22px;
          overflow: hidden;
          background: linear-gradient(115deg, ${palette.silverDeep}, ${palette.silver} 34%, ${palette.champagne} 72%, ${palette.rose});
          box-shadow: 0 16px 45px rgba(97,93,87,0.18);
          color: ${palette.white};
          cursor: pointer;
          font-family: var(--sans);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-decoration: none;
          text-transform: uppercase;
          transition: transform 260ms ease, box-shadow 260ms ease;
        }
        .lsg-button::before {
          content: "";
          position: absolute;
          inset: -140% -40%;
          z-index: -1;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,0.64), transparent);
          transform: translateX(-70%) rotate(10deg);
          transition: transform 700ms ease;
        }
        .lsg-button:hover::before { transform: translateX(70%) rotate(10deg); }
        .lsg-button:hover { box-shadow: 0 22px 60px rgba(97,93,87,0.24); }
        .lsg-media-wrap {
          position: relative;
          min-height: 620px;
        }
        .lsg-media-shell {
          position: absolute;
          inset: 0 0 62px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.68);
          background: ${palette.parchment};
          clip-path: polygon(11% 0, 100% 8%, 91% 91%, 18% 100%, 0 64%, 4% 17%);
          box-shadow: 0 45px 110px rgba(36,34,32,0.18);
          animation: lsg-morph 11s ease-in-out infinite alternate;
        }
        .lsg-media-shell img,
        .lsg-venue-image img {
          width: 100%;
          height: calc(100% + 80px);
          transform: translateY(var(--parallax, 0px)) scale(1.04);
          object-fit: cover;
          filter: saturate(0.56) contrast(1.04) brightness(1.05);
        }
        .lsg-media-caption {
          position: absolute;
          right: 0;
          bottom: 0;
          display: grid;
          width: min(360px, 78%);
          gap: 6px;
          padding: 22px;
          border: 1px solid rgba(255,255,255,0.58);
          background: rgba(255,255,255,0.56);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 70px rgba(36,34,32,0.12);
        }
        .lsg-media-caption span:first-child {
          font-family: var(--serif);
          font-size: 1.22rem;
        }
        .lsg-media-caption span:last-child,
        .lsg-panel span,
        .lsg-panel dd {
          color: ${palette.graphite};
          font-size: 0.95rem;
          line-height: 1.7;
        }
        .lsg-section {
          position: relative;
          z-index: 2;
          padding: clamp(78px, 11vw, 148px) 5vw;
        }
        .lsg-section-cream {
          background:
            linear-gradient(135deg, rgba(255,255,255,0.7), rgba(241,238,230,0.88)),
            radial-gradient(circle at 82% 20%, rgba(200,206,211,0.24), transparent 28%);
        }
        .lsg-section-title,
        .lsg-venue-card h2,
        .lsg-rsvp h2 {
          margin: 14px auto 0;
          max-width: 980px;
          font-family: var(--serif);
          font-size: clamp(2.35rem, 5.6vw, 5.3rem);
          font-weight: 500;
          line-height: 1.03;
          letter-spacing: 0;
        }
        .lsg-panel {
          position: relative;
          border: 1px solid rgba(255,255,255,0.64);
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(18px);
          box-shadow: 0 28px 80px rgba(36,34,32,0.1);
        }
        .lsg-draw::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border: 1px solid transparent;
          background:
            linear-gradient(90deg, ${palette.champagne}, ${palette.silver}, ${palette.rose}) border-box;
          -webkit-mask:
            linear-gradient(#000 0 0) padding-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transform: scaleX(0.96);
          transform-origin: left;
          transition: opacity 900ms ease, transform 900ms ease;
        }
        .is-visible .lsg-draw::before,
        .lsg-draw.is-visible::before,
        .lsg-reveal.is-visible .lsg-draw::before {
          opacity: 0.78;
          transform: scaleX(1);
        }
        .lsg-timeline {
          position: relative;
          display: grid;
          max-width: 960px;
          gap: 26px;
          margin: 70px auto 0;
        }
        .lsg-timeline::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 58px;
          width: 1px;
          background: linear-gradient(180deg, transparent, ${palette.line}, transparent);
        }
        .lsg-timeline-row {
          display: grid;
          grid-template-columns: 116px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }
        .lsg-timeline-index {
          display: grid;
          width: 116px;
          height: 116px;
          place-items: center;
          border-radius: 999px;
          background: rgba(255,255,255,0.52);
          border: 1px solid ${palette.line};
          color: ${palette.champagne};
        }
        .lsg-timeline article {
          padding: clamp(26px, 4vw, 44px);
        }
        .lsg-timeline article p,
        .lsg-event p {
          color: ${palette.champagne};
          margin: 0;
        }
        .lsg-timeline h3,
        .lsg-event h3 {
          margin: 10px 0 12px;
          font-family: var(--serif);
          font-size: clamp(1.55rem, 3vw, 2.25rem);
          font-weight: 500;
          line-height: 1.12;
        }
        .lsg-event-grid {
          display: grid;
          max-width: 1180px;
          margin: 70px auto 0;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }
        .lsg-event {
          min-height: 320px;
          padding: 30px;
          transition: transform 500ms cubic-bezier(.22,1,.36,1), box-shadow 500ms ease;
        }
        .lsg-event:hover {
          transform: translateY(-8px);
          box-shadow: 0 34px 90px rgba(36,34,32,0.16);
        }
        .lsg-event-icon,
        .lsg-check {
          display: grid;
          width: 56px;
          height: 56px;
          place-items: center;
          margin-bottom: 28px;
          border-radius: 999px;
          background: linear-gradient(135deg, ${palette.white}, ${palette.silver}, ${palette.champagne});
          color: ${palette.ink};
        }
        .lsg-event dl {
          display: grid;
          gap: 18px;
          margin: 28px 0 0;
        }
        .lsg-event dt {
          margin-bottom: 4px;
          color: ${palette.champagne};
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }
        .lsg-venue {
          display: grid;
          max-width: 1180px;
          margin: 0 auto;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 0.82fr);
          align-items: center;
          gap: clamp(28px, 5vw, 72px);
        }
        .lsg-venue-image {
          min-height: 560px;
        }
        .lsg-venue-image > div {
          height: 100%;
          min-height: 560px;
          overflow: hidden;
          clip-path: polygon(0 7%, 83% 0, 100% 36%, 91% 100%, 14% 92%);
          animation: lsg-morph-two 12s ease-in-out infinite alternate;
        }
        .lsg-venue-card {
          padding: clamp(30px, 5vw, 54px);
        }
        .lsg-venue-card p:not(.lsg-eyebrow) {
          color: ${palette.graphite};
          line-height: 1.8;
          margin: 24px 0 30px;
        }
        .lsg-rsvp {
          padding: clamp(28px, 5vw, 54px);
          overflow: hidden;
        }
        .lsg-progress {
          height: 2px;
          margin: -10px 0 34px;
          background: linear-gradient(90deg, ${palette.champagne} var(--progress), rgba(97,93,87,0.14) var(--progress));
        }
        .lsg-field {
          display: grid;
          gap: 12px;
        }
        .lsg-field input,
        .lsg-field select {
          width: 100%;
          min-height: 64px;
          border: 1px solid ${palette.line};
          border-radius: 0;
          background: rgba(255,255,255,0.64);
          color: ${palette.ink};
          font: 400 1.02rem var(--sans);
          outline: none;
          padding: 0 18px;
          transition: border-color 260ms ease, box-shadow 260ms ease, background 260ms ease;
        }
        .lsg-field input:focus,
        .lsg-field select:focus {
          border-color: ${palette.champagne};
          background: rgba(255,255,255,0.86);
          box-shadow: 0 0 0 4px rgba(197,164,110,0.12);
        }
        .lsg-rsvp-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-top: 28px;
        }
        .lsg-check {
          margin: 0 auto 28px;
        }
        .lsg-count {
          display: grid;
          min-height: 88px;
          place-items: center;
          border: 1px solid ${palette.line};
          background: rgba(255,255,255,0.46);
          backdrop-filter: blur(14px);
        }
        .lsg-count span {
          font-family: var(--serif);
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          color: ${palette.champagne};
        }
        .lsg-footer {
          position: relative;
          z-index: 2;
          padding: 74px 5vw;
          text-align: center;
          border-top: 1px solid ${palette.line};
        }
        .lsg-footer h2 {
          margin: 0;
          font-family: var(--serif);
          font-size: clamp(2.4rem, 6vw, 5rem);
          font-weight: 500;
        }
        .lsg-footer p { color: ${palette.graphite}; }
        .lsg-reveal {
          opacity: 0;
          transform: translateY(36px);
          transition:
            opacity 900ms cubic-bezier(.22,1,.36,1) var(--lsg-delay),
            transform 900ms cubic-bezier(.22,1,.36,1) var(--lsg-delay);
        }
        .lsg-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes lsg-load {
          0% { opacity: 1; clip-path: inset(0 0 0 0); }
          68% { opacity: 1; clip-path: inset(0 0 0 0); }
          100% { opacity: 0; clip-path: inset(0 0 100% 0); visibility: hidden; }
        }
        @keyframes lsg-foil {
          0% { background-position: 0% 50%; }
          100% { background-position: 240% 50%; }
        }
        @keyframes lsg-morph {
          0% { clip-path: polygon(11% 0, 100% 8%, 91% 91%, 18% 100%, 0 64%, 4% 17%); }
          100% { clip-path: polygon(4% 9%, 93% 0, 100% 70%, 78% 100%, 11% 91%, 0 28%); }
        }
        @keyframes lsg-morph-two {
          0% { clip-path: polygon(0 7%, 83% 0, 100% 36%, 91% 100%, 14% 92%); }
          100% { clip-path: polygon(8% 0, 100% 10%, 91% 86%, 35% 100%, 0 70%); }
        }
        @media (max-width: 900px) {
          .lsg-nav { inset: 12px 12px auto; }
          .lsg-nav-links { display: none; }
          .lsg-hero { padding-top: 104px; }
          .lsg-hero-grid,
          .lsg-venue {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .lsg-media-wrap { min-height: min(620px, 112vw); }
          .lsg-event-grid { grid-template-columns: 1fr; }
          .lsg-timeline::before { left: 24px; }
          .lsg-timeline-row {
            grid-template-columns: 48px minmax(0, 1fr);
            gap: 14px;
          }
          .lsg-timeline-index {
            width: 48px;
            height: 48px;
            letter-spacing: 0.14em;
          }
        }
        @media (max-width: 560px) {
          .lsg-hero,
          .lsg-section { padding-left: 18px; padding-right: 18px; }
          .lsg-title { font-size: clamp(3.35rem, 18vw, 5rem); }
          .lsg-hero-actions,
          .lsg-rsvp-footer { align-items: stretch; flex-direction: column; }
          .lsg-button { width: 100%; }
          .lsg-media-caption { width: 92%; }
          .lsg-count { min-height: 76px; }
          .lsg-count small { letter-spacing: 0.12em; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lsg-root *, .lsg-root *::before, .lsg-root *::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 1ms !important;
          }
        }
      `}</style>

      <LuxuryHero template={template} scroll={scroll} />

      <section className="lsg-section">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Countdown target={template.eventDate} />
          </Reveal>
        </div>
      </section>

      <StoryTimeline template={template} />
      <EventsGrid template={template} />
      <VenueFeature template={template} scroll={scroll} />
      <RsvpExperience template={template} />

      <footer className="lsg-footer">
        <p className="lsg-eyebrow">{year} Private Wedding Edition</p>
        <h2>
          {template.couple.one} {template.couple.amp} {template.couple.two}
        </h2>
        <p>{template.hashtag}</p>
      </footer>
    </div>
  );
}
