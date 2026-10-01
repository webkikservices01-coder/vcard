import { useCallback, useEffect, useRef, useState } from 'react';

// Voice for Cardy, using the browser's own speech features (nothing is uploaded by us):
// useSpeechInput turns speech into text for the message box; speak() reads a reply aloud.
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// English (India) understands Indian accents and Hinglish best; Hindi for Devanagari speech.
export const VOICE_LANGS = [
  { code: 'en-IN', label: 'EN' },
  { code: 'hi-IN', label: 'हिं' },
];

export function useSpeechInput(onText) {
  const [listening, setListening] = useState(false);
  const rec = useRef(null);
  const supported = !!SR;

  const stop = useCallback(() => {
    rec.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(
    (lang = 'en-IN') => {
      if (!SR) return;
      const r = new SR();
      r.lang = lang;
      r.continuous = false;
      r.interimResults = true;
      r.onresult = (e) => {
        const text = Array.from(e.results).map((x) => x[0].transcript).join(' ');
        onText(text, e.results[e.results.length - 1].isFinal);
      };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      rec.current = r;
      try {
        r.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    [onText]
  );

  useEffect(() => () => rec.current?.abort?.(), []);
  return { supported, listening, start, stop };
}

export const canSpeak = () => typeof window !== 'undefined' && !!window.speechSynthesis;

// Reads a reply aloud (markdown and links stripped). Devanagari text gets a Hindi voice.
export function speak(text, onEnd) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const clean = String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*`#_>]/g, '')
    .slice(0, 900);
  const u = new SpeechSynthesisUtterance(clean);
  const hindi = /[ऀ-ॿ]/.test(clean);
  u.lang = hindi ? 'hi-IN' : 'en-IN';
  const voice = synth.getVoices().find((v) => v.lang === u.lang) || synth.getVoices().find((v) => v.lang?.startsWith(hindi ? 'hi' : 'en'));
  if (voice) u.voice = voice;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}

export const stopSpeaking = () => canSpeak() && window.speechSynthesis.cancel();
