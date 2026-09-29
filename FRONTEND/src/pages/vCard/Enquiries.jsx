import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Inbox, Search, Trash2, Phone, Mail, MessageCircle, ExternalLink, RefreshCw } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import MeshBackground from '../../components/ui/MeshBackground';
import IconButton from '../../components/ui/IconButton';
import { fadeUp } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/vcard`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const when = (d) => {
  const t = new Date(d);
  const mins = Math.round((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return t.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const waLink = (mobile) => {
  const d = (mobile || '').replace(/[^0-9]/g, '');
  if (!d) return '';
  return `https://wa.me/${d.length === 10 ? '91' + d : d}`;
};

// Messages sent from the contact form on the owner's public card.
const Enquiries = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [slug, setSlug] = useState('');

  const load = async (quiet) => {
    try {
      const { data } = await axios.get(`${API}/enquiries`, { headers: headers() });
      setItems(data);
    } catch {
      if (!quiet) toast.error('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    axios.get(`${API}/me`, { headers: headers() }).then(({ data }) => setSlug(data.username || '')).catch(() => {});
    const t = setInterval(() => load(true), 30000);
    return () => clearInterval(t);
  }, []);

  const setRead = async (item, read) => {
    setItems((list) => list.map((x) => (x._id === item._id ? { ...x, read } : x)));
    try {
      await axios.patch(`${API}/enquiries/${item._id}`, { read }, { headers: headers() });
    } catch {
      setItems((list) => list.map((x) => (x._id === item._id ? { ...x, read: item.read } : x)));
    }
  };

  const open = (item) => {
    setOpenId(openId === item._id ? null : item._id);
    if (!item.read) setRead(item, true);
  };

  const remove = async (item) => {
    if (!window.confirm(`Delete the enquiry from ${item.name}?`)) return;
    try {
      await axios.delete(`${API}/enquiries/${item._id}`, { headers: headers() });
      setItems((list) => list.filter((x) => x._id !== item._id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const unread = items.filter((i) => !i.read).length;
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === 'all' || (filter === 'unread' ? !i.read : i.read)) &&
        (!q || [i.name, i.email, i.mobile, i.message].some((v) => (v || '').toLowerCase().includes(q)))
    );
  }, [items, search, filter]);

  return (
    <div className="space-y-5 relative">
      <motion.div {...fadeUp(0)} className="relative bg-gradient-to-br from-brand-600 to-rose-600 rounded-2xl px-6 py-5 overflow-hidden">
        <MeshBackground className="opacity-60" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">vCard</p>
            <h2 className="text-2xl font-black text-white leading-tight">Enquiries</h2>
            <p className="text-sm text-white/70 mt-1">Messages visitors send from the contact form on your card</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-3xl font-black text-white leading-none">{items.length}</p>
            <p className="text-[11px] text-white/70 mt-1">{unread ? `${unread} unread` : 'all read'}</p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
            placeholder="Search name, phone, message…"
          />
        </div>
        <div className="flex rounded-lg p-1 gap-1" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
          {[
            ['all', 'All'],
            ['unread', `Unread${unread ? ` (${unread})` : ''}`],
            ['read', 'Read'],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${filter === k ? 'bg-brand-600 text-white' : ''}`}
              style={filter === k ? undefined : { color: 'var(--surface-text-2)' }}
            >
              {label}
            </button>
          ))}
        </div>
        <IconButton variant="ghost" title="Refresh" onClick={() => load()}>
          <RefreshCw className="w-4 h-4" />
        </IconButton>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <GlassCard {...fadeUp(0.1)} className="p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--surface-text)' }}>
            {items.length ? 'No enquiries match this filter.' : 'No enquiries yet.'}
          </p>
          {!items.length && (
            <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--surface-text-2)' }}>
              When someone fills the contact form on your card, their message shows up here (and is emailed to you if an enquiry email is set in Advanced settings).
            </p>
          )}
          {!items.length && slug && (
            <a href={`/${slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-brand-600 hover:underline">
              Open my card <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {shown.map((item) => {
              const isOpen = openId === item._id;
              const wa = waLink(item.mobile);
              return (
                <motion.div key={item._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <GlassCard className="p-4 sm:p-5">
                    <button type="button" onClick={() => open(item)} className="w-full text-left cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-sm font-bold">
                          {(item.name || '?').charAt(0).toUpperCase()}
                          {!item.read && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm truncate ${item.read ? 'font-semibold' : 'font-black'}`} style={{ color: 'var(--surface-text)' }}>
                              {item.name}
                            </p>
                            <span className="text-[11px] shrink-0" style={{ color: 'var(--surface-text-2)' }}>{when(item.createdAt)}</span>
                          </div>
                          <p className="text-xs truncate" style={{ color: 'var(--surface-text-2)' }}>
                            {[item.mobile, item.email].filter(Boolean).join(' · ') || 'No contact details given'}
                          </p>
                          <p className={`text-sm mt-1.5 ${isOpen ? 'whitespace-pre-wrap' : 'line-clamp-2'}`} style={{ color: 'var(--surface-text)' }}>
                            {item.message}
                          </p>
                        </div>
                      </div>
                    </button>
                    {isOpen && (
                      <div className="mt-4 pt-3 flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid var(--surface-border)' }}>
                        {wa && (
                          <a href={`${wa}?text=${encodeURIComponent(`Hi ${item.name}, thanks for reaching out!`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700">
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        )}
                        {item.mobile && (
                          <a href={`tel:${item.mobile.replace(/[^0-9+]/g, '')}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                        )}
                        {item.email && (
                          <a href={`mailto:${item.email}?subject=${encodeURIComponent('Re: your enquiry')}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold" style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                            <Mail className="w-3.5 h-3.5" /> Email
                          </a>
                        )}
                        <div className="flex-1" />
                        <button type="button" onClick={() => setRead(item, !item.read)} className="text-xs font-semibold hover:underline cursor-pointer" style={{ color: 'var(--surface-text-2)' }}>
                          Mark as {item.read ? 'unread' : 'read'}
                        </button>
                        <IconButton variant="danger" title="Delete" onClick={() => remove(item)}>
                          <Trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
