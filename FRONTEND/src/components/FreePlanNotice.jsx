import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Bot, LayoutTemplate, ArrowRight, Timer, PauseCircle } from 'lucide-react';

// Free-plan limits, shown where they matter:
//   ai    → the card's AI chatbot trial ("3 of 4 free chats left" / "paused: upgrade for chatbot")
//   theme → templates the plan unlocks (1 / 3 / 10)
// Fetches /api/stats itself; shows nothing once nothing is locked (or on a lifetime account).
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
  // 24-hour trial: a countdown, then "paused" (the card's public page says so) until they upgrade.
  const tr = s.trial;
  if (show.includes('trial') && tr?.active && tr.started) {
    notes.push(
      tr.paused
        ? {
            key: 'trial',
            icon: PauseCircle,
            tone: 'red',
            title: 'Your card is paused',
            text: `Your ${tr.hours}-hour free trial is over, so people opening your card see that it's paused. Pick a plan to switch it back on instantly. ${tr.linkSentAt ? 'We\'ve also sent you a payment link by email.' : ''}`,
            cta: 'Upgrade & reactivate',
          }
        : {
            key: 'trial',
            icon: Timer,
            tone: 'amber',
            title: `Free trial: your card is live for ${tr.hoursLeft} more hour${tr.hoursLeft === 1 ? '' : 's'}`,
            text: `After ${tr.hours} hours on the free trial your card pauses until you choose a plan. We'll send you a payment link by email and SMS.`,
            cta: 'Choose a plan',
          }
    );
  }
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
  // Paid plan: AI chats this month (Digital Card 10, Smart AI Card 25; AI Agent Pro unlimited).
  const q = s.aiQuota;
  if (show.includes('ai') && q && q.limit && q.used >= Math.ceil(q.limit * 0.6)) {
    const over = q.left <= 0;
    const next = q.plan === 'DIGITAL CARD' ? 'Smart AI Card (25 chats a month + AI voice call)' : 'AI Agent Pro (unlimited chats + AI video call)';
    notes.push({
      key: 'quota',
      icon: Bot,
      tone: over ? 'red' : 'amber',
      title: over ? `Upgrade your plan: all ${q.limit} AI chats used this month` : `AI chatbot: ${q.left} of ${q.limit} chats left this month`,
      text: over
        ? `Your card’s AI chatbot is resting until the 1st. Upgrade to ${next} to switch it back on now.`
        : `Your plan includes ${q.limit} AI chats a month. Upgrade to ${next} so visitors never miss a reply.`,
      cta: 'Upgrade your plan',
    });
  }
  // Templates by plan: free trial & Digital Card 1, Smart AI Card 3, AI Agent Pro all 10.
  const allowedCount = Array.isArray(s.allowedThemes) ? s.allowedThemes.length : s.paid === false ? 1 : 10;
  if (show.includes('theme') && allowedCount < 10) {
    notes.push({
      key: 'theme',
      icon: LayoutTemplate,
      tone: 'amber',
      title: allowedCount <= 1 ? 'Your plan: 1 template (Webkik Signature)' : `Your plan: ${allowedCount} templates`,
      text:
        allowedCount <= 1
          ? 'You can preview every template. Smart AI Card unlocks 3 templates and AI Agent Pro all 10.'
          : 'You can preview every template. AI Agent Pro unlocks all 10 (plus a metal NFC card).',
      cta: 'Unlock more templates',
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
