import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { MapPin, Search, LocateFixed, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });
const gmaps = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const isLink = (v) => /^https?:\/\//i.test(String(v || '').trim());

// Location field: type your business name or address and pick a suggestion, or use where you
// are now. The value saved is a Google Maps link (what the card's Location button opens).
// The first suggestion is always "your text on Google Maps", which finds businesses by name;
// the others are addresses from OpenStreetMap.
export default function LocationInput({ value, onChange, onPlace, style, className = '' }) {
  const [text, setText] = useState(value || '');
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const box = useRef(null);
  const timer = useRef(0);
  const sent = useRef(value || ''); // last value this field reported

  // A value from outside (editing a saved location, or the form being cleared) shows here;
  // the field's own updates don't overwrite what the owner is typing.
  useEffect(() => {
    if ((value || '') === sent.current) return;
    sent.current = value || '';
    setText(value || '');
    setList([]);
  }, [value]);
  const emit = (v) => {
    sent.current = v;
    onChange(v);
  };

  useEffect(() => {
    const out = (e) => box.current && !box.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, []);

  const type = (v) => {
    setText(v);
    setErr('');
    // A pasted Maps link is used as it is; typed text becomes a Maps search right away.
    emit(isLink(v) ? v.trim() : v.trim() ? gmaps(v.trim()) : '');
    clearTimeout(timer.current);
    if (isLink(v) || v.trim().length < 3) {
      setList([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const { data } = await axios.get(`${API}/api/geo/search`, { params: { q: v.trim() }, headers: headers() });
        setList(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setList([]);
      } finally {
        setBusy(false);
      }
    }, 450);
  };

  const pick = (p) => {
    setText(p.label);
    setOpen(false);
    emit(p.url);
    onPlace?.(p);
  };

  const here = () => {
    if (!navigator.geolocation) return setErr('Location is not available in this browser.');
    setBusy(true);
    setErr('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await axios.get(`${API}/api/geo/reverse`, { params: { lat: coords.latitude, lng: coords.longitude }, headers: headers() });
          pick(data);
        } catch {
          setErr('Could not read your location. Please type the address.');
        } finally {
          setBusy(false);
        }
      },
      () => {
        setBusy(false);
        setErr('Please allow location access, or type the address.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const typed = text.trim() && !isLink(text) ? { label: `Search “${text.trim()}” on Google Maps`, url: gmaps(text.trim()), name: text.trim(), address: '' } : null;
  const options = [...(typed ? [typed] : []), ...list];

  return (
    <div ref={box} className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <input
          type="text"
          value={text}
          onChange={(e) => type(e.target.value)}
          onFocus={() => options.length && setOpen(true)}
          placeholder="Business name or address, e.g. Citi Glass, Kirti Nagar"
          className="w-full rounded-md py-2 pl-9 pr-24 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          style={style}
          autoComplete="off"
          aria-label="Location"
        />
        <button
          type="button"
          onClick={here}
          className="absolute right-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-brand-500 hover:bg-brand-500/10"
          title="Use my current location"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />} Near me
        </button>
      </div>
      {err && <p className="mt-1 text-[11px] text-red-500">{err}</p>}
      {open && options.length > 0 && (
        <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-lg py-1 shadow-xl" style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }} role="listbox">
          {options.map((p, i) => (
            <li key={`${p.url}|${i}`}>
              <button type="button" onClick={() => pick(p)} className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-brand-500/10" style={{ color: 'var(--surface-text)' }}>
                <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${i === 0 && typed ? 'text-brand-500' : 'opacity-60'}`} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{i === 0 && typed ? p.label : p.name || p.address.split(',')[0]}</span>
                  {!(i === 0 && typed) && <span className="block truncate text-xs" style={{ color: 'var(--surface-text-2)' }}>{p.address}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
