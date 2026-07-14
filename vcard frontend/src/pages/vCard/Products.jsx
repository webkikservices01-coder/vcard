import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon, Mic } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/products`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const emptyForm = { title: '', description: '', price: '', link: '', coverImage: null };

const Products = () => {
  const plan = usePlan();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
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
      const res = await axios.get(API, { headers: headers() });
      setItems(res.data);
    } catch { toast.error('Failed to load products'); }
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
  }, []);

  const openCreate = () => { setForm(emptyForm); setPreview(''); setEditing(null); setModalOpen(true); };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description, price: item.price, link: item.link, coverImage: null });
    setPreview(item.coverImage || '');
    setEditing(item._id);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && k !== 'coverImage') fd.append(k, v); });
      if (form.coverImage) fd.append('coverImage', form.coverImage);

      if (editing) {
        await axios.put(`${API}/${editing}`, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      }

      setModalOpen(false);
      fetchProducts();
      setShowPopup(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: headers() });
      toast.success('Deleted');
      fetchProducts();
    } catch { toast.error('Failed to delete'); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.open(`/c/${slug}`, '_blank');
    } else {
      toast.error('Profile not found! Please create a profile first.');
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/portfolio');
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
            <h2 className="text-2xl font-black text-white leading-tight">Products &amp; Services</h2>
            <p className="text-sm text-white/70 mt-1">Showcase what you offer on your vCard</p>
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
              placeholder="Search products..."
            />
          </div>
          <GradientButton onClick={openCreate} className="!w-auto px-5 shrink-0">
            <Plus className="w-4 h-4" /><span>Add Product</span>
          </GradientButton>
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
            <p className="text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>No products yet. Add your first one.</p>
            <GradientButton onClick={openCreate} className="!w-auto px-6 mx-auto">
              <Plus className="w-4 h-4" /><span>Add Product</span>
            </GradientButton>
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
                    {item.coverImage ? (
                      <img src={item.coverImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" style={{ color: 'var(--surface-text-2)' }} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--surface-text)' }}>{item.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2 flex-1" style={{ color: 'var(--surface-text-2)' }}>{item.description || '—'}</p>
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <span className="text-sm font-black text-brand-500">{item.price ? `₹${item.price}` : '—'}</span>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => openEdit(item)}
                        className="p-2 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition"
                        style={{ color: 'var(--surface-text-2)' }}
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 fast-transition"
                        style={{ color: 'var(--surface-text-2)' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Product Form Modal (Creation/Editing) */}
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
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>{editing ? 'Edit Product' : 'Add Product'}</h3>
                  <div className="flex items-center space-x-1">
                    {hasVoiceFill(plan) && (
                      <button
                        type="button"
                        onClick={() => setShowVoiceFill(true)}
                        title="Fill with Voice"
                        className="p-2 rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition"
                        style={{ color: 'var(--surface-text-2)' }}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setModalOpen(false)}
                      className="p-2 rounded-lg hover:bg-brand-500/10 fast-transition"
                      style={{ color: 'var(--surface-text-2)' }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Title *</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Product name" />
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
                        placeholder="999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Link URL</label>
                      <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                        placeholder="https://..." />
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
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium hover:border-brand-500 hover:text-brand-500 fast-transition"
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  >
                    Cancel
                  </button>
                  <GradientButton onClick={handleSave} disabled={saving} loading={saving} className="!w-auto px-6">
                    <span>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</span>
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
