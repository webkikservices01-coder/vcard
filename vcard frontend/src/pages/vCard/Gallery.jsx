import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Search, X, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/gallery`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const Gallery = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'image', url: '', image: null });
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchGallery = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
    catch { toast.error('Failed to load gallery'); }
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
    fetchGallery();
    fetchUserDetails();
  }, []);

  const handleSave = async () => {
    if (form.type === 'video' && !form.url) { toast.error('Video URL is required'); return; }
    if (form.type === 'image' && !form.image) { toast.error('Please select an image'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', form.type);
      if (form.type === 'video') fd.append('url', form.url);
      if (form.type === 'image' && form.image) fd.append('image', form.image);

      await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });

      setModalOpen(false);
      setForm({ type: 'image', url: '', image: null });
      setPreview('');
      fetchGallery();
      setShowPopup(true);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from gallery?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Removed'); fetchGallery(); }
    catch { toast.error('Failed to delete'); }
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
    navigate('/dashboard/vcard/testimonials');
  };

  const filtered = items.filter(i => i.type?.toLowerCase().includes(search.toLowerCase()) || i.url?.toLowerCase().includes(search.toLowerCase()));

  const getYoutubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
  };

  return (
    <>
      <div className="space-y-5 relative">

        {/* Hero */}
        <motion.div {...fadeUp(0)} className="relative bg-gradient-to-br from-brand-600 to-rose-600 rounded-2xl px-6 py-5 overflow-hidden">
          <MeshBackground className="opacity-60" />
          <div className="relative">
            <p className="text-xs text-white/60 mb-1 uppercase tracking-wider">vCard</p>
            <h2 className="text-2xl font-black text-white leading-tight">Gallery</h2>
            <p className="text-sm text-white/70 mt-1">Images and videos for your vCard</p>
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
              placeholder="Search..."
            />
          </div>
          <GradientButton
            onClick={() => { setModalOpen(true); setForm({ type: 'image', url: '', image: null }); setPreview(''); }}
            className="!w-auto px-5 shrink-0"
          >
            <Plus className="w-4 h-4" /><span>Add</span>
          </GradientButton>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <GlassCard {...fadeUp(0.1)} className="p-12 text-center">
            <ImageIcon className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Gallery is empty. Add images or videos.</p>
          </GlassCard>
        ) : (
          <motion.div {...staggerContainer(0.05, 0.1)} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item) => {
                const thumb = item.type === 'video' ? getYoutubeThumbnail(item.url) : item.url;
                return (
                  <GlassCard
                    key={item._id}
                    hover
                    variants={staggerItem}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                    className="p-2.5 flex flex-col group"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden relative" style={{ background: 'var(--surface-2)' }}>
                      {thumb ? (
                        <img
                          src={thumb} alt="preview" className="w-full h-full object-cover"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6" style={{ color: 'var(--surface-text-2)' }} />
                        </div>
                      )}
                      <div className={`absolute top-1.5 left-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.type === 'video' ? 'bg-black/60 text-white' : 'bg-brand-600 text-white'}`}>
                        {item.type === 'video' ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                        <span className="capitalize">{item.type}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(item._id)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 fast-transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                    <p className="text-[11px] mt-1.5 px-0.5 truncate" style={{ color: 'var(--surface-text-2)' }}>{item.url || '—'}</p>
                  </GlassCard>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Modal for adding content */}
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
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>Add to Gallery</h3>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 rounded-lg hover:bg-brand-500/10 fast-transition"
                    style={{ color: 'var(--surface-text-2)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surface-text)' }}>Content Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['image', 'video'].map(t => (
                        <motion.button
                          key={t}
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setForm({...form, type: t})}
                          className={`py-2.5 rounded-lg text-sm font-medium capitalize fast-transition ${
                            form.type === t
                              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white border border-transparent'
                              : 'hover:border-brand-500 hover:text-brand-500'
                          }`}
                          style={form.type !== t ? { border: '1px solid var(--surface-border)', color: 'var(--surface-text-2)' } : undefined}
                        >
                          {t === 'image' ? '🖼️' : '🎬'} {t}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  {form.type === 'image' ? (
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Upload Image</label>
                      {preview && <img src={preview} alt="preview" className="w-full h-36 object-cover rounded-lg mb-2" style={{ border: '1px solid var(--surface-border)' }} />}
                      <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, image: f}); setPreview(URL.createObjectURL(f)); } }}
                        className="w-full text-sm fast-transition file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:text-brand-600 file:text-sm file:font-medium hover:file:bg-brand-500/20"
                        style={{ color: 'var(--surface-text-2)' }} />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>YouTube URL</label>
                      <input value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                        placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  )}
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
                    <span>{saving ? 'Adding...' : 'Add'}</span>
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
    </>
  );
};

export default Gallery;
