import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, X, Loader2, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import { siteShot } from '../../utils/media';

const API = `${import.meta.env.VITE_API_URL}/api/products`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });
const field = { background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' };

// Words for the two tabs: services (each with its own page) and products (from their online shop,
// with photo and price).
const COPY = {
  service: {
    one: 'service',
    title: 'Import services from your website',
    sub: 'We read your site and bring each service with its own link.',
    label: 'Your website or services page',
    ph: 'e.g. yourwebsite.com/our-services',
    tip: 'Tip: the page that lists your services works best. Your homepage works too if its menu has a “Services” section.',
    find: 'Find my services',
  },
  product: {
    one: 'product',
    title: 'Import products from your website',
    sub: 'We bring each product with its photo, price and link from your shop.',
    label: 'Your shop or products page',
    ph: 'e.g. yourshop.com',
    tip: 'Works with Shopify and WooCommerce stores and most product pages. Your shop’s homepage is enough.',
    find: 'Find my products',
  },
};

// "Import from my website": paste your site; every service / product found can be added to the
// card in one go.
export default function ImportServices({ open, onClose, onImported, kind = 'service' }) {
  const c = COPY[kind] || COPY.service;
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
      const res = await axios.post(`${API}/import/preview`, { url: url.trim(), kind }, { headers: headers() });
      const list = res.data.products || res.data.services || [];
      setFound(list);
      setPicked(new Set(list.map((_, i) => i)));
      setStep('pick');
    } catch (err) {
      setError(err.response?.data?.msg || "Couldn't read that website. Please check the link.");
      setStep('url');
    }
  };

  const save = async () => {
    setStep('saving');
    try {
      const items = found.filter((_, i) => picked.has(i));
      const res = await axios.post(`${API}/import`, { items, kind }, { headers: headers() });
      const { added, skipped } = res.data;
      toast.success(`${added} ${c.one}${added === 1 ? '' : 's'} added${skipped ? ` (${skipped} already on your card)` : ''}`);
      reset();
      setUrl('');
      onImported();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.msg || `Could not add the ${c.one}s.`);
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
            className="glass flex max-h-[88vh] w-full max-w-lg flex-col rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={c.title}
          >
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white">
                  <Globe className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--surface-text)' }}>{c.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{c.sub}</p>
                </div>
              </div>
              <IconButton variant="ghost" title="Close" onClick={close}>
                <X className="h-5 w-5" />
              </IconButton>
            </div>

            {step === 'url' || step === 'loading' ? (
              <form onSubmit={find} className="space-y-3 p-5">
                <label className="block text-sm font-medium" style={{ color: 'var(--surface-text)' }}>
                  {c.label}
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={c.ph}
                    inputMode="url"
                    autoFocus
                    disabled={step === 'loading'}
                    className="mt-1.5 w-full rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-400"
                    style={field}
                  />
                </label>
                <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{c.tip}</p>
                {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500" role="alert">{error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" onClick={close} style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>Cancel</Button>
                  <GradientButton type="submit" disabled={step === 'loading' || !url.trim()} className="!w-auto px-5">
                    {step === 'loading' ? (<><Loader2 className="h-4 w-4 animate-spin" /><span>Reading your website…</span></>) : <span>{c.find}</span>}
                  </GradientButton>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between px-5 pt-4 text-xs" style={{ color: 'var(--surface-text-2)' }}>
                  <span>Found {found.length} {c.one}{found.length === 1 ? '' : 's'} · {picked.size} selected</span>
                  <button type="button" className="font-semibold text-brand-500 hover:underline" onClick={() => setPicked(picked.size === found.length ? new Set() : new Set(found.map((_, i) => i)))}>
                    {picked.size === found.length ? 'Select none' : 'Select all'}
                  </button>
                </div>
                <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5 pt-3">
                  {found.map((s, i) => {
                    const on = picked.has(i);
                    const pic = s.image || (s.link ? siteShot(s.link) : '');
                    return (
                      <li key={`${s.link}|${i}`}>
                        <button
                          type="button"
                          onClick={() => toggle(i)}
                          aria-pressed={on}
                          className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors"
                          style={{ border: `1px solid ${on ? 'rgb(231 12 101 / .5)' : 'var(--surface-border)'}`, background: on ? 'rgb(231 12 101 / .06)' : 'var(--surface-1)' }}
                        >
                          <span className={`mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-md border ${on ? 'border-brand-500 bg-brand-500 text-white' : ''}`} style={on ? undefined : { borderColor: 'var(--surface-border)' }}>
                            {on && <Check className="h-3.5 w-3.5" />}
                          </span>
                          {pic ? (
                            <img src={pic} alt="" className={`h-12 w-16 shrink-0 rounded-lg ${kind === 'product' ? 'object-contain bg-white' : 'object-cover object-top'}`} loading="lazy" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="grid h-12 w-16 shrink-0 place-items-center rounded-lg" style={{ background: 'var(--surface-2)' }}><ImageIcon className="h-4 w-4" style={{ color: 'var(--surface-text-2)' }} /></span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>
                              {s.title}
                              {s.price ? <span className="ml-2 text-brand-500">₹{s.price}</span> : null}
                            </span>
                            {s.description && <span className="mt-0.5 line-clamp-2 block text-xs" style={{ color: 'var(--surface-text-2)' }}>{s.description}</span>}
                            {s.link && <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-brand-500"><ExternalLink className="h-3 w-3 shrink-0" />{s.link.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="flex justify-between gap-2 p-5 pt-0">
                  <Button variant="ghost" onClick={reset} disabled={step === 'saving'} style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>Other link</Button>
                  <GradientButton onClick={save} disabled={!picked.size || step === 'saving'} loading={step === 'saving'} className="!w-auto px-5">
                    <span>{step === 'saving' ? 'Adding…' : `Add ${picked.size} ${c.one}${picked.size === 1 ? '' : 's'}`}</span>
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
