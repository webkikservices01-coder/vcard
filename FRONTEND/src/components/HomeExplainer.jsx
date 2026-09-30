import { Sparkles, Workflow, MapPin, TrendingUp, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Right after the homepage banner: what Aicardly is, how it works, where it's used and how it
// helps, in plain words for someone hearing about digital cards for the first time.
const BLOCKS = [
  {
    icon: Sparkles,
    tag: 'What it is',
    title: 'Your business card, as a smart web page',
    text: 'Aicardly turns your visiting card into a digital card that lives at your own link, aicardly.com/yourname. It holds your photo, contact details, services, work and social links, plus an AI assistant that talks to visitors for you.',
    points: ['Your own link and QR code', 'Optional premium metal NFC card', 'No app needed for anyone'],
  },
  {
    icon: Workflow,
    tag: 'How it works',
    title: 'Create once, share in one tap',
    text: 'Sign up free, add your details and pick a design. Then share your card by QR code, an NFC tap on the phone, WhatsApp or a simple link. Update it anytime; everyone always sees your latest details.',
    points: ['Ready in about 60 seconds', 'Tap, scan or send a link', 'Edit anytime, no reprinting'],
  },
  {
    icon: MapPin,
    tag: 'Where it is used',
    title: 'Everywhere you meet people',
    text: 'At meetings, events and trade shows, in your email signature and WhatsApp, on Instagram and LinkedIn bios, on shop counters and clinic desks, and on printed flyers with a QR code.',
    points: ['Events, meetings and expos', 'Email, WhatsApp and social bios', 'Shops, clinics and offices'],
  },
  {
    icon: TrendingUp,
    tag: 'How it helps you',
    title: 'More contacts saved, more leads',
    text: 'People save your full contact in one tap, your AI assistant answers their questions 24/7 and captures enquiries, and you can see who viewed your card. You look professional and never run out of cards.',
    points: ['One-tap Save Contact', 'AI replies and lead capture 24/7', 'Views and enquiry insights'],
  },
];

export default function HomeExplainer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <section id="what-is-aicardly" aria-labelledby="explainer-heading" className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Aicardly in 1 minute</p>
        <h2 id="explainer-heading" className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
          What is an AI digital business card?
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BLOCKS.map(({ icon: Icon, tag, title, text, points }, i) => (
          <article
            key={tag}
            className={`group relative flex flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
              isDark ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]' : 'border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-pink-100/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className={`text-3xl font-black ${isDark ? 'text-white/10' : 'text-slate-200'}`}>0{i + 1}</span>
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-[#E70C65]">{tag}</p>
            <h3 className={`mt-1 text-lg font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
            <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</p>
            <ul className="mt-4 space-y-1.5">
              {points.map((p) => (
                <li key={p} className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" aria-hidden="true" /> {p}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
