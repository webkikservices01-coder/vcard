import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

const API_URL = import.meta.env.VITE_API_URL;
let idCounter = 0;
const genId = () => `m_${Date.now()}_${idCounter++}`;

const ChatWidget = ({ slug, aiName, greeting }) => {
  const avatarLetter = (aiName || 'A').trim().charAt(0).toUpperCase();
  const initialMsg = { role: 'assistant', content: greeting || 'Hi! How can I help you today?', id: 'init' };
  const initSuggestions = [`Tell me about ${aiName?.split(' ')[0] || 'them'}`, 'How can I get in touch?', 'What do they offer?'];

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMsg]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBusy]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 140);
  }, []);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  const sendMessage = useCallback(async (text) => {
    const userText = text.trim();
    if (!userText || isBusy) return;

    const updated = [...messages, { role: 'user', content: userText, id: genId() }];
    setMessages(updated);
    setInput('');
    setIsBusy(true);

    try {
      const res = await axios.post(`${API_URL}/api/ai/chat/${slug}`, {
        messages: updated.map(({ role, content }) => ({ role, content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, id: genId() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.response?.data?.msg || 'Sorry, something went wrong. Please try again.',
        id: genId(),
      }]);
    } finally {
      setIsBusy(false);
    }
  }, [messages, isBusy, slug]);

  const clearChat = () => setMessages([initialMsg]);

  const showChips = !isBusy && messages.length === 1;

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 370 }}
            className="absolute bottom-[76px] right-0 w-[calc(100vw-2rem)] sm:w-[380px] bg-[#0a0a0a] border border-[#232323] rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 130px)', height: '560px' }}
          >
            <ChatHeader aiName={aiName} avatarLetter={avatarLetter} onClear={clearChat} onClose={() => setIsOpen(false)} />

            <div className="relative flex-1 min-h-0 flex flex-col">
              <div ref={scrollRef} onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 chat-scroll"
                style={{ overscrollBehavior: 'contain' }}>
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} avatarLetter={avatarLetter} />
                ))}
                {isBusy && <TypingIndicator avatarLetter={avatarLetter} />}
                <div ref={endRef} />
              </div>

              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#222] transition-all shadow-lg">
                    ↓
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showChips && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="px-3 pb-2.5 pt-2 flex flex-wrap gap-1.5 flex-shrink-0 border-t border-[#1a1a1a]"
                >
                  {initSuggestions.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-[11px] text-gray-400 border border-[#2a2a2a] rounded-full px-3 py-1.5 hover:border-indigo-500/50 hover:text-white hover:bg-indigo-500/10 transition-all bg-[#111]">
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <ChatInput value={input} onChange={setInput} onSubmit={sendMessage} isBusy={isBusy} inputRef={inputRef} />

            <div className="bg-[#0f0f0f] pb-2.5 pt-1 flex items-center justify-center gap-1 flex-shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
              <p className="text-[10px] text-gray-600 tracking-wide">
                Powered by <span className="text-gray-500 font-medium">MYcardLINK AI</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 16, scale: 0.88 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.88 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300, delay: 0.6 }}
              className="hidden sm:flex absolute right-[68px] bottom-1 items-center gap-2 bg-white text-black text-[12px] font-semibold px-4 py-2.5 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.35)] whitespace-nowrap select-none cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              Chat with {aiName}
              <span className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[7px] border-t-transparent border-b-[7px] border-b-transparent border-l-[7px] border-l-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {!isOpen && (
          <motion.div
            className="absolute w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 blur-md"
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <motion.button
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
          onClick={() => setIsOpen(o => !o)}
          className="relative w-14 h-14 bg-gradient-to-br from-[#111] to-black text-white rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/10"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.span key="close" initial={{ opacity: 0, rotate: -90, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.7 }} transition={{ duration: 0.18 }}>
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
                <MessageCircle className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
          {!isOpen && (
            <motion.span
              className="absolute top-0.5 right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"
              animate={{ scale: [1, 1.35, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.button>
      </div>

      <style>{`
        .chat-scroll{scrollbar-width:thin;scrollbar-color:#2a2a2a transparent}
        .chat-scroll::-webkit-scrollbar{width:4px}
        .chat-scroll::-webkit-scrollbar-track{background:transparent}
        .chat-scroll::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:4px}
      `}</style>
    </div>
  );
};

export default ChatWidget;
