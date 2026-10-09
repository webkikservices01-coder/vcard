// Display helpers. Times are shown in IST, the business's time zone.
const TZ = 'Asia/Kolkata';

export const dateTime = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const dateOnly = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric' }) : '—');

export const money = (rupees) => `₹${Number(rupees || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const num = (n) => Number(n || 0).toLocaleString('en-IN');

export function timeLeft(d) {
  if (!d) return '';
  const ms = new Date(d) - Date.now();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600000);
  if (h >= 48) return `${Math.floor(h / 24)} days left`;
  if (h >= 1) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 60000))} min left`;
}

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

// Plan names as people read them.
const PLAN_NAMES = { 'DIGITAL CARD': 'Digital Card', 'SMART AI CARD': 'Smart AI Card', 'AI AGENT PRO': 'AI Agent Pro', 'Free Trial': 'Free trial' };
export const planLabel = (name = '') => {
  const s = String(name || '');
  if (!s) return '—';
  return s.replace(/DIGITAL CARD|SMART AI CARD|AI AGENT PRO|Free Trial/g, (m) => PLAN_NAMES[m] || m);
};

// "1 user", "2 users".
export const plural = (n, word, many = `${word}s`) => `${num(n)} ${Number(n) === 1 ? word : many}`;

// Internal codes shown as words (roles, features, events).
const WORDS = {
  super_admin: 'Super admin', admin: 'Admin', support: 'Support',
  'platform-chat': 'Website chatbot (Cardy)', 'card-chat': 'Card AI chat', jarvis: 'Dashboard assistant', 'voice-fill': 'Voice fill', 'chat-fill': 'Chat fill',
  'theme-designer': 'AI theme designer', 'wedding-chat': 'Invite AI host', 'ai-call': 'AI call', import: 'Website import', 'voice-gender': 'Voice picker',
};
export const words = (code = '') => WORDS[code] || String(code || '').replace(/[._-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Audit / log action codes ("user.purge", "auth.login") as plain words.
const ACTIONS = {
  'auth.login': 'Signed in', 'auth.logout': 'Signed out', 'auth.login_failed': 'Failed sign-in', 'auth.refresh': 'Session refreshed',
  'user.block': 'Blocked a user', 'user.unblock': 'Unblocked a user', 'user.remove': 'Removed a user', 'user.restore': 'Restored a user', 'user.purge': 'Deleted a user permanently',
  'user.edit': 'Edited a user', 'user.create': 'Created a user', 'user.impersonate': 'Signed in as a user', 'user.signout': 'Signed a user out', 'user.reset_link': 'Sent a reset link', 'user.verify_link': 'Sent a verification link',
  'user.credits': 'Changed credits', 'user.test_on': 'Marked as test account', 'user.test_off': 'Unmarked test account', 'user.upgrade_link': 'Sent an upgrade link', 'user.end_trial': 'Ended a trial',
  'plan.grant': 'Granted a plan', 'plan.extend': 'Extended a plan', 'plan.change': 'Changed a plan', 'plan.revoke': 'Revoked a plan', 'plan.lifetime_on': 'Made lifetime', 'plan.lifetime_off': 'Removed lifetime',
  'plan.create': 'Created a plan', 'plan.update': 'Edited a plan', 'plan.enable': 'Enabled a plan', 'plan.disable': 'Disabled a plan',
  'card.hide': 'Hid a card', 'card.show': 'Showed a card', 'card.link': 'Changed a card link', 'card.cleanup_orphans': 'Cleaned up cards of deleted accounts', 'card.resend': 'Re-sent a card',
  'payment.refund': 'Refunded a payment', 'payment.reconcile': 'Checked a payment with Cashfree', 'payment.invoice': 'Downloaded an invoice', 'payment.link.resend': 'Re-sent a payment link', 'payment.link.regenerate': 'New payment link',
  'support.update': 'Changed a ticket', 'support.reply': 'Replied to a ticket', 'lead.update': 'Changed a lead',
  'export.users': 'Exported users', 'export.cards': 'Exported cards', 'export.payments': 'Exported payments', 'export.leads': 'Exported leads', 'export.ai_usage': 'Exported AI usage',
};
export const actionLabel = (code = '') => ACTIONS[code] || words(code);
