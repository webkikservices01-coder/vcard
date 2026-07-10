import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mic, MicOff, X, Loader2, Sparkles } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// Fires a browser-wide event so any open page can refetch its data after Jarvis mutates something.
const notifyVcardDataChanged = () => window.dispatchEvent(new Event('vcard:data-changed'));

const JarvisWidget = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking | error
  const [log, setLog] = useState([]);
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

      await speak(reply);
      setStatus('idle');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Jarvis failed to respond');
      setStatus('error');
    }
  }, [navigate, speak]);

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
    idle: 'Mic dabaiye aur bolna shuru kijiye',
  }[status];

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[200] w-[calc(100vw-2rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-black text-white">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <p className="text-sm font-bold">Jarvis</p>
            </div>
            <button onClick={handleToggleOpen} className="p-1 hover:bg-white/10 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 max-h-72 overflow-y-auto space-y-3">
            {log.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">
                Bol kar bataiye — jaise "naya product add karo naam Website Design", ya "contact details pe le chalo".
              </p>
            )}
            {log.map((entry, i) => (
              <div key={i} className={`text-sm ${entry.role === 'assistant' ? '' : 'text-right'}`}>
                <span className={`inline-block px-3 py-2 rounded-xl ${entry.role === 'assistant' ? 'bg-gray-100 text-gray-900' : 'bg-black text-white'}`}>
                  {entry.text}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 pt-0 text-center">
            <p className="text-xs text-gray-400 mb-3">{statusText}</p>
            <button
              onClick={() => (status === 'listening' ? recognitionRef.current?.stop() : startListening())}
              disabled={status === 'thinking' || status === 'speaking'}
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto transition disabled:opacity-50 ${status === 'listening' ? 'bg-red-500 text-white' : 'bg-black text-white'}`}
            >
              {status === 'thinking' ? <Loader2 className="w-6 h-6 animate-spin" /> : status === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleToggleOpen}
        className="fixed bottom-6 right-4 sm:right-6 z-[200] w-14 h-14 rounded-full bg-black text-white shadow-2xl flex items-center justify-center hover:bg-gray-800 transition"
        title="Jarvis Voice Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>
    </>
  );
};

export default JarvisWidget;
