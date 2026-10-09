import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Bot, X, MessageCircle, ArrowUpRight, Calendar, Layers, ListChecks, Sparkles, IndianRupee, Rocket, ChevronRight, History, Mic, Square, Volume2, VolumeX, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Pencil, ChevronDown } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import IconButton from '../ui/IconButton';
import Button from '../ui/Button';
import GlassCard from '../ui/GlassCard';
import { CardyMessage } from './markdown';
import FlowStep from './FlowStep';
import LeadForm from './LeadForm';
import {
  ALLOWED_PATHS, GREETING_DELAY_MS, GREETING_SESSION_KEY, WELCOME_TEXT,
  WHATSAPP_HREF, BOOKING_HREF, PRICING_HREF, FAQ_CHIPS, FLOW_TRIGGER_CHIP, FLOW_STEPS,
  recommendFromAnswers, getKeyHighlights, PLAN_CHIP,
} from './config';
import { PRICING_ENABLED } from '../../utils/plan';
import HistoryPanel from './HistoryPanel';
import { loadChats, saveChats, getActiveId, setActiveId, newChatId, upsertChat } from './history';
import { useSpeechInput, speak, stopSpeaking, canSpeak, VOICE_LANGS } from './speech';
import { followUps, offlineAnswer } from './replies';

const API_URL = import.meta.env.VITE_API_URL;
const PULSE_SEEN_KEY = 'webcard_platform_chat_pulsed';
// Same order as FAQ_CHIPS (the guided "pick a plan" chip is rendered separately as the primary action).
const CHIP_ICONS = [Layers, ListChecks, Sparkles, Bot, IndianRupee, Calendar];
const MAX_MESSAGE_LENGTH = 1000;

let idCounter = 0;
const genId = () => `pc_${Date.now()}_${idCounter++}`;

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  type: 'text',
  content: WELCOME_TEXT,
};

const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
};

// Pages built around a form: on phones the launcher would sit on top of the fields / submit button.
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/contact-us', '/metal-nfc-card'];

// A new answer appears word by word (like typing) instead of all at once.
function RevealText({ text, onDone }) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= words.length) { onDone?.(); return; }
    const t = setTimeout(() => setN((x) => Math.min(words.length, x + 3)), 28);
    return () => clearTimeout(t);
  }, [n, words.length, onDone]);
  return <CardyMessage text={words.slice(0, n).join('')} />;
}

