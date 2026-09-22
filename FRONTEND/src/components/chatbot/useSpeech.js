import { useState, useRef, useCallback } from 'react';

const SR = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

// 'en-IN' recognizes English, Hindi, and Hinglish speech — matches the rest of the app.
export const useSpeech = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isSupported = !!SR;

  const startListening = useCallback(() => {
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => onTranscript(e.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch { /* already started */ }
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, toggleListening, stopListening };
};

export const speakText = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/\*\*/g, '').replace(/`/g, '').replace(/#{1,3}\s/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').slice(0, 400);
  const utt = new SpeechSynthesisUtterance(clean);
  utt.rate = 1.0;
  utt.pitch = 1.0;
  utt.lang = 'en-IN';
  const voices = window.speechSynthesis.getVoices();
  const pref = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
  if (pref) utt.voice = pref;
  window.speechSynthesis.speak(utt);
};
