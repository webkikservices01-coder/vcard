import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Music, MapPin, CalendarHeart, MessageCircleHeart, Share2, Check, ArrowRight } from 'lucide-react';
import MeshBackground from '../../components/ui/MeshBackground';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { TEMPLATES } from '../../wedding/data/templates';
import { OCCASIONS, OCCASION_ORDER } from '../../wedding/data/occasions';
import { DesignThumb } from '../../wedding/DesignThumb';

// Public /invites page (also /wedding): every Digital Invite design — weddings, engagements,
// birthdays, Diwali, festival wishes … — newest first, filtered by occasion, free to use.
const DESIGNS = [...TEMPLATES].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
const occ = (t) => t.occasion || 'wedding';
const COUNT = Object.fromEntries(OCCASION_ORDER.map((id) => [id, DESIGNS.filter((t) => occ(t) === id).length]));
const PERKS = [
  { icon: CalendarHeart, t: 'Live countdown & your programme', d: 'Haldi to Reception, cake cutting, Lakshmi Puja — each with its date, time and place.' },
  { icon: MessageCircleHeart, t: 'RSVP, wishes & an AI host', d: 'Guests confirm in one tap and ask the AI host anything; you see who is coming in your dashboard.' },
  { icon: MapPin, t: 'Venue on Google Maps', d: 'One tap opens directions, plus a "Call the host" button.' },
  { icon: Music, t: 'Your photos, video & music', d: 'Your photo, a gallery of moments and your favourite song.' },
  { icon: Share2, t: 'One link for WhatsApp', d: 'aicardly.com/invite/your-link with a beautiful preview when shared.' },
  { icon: Heart, t: 'Free', d: 'Make and share your invite or festival greeting at no cost.' },
];

const signedIn = () => {
  try {
    return !!localStorage.getItem('token');
  } catch {
    return false;
  }
};

export default function WeddingShowcase() {
  const [params, setParams] = useSearchParams();
  const filter = OCCASIONS[params.get('occasion')] ? params.get('occasion') : 'all';
  const shown = filter === 'all' ? DESIGNS : DESIGNS.filter((t) => occ(t) === filter);
  const start = signedIn() ? '/dashboard/invites' : '/register';
  useEffect(() => {
    document.title = 'Digital Invites – Wedding, Birthday, Engagement, Diwali & Festival Wishes | Aicardly';
  }, []);
  const chip = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setParams(id === 'all' ? {} : { occasion: id }, { replace: true })}
      aria-pressed={filter === id}
      className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${filter === id ? 'border-transparent bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow' : ''}`}
      style={filter === id ? undefined : { borderColor: 'var(--surface-border)', color: 'var(--surface-text)', background: 'var(--surface-1)' }}
    >
      {label}
    </button>
  );
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-50" />
      <PublicNav />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Digital Invites</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl" style={{ color: 'var(--surface-text)' }}>
            An invite for every celebration
          </h1>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: 'var(--surface-text-2)' }}>
            Weddings, engagements, birthdays, Diwali parties, Griha Pravesh, baby showers and festival wishes. Pick a design, add your details and share one link on WhatsApp — guests RSVP, send wishes and chat with your AI host. Free.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={start} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-95">
              Create my invite <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a href="#designs" className="inline-flex items-center rounded-full border px-6 py-3 text-sm font-semibold" style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
              See the {DESIGNS.length} designs
            </a>
          </div>
        </motion.div>

        <div id="designs" className="mt-12 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0" role="toolbar" aria-label="Filter by occasion">
          {chip('all', `All · ${DESIGNS.length}`)}
          {OCCASION_ORDER.filter((id) => COUNT[id]).map((id) => chip(id, `${OCCASIONS[id].emoji} ${OCCASIONS[id].label} · ${COUNT[id]}`))}
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
          {shown.map((t, i) => (
            <motion.article
              key={t.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: 0.03 * (i % 5) }}
              className="group overflow-hidden rounded-3xl border transition hover:-translate-y-1"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}
            >
              <Link to={`/invites/${t.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <DesignThumb template={t} animate={false} className="transition duration-700 group-hover:scale-105" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />
                  {t.isNew && (
                    <span className="absolute left-2 top-2 rounded-full bg-[#E70C65] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow sm:left-3 sm:top-3 sm:text-[10px]">
                      New{t.opening === 'shutter' ? ' · Shutter' : t.opening === 'scratch' ? ' · Scratch' : ''}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4">
                    <p className="text-[9px] uppercase tracking-[0.25em] opacity-80 sm:text-[10px]">{OCCASIONS[occ(t)].emoji} {t.occasion ? t.countryLabel : `Wedding · ${t.countryLabel}`}</p>
                    <h2 className="text-base font-semibold leading-tight sm:text-lg">{t.name}</h2>
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 p-2 sm:p-3">
                <Link to={`/invites/${t.slug}`} className="flex-1 rounded-xl border py-2 text-center text-xs font-semibold" style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
                  Preview
                </Link>
                <Link to={start === '/register' ? '/register' : `/dashboard/invites?template=${t.slug}`} className="flex-1 rounded-xl bg-[#E70C65] py-2 text-center text-xs font-semibold text-white">
                  Use this
                </Link>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERKS.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-3xl border p-6" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold" style={{ color: 'var(--surface-text)' }}>{t}</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--surface-text-2)' }}>{d}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 rounded-3xl border p-8 text-center" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--surface-text)' }}>Ready in 5 minutes</h2>
          <ul className="mx-auto mt-4 grid max-w-3xl gap-2 text-left text-sm sm:grid-cols-3" style={{ color: 'var(--surface-text-2)' }}>
            {[`1. Choose one of the ${DESIGNS.length} designs`, '2. Add names, date, programme & photos', '3. Share your link on WhatsApp'].map((s) => (
              <li key={s} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" aria-hidden="true" /> {s}
              </li>
            ))}
          </ul>
          <Link to={start} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-semibold text-white">
            Create my invite <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
