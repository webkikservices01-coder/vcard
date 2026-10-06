import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon, Mic, ExternalLink, Globe } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import ImportServices from './ImportServices';
import { siteShot } from '../../utils/media';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/products`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const emptyForm = { title: '', description: '', price: '', link: '', coverImage: null };

// One page for both dashboard tabs. Services open the owner's website when tapped on the card,
// so their link is required.
const COPY = {
  product: {
    heading: 'Products', sub: 'Showcase the products you sell on your vCard', one: 'Product', search: 'Search products...',
    empty: 'No products yet. Add your first one.', titlePh: 'Product name', linkLabel: 'Link URL', pricePh: '999', next: '/dashboard/vcard/services',
  },
  service: {
    heading: 'Services', sub: 'List the services you offer. Visitors tap one on your card to open your website.', one: 'Service', search: 'Search services...',
    empty: 'No services yet. Add what you offer, with a link to your website.', titlePh: 'e.g. Website Design, GST Filing, Bridal Makeup', linkLabel: 'Website link *', pricePh: 'Starting 4,999', next: '/dashboard/vcard/portfolio',
  },
};

// Same rule as the server: web addresses only; "site.com" gets https:// added.
const webLink = (v) => {
  const s = String(v || '').trim();
  if (!s) return '';
  try {
    const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : `https://${s.replace(/^\/+/, '')}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
};

