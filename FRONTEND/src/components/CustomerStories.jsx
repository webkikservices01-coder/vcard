import { ArrowUpRight, Star } from 'lucide-react';
import { useSiteTestimonials } from '../utils/siteSettings';
import { useTheme } from '../context/ThemeContext';

// Real customers on the home page: their stories (added with consent in the admin panel →
// Testimonials) and a few live Aicardly cards anyone can open. Nothing here is made up: with no
// published stories, only the live cards show.
const LIVE_CARDS = [
  { path: '/citi-glass', name: 'Citi Glass', what: 'Glass & aluminium business' },
  { path: '/shubham-khurana', name: 'Shubham Khurana', what: 'Founder, Webkik Services' },
  { path: '/umandeep-singh', name: 'Umandeep Singh', what: 'Professional card' },
];

export default function CustomerStories() {
  const stories = useSiteTestimonials();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const cards = [...stories.filter((s) => s.cardLink).map((s) => ({ path: s.cardLink, name: s.company || s.name, what: s.role })), ...LIVE_CARDS]
    .filter((c, i, all) => all.findIndex((x) => x.path === c.path) === i)
    .slice(0, 4);
  const box = isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-white shadow-sm';
  const ink = isDark ? 'text-white' : 'text-slate-900';
  const soft = isDark ? 'text-slate-400' : 'text-slate-500';
  return (
    <section className="cv-auto relative mx-auto max-w-7xl px-6 pb-20 lg:px-10" aria-labelledby="real-cards">
      <div className="text-center">
        {/* Small pink text needs a slightly deeper pink on the light page to be readable (contrast 4.5:1). */}
        <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-[#ff6b9d]' : 'text-[#D60A5E]'}`}>Real cards</p>
        <h2 id="real-cards" className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${ink}`}>See Aicardly cards people use today.</h2>
        <p className={`mx-auto mt-3 max-w-xl text-sm ${soft}`}>Open a live card: save the contact, tap WhatsApp, or ask its AI assistant a question.</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <a key={c.path} href={c.path} target="_blank" rel="noopener" className={`group flex items-center justify-between gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-[#E70C65]/50 ${box}`}>
            <span className="min-w-0">
              <span className={`block truncate text-sm font-bold ${ink}`}>{c.name}</span>
              <span className={`block truncate text-xs ${soft}`}>aicardly.com{c.path}{c.what ? ` · ${c.what}` : ''}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-[#E70C65] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
        ))}
      </div>
      {stories.length > 0 && (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {stories.slice(0, 6).map((s) => (
            <figure key={s.id} className={`flex flex-col rounded-3xl border p-6 ${box}`}>
              <span className="flex text-amber-400" aria-label={`${s.rating} out of 5`}>{Array.from({ length: s.rating || 5 }, (_, i) => <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />)}</span>
              <blockquote className={`mt-3 flex-1 text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>“{s.quote}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                {s.photo ? <img src={s.photo} alt="" className="h-10 w-10 rounded-full object-cover" loading="lazy" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-xs font-bold text-white">{s.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>}
                <span className="min-w-0">
                  <span className={`block text-sm font-bold ${ink}`}>{s.name}</span>
                  <span className={`block text-xs ${soft}`}>{[s.role, s.company].filter(Boolean).join(', ')}{s.cardLink && <> · <a href={s.cardLink} className="text-[#E70C65] hover:underline">their card</a></>}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
