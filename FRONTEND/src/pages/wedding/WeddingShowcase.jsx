import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Music, MapPin, CalendarHeart, MessageCircleHeart, Share2, Check, ArrowRight } from 'lucide-react';
import MeshBackground from '../../components/ui/MeshBackground';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { TEMPLATES } from '../../wedding/data/templates';

// Public /wedding page: every wedding invitation design (newest first), free to use from the dashboard.
const DESIGNS = [...TEMPLATES].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
const PERKS = [
  { icon: CalendarHeart, t: 'Live countdown & all your functions', d: 'Haldi, Mehndi, Sangeet, Phere, Reception — each with date, time and venue.' },
  { icon: MessageCircleHeart, t: 'RSVP & guest wishes', d: 'Guests confirm in one tap; you see who is coming and how many in your dashboard.' },
  { icon: MapPin, t: 'Venue on Google Maps', d: 'One tap opens directions, plus a "Call the family" button.' },
  { icon: Music, t: 'Your photos, video & music', d: 'Your couple photo, a gallery of moments and your favourite song.' },
  { icon: Share2, t: 'One link for WhatsApp', d: 'aicardly.com/invite/your-names with a beautiful preview when shared.' },
  { icon: Heart, t: 'Free', d: 'Make and share your invitation at no cost.' },
];

const startLink = () => {
  try {
    return localStorage.getItem('token') ? '/dashboard/wedding' : '/register';
  } catch {
    return '/register';
  }
};

export default function WeddingShowcase() {
  const start = startLink();
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-50" />
      <PublicNav />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Wedding Invitations</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>
            A wedding invite your guests will remember
          </h1>
          <p className="mx-auto mt-3 max-w-2xl" style={{ color: 'var(--surface-text-2)' }}>
            Pick a design, add your names, date, functions and photos, and share one link on WhatsApp. Guests RSVP and send blessings right on the invite. Free.
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

        <section id="designs" className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {DESIGNS.map((t, i) => (
            <motion.article
              key={t.slug}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: 0.03 * (i % 5) }}
              className="group overflow-hidden rounded-3xl border transition hover:-translate-y-1"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}
            >
              <Link to={`/wedding/${t.slug}`} className="block">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img src={t.hero} alt={`${t.name} wedding invitation design`} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  {t.isNew && <span className="absolute left-3 top-3 rounded-full bg-[#E70C65] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">New · {t.opening === "shutter" ? "Shutter" : "Scratch"} reveal</span>}
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">{t.countryLabel}</p>
                    <h2 className="text-lg font-semibold leading-tight">{t.name}</h2>
                  </div>
                </div>
              </Link>
              <div className="flex gap-2 p-3">
                <Link to={`/wedding/${t.slug}`} className="flex-1 rounded-xl border py-2 text-center text-xs font-semibold" style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
                  Preview
                </Link>
                <Link to={start === '/register' ? '/register' : `/dashboard/wedding?template=${t.slug}`} className="flex-1 rounded-xl bg-[#E70C65] py-2 text-center text-xs font-semibold text-white">
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
            {[`1. Choose one of the ${DESIGNS.length} designs`, '2. Add names, date, functions & photos', '3. Share your link on WhatsApp'].map((s) => (
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
