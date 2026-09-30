import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Bot, Send, LifeBuoy } from 'lucide-react';
import GlassCard from './ui/GlassCard';

const API_URL = import.meta.env.VITE_API_URL;
const MAX_LEN = 1000;
const SUGGESTIONS = [
  'How do I change my card template?',
  'How do I share my card by QR or NFC?',
  'How do I add documents to my card?',
  'Payment done but plan not active',
];
const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm Cardy, the Aicardly AI assistant. Ask me anything about your card, templates, AI features or plans — I reply instantly, 24/7. If I can't solve it, raise a ticket below and our team will help.",
};

// In-page AI chat for the dashboard Support page (same assistant as the site chatbot).
const SupportChat = ({ onNeedTicket }) => {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text) => {
    const q = text.trim().slice(0, MAX_LEN);
    if (!q || busy) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/platform-chat`, {
        messages: next.slice(1).slice(-12),
      });
      setMessages((m) => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, {
        role: 'assistant',
        content: err.response?.data?.msg || "Sorry, I couldn't answer right now. Please raise a ticket below and our team will get back to you.",
      }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--surface-border)' }}>
        <span className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundImage: 'var(--background-image-gradient-crimson)' }}>
          <Bot className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Chat with Cardy · AI Support</p>
          <p className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Online · instant replies 24/7
          </p>
        </div>
        {onNeedTicket && (
          <button type="button" onClick={onNeedTicket} className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold"
            style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
            <LifeBuoy className="h-3.5 w-3.5" /> Talk to a human
          </button>
        )}
      </div>

      <div ref={listRef} className="h-80 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
              style={m.role === 'user'
                ? { backgroundImage: 'var(--background-image-gradient-crimson)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--surface-text)' }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl px-3.5 py-3" style={{ background: 'var(--surface-2)' }}>
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: 'var(--surface-text-2)', animationDelay: `${d * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: 'var(--surface-border)', color: 'var(--surface-text)' }}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t px-3 py-3" style={{ borderColor: 'var(--surface-border)' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_LEN}
          placeholder="Type your question…"
          className="flex-1 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
        />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Send"
          className="grid h-10 w-10 place-items-center rounded-xl text-white disabled:opacity-50"
          style={{ backgroundImage: 'var(--background-image-gradient-crimson)' }}>
          <Send className="h-4 w-4" />
        </button>
      </form>
    </GlassCard>
  );
};

export default SupportChat;
