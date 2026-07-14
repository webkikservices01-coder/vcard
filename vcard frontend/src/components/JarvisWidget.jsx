import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mic, MicOff, X, Loader2, Sparkles, Send } from 'lucide-react';
import { hasVoiceFill } from '../utils/plan';

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// Fires a browser-wide event so any open page can refetch its data after Jarvis mutates something.
const notifyVcardDataChanged = () => window.dispatchEvent(new Event('vcard:data-changed'));

const JarvisWidget = ({ plan }) => {
  const navigate = useNavigate();
  const canUseVoice = hasVoiceFill(plan);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking | error
  const [log, setLog] = useState([]);
  const [textInput, setTextInput] = useState('');
  const historyRef = useRef([]);
  const recognitionRef = useRef(null);

  const speak = useCallback((text) => new Promise((resolve) => {
    if (!window.speechSynthesis || !text) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-IN';
    utter.rate = 1;
    utter.onend = resolve;
    utter.onerror = resolve;
    setStatus('speaking');
    window.speechSynthesis.speak(utter);
  }), []);

  const handleCommand = useCallback(async (text) => {
    setStatus('thinking');
    try {
      const res = await axios.post(`${API}/ai/jarvis`, {
        message: text,
        history: historyRef.current,
      }, { headers: headers() });

      const { reply, navigateTo, refresh, history } = res.data;
      historyRef.current = history || historyRef.current;
      setLog(l => [...l, { role: 'assistant', text: reply }]);

      if (refresh) notifyVcardDataChanged();
      if (navigateTo) navigate(navigateTo);

      if (canUseVoice) await speak(reply);
      setStatus('idle');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Jarvis failed to respond');
      setStatus('error');
    }
  }, [navigate, speak, canUseVoice]);

  const handleSendText = useCallback((e) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text || status === 'thinking' || status === 'speaking') return;
    setLog(l => [...l, { role: 'user', text }]);
    setTextInput('');
    handleCommand(text);
  }, [textInput, status, handleCommand]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      toast.error('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setLog(l => [...l, { role: 'user', text }]);
      handleCommand(text);
    };
    recognition.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') { setStatus('idle'); return; }
      toast.error('Mic error: ' + e.error);
      setStatus('error');
    };
    recognition.onend = () => {
      setStatus(s => (s === 'listening' ? 'idle' : s));
    };

    recognitionRef.current = recognition;
    setStatus('listening');
    try { recognition.start(); } catch { /* already started */ }
  }, [handleCommand]);

  const handleToggleOpen = () => {
    if (open) {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
      setStatus('idle');
    }
    setOpen(o => !o);
  };

  const statusText = {
    listening: 'Sun raha hoon...',
    thinking: 'Kar raha hoon...',
    speaking: 'Bol raha hoon...',
    error: 'Kuch gadbad hui, dobara try karein',
    idle: canUseVoice ? 'Type kijiye ya mic dabaiye' : 'Type karke bataiye',
  }[status];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ type: 'spring', damping: 28, stiffness: 370 }}
            className="fixed bottom-24 right-4 sm:right-6 z-[200] w-[calc(100vw-2rem)] max-w-sm bg-white rounded-3xl shadow-[0_20px_60px_rgba(244,63,94,0.18)] border border-pink-100 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-none">Jarvis</p>
                  <p className="text-[10px] text-white/80 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block" />
                    Online now
                  </p>
                </div>
              </div>
              <button onClick={handleToggleOpen} className="p-1.5 hover:bg-white/15 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto space-y-3">
              {log.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  {canUseVoice
                    ? 'Type kijiye ya bol kar bataiye — jaise "naya product add karo naam Website Design", ya "contact details pe le chalo".'
                    : 'Type karke bataiye — jaise "naya product add karo naam Website Design", ya "contact details pe le chalo".'}
                </p>
              )}
              {log.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className={`text-sm ${entry.role === 'assistant' ? '' : 'text-right'}`}
                >
                  <span className={`inline-block px-3.5 py-2.5 rounded-2xl ${entry.role === 'assistant' ? 'bg-pink-50 text-gray-900 rounded-bl-sm' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-sm'}`}>
                    {entry.text}
                  </span>
                </motion.div>
              ))}
              {(status === 'thinking' || status === 'speaking') && (
                <div className="flex items-center gap-1 pl-1">
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-pink-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-pink-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.15 }} />
                  <motion.span className="w-1.5 h-1.5 rounded-full bg-pink-400" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} />
                </div>
              )}
            </div>

            <div className="p-4 pt-0">
              <p className="text-xs text-gray-400 mb-2 text-center">{statusText}</p>
              <form onSubmit={handleSendText} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={status === 'thinking' || status === 'speaking'}
                  placeholder="Message likhiye..."
                  className="flex-1 min-w-0 px-3 py-2 text-sm rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                  type="submit"
                  disabled={status === 'thinking' || status === 'speaking' || !textInput.trim()}
                  className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center disabled:opacity-30 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
                {canUseVoice && (
                  <motion.button
                    whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                    type="button"
                    onClick={() => (status === 'listening' ? recognitionRef.current?.stop() : startListening())}
                    disabled={status === 'thinking' || status === 'speaking'}
                    className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition disabled:opacity-50 shadow-sm ${status === 'listening' ? 'bg-red-500 text-white' : 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'}`}
                  >
                    {status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : status === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-4 sm:right-6 z-[200]">
        {!open && (
          <motion.div
            className="absolute inset-0 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 blur-md"
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        <motion.button
          whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.93 }}
          onClick={handleToggleOpen}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-[0_8px_28px_rgba(244,63,94,0.4)] flex items-center justify-center"
          title={canUseVoice ? 'Jarvis Voice Assistant' : 'Jarvis Chat Assistant'}
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="close" initial={{ opacity: 0, rotate: -90, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.7 }} transition={{ duration: 0.18 }}>
                <X className="w-5 h-5" />
              </motion.span>
            ) : (
              <motion.span key="open" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.18 }}>
                <Sparkles className="w-6 h-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
};

export default JarvisWidget;
