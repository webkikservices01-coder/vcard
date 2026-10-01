import HOME_SCHEMA from '../../data/homeSchema.json';

// Follow-up buttons under Cardy's latest answer, picked from what the answer talked about.
const TOPICS = [
  [/price|cost|₹|plan|pricing|paid|free/i, ['How do I create my card?', 'What does the AI chat widget do?', 'Can I get a demo or talk to your team?']],
  [/nfc|metal|tap|physical/i, ['Tell me about the Metal NFC card', 'How do I create my card?', 'Can I get a demo or talk to your team?']],
  [/whatsapp|delivery|deliver|payment link/i, ['How do I create my card?', 'How much does it cost?', 'Can I get a demo or talk to your team?']],
  [/\bai\b|chat|assistant|voice|agent/i, ['How do I create my card?', 'How much does it cost?', 'Can I get a demo or talk to your team?']],
  [/create|sign ?up|register|start|template|design/i, ['What does the AI chat widget do?', 'How much does it cost?', 'Can I get a demo or talk to your team?']],
  [/demo|call|team|contact|email|phone/i, ['What services does Aicardly offer?', 'How do I create my card?', 'How much does it cost?']],
];
const DEFAULT = ['How do I create my card?', 'What does the AI chat widget do?', 'Can I get a demo or talk to your team?'];

export function followUps(reply, askedAlready = []) {
  const hit = TOPICS.find(([re]) => re.test(reply || ''));
  const asked = new Set(askedAlready.map((q) => q.toLowerCase()));
  return (hit ? hit[1] : DEFAULT).filter((q) => !asked.has(q.toLowerCase())).slice(0, 3);
}

// When the AI can't be reached: the closest question from the homepage FAQ (the same answers
// the site publishes), or a pointer to the team. Never makes anything up.
const words = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
const STOP = new Set(['card', 'cards', 'business', 'digital', 'aicardly', 'get', 'need', 'want', 'the', 'and', 'for', 'you', 'your', 'can', 'what', 'how', 'does', 'with', 'are', 'from', 'this', 'that', 'have', 'kya', 'hai', 'kaise', 'mera', 'mujhe']);

export function offlineAnswer(question) {
  const q = new Set(words(question));
  let best = null;
  let bestScore = 0;
  for (const f of HOME_SCHEMA.faqs || []) {
    const score = words(f.q).filter((w) => q.has(w)).length * 2 + words(f.a).filter((w) => q.has(w)).length * 0.5;
    if (score > bestScore) {
      best = f;
      bestScore = score;
    }
  }
  if (best && bestScore >= 2) {
    return `I can't reach my AI brain right now, but here's the answer from our FAQ:\n\n**${best.q}**\n${best.a}\n\nFor anything else, tap **Chat on WhatsApp** above and our team will help.`;
  }
  return "I can't reach my AI brain right now. Please tap **Chat on WhatsApp** above, or try again in a minute. Our team usually replies quickly.";
}
