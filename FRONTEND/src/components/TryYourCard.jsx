import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlus, ArrowRight, X } from 'lucide-react';
import DynamicCyberCard3D from './ui/DynamicCyberCard3D';
import { useTheme } from '../context/ThemeContext';

// Homepage "try it free": visitors type their details and pick a photo, and a preview card is
// built next to it. Nothing is uploaded; the photo stays in the browser. The typed details are
// kept for the sign-up form (see Register.jsx).
export const TRY_KEY = 'aicardly-try-card';

const readDraft = () => {
  try {
    return JSON.parse(sessionStorage.getItem(TRY_KEY)) || {};
  } catch {
    return {};
  }
};

export default function TryYourCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [d, setD] = useState(() => ({ name: '', role: '', company: '', phone: '', ...readDraft() }));
  const [photo, setPhoto] = useState('');
  const [logo, setLogo] = useState('');

  const set = (k) => (e) => {
    const next = { ...d, [k]: e.target.value.slice(0, 60) };
    setD(next);
    try {
      sessionStorage.setItem(TRY_KEY, JSON.stringify(next));
    } catch {
      /* storage blocked */
    }
  };
  const pick = (setter) => (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f || !f.type.startsWith('image/')) return;
    const r = new FileReader();
    r.onload = () => setter(String(r.result));
    r.readAsDataURL(f);
  };
  const slug = (d.name || 'yourname').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'yourname';
  const field = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#E70C65] ${
    isDark ? 'border-white/10 bg-white/[0.04] text-white placeholder-slate-500' : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400'
  }`;
  const label = `mb-1.5 block text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  const renderPick = ({ value, onPick, onClear, title, hint }) => (
    <div>
      <span className={label}>{title}</span>
      <div className="flex items-center gap-3">
        <label className={`grid h-14 w-14 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-2xl border-2 border-dashed transition hover:border-[#E70C65] ${isDark ? 'border-white/20' : 'border-slate-300'}`}>
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5 text-[#E70C65]" aria-hidden="true" />}
          <input type="file" accept="image/*" className="sr-only" onChange={onPick} aria-label={`Upload ${title.toLowerCase()}`} />
        </label>
        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</span>
        {value && (
          <button type="button" onClick={onClear} aria-label={`Remove ${title.toLowerCase()}`} className="ml-auto text-slate-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <section id="try-your-card" aria-labelledby="try-heading" className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">Try it free · no sign-up</p>
          <h2 id="try-heading" className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            See your own card in seconds
          </h2>
          <p className={`mt-3 text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Type your details and add a photo. Your card appears on the right as you type. Nothing is uploaded until you sign up.
          </p>
          <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className={label} htmlFor="try-name">Full name</label>
              <input id="try-name" className={field} value={d.name} onChange={set('name')} placeholder="e.g. Priya Sharma" autoComplete="name" />
            </div>
            <div>
              <label className={label} htmlFor="try-role">Designation</label>
              <input id="try-role" className={field} value={d.role} onChange={set('role')} placeholder="e.g. Founder" autoComplete="organization-title" />
            </div>
            <div>
              <label className={label} htmlFor="try-company">Brand / company</label>
              <input id="try-company" className={field} value={d.company} onChange={set('company')} placeholder="e.g. Clamora Studio" autoComplete="organization" />
            </div>
            <div>
              <label className={label} htmlFor="try-phone">Phone</label>
              <input id="try-phone" className={field} value={d.phone} onChange={set('phone')} placeholder="e.g. 98765 43210" inputMode="tel" autoComplete="tel" />
            </div>
            {renderPick({ value: photo, onPick: pick(setPhoto), onClear: () => setPhoto(''), title: 'Your photo', hint: 'Shows on the front' })}
            {renderPick({ value: logo, onPick: pick(setLogo), onClear: () => setLogo(''), title: 'Logo or cover', hint: 'Fills the card background' })}
          </form>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
            >
              Create my card free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your details carry over to sign-up.</span>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <DynamicCyberCard3D
            name={d.name || 'Your Name'}
            designation={[d.role, d.company].filter(Boolean).join(' · ') || 'Your role · Your brand'}
            company={d.company}
            slug={slug}
            photoUrl={photo}
            bgImageUrl={logo}
            themeColor="#E70C65"
            linkBgColor="#E70C65"
            cardBgColor="#1b1e27"
            surfaceBgColor="#12141a"
            backBgColor="#12141a"
          />
          <p className={`mt-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live preview · hover to pause, it turns to show the back</p>
        </div>
      </div>
    </section>
  );
}
