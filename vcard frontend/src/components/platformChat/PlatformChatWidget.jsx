import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Bot, X, MessageCircle, ArrowUpRight, Calendar, Layers, ListChecks, Sparkles, IndianRupee, Rocket, ChevronRight } from 'lucide-react';
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
  recommendFromAnswers, getKeyHighlights,
} from './config';

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

const PlatformChatWidget = () => {
  const location = useLocation();
  const allowed = ALLOWED_PATHS.includes(location.pathname);
  const reducedMotion = usePrefersReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [shouldPulse] = useState(() => {
    try { return !localStorage.getItem(PULSE_SEEN_KEY); } catch { return false; }
  });

  const [flow, setFlow] = useState(null); // { stepIndex, answers }
  const [leadState, setLeadState] = useState(null); // null | 'form' | 'submitting' | 'done'
  const [leadContext, setLeadContext] = useState(null);
  const [leadError, setLeadError] = useState('');

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const launcherRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' }); }, [messages, isBusy, flow, leadState, reducedMotion]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), reducedMotion ? 0 : 300);
  }, [isOpen, reducedMotion]);

  // One-time launcher pulse: shouldPulse is read once at mount; mark it seen once the launcher is actually shown.
  useEffect(() => {
    if (!allowed || !shouldPulse) return;
    try { localStorage.setItem(PULSE_SEEN_KEY, '1'); } catch { /* ignore */ }
  }, [allowed, shouldPulse]);

  // Dismissible greeting bubble — home page only, once per session.
  useEffect(() => {
    if (!allowed || location.pathname !== '/' || isOpen) return;
    let shown = false;
    try { shown = sessionStorage.getItem(GREETING_SESSION_KEY) === '1'; } catch { /* ignore */ }
    if (shown) return;
    const t = setTimeout(() => {
      setShowGreeting(true);
      try { sessionStorage.setItem(GREETING_SESSION_KEY, '1'); } catch { /* ignore */ }
    }, GREETING_DELAY_MS);
    return () => clearTimeout(t);
  }, [allowed, location.pathname, isOpen]);

  // Focus trap + Esc-to-close while the panel is open.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const getFocusables = () => panel?.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    setTimeout(() => getFocusables()?.[0]?.focus(), 0);

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

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!userText || isBusy) return;
    const updated = [...messages, { id: genId(), role: 'user', type: 'text', content: userText }];
    setMessages(updated);
    setInput('');
    setIsBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/platform-chat`, {
        messages: updated.filter(m => m.type === 'text').slice(-12).map(({ role, content }) => ({
          role,
          content: role === 'user' ? content.slice(0, MAX_MESSAGE_LENGTH) : content,
        })),
      });
      appendMessage('assistant', res.data.reply);
      if (res.data.showLeadForm && leadState !== 'done') {
        setLeadContext(null);
        setLeadError('');
        setLeadState('form');
      }
    } catch (err) {
      appendMessage('assistant', err.response?.data?.msg || "Sorry, I'm having trouble responding right now. You can reach our team on WhatsApp or email instead — see the buttons above.");
    } finally {
      setIsBusy(false);
    }
  }, [messages, isBusy, appendMessage, leadState]);

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
      appendMessage('assistant', "Got it — for a custom or enterprise setup, let's connect you with our team directly. Share your details below and we'll reach out within 24-48 hours.");
      setLeadContext(answers);
      setLeadState('form');
    } else {
      appendMessage('assistant', `Based on that, I'd recommend **${result.plan.name}** — ${result.plan.tagline}, ₹${result.plan.price.monthly}/mo (or ₹${result.plan.price.yearly}/yr).`, { type: 'recommendation', plan: result.plan });
    }
  }, [flow, appendMessage]);

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
    setMessages([WELCOME_MESSAGE]);
    setFlow(null);
    setLeadState(null);
    setLeadContext(null);
    setLeadError('');
  };

  const showFaqChips = useMemo(
    () => !isBusy && !flow && !leadState && messages.length === 1,
    [isBusy, flow, leadState, messages.length]
  );

  if (!allowed) return null;

  const panelTransition = reducedMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 360 };

  return (
    <div className="fixed bottom-5 right-3 sm:bottom-6 sm:right-6 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Webcard.ai assistant chat"
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
            <div className="flex h-full flex-col">
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
                    <p className="text-[13px] font-bold leading-none text-white">Cardy · Webcard.ai Assistant</p>
                    <p className="mt-1 text-[11px] text-white/75">{isBusy ? 'Typing…' : 'Online'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton variant="bare" size="sm" onClick={startNewChat} title="Start new chat" className="text-white/80 hover:bg-white/15 hover:text-white">
                    <MessageCircle className="h-4 w-4" />
                  </IconButton>
                  <IconButton variant="bare" size="sm" onClick={() => setIsOpen(false)} title="Close chat" className="text-white/80 hover:bg-white/15 hover:text-white">
                    <X className="h-4 w-4" />
                  </IconButton>
                </div>
              </div>

              {/* Always-visible primary CTAs */}
              <div className={`grid shrink-0 gap-2 border-b px-3 py-2.5 ${BOOKING_HREF ? 'grid-cols-2' : 'grid-cols-1'}`} style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-2)' }}>
                <a href={WHATSAPP_HREF} target="_blank" rel="noopener noreferrer" className="min-w-0">
                  <Button variant="secondary" size="sm" fullWidth leftIcon={<FaWhatsapp className="h-3.5 w-3.5 shrink-0" />} className="!min-h-[42px] !px-2 !text-[11px]">
                    <span className="text-center leading-tight">Chat on WhatsApp</span>
                  </Button>
                </a>
                {BOOKING_HREF && (
                  <a href={BOOKING_HREF} target="_blank" rel="noopener noreferrer" className="min-w-0">
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Calendar className="h-3.5 w-3.5 shrink-0" />} className="!min-h-[42px] !px-2 !text-[11px]">
                      <span className="text-center leading-tight">Book a Free Demo</span>
                    </Button>
                  </a>
                )}
              </div>

              {/* Messages */}
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
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
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === 'user' ? 'rounded-br-sm font-medium' : 'rounded-bl-sm'}`}
                        style={msg.role === 'user'
                          ? { backgroundImage: 'var(--background-image-gradient-crimson)', color: '#fff' }
                          : { background: 'var(--surface-2)', color: 'var(--surface-text)' }}
                      >
                        {msg.role === 'user' ? <span className="whitespace-pre-wrap">{msg.content}</span> : <CardyMessage text={msg.content} />}
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
                      {FAQ_CHIPS.filter(c => c !== FLOW_TRIGGER_CHIP).map((chip, i) => {
                        const Icon = CHIP_ICONS[i] || Sparkles;
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

                <div ref={endRef} />
              </div>

              {/* Footer controls: guided flow chips, lead form, or normal input */}
              <div className="shrink-0 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                {flow ? (
                  <FlowStep step={FLOW_STEPS[flow.stepIndex]} onAnswer={handleFlowAnswer} />
                ) : leadState === 'form' || leadState === 'submitting' ? (
                  <LeadForm onSubmit={handleLeadSubmit} submitting={leadState === 'submitting'} error={leadError} />
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                    className="flex items-center gap-2 px-3 py-3"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                      placeholder="Type a message…"
                      maxLength={MAX_MESSAGE_LENGTH}
                      disabled={isBusy}
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

      {/* Launcher */}
      <div ref={launcherRef}>
        <IconButton
          variant="bare"
          size="lg"
          onClick={() => { setIsOpen(o => !o); setShowGreeting(false); }}
          title={isOpen ? 'Close Webcard.ai assistant' : 'Open Webcard.ai assistant'}
          className="relative !h-14 !w-14 text-white shadow-lg"
          style={{ backgroundImage: 'var(--background-image-gradient-crimson)', boxShadow: 'var(--shadow-glow-crimson-lg)' }}
          animate={shouldPulse && !isOpen && !reducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={shouldPulse && !isOpen && !reducedMotion ? { duration: 1.6, repeat: 2 } : {}}
        >
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
