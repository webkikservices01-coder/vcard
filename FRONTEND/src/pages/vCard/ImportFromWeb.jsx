import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Loader2, Check, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';

const API = import.meta.env.VITE_API_URL;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });
const field = { background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' };

// What each import reads and how its results look.
const KINDS = {
  photos: {
    title: 'Photos from your website',
    sub: 'We collect the pictures on your site; pick the ones for your gallery.',
    label: 'Your website (or its gallery / projects page)',
    placeholder: 'e.g. yourwebsite.com/gallery',
    tip: 'Sites built with JavaScript show screenshots of their pages instead.',
    find: 'Find photos',
    reading: 'Reading your website…',
    preview: '/api/gallery/import/preview',
    list: (d) => d.photos.map((p) => ({ ...p, key: p.url })),
    noun: ['photo', 'photos'],
    grid: true,
  },
  reviews: {
    title: 'Reviews from your website',
    sub: 'AI finds the client reviews published on your site, word for word.',
    label: 'Your website (or its testimonials page)',
    placeholder: 'e.g. yourwebsite.com/testimonials',
    tip: 'Only reviews written on your site are picked up; nothing is made up.',
    find: 'Find reviews',
    reading: 'Reading your website… (up to 30 s)',
    preview: '/api/testimonials/import/preview',
    list: (d) => d.reviews.map((r, i) => ({ ...r, key: `${i}-${r.review.slice(0, 20)}` })),
    noun: ['review', 'reviews'],
  },
  videos: {
    title: 'Videos from your YouTube channel',
    sub: 'Your latest YouTube videos and Shorts, ready to show as reels.',
    label: 'Your YouTube channel',
    placeholder: 'e.g. youtube.com/@yourchannel',
    tip: 'Instagram and Facebook don’t let other apps read your profile, so add those reels one by one with their links.',
    find: 'Find videos',
    reading: 'Reading your channel…',
    preview: '/api/vcard/reels/import/preview',
    list: (d) => d.videos.map((v) => ({ ...v, key: v.url })),
    noun: ['video', 'videos'],
    grid: true,
  },
};

// "Bring it from my website / channel": paste a link, pick from what was found, add.
// onSave(selectedItems) does the adding and returns a message for the toast.
export default function ImportFromWeb({ kind, open, onClose, onSave }) {
  const k = KINDS[kind];
  const [url, setUrl] = useState('');
  const [step, setStep] = useState('url'); // url | loading | pick | saving
  const [found, setFound] = useState([]);
  const [picked, setPicked] = useState(new Set());
  const [error, setError] = useState('');

  const reset = () => {
    setStep('url');
    setFound([]);
    setPicked(new Set());
    setError('');
  };
  const close = () => {
    if (step === 'loading' || step === 'saving') return;
    reset();
    onClose();
  };
  const find = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setError('');
    setStep('loading');
    try {
      const res = await axios.post(`${API}${k.preview}`, { url: url.trim() }, { headers: headers(), timeout: 90000 });
      const list = k.list(res.data);
      setFound(list);
      // Photos: the first 12 are ticked; reviews and videos: all.
      setPicked(new Set(list.map((_, i) => i).filter((i) => kind !== 'photos' || i < 12)));
      setStep('pick');
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't read that link. Please check it.");
      setStep('url');
    }
  };
  const save = async () => {
    setStep('saving');
    try {
      const msg = await onSave(found.filter((_, i) => picked.has(i)));
      toast.success(msg || 'Added');
      reset();
      setUrl('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || 'Could not add them.');
      setStep('pick');
    }
  };
  const toggle = (i) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  const tick = (on) => (
    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-brand-500 bg-brand-500 text-white' : 'bg-black/30'}`} style={on ? undefined : { borderColor: 'rgba(255,255,255,.6)' }}>
      {on && <Check className="h-3.5 w-3.5" />}
    </span>
  );
  const max = 20;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="glass flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={k.title}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <Globe className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--surface-text)' }}>{k.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{k.sub}</p>
                </div>
              </div>
              <IconButton variant="ghost" title="Close" onClick={close}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            {step === 'url' || step === 'loading' ? (
              <form onSubmit={find} className="space-y-3 p-5">
                <label className="block text-sm font-medium" style={{ color: 'var(--surface-text)' }}>
                  {k.label}
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={k.placeholder}
                    inputMode="url"
                    autoFocus
                    disabled={step === 'loading'}
                    className="mt-1.5 w-full rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                    style={field}
                  />
                </label>
                <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{k.tip}</p>
                {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">{error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" onClick={close} style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>Cancel</Button>
                  <GradientButton type="submit" disabled={step === 'loading' || !url.trim()} className="!w-auto px-5">
                    {step === 'loading' ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>{k.reading}</span></>) : <span>{k.find}</span>}
                  </GradientButton>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 pt-4 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                  <span>Found {found.length} {found.length === 1 ? k.noun[0] : k.noun[1]} · {picked.size} selected{picked.size > max ? ` (max ${max} at a time)` : ''}</span>
                  <button type="button" className="font-semibold text-brand-500 hover:underline" onClick={() => setPicked(picked.size ? new Set() : new Set(found.map((_, i) => i).slice(0, max)))}>
                    {picked.size ? 'Select none' : 'Select all'}
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-5 pt-3">
                  {k.grid ? (
                    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {found.map((it, i) => {
                        const on = picked.has(i);
                        const img = kind === 'videos' ? it.thumb : it.url;
                        return (
                          <li key={it.key}>
                            <button
                              type="button"
                              onClick={() => toggle(i)}
                              aria-pressed={on}
                              aria-label={`${on ? 'Unselect' : 'Select'} ${kind === 'videos' ? it.title : `photo ${i + 1}`}`}
                              className="relative block w-full overflow-hidden rounded-xl text-left"
                              style={{ outline: on ? '2px solid rgb(231 12 101)' : '1px solid var(--surface-border)', outlineOffset: on ? '1px' : 0, background: 'var(--surface-2)' }}
                            >
                              <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" className={`aspect-[4/3] w-full object-cover ${it.source === 'screenshot' ? 'object-top' : ''}`} onError={(e) => (e.currentTarget.style.opacity = '.25')} />
                              <span className="absolute left-2 top-2">{tick(on)}</span>
                              {kind === 'videos' && <span className="block truncate px-2 py-1.5 text-[11px] font-semibold" style={{ color: 'var(--surface-text)' }}>{it.title}</span>}
                              {it.source === 'screenshot' && <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">page</span>}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <ul className="space-y-2">
                      {found.map((r, i) => {
                        const on = picked.has(i);
                        return (
                          <li key={r.key}>
                            <button
                              type="button"
                              onClick={() => toggle(i)}
                              aria-pressed={on}
                              className="flex w-full items-start gap-3 rounded-xl p-3 text-left"
                              style={{ border: `1px solid ${on ? 'rgb(231 12 101 / .5)' : 'var(--surface-border)'}`, background: on ? 'rgb(231 12 101 / .06)' : 'var(--surface-1)' }}
                            >
                              <span className="mt-0.5">{tick(on)}</span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>
                                  {r.name || 'Client'}
                                  <span className="flex text-amber-400">{Array.from({ length: r.rating || 5 }, (_, s) => <Star key={s} className="h-3 w-3 fill-current" />)}</span>
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed" style={{ color: 'var(--surface-text-2)' }}>“{r.review}”</span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <div className="flex justify-between gap-2 p-5 pt-0">
                  <Button variant="ghost" onClick={reset} disabled={step === 'saving'} style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>Other link</Button>
                  <GradientButton onClick={save} disabled={!picked.size || picked.size > max || step === 'saving'} loading={step === 'saving'} className="!w-auto px-5">
                    <span>{step === 'saving' ? 'Adding…' : `Add ${picked.size} ${picked.size === 1 ? k.noun[0] : k.noun[1]}`}</span>
                  </GradientButton>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
