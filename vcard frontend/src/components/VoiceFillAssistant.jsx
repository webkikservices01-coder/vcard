import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Mic, MicOff, X, Loader2, Volume2 } from 'lucide-react';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const GREETINGS = {
  profile: "Namaste! Please bataiye apna pura naam, designation aur ek chota sa bio.",
  contact: "Bataiye aapka phone number, email ya social links kya add karne hain.",
  products: "Apne product ya service ka naam, description aur price bataiye.",
  portfolio: "Apne project ka naam, description aur link bataiye.",
};

const SpeechRecognitionAPI = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// page: 'profile' | 'contact' | 'products' | 'portfolio'
// onFill(fields): merge extracted fields into the parent form
// getKnown(): returns the parent's current known values for this form (used as context for the next turn)
// onClose(): called when the assistant is dismissed
const VoiceFillAssistant = ({ page, onFill, getKnown, onClose }) => {
  const [status, setStatus] = useState('idle'); // idle | listening | thinking | speaking | done | error
  const [log, setLog] = useState([]);
  const recognitionRef = useRef(null);
  const stoppedRef = useRef(false);
  const startListeningRef = useRef(() => {});

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

  const handleTranscript = useCallback(async (text) => {
    setStatus('thinking');
    try {
      const res = await axios.post(`${API}/ai/voice-fill`, {
        page, transcript: text, known: getKnown(),
      }, { headers: headers() });

      const { fields, complete, reply } = res.data;
      onFill(fields);
      setLog(l => [...l, { role: 'assistant', text: reply }]);

      if (reply) await speak(reply);

      if (complete) {
        setStatus('done');
      } else if (!stoppedRef.current) {
        startListeningRef.current();
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Voice assistant failed');
      setStatus('error');
    }
  }, [page, getKnown, onFill, speak]);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI || stoppedRef.current) return;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setLog(l => [...l, { role: 'user', text }]);
      handleTranscript(text);
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
  }, [handleTranscript]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  useEffect(() => {
    stoppedRef.current = false;
    (async () => {
      const greeting = GREETINGS[page] || 'Please bataiye details.';
      setLog([{ role: 'assistant', text: greeting }]);
      await speak(greeting);
      if (!stoppedRef.current) startListening();
    })();
    return () => {
      stoppedRef.current = true;
      window.speechSynthesis?.cancel();
      recognitionRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStop = () => {
    stoppedRef.current = true;
    window.speechSynthesis?.cancel();
    recognitionRef.current?.stop();
    onClose();
  };

  if (!SpeechRecognitionAPI) {
    return (
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center space-y-3">
          <p className="text-sm text-gray-700">Voice input is not supported in this browser. Please use Chrome, or fill the form manually.</p>
          <Button variant="themed" size="sm" onClick={onClose} className="!w-auto mx-auto bg-brand-600 text-white hover:bg-brand-700">Close</Button>
        </div>
      </div>
    );
  }

  const statusText = {
    listening: 'Sun raha hoon... bolte rahiye',
    thinking: 'Samajh raha hoon...',
    speaking: 'Bol raha hoon...',
    done: 'Ho gaya! Details check karke Save kar dijiye.',
    error: 'Kuch gadbad hui, dobara try karein',
    idle: 'Mic dabaiye aur bolna shuru kijiye',
  }[status];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'listening' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}>
              {status === 'listening' ? <Mic className="w-4 h-4" /> : status === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            </div>
            <p className="text-sm font-bold text-gray-900">Voice Assistant</p>
          </div>
          <IconButton variant="bare" title="Close" onClick={handleStop} className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="p-5 max-h-64 overflow-y-auto space-y-3">
          {log.map((entry, i) => (
            <div key={i} className={`text-sm ${entry.role === 'assistant' ? '' : 'text-right'}`}>
              <span className={`inline-block px-3 py-2 rounded-xl ${entry.role === 'assistant' ? 'bg-gray-100 text-gray-900' : 'bg-brand-600 text-white'}`}>
                {entry.text}
              </span>
            </div>
          ))}
        </div>

        <div className="p-5 pt-0 text-center">
          <p className="text-xs text-gray-400 mb-3">{statusText}</p>
          {status === 'done' ? (
            <Button variant="themed" size="md" onClick={handleStop} className="!w-auto mx-auto bg-brand-600 text-white hover:bg-brand-700">Done</Button>
          ) : (
            <IconButton
              variant="bare" size="lg"
              title={status === 'listening' ? 'Stop listening' : 'Start listening'}
              onClick={() => (status === 'listening' ? recognitionRef.current?.stop() : startListening())}
              disabled={status === 'thinking' || status === 'speaking'}
              className={`!w-14 !h-14 mx-auto ${status === 'listening' ? 'bg-red-500 text-white' : 'bg-brand-600 text-white'}`}
            >
              {status === 'listening' ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceFillAssistant;
