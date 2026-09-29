import { useEffect, useState } from 'react';
import axios from 'axios';

// Debounced live check of a card username against /api/vcard/check-username.
// Returns { state: 'idle' | 'checking' | 'ok' | 'bad', msg }.
export const useUsernameCheck = (username, delay = 450) => {
  const [result, setResult] = useState({ state: 'idle', msg: '' });
  useEffect(() => {
    const u = (username || '').trim().toLowerCase();
    if (!u) {
      setResult({ state: 'idle', msg: '' });
      return;
    }
    setResult({ state: 'checking', msg: '' });
    let active = true;
    const t = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/check-username/${encodeURIComponent(u)}`, {
          headers: { 'x-auth-token': localStorage.getItem('token') },
        });
        if (active) setResult(data.available ? { state: 'ok', msg: data.mine ? 'This is your current link.' : 'Available!' } : { state: 'bad', msg: data.msg || 'Not available.' });
      } catch {
        if (active) setResult({ state: 'idle', msg: '' });
      }
    }, delay);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [username, delay]);
  return result;
};

// Same rules as the server: lowercase letters, numbers and single hyphens.
export const toUsername = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-/, '')
    .slice(0, 30);