const Products = ({ kind = 'product' }) => {
  const copy = COPY[kind];
  const plan = usePlan();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showVoiceFill, setShowVoiceFill] = useState(false);
  const [slug, setSlug] = useState('');

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}?kind=${kind}`, { headers: headers() });
      setItems(res.data);
    } catch { toast.error(`Failed to load ${copy.heading.toLowerCase()}`); }
    finally { setLoading(false); }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
      if (res.data?.username) {
        setSlug(res.data.username);
      }
    } catch (err) {
      console.error('Error fetching user slug', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchUserDetails();

    window.addEventListener('vcard:data-changed', fetchProducts);
    return () => window.removeEventListener('vcard:data-changed', fetchProducts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  const openCreate = () => { setForm(emptyForm); setPreview(''); setEditing(null); setModalOpen(true); };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description, price: item.price, link: item.link, coverImage: null });
    setPreview(getImageUrl(item.coverImage) || '');
    setEditing(item._id);
    setModalOpen(true);
  };

  // Helper to correctly resolve local uploads URL from backend server
  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) return imgPath;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`;
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    const link = webLink(form.link);
    if (kind === 'service' && !link) { toast.error('Please add your website link, e.g. https://yourwebsite.com'); return; }
    if (form.link && !link) { toast.error('Please enter a valid web link starting with https://'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, link }).forEach(([k, v]) => { if (v !== null && k !== 'coverImage') fd.append(k, v); });
      if (!editing) fd.append('kind', kind);
      if (form.coverImage) fd.append('coverImage', form.coverImage);

      if (editing) {
        await axios.put(`${API}/${editing}`, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      }

      setModalOpen(false);
      fetchProducts();
      setShowPopup(true);
      toast.success(`${copy.one} saved successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete this ${copy.one.toLowerCase()}?`)) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: headers() });
      toast.success('Deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.dispatchEvent(new Event('card:preview'));
    } else {
      toast.error('Profile not found! Please create a profile first.');
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate(copy.next);
  };

  const handleVoiceFill = (fields) => {
    setForm(prev => ({
      ...prev,
      title: fields.title ?? prev.title,
      description: fields.description ?? prev.description,
      price: fields.price ?? prev.price,
      link: fields.link ?? prev.link,
    }));
  };

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="space-y-5 relative">

        {/* Hero */}
        <motion.div {...fadeUp(0)} className="relative bg-gradient-to-br from-brand-600 to-rose-600 rounded-2xl px-6 py-5 overflow-hidden">
          <MeshBackground className="opacity-60" />
          <div className="relative">
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">vCard</p>
            <h2 className="text-2xl font-black text-white leading-tight">{copy.heading}</h2>
            <p className="text-sm text-white/70 mt-1">{copy.sub}</p>
          </div>
        </motion.div>

        {/* Search + Add */}
        <motion.div {...fadeUp(0.06)} className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              placeholder={copy.search}
            />
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {(
              <Button
                variant="ghost"
                onClick={() => setShowImport(true)}
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                className="hover:border-brand-500 hover:text-brand-500"
              >
                <Globe className="w-4 h-4" /><span>Import from website</span>
              </Button>
            )}
            <GradientButton onClick={openCreate} className="!w-auto px-5 shrink-0">
              <Plus className="w-4 h-4" /><span>Add {copy.one}</span>
            </GradientButton>
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard {...fadeUp(0.1)} className="p-12 text-center">
            <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
            <p className="text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>{copy.empty}</p>
            <div className="flex flex-wrap justify-center gap-2">
              {(
                <GradientButton onClick={() => setShowImport(true)} className="!w-auto px-6">
                  <Globe className="w-4 h-4" /><span>Import from my website</span>
                </GradientButton>
              )}
              <Button
                variant="ghost"
                onClick={openCreate}
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                className="hover:border-brand-500 hover:text-brand-500"
              >
                <Plus className="w-4 h-4" /><span>Add {copy.one} yourself</span>
              </Button>
            </div>
          </GlassCard>
        ) : (
          <motion.div {...staggerContainer(0.06, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((item) => (
                <GlassCard
                  key={item._id}
                  hover
                  variants={staggerItem}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                  className="p-4 flex flex-col"
                >
                  <div className="aspect-video rounded-xl overflow-hidden mb-3" style={{ background: 'var(--surface-2)' }}>
                    {item.coverImage || item.link ? (
                      // No picture? The card shows a screenshot of the service's page, so preview the same.
                      <img src={getImageUrl(item.coverImage) || siteShot(item.link)} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" style={{ color: 'var(--surface-text-2)' }} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--surface-text)' }}>{item.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2 flex-1" style={{ color: 'var(--surface-text-2)' }}>{item.description || '—'}</p>
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <div className="min-w-0">
                      <span className="text-sm font-black text-brand-500">{item.price ? `₹${item.price}` : '—'}</span>
                      {webLink(item.link) && (
                        <a href={webLink(item.link)} target="_blank" rel="noopener noreferrer" className="mt-0.5 flex items-center gap-1 truncate text-xs hover:text-brand-500" style={{ color: 'var(--surface-text-2)' }}>
                          <ExternalLink className="w-3 h-3 shrink-0" /> <span className="truncate">{webLink(item.link).replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton variant="ghost" title="Edit" onClick={() => openEdit(item)}>
                        <Pencil className="w-4 h-4" />
                      </IconButton>
                      <IconButton variant="danger" title="Delete" onClick={() => handleDelete(item._id)}>
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Product Form Modal (Creation/Editing) */}
        {createPortal(
<AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="glass rounded-2xl w-full max-w-md"
              >
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>{editing ? `Edit ${copy.one}` : `Add ${copy.one}`}</h3>
                  <div className="flex items-center space-x-1">
                    {hasVoiceFill(plan) && (
                      <IconButton
                        variant="ghost"
                        title="Fill with Voice"
                        onClick={() => setShowVoiceFill(true)}
                      >
                        <Mic className="w-4 h-4" />
                      </IconButton>
                    )}
                    <IconButton variant="ghost" title="Close" onClick={() => setModalOpen(false)}>
                      <X className="w-5 h-5" />
                    </IconButton>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Title *</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder={copy.titlePh} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Brief description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Price (₹)</label>
                      <input value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                        placeholder={copy.pricePh} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>{copy.linkLabel}</label>
                      <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                        placeholder="https://yourwebsite.com" inputMode="url" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Cover Image</label>
                    {preview && <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" style={{ border: '1px solid var(--surface-border)' }} />}
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setForm({...form, coverImage: f}); setPreview(URL.createObjectURL(f)); }
                    }} className="w-full text-sm fast-transition file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:text-brand-600 file:text-sm file:font-medium hover:file:bg-brand-500/20" style={{ color: 'var(--surface-text-2)' }} />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    className="hover:border-brand-500 hover:text-brand-500"
                  >
                    Cancel
                  </Button>
                  <GradientButton onClick={handleSave} disabled={saving} loading={saving} className="!w-auto px-6">
                    <span>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</span>
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
 document.body)}
      </div>

      {(
        <ImportServices kind={kind} open={showImport} onClose={() => setShowImport(false)} onImported={fetchProducts} />
      )}

      <ActionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onPreview={handlePreview}
        onNext={handleNext}
      />

      {showVoiceFill && (
        <VoiceFillAssistant
          page="products"
          onFill={handleVoiceFill}
          getKnown={() => ({ title: form.title, description: form.description, price: form.price, link: form.link })}
          onClose={() => setShowVoiceFill(false)}
        />
      )}
    </>
  );
};

export default Products;