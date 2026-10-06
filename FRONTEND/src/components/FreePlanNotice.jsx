import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, LayoutTemplate, ArrowRight } from 'lucide-react';

// Free-plan limits, shown where they matter:
//   ai    → the card's AI chatbot trial ("3 of 4 free chats left" / "paused: upgrade for chatbot")
//   theme → one template on the free plan
// Fetches /api/stats itself; shows nothing on a paid plan (or a lifetime account).
export default function FreePlanNotice({ show = ['ai'], className = '' }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    let live = true;
    const load = () =>
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/stats`, { headers: { 'x-auth-token': localStorage.getItem('token') } })
        .then((r) => live && setS(r.data))
        .catch(() => {});
    load();
    window.addEventListener('vcard:data-changed', load);
    return () => {
      live = false;
      window.removeEventListener('vcard:data-changed', load);
    };
  }, []);
  if (!s) return null;

  const notes = [];
  const t = s.aiTrial;
  if (show.includes('ai') && t && !t.paid) {
    const over = t.left <= 0;
    notes.push({
      key: 'ai',
      icon: Bot,
      tone: over ? 'red' : 'amber',
      title: over ? 'Your card’s AI chatbot is paused' : `Free AI chatbot: ${t.left} of ${t.limit} chats left`,
      text: over
        ? `Visitors used your ${t.limit} free AI chats, so the chatbot is hidden on your card. Upgrade to Smart AI Card to switch it back on, with unlimited chats and AI voice calls.`
        : `On the free plan your card’s AI answers ${t.limit} questions as a trial. Upgrade to Smart AI Card for unlimited chats and AI voice calls.`,
      cta: 'Upgrade for chatbot',
    });
  }
  if (show.includes('theme') && s.paid === false) {
    notes.push({
      key: 'theme',
      icon: LayoutTemplate,
      tone: 'amber',
      title: 'Free plan: 1 template (Webkik Signature)',
      text: 'You can preview every template. Any paid plan unlocks all 10 for your card.',
      cta: 'Unlock all templates',
    });
  }
  if (!notes.length) return null;

  const tones = {
    amber: { box: 'border-amber-500/30 bg-amber-500/10', icon: 'bg-amber-500 text-white', title: 'text-amber-600 dark:text-amber-300' },
    red: { box: 'border-red-500/30 bg-red-500/10', icon: 'bg-red-500 text-white', title: 'text-red-600 dark:text-red-300' },
  };
  return (
    <div className={`space-y-3 ${className}`}>
      {notes.map(({ key, icon: Icon, tone, title, text, cta }) => (
        <div key={key} className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${tones[tone].box}`} role="status">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone].icon}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold ${tones[tone].title}`}>{title}</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>{text}</p>
          </div>
          <Link to="/dashboard/plans" className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95">
            {cta} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      ))}
    </div>
  );
}
