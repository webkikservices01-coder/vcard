import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Bot, X, Sparkles, Video } from 'lucide-react';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import IconButton from '../ui/IconButton';
import Button from '../ui/Button';

const API_URL = import.meta.env.VITE_API_URL;
let idCounter = 0;
const genId = () => `m_${Date.now()}_${idCounter++}`;
const socialIcons = { Instagram: FaInstagram, Facebook: FaFacebook, LinkedIn: FaLinkedin, YouTube: FaYoutube, WhatsApp: FaWhatsapp, Twitter: FaXTwitter };

const ChatWidget = ({ slug, aiName, greeting, profile, videoRoomUrl }) => {
  const ownerName = profile?.name?.trim() || aiName?.trim() || 'this profile';
  const assistantName = aiName?.trim() || 'AI Agent';
  const avatarLetter = ownerName.charAt(0).toUpperCase();
  const initialMsg = { role: 'assistant', content: greeting || `Hi! I’m ${assistantName}. How can I help you today?`, id: 'init' };
  const initSuggestions = [`Tell me about ${ownerName.split(' ')[0]}`, 'How can I get in touch?', 'What do they offer?'];
  const socialLinks = (profile?.links || []).filter(link => socialIcons[link.fieldType] && link.url);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMsg]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const endRef = useRef(null), scrollRef = useRef(null), inputRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isBusy]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 300); }, [isOpen]);
  const handleScroll = useCallback(() => { const el = scrollRef.current; if (el) setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 140); }, []);
  const sendMessage = useCallback(async (text) => {
    const userText = text.trim();
    if (!userText || isBusy) return;
    const updated = [...messages, { role: 'user', content: userText, id: genId() }];
    setMessages(updated); setInput(''); setIsBusy(true);
    try {
      const res = await axios.post(`${API_URL}/api/ai/chat/${slug}`, { messages: updated.map(({ role, content }) => ({ role, content })) });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, id: genId() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.response?.data?.msg || 'Sorry, something went wrong. Please try again.', id: genId() }]);
    } finally { setIsBusy(false); }
  }, [messages, isBusy, slug]);
  const showChips = !isBusy && messages.length === 1;

  return <div className="fixed bottom-5 right-3 sm:bottom-6 sm:right-6 z-[100]">
    <AnimatePresence>{isOpen && <motion.div initial={{ opacity: 0, y: 24, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.94 }} transition={{ type: 'spring', damping: 28, stiffness: 370 }} className="ai-chat-shell absolute bottom-[78px] right-0 w-[calc(100vw-1.5rem)] sm:w-[400px] flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#090a12] shadow-[0_24px_80px_rgba(8,10,30,0.65)]" style={{ maxHeight: 'calc(100dvh - 112px)', height: '600px' }}>
      <div className={`ai-wave-layer${isBusy ? ' thinking' : ''}`} aria-hidden="true"><i /><i /><i /><span className="ai-streak" /></div>
      <div className="relative z-10"><ChatHeader aiName={assistantName} ownerName={ownerName} avatarLetter={avatarLetter} isBusy={isBusy} onClear={() => setMessages([initialMsg])} onClose={() => setIsOpen(false)} />
        <div className="mx-3 mt-2.5 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5">
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-violet-500 to-cyan-400 p-[1px]"><div className="flex h-full w-full items-center justify-center overflow-hidden rounded-[11px] bg-[#121426] text-xs font-black text-white">{profile?.avatar ? <img src={profile.avatar} alt="" className="h-full w-full object-cover" /> : avatarLetter}</div></div>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">Chat with {ownerName}</p><p className="mt-0.5 text-[10px] text-indigo-200/60">Personal AI assistant</p></div>
          {socialLinks.length > 0 && <div className="flex gap-1">{socialLinks.slice(0, 3).map(link => { const SocialIcon = socialIcons[link.fieldType]; return <a key={`${link.fieldType}-${link.url}`} href={link.url} target="_blank" rel="noreferrer" aria-label={link.fieldType} className="text-indigo-100/55 transition hover:text-white"><SocialIcon className="h-3.5 w-3.5" /></a>; })}</div>}
        </div>
      </div>
      <div className="relative z-10 flex min-h-0 flex-1 flex-col"><div ref={scrollRef} onScroll={handleScroll} className="chat-scroll flex-1 min-h-0 space-y-3 overflow-y-auto p-4" style={{ overscrollBehavior: 'contain' }}>{messages.map(msg => <MessageBubble key={msg.id} msg={msg} avatarLetter={avatarLetter} />)}{isBusy && <TypingIndicator avatarLetter={avatarLetter} />}<div ref={endRef} /></div><AnimatePresence>{showScrollBtn && <IconButton variant="bare" size="sm" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth' })} title="Scroll to bottom" className="absolute bottom-3 right-3 z-10 border border-white/10 bg-[#1a1b2a] text-gray-300 shadow-lg">↓</IconButton>}</AnimatePresence></div>
      <div className="relative z-10"><AnimatePresence>{showChips && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex flex-wrap gap-1.5 border-t border-white/[0.06] px-3 pb-2 pt-2">{initSuggestions.map(s => <Button key={s} variant="themed" size="sm" onClick={() => sendMessage(s)} className="!min-h-0 !rounded-full !border !border-white/10 !bg-white/[0.045] !px-3 !py-1.5 !text-[11px] !font-normal text-indigo-100/70 hover:!border-indigo-400/40 hover:!bg-indigo-400/10 hover:!text-white">{s}</Button>)}</motion.div>}</AnimatePresence><ChatInput value={input} onChange={setInput} onSubmit={sendMessage} isBusy={isBusy} inputRef={inputRef} /><div className="flex items-center justify-center gap-1 bg-[#0d0e19] pb-2.5 pt-1"><Sparkles className="h-2.5 w-2.5 text-indigo-300" /><p className="text-[10px] tracking-wide text-indigo-100/35">Powered by <span className="font-medium text-indigo-100/55">Webcard.ai</span></p></div></div>
    </motion.div>}</AnimatePresence>
    {!isOpen && videoRoomUrl && <div className="absolute right-0 bottom-[72px] flex items-center justify-end"><AnimatePresence>{!isOpen && <motion.button initial={{ opacity: 0, x: 16, scale: 0.88 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 16, scale: 0.88 }} transition={{ type: 'spring', damping: 22, stiffness: 300, delay: 0.55 }} onClick={() => window.open(videoRoomUrl, '_blank', 'noopener,noreferrer')} className="hidden sm:flex absolute right-[58px] bottom-0.5 items-center gap-2 rounded-2xl border border-white/70 bg-white px-3.5 py-2 text-[12px] font-bold text-slate-900 shadow-[0_8px_28px_rgba(0,0,0,0.28)] whitespace-nowrap">Video call with {ownerName}<span className="absolute right-[-7px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-[7px] border-l-[7px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" /></motion.button>}</AnimatePresence><span className="video-launch-glow" aria-hidden="true" /><IconButton variant="bare" size="lg" onClick={() => window.open(videoRoomUrl, '_blank', 'noopener,noreferrer')} className="relative !h-11 !w-11 border border-white/20 !bg-gradient-to-br !from-emerald-500 !via-teal-500 !to-cyan-500 text-white shadow-[0_6px_20px_rgba(16,185,129,0.5)]" title={`Video call with ${ownerName}`}><Video className="h-4 w-4" /></IconButton></div>}
    <div className="relative flex items-center justify-end"><AnimatePresence>{!isOpen && <motion.button initial={{ opacity: 0, x: 16, scale: 0.88 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 16, scale: 0.88 }} transition={{ type: 'spring', damping: 22, stiffness: 300, delay: 0.4 }} onClick={() => setIsOpen(true)} className="hidden sm:flex absolute right-[70px] bottom-1 items-center gap-2 rounded-2xl border border-white/70 bg-white px-4 py-2.5 text-[12px] font-bold text-slate-900 shadow-[0_8px_28px_rgba(0,0,0,0.28)] whitespace-nowrap"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>Chat with {ownerName}<span className="absolute right-[-7px] top-1/2 h-0 w-0 -translate-y-1/2 border-b-[7px] border-l-[7px] border-t-[7px] border-b-transparent border-l-white border-t-transparent" /></motion.button>}</AnimatePresence>{!isOpen && <><span className="ai-launch-glow" aria-hidden="true" /><span className="ai-launch-ring" aria-hidden="true" /></>}<IconButton variant="bare" size="lg" onClick={() => setIsOpen(o => !o)} className="relative !h-14 !w-14 border border-white/20 !bg-gradient-to-br !from-indigo-500 !via-violet-600 !to-cyan-500 text-white shadow-[0_8px_28px_rgba(79,70,229,0.5)]" title={isOpen ? 'Close AI Agent' : 'Open AI Agent'}><AnimatePresence mode="wait">{isOpen ? <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}><X className="h-5 w-5" /></motion.span> : <motion.span key="open" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}><Bot className="h-6 w-6" /></motion.span>}</AnimatePresence>{!isOpen && <span className="absolute right-0.5 top-0.5 h-3 w-3 rounded-full border-2 border-indigo-700 bg-emerald-400" />}</IconButton></div>
    <style>{`.chat-scroll{scrollbar-width:thin;scrollbar-color:#353754 transparent}.chat-scroll::-webkit-scrollbar{width:4px}.chat-scroll::-webkit-scrollbar-thumb{background:#353754;border-radius:4px}.ai-wave-layer{position:absolute;inset:0;overflow:hidden;pointer-events:none;background:radial-gradient(circle at 92% 3%,rgba(99,102,241,.24),transparent 30%),linear-gradient(145deg,#101127,#090a12 55%,#0b1021);transition:filter .4s ease}.ai-wave-layer i{position:absolute;width:170%;height:42%;left:-38%;border:1px solid rgba(129,140,248,.16);border-radius:50%;transform:rotate(-14deg);animation:ai-wave 9s linear infinite;transition:animation-duration .4s ease,opacity .4s ease}.ai-wave-layer i:nth-child(2){top:24%;left:-52%;animation-delay:-3s;opacity:.65}.ai-wave-layer i:nth-child(3){top:54%;animation-delay:-6s;opacity:.4}.ai-wave-layer .ai-streak{position:absolute;top:0;bottom:0;width:40%;left:-55%;background:linear-gradient(100deg,transparent,rgba(165,180,252,.14) 45%,rgba(103,232,249,.12) 55%,transparent);animation:ai-streak 7s ease-in-out infinite;transition:animation-duration .4s ease}.ai-wave-layer.thinking{filter:brightness(1.18)}.ai-wave-layer.thinking i{animation-duration:4s}.ai-wave-layer.thinking i:first-child{opacity:.85}.ai-wave-layer.thinking .ai-streak{animation-duration:2.6s}.ai-launch-glow{position:absolute;height:58px;width:58px;border-radius:999px;background:rgba(99,102,241,.55);filter:blur(13px);animation:ai-pulse 2.8s ease-in-out infinite}.ai-launch-ring{position:absolute;height:64px;width:64px;border:1px solid rgba(129,140,248,.5);border-radius:999px;animation:ai-ring 2.8s ease-out infinite}.video-launch-glow{position:absolute;right:0;height:46px;width:46px;border-radius:999px;background:rgba(16,185,129,.5);filter:blur(11px);animation:ai-pulse 2.8s ease-in-out infinite .3s}@keyframes ai-wave{from{translate:-8% 0}to{translate:16% 0}}@keyframes ai-streak{0%{left:-55%}100%{left:115%}}@keyframes ai-pulse{50%{transform:scale(1.22);opacity:.45}}@keyframes ai-ring{70%,to{transform:scale(1.35);opacity:0}}@media (prefers-reduced-motion:reduce){.ai-wave-layer i,.ai-wave-layer .ai-streak,.ai-launch-glow,.ai-launch-ring{animation:none}}`}</style>
  </div>;
};

export default ChatWidget;