// Copy / read aloud / helpful? / regenerate, under one of Cardy's answers.
function AnswerActions({ msg, isLast, feedback, onFeedback, onRegenerate, speakingId, onSpeak, busy }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };
  const btn = 'grid h-7 w-7 place-items-center rounded-lg transition-colors hover:bg-black/5 disabled:opacity-40';
  const tone = { color: 'var(--surface-text-2)' };
  return (
    <div className="mt-1 flex items-center gap-0.5 pl-1" aria-label="Answer actions">
      <button type="button" onClick={copy} className={btn} style={tone} title={copied ? 'Copied' : 'Copy answer'} aria-label="Copy answer">
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      {canSpeak() && (
        <button type="button" onClick={() => onSpeak(msg)} className={btn} style={tone} title={speakingId === msg.id ? 'Stop reading' : 'Read aloud'} aria-label={speakingId === msg.id ? 'Stop reading' : 'Read answer aloud'}>
          {speakingId === msg.id ? <VolumeX className="h-3.5 w-3.5 text-crimson-500" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>
      )}
      <button type="button" onClick={() => onFeedback(msg, 'up')} disabled={!!feedback} className={btn} style={tone} title="Helpful" aria-label="Helpful answer" aria-pressed={feedback === 'up'}>
        <ThumbsUp className={`h-3.5 w-3.5 ${feedback === 'up' ? 'fill-current text-emerald-500' : ''}`} />
      </button>
      <button type="button" onClick={() => onFeedback(msg, 'down')} disabled={!!feedback} className={btn} style={tone} title="Not helpful" aria-label="Not helpful answer" aria-pressed={feedback === 'down'}>
        <ThumbsDown className={`h-3.5 w-3.5 ${feedback === 'down' ? 'fill-current text-crimson-500' : ''}`} />
      </button>
      {isLast && (
        <button type="button" onClick={onRegenerate} disabled={busy} className={btn} style={tone} title="Answer again" aria-label="Answer again">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
      {feedback && <span className="ml-1 text-[10.5px]" style={tone}>Thanks for the feedback!</span>}
    </div>
  );
}

const PlatformChatWidget = () => {
  const location = useLocation();
  const allowed = ALLOWED_PATHS.includes(location.pathname);
  const reducedMotion = usePrefersReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  // The last chat comes back after a reload or a visit to another page.
  const [messages, setMessages] = useState(() => {
    const saved = loadChats().find((c) => c.id === getActiveId());
    return saved?.messages?.length ? saved.messages : [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const busyRef = useRef(false);
  // The "Chat with AI" label shows for a few seconds, then only the round button stays, so it
  // doesn't cover prices, form fields or menus.
  const [showLabel, setShowLabel] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowLabel(false), 8000);
    return () => clearTimeout(t);
  }, []);
  const [showGreeting, setShowGreeting] = useState(false);
  const [shouldPulse] = useState(() => {
    try { return !localStorage.getItem(PULSE_SEEN_KEY); } catch { return false; }
  });

  const [flow, setFlow] = useState(null); // { stepIndex, answers }
  const [leadState, setLeadState] = useState(null); // null | 'form' | 'submitting' | 'done'
  const [leadContext, setLeadContext] = useState(null);
  const [leadError, setLeadError] = useState('');

  // Saved chats (this browser only) and the one on screen.
  const [chats, setChats] = useState(() => loadChats());
  const [chatId, setChatId] = useState(() => {
    const saved = getActiveId();
    return saved && loadChats().some((c) => c.id === saved) ? saved : newChatId();
  });
  const [showHistory, setShowHistory] = useState(false);
  const [revealId, setRevealId] = useState(null); // answer currently "typing"
  const [quick, setQuick] = useState([]); // follow-up buttons under the latest answer
  const [feedback, setFeedback] = useState({}); // message id → 'up' | 'down'
  const [speakingId, setSpeakingId] = useState(null);
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const scrollRef = useRef(null);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);
  // Opened by itself on the homepage (see below) and not touched yet by the visitor.
  const autoOpen = useRef(false);

  // Save the conversation as it grows (the history panel reads the saved list when opened).
  useEffect(() => {
    if (!messages.some((m) => m.role === 'user')) return;
    saveChats(upsertChat(loadChats(), chatId, messages));
    setActiveId(chatId);
  }, [messages, chatId]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }, [messages, isBusy, flow, leadState, reducedMotion]);

  const onScrollMessages = () => {
    const el = scrollRef.current;
    if (el) setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 160);
  };

  useEffect(() => {
    // No focus when it opened by itself: that would pop up the phone keyboard and scroll the page.
    if (isOpen && !autoOpen.current) setTimeout(() => inputRef.current?.focus(), reducedMotion ? 0 : 300);
  }, [isOpen, reducedMotion]);

  // One-time launcher pulse: shouldPulse is read once at mount; mark it seen once the launcher is actually shown.
  useEffect(() => {
    if (!allowed || !shouldPulse) return;
    try { localStorage.setItem(PULSE_SEEN_KEY, '1'); } catch { /* ignore */ }
  }, [allowed, shouldPulse]);

  // Homepage, once per session: the chat opens by itself for about 5 seconds so visitors notice
  // the AI assistant, then tucks away into the greeting bubble unless they start using it.
  useEffect(() => {
    if (!allowed || location.pathname !== '/') return;
    let shown = false;
    try { shown = sessionStorage.getItem(GREETING_SESSION_KEY) === '1'; } catch { /* ignore */ }
    if (shown) return;
    // Phones: the open chat fills the screen, so only the small greeting bubble shows.
    if (window.matchMedia('(max-width: 639px)').matches) {
      const bubble = setTimeout(() => {
        try { sessionStorage.setItem(GREETING_SESSION_KEY, '1'); } catch { /* ignore */ }
        setShowGreeting(true);
      }, GREETING_DELAY_MS);
      return () => clearTimeout(bubble);
    }
    const open = setTimeout(() => {
      try { sessionStorage.setItem(GREETING_SESSION_KEY, '1'); } catch { /* ignore */ }
      autoOpen.current = true;
      setIsOpen(true);
    }, Math.min(GREETING_DELAY_MS, 1500));
    const close = setTimeout(() => {
      if (!autoOpen.current) return; // visitor is using it: leave it open
      autoOpen.current = false;
      setIsOpen(false);
      setShowGreeting(true);
    }, Math.min(GREETING_DELAY_MS, 1500) + 5000);
    return () => { clearTimeout(open); clearTimeout(close); };
  }, [allowed, location.pathname]);

  // Any tap or key inside the panel means the visitor took over: no auto-close.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    const took = () => { autoOpen.current = false; };
    panel.addEventListener('pointerdown', took);
    panel.addEventListener('keydown', took);
    return () => { panel.removeEventListener('pointerdown', took); panel.removeEventListener('keydown', took); };
  }, [isOpen]);

  // Focus trap + Esc-to-close while the panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const getFocusables = () => panel?.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!autoOpen.current) setTimeout(() => getFocusables()?.[0]?.focus(), 0);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setIsOpen(false); launcherRef.current?.querySelector('button')?.focus(); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(getFocusables() || []);
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const appendMessage = useCallback((role, content, extra = {}) => {
    setMessages(prev => [...prev, { id: genId(), role, type: 'text', content, ...extra }]);
  }, []);

  // history: the conversation to continue from (regenerate / edit pass a trimmed one).
  const sendMessage = useCallback(async (text, history) => {
    const userText = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!userText) return;
    // Still answering the last question: keep this one in the box (never drop it silently).
    if (isBusy || busyRef.current) {
      setInput(userText);
      return;
    }
    busyRef.current = true;
    const base = history || messages;
    const updated = [...base, { id: genId(), role: 'user', type: 'text', content: userText }];
    setMessages(updated);
    setInput('');
    setQuick([]);
    setIsBusy(true);
    stopSpeaking();
    setSpeakingId(null);
    try {
      const res = await axios.post(`${API_URL}/api/ai/platform-chat`, {
        messages: updated.filter(m => m.type === 'text').slice(-12).map(({ role, content }) => ({
          role,
          content: role === 'user' ? content.slice(0, MAX_MESSAGE_LENGTH) : content,
        })),
      });
      const id = genId();
      setMessages(prev => [...prev, { id, role: 'assistant', type: 'text', content: res.data.reply }]);
      if (!reducedMotion) setRevealId(id);
      setQuick(followUps(res.data.reply, updated.filter(m => m.role === 'user').map(m => m.content)));
      if (res.data.showLeadForm && leadState !== 'done') {
        setLeadContext(null);
        setLeadError('');
        setLeadState('form');
      }
    } catch (err) {
      // Too many messages: say so. AI unreachable: answer from the published FAQ instead.
      const limited = err.response?.status === 429;
      appendMessage('assistant', limited ? (err.response?.data?.msg || 'Too many messages. Please wait a few minutes and try again.') : offlineAnswer(userText));
      setQuick(['Can I get a demo or talk to your team?']);
    } finally {
      busyRef.current = false;
      setIsBusy(false);
    }
  }, [messages, isBusy, appendMessage, leadState, reducedMotion]);

  // Ask the last question again (drops the last answer).
  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find(m => m.role === 'user' && m.type === 'text');
    if (!lastUser || isBusy) return;
    const idx = messages.findIndex(m => m.id === lastUser.id);
    sendMessage(lastUser.content, messages.slice(0, idx));
  }, [messages, isBusy, sendMessage]);

  // Edit your last question: it goes back into the box and the chat continues from before it.
  const editLast = useCallback((msg) => {
    if (isBusy) return;
    const idx = messages.findIndex(m => m.id === msg.id);
    if (idx < 0) return;
    setMessages(messages.slice(0, idx));
    setInput(msg.content);
    setQuick([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [messages, isBusy]);

  // 👍 / 👎 on an answer: shown to the team in the admin panel's App logs.
  const sendFeedback = useCallback((msg, rating) => {
    setFeedback(f => ({ ...f, [msg.id]: rating }));
    const i = messages.findIndex(m => m.id === msg.id);
    const question = [...messages.slice(0, i)].reverse().find(m => m.role === 'user')?.content || '';
    axios.post(`${API_URL}/api/ai/platform-feedback`, { rating, question: question.slice(0, 500), answer: msg.content.slice(0, 1500) }).catch(() => {});
  }, [messages]);

  const toggleSpeak = useCallback((msg) => {
    if (speakingId === msg.id) { stopSpeaking(); setSpeakingId(null); return; }
    setSpeakingId(msg.id);
    speak(msg.content, () => setSpeakingId(id => (id === msg.id ? null : id)));
  }, [speakingId]);

  // Voice typing into the message box; sends by itself when the visitor stops talking.
  const onVoiceText = useCallback((text, final) => {
    setInput(text);
    if (final && text.trim()) setTimeout(() => sendMessage(text), 250);
  }, [sendMessage]);
  const voice = useSpeechInput(onVoiceText);

  const startFlow = useCallback(() => {
    appendMessage('user', FLOW_TRIGGER_CHIP);
    appendMessage('assistant', FLOW_STEPS[0].question);
    setFlow({ stepIndex: 0, answers: {} });
  }, [appendMessage]);

  const handleFlowAnswer = useCallback((value) => {
    if (!flow) return;
    const step = FLOW_STEPS[flow.stepIndex];
    const answers = { ...flow.answers, [step.key]: value };
    appendMessage('user', value);

    const nextIndex = flow.stepIndex + 1;
    if (nextIndex < FLOW_STEPS.length) {
      appendMessage('assistant', FLOW_STEPS[nextIndex].question);
      setFlow({ stepIndex: nextIndex, answers });
      return;
    }

    const result = recommendFromAnswers(answers);
    setFlow(null);
    if (result.type === 'lead') {
      appendMessage('assistant', "Got it — for a custom or enterprise setup, let's connect you with our team directly. Share your details below and we'll reach out within one business day.");
      setLeadContext(answers);
      setLeadState('form');
    } else {
      appendMessage('assistant', `Based on that, I'd recommend **${result.plan.name}** — ${result.plan.tagline}, ₹${result.plan.price.monthly}/mo (or ₹${result.plan.price.yearly}/yr).`, { type: 'recommendation', plan: result.plan });
    }
  }, [flow, appendMessage]);

  // "Book a Free Demo" without a booking page: ask for name + phone and the team calls back.
  const openDemoForm = useCallback(() => {
    if (leadState === 'submitting') return;
    appendMessage('assistant', "Happy to show you Aicardly! Share your name and phone below and the team will call you to fix a demo time, usually within one business day.");
    setLeadContext({ need: 'Free demo' });
    setLeadError('');
    setLeadState('form');
  }, [leadState, appendMessage]);

  const handleLeadSubmit = useCallback(async (values) => {
    setLeadError('');
    setLeadState('submitting');
    try {
      const res = await axios.post(`${API_URL}/api/ai/platform-lead`, {
        ...values,
        need: leadContext?.need || '',
        timeline: leadContext?.timeline || '',
        budget: leadContext?.budget || '',
      });
      appendMessage('assistant', res.data.msg || "Thanks! Our team will reach out soon.");
      setLeadState('done');
    } catch (err) {
      setLeadError(err.response?.data?.msg || 'Something went wrong. Please try WhatsApp or email instead.');
      setLeadState('form');
    }
  }, [leadContext, appendMessage]);

  const handleChipClick = (chip) => {
    if (chip === FLOW_TRIGGER_CHIP) startFlow();
    else sendMessage(chip);
  };

  const startNewChat = () => {
    setChatId(newChatId());
    setMessages([WELCOME_MESSAGE]);
    setFlow(null);
    setLeadState(null);
    setLeadContext(null);
    setLeadError('');
    setQuick([]);
    setShowHistory(false);
    stopSpeaking();
    setSpeakingId(null);
  };

  const openChat = (id) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    setChatId(id);
    setActiveId(id);
    setMessages(chat.messages.length ? chat.messages : [WELCOME_MESSAGE]);
    setFlow(null);
    setLeadState(null);
    setQuick([]);
    setShowHistory(false);
  };

  const deleteChat = (id) => {
    const next = chats.filter(c => c.id !== id);
    setChats(next);
    saveChats(next);
    if (id === chatId) startNewChat();
  };

  const pinChat = (id) => {
    const next = chats.map(c => (c.id === id ? { ...c, pinned: !c.pinned } : c));
    setChats(next);
    saveChats(next);
  };

  const lastUserId = useMemo(() => [...messages].reverse().find(m => m.role === 'user')?.id, [messages]);
  const lastAnswerId = useMemo(() => [...messages].reverse().find(m => m.role === 'assistant' && m.type === 'text')?.id, [messages]);

  const showFaqChips = useMemo(
    () => !isBusy && !flow && !leadState && messages.length === 1,
    [isBusy, flow, leadState, messages.length]
  );

  if (!allowed) return null;

  const panelTransition = reducedMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 360 };

  return (
    // On phones the sign-in / sign-up forms fill the screen; the launcher would cover their button.
    <div className={`cardy-root fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-[150] ${AUTH_PATHS.includes(location.pathname) ? 'hidden sm:block' : ''}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Aicardly assistant chat"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.95 }}
            transition={panelTransition}
            className="fixed inset-0 z-10 sm:absolute sm:inset-auto sm:bottom-[74px] sm:right-0 flex h-dvh w-full flex-col overflow-hidden sm:h-[600px] sm:max-h-[calc(100dvh-112px)] sm:w-[380px] sm:rounded-[26px] border"
            style={{
              borderColor: 'var(--surface-border)',
              background: 'var(--surface-1)',
              boxShadow: 'var(--shadow-premium-lg)',
            }}
          >
            <div className="relative flex h-full flex-col">
              <AnimatePresence>
                {showHistory && (
                  <HistoryPanel
                    chats={chats}
                    activeId={chatId}
                    onOpen={openChat}
                    onNew={startNewChat}
                    onDelete={deleteChat}
                    onPin={pinChat}
                    onClose={() => setShowHistory(false)}
                    reducedMotion={reducedMotion}
                  />
                )}
              </AnimatePresence>
              {/* Header */}
              <div
                className="flex shrink-0 items-center justify-between px-4 py-3.5"
                style={{ backgroundImage: 'var(--background-image-gradient-crimson)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                    <Bot className="h-5 w-5 text-white" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold leading-none text-white">Cardy · Aicardly Assistant</p>
                    <p className="mt-1 text-[11px] text-white/75">{isBusy ? 'Typing…' : 'Online'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton variant="bare" size="sm" onClick={() => { setChats(loadChats()); setShowHistory(true); }} title="Your previous chats" className="text-white/80 hover:bg-white/15 hover:text-white">
                    <History className="h-4 w-4" />
                  </IconButton>
                  <IconButton variant="bare" size="sm" onClick={startNewChat} title="Start new chat" className="text-white/80 hover:bg-white/15 hover:text-white">
                    <MessageCircle className="h-4 w-4" />
                  </IconButton>
                  <IconButton variant="bare" size="sm" onClick={() => setIsOpen(false)} title="Close chat" className="text-white/80 hover:bg-white/15 hover:text-white">
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              {/* Always-visible primary CTAs */}
              <div className="grid shrink-0 grid-cols-2 gap-2 border-b px-3 py-2.5" style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-2)' }}>
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="min-w-0">
                  <Button variant="secondary" size="sm" fullWidth leftIcon={<FaWhatsapp className="h-3.5 w-3.5 shrink-0" />} className="!min-h-[42px] !px-2 !text-[11px]">
                    <span className="text-center leading-tight">Chat on WhatsApp</span>
                  </Button>
                </a>
                {BOOKING_HREF ? (
                  <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="min-w-0">
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Calendar className="h-3.5 w-3.5 shrink-0" />} className="!min-h-[42px] !px-2 !text-[11px]">
                      <span className="text-center leading-tight">Book a Free Demo</span>
                    </Button>
                  </a>
                ) : (
                  <Button variant="primary" size="sm" fullWidth onClick={openDemoForm} leftIcon={<Calendar className="h-3.5 w-3.5 shrink-0" />} className="!min-h-[42px] !px-2 !text-[11px]">
                    <span className="text-center leading-tight">Book a Free Demo</span>
                  </Button>
                )}
              </div>

              {/* Messages */}
              <div className="relative flex min-h-0 flex-1 flex-col">
              <div ref={scrollRef} onScroll={onScrollMessages} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain' }}>
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.type === 'recommendation' ? (
                      <div className="max-w-[92%] space-y-2">
                        <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--surface-text)' }}>
                          <CardyMessage text={msg.content} />
                        </div>
                        <GlassCard premium className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-crimson-700">{msg.plan.badge || 'Recommended'}</p>
                          <p className="mt-1 text-base font-bold" style={{ color: 'var(--surface-text)' }}>{msg.plan.name}</p>
                          <ul className="mt-2 space-y-1">
                            {getKeyHighlights(msg.plan).map(label => (
                              <li key={label} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                                <span className="h-1 w-1 rounded-full bg-crimson-500" /> {label}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 flex gap-2">
                            <Link to="/register" className="flex-1">
                              <Button variant="primary" size="sm" fullWidth className="!text-[11.5px]">Create free account</Button>
                            </Link>
                            <a href={PRICING_HREF} className="flex-1">
                              <Button variant="secondary" size="sm" fullWidth className="!text-[11.5px]">Full comparison</Button>
                            </a>
                          </div>
                        </GlassCard>
                      </div>
                    ) : msg.role === 'user' ? (
                      <div className="group flex max-w-[85%] items-end gap-1">
                        {msg.id === lastUserId && !isBusy && !flow && (
                          <button type="button" onClick={() => editLast(msg)} className="mb-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100" style={{ color: 'var(--surface-text-2)' }} title="Edit your question" aria-label="Edit your question">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <div className="rounded-2xl rounded-br-sm px-3.5 py-2.5 text-sm font-medium" style={{ backgroundImage: 'var(--background-image-gradient-crimson)', color: '#fff' }}>
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%]">
                        <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm" style={{ background: 'var(--surface-2)', color: 'var(--surface-text)' }}>
                          {revealId === msg.id ? <RevealText text={msg.content} onDone={() => setRevealId(null)} /> : <CardyMessage text={msg.content} />}
                        </div>
                        {msg.id !== 'welcome' && revealId !== msg.id && (
                          <AnswerActions
                            msg={msg}
                            isLast={msg.id === lastAnswerId}
                            feedback={feedback[msg.id]}
                            onFeedback={sendFeedback}
                            onRegenerate={regenerate}
                            speakingId={speakingId}
                            onSpeak={toggleSpeak}
                            busy={isBusy}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isBusy && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm px-4 py-3" style={{ background: 'var(--surface-2)' }}>
                      {[0, 0.15, 0.3].map(d => (
                        <motion.span key={d} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--surface-text-2)' }}
                          animate={reducedMotion ? {} : { y: [0, -4, 0] }} transition={{ duration: 0.55, repeat: Infinity, delay: d, ease: 'easeInOut' }} />
                      ))}
                    </div>
                  </div>
                )}

                {showFaqChips && (
                  <div className="pt-2">
                    <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider" style={{ color: 'var(--surface-text-2)' }}>
                      <Sparkles className="h-3 w-3 text-crimson-500" /> Quick questions
                    </p>
                    <div className="flex flex-col gap-2">
                      {PRICING_ENABLED && (
                      <motion.button
                        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={reducedMotion ? undefined : { scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChipClick(FLOW_TRIGGER_CHIP)}
                        className="group flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 text-left text-[13px] font-bold text-white"
                        style={{ backgroundImage: 'var(--background-image-gradient-crimson)', boxShadow: 'var(--shadow-glow-crimson-lg)' }}
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20"><Rocket className="h-3.5 w-3.5" /></span>
                        <span className="flex-1 leading-snug">Help me pick the right plan</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </motion.button>
                      )}
                      {FAQ_CHIPS.filter(c => c !== FLOW_TRIGGER_CHIP && (PRICING_ENABLED || c !== PLAN_CHIP)).map((chip, i) => {
                        const Icon = CHIP_ICONS[FAQ_CHIPS.indexOf(chip)] || Sparkles;
                        return (
                          <motion.button
                            key={chip}
                            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reducedMotion ? 0 : 0.05 * (i + 1) }}
                            whileHover={reducedMotion ? undefined : { x: 3 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleChipClick(chip)}
                            className="group flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[12.5px] font-medium transition-all hover:border-crimson-400 hover:shadow-md"
                            style={{
                              borderColor: 'color-mix(in srgb, var(--color-crimson-500) 24%, transparent)',
                              background: 'color-mix(in srgb, var(--color-crimson-500) 6%, var(--surface-1))',
                              color: 'var(--surface-text)',
                            }}
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-crimson-500/10 text-crimson-600 transition-colors group-hover:bg-crimson-500 group-hover:text-white">
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="flex-1 leading-snug">{chip}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-crimson-500 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {quick.length > 0 && !isBusy && !flow && !leadState && !revealId && !showFaqChips && (
                  <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Suggested questions">
                    {quick.map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendMessage(q)}
                        className="rounded-full border px-3 py-1.5 text-left text-[11.5px] font-medium transition-colors hover:border-crimson-400"
                        style={{ borderColor: 'color-mix(in srgb, var(--color-crimson-500) 28%, transparent)', background: 'color-mix(in srgb, var(--color-crimson-500) 6%, var(--surface-1))', color: 'var(--surface-text)' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={endRef} />
              </div>
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })}
                    className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full border shadow-md"
                    style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)', color: 'var(--surface-text)' }}
                    title="Go to the latest message"
                    aria-label="Go to the latest message"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
              </div>

              {/* Footer controls: guided flow chips, lead form, or normal input */}
              <div className="shrink-0 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                {flow ? (
                  <FlowStep step={FLOW_STEPS[flow.stepIndex]} onAnswer={handleFlowAnswer} />
                ) : leadState === 'form' || leadState === 'submitting' ? (
                  <LeadForm onSubmit={handleLeadSubmit} submitting={leadState === 'submitting'} error={leadError} onCancel={() => setLeadState(null)} />
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex items-center gap-2 px-3 py-3"
                  >
                    {voice.supported && (
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => (voice.listening ? voice.stop() : voice.start(voiceLang))}
                          disabled={isBusy}
                          className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${voice.listening ? 'animate-pulse text-white' : 'hover:bg-black/5'}`}
                          style={voice.listening ? { backgroundImage: 'var(--background-image-gradient-crimson)' } : { color: 'var(--surface-text-2)' }}
                          title={voice.listening ? 'Stop listening' : 'Ask by voice'}
                          aria-label={voice.listening ? 'Stop listening' : 'Ask by voice'}
                        >
                          {voice.listening ? <Square className="h-3.5 w-3.5 fill-current" /> : <Mic className="h-4 w-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoiceLang(l => (l === 'en-IN' ? 'hi-IN' : 'en-IN'))}
                          className="rounded-md px-1 py-0.5 text-[10px] font-bold"
                          style={{ color: 'var(--surface-text-2)' }}
                          title="Voice language: English or Hindi"
                          aria-label={`Voice language: ${voiceLang === 'en-IN' ? 'English' : 'Hindi'}. Tap to switch.`}
                        >
                          {VOICE_LANGS.find(l => l.code === voiceLang)?.label}
                        </button>
                      </div>
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                      placeholder={voice.listening ? 'Listening…' : isBusy ? 'Cardy is answering…' : 'Type or speak your question…'}
                      maxLength={MAX_MESSAGE_LENGTH}
                      aria-label="Message"
                      className="input-premium flex-1 !py-2.5 text-sm"
                    />
                    <IconButton type="submit" size="md" variant="ghost" disabled={isBusy || !input.trim()} title="Send message"
                      style={{ backgroundImage: (!isBusy && input.trim()) ? 'var(--background-image-gradient-crimson)' : undefined, color: (!isBusy && input.trim()) ? '#fff' : undefined }}>
                      <ArrowUpRight className="h-4 w-4 -rotate-45" />
                    </IconButton>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Greeting bubble */}
      <AnimatePresence>
        {!isOpen && showGreeting && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12, scale: 0.9 }}
            className="absolute bottom-[74px] right-0 flex w-[270px] items-start gap-2 rounded-2xl rounded-br-sm border p-3 text-left shadow-lg"
            style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}
          >
            <button
              onClick={() => { setShowGreeting(false); setIsOpen(true); }}
              className="flex-1 text-left text-[12.5px] leading-snug"
              style={{ color: 'var(--surface-text)' }}
            >
              {WELCOME_TEXT}
            </button>
            <IconButton variant="ghost" size="sm" onClick={() => setShowGreeting(false)} title="Dismiss">
              <X className="h-3 w-3" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher: floats, wiggles now and then and shows an "Ask AI" label, so everyone
          notices there is an AI assistant (all motion off under reduced-motion). */}
      <style>{`
        @keyframes cardyFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
        @keyframes cardyWiggle { 0%,86%,100% { transform: rotate(0) } 88% { transform: rotate(-14deg) } 90% { transform: rotate(12deg) } 92% { transform: rotate(-9deg) } 94% { transform: rotate(6deg) } 96% { transform: rotate(-3deg) } }
        @keyframes cardyRing { 0% { transform: scale(1); opacity: .55 } 100% { transform: scale(1.75); opacity: 0 } }
        @keyframes cardyLabel { from { opacity: 0; transform: translateX(8px) } to { opacity: 1; transform: none } }
        .cardy-float { animation: cardyFloat 3s ease-in-out infinite }
        .cardy-wiggle { animation: cardyWiggle 6s ease-in-out infinite; transform-origin: 50% 60% }
        .cardy-ring { animation: cardyRing 2.2s ease-out infinite }
        .cardy-label { animation: cardyLabel .4s ease-out both }
        @media (prefers-reduced-motion: reduce) { .cardy-float, .cardy-wiggle, .cardy-ring, .cardy-label { animation: none } }
        /* Out of the way while a site menu is open (it would cover the menu's last buttons). */
        body:has([data-site-menu]) .cardy-root { display: none }
      `}</style>
      <div ref={launcherRef} className={`relative flex items-center gap-2 ${!isOpen ? 'cardy-float' : ''}`}>
        {!isOpen && !showGreeting && showLabel && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="cardy-label hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-lg"
            style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-1)', color: 'var(--surface-text)' }}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" /> Chat with AI · 24/7
          </button>
        )}
        {!isOpen && <span aria-hidden="true" className="cardy-ring pointer-events-none absolute right-0 h-12 w-12 sm:h-14 sm:w-14 rounded-full" style={{ backgroundImage: 'var(--background-image-gradient-crimson)' }} />}
        <IconButton
          variant="bare"
          size="lg"
          onClick={() => { setIsOpen(o => !o); setShowGreeting(false); }}
          title={isOpen ? 'Close Aicardly assistant' : 'Chat with the Aicardly AI assistant'}
          className={`relative !h-12 !w-12 sm:!h-14 sm:!w-14 text-white shadow-lg ${!isOpen ? 'cardy-wiggle' : ''}`}
          style={{ backgroundImage: 'var(--background-image-gradient-crimson)', boxShadow: 'var(--shadow-glow-crimson-lg)' }}
        >
          {!isOpen && (
            <span className="absolute -top-1 -left-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-[#E70C65] shadow" aria-hidden="true">
              AI
            </span>
          )}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}>
                <Bot className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </IconButton>
      </div>
    </div>
  );
};

export default PlatformChatWidget;
