import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/testimonials`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { name: '', review: '', rating: 5, photo: null };

const StarRating = ({ value, onChange }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map(n => (
      <motion.button key={n} type="button" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => onChange(n)}
        className={`text-2xl fast-transition ${n <= value ? 'text-brand-500' : ''}`}
        style={n > value ? { color: 'var(--surface-text-2)', opacity: 0.35 } : undefined}>
        ★
      </motion.button>
    ))}
  </div>
);

const Testimonials = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
    catch { toast.error('Failed to load testimonials'); }
    finally { setLoading(false); }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
      if (res.data?.username) setSlug(res.data.username);
    } catch (err) { console.error('Error fetching slug', err); }
  };

  useEffect(() => {
    fetch();
    fetchUserDetails();
  }, []);

  const openCreate = () => { setForm(emptyForm); setPhotoPreview(''); setEditing(null); setModalOpen(true); };
  const openEdit = (item) => {
    setForm({ name: item.name, review: item.review, rating: item.rating, photo: null });
    setPhotoPreview(item.photo || '');
    setEditing(item._id); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.review) { toast.error('Name and review are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('review', form.review); fd.append('rating', form.rating);
      if (form.photo) fd.append('photo', form.photo);

      if (editing) { await axios.put(`${API}/${editing}`, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } }); }
      else { await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } }); }

      setModalOpen(false);
      fetch();
      setShowPopup(true);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) window.open(`/c/${slug}`, '_blank');
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/custom');
  };

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.review?.toLowerCase().includes(search.toLowerCase()));

  const Stars = ({ n }) => (
    <span className="text-sm tracking-tighter">
      <span className="text-brand-500">{'★'.repeat(n)}</span>
      <span style={{ color: 'var(--surface-text-2)', opacity: 0.4 }}>{'☆'.repeat(5 - n)}</span>
    </span>
  );

  return (
    <>
      <div className="space-y-5">
        <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl">
          <MeshBackground className="opacity-40" />
          <div className="relative flex flex-wrap items-center justify-between gap-3 py-1">
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Testimonials</h2>
              <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Customer reviews and feedback</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  placeholder="Search..."
                />
              </div>
              <GradientButton onClick={openCreate} className="!w-auto !py-2.5 !px-4 shrink-0">
                <Plus className="w-4 h-4" /><span>Add</span>
              </GradientButton>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div {...fadeUp(0.08)} className="text-center py-16 rounded-2xl" style={{ border: '2px dashed var(--surface-border)' }}>
            <Star className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--surface-text-2)' }}>No testimonials yet.</p>
            <p className="text-xs mb-4" style={{ color: 'var(--surface-text-2)', opacity: 0.8 }}>Collect and showcase customer feedback</p>
            <Button variant="primary" onClick={openCreate} className="!w-auto" leftIcon={<Plus className="w-4 h-4" />}>
              Add Testimonial
            </Button>
          </motion.div>
        ) : (
          <motion.div {...staggerContainer(0.06, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((item) => (
                <GlassCard key={item._id} variants={staggerItem} exit={{ opacity: 0, scale: 0.94 }} hover className="p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    {item.photo
                      ? <img src={item.photo} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--surface-border)' }} />
                      : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white text-sm font-bold shrink-0">{item.name?.[0]?.toUpperCase()}</div>}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--surface-text)' }}>{item.name}</p>
                      <Stars n={item.rating || 5} />
                    </div>
                  </div>
                  <p className="text-sm flex-1" style={{ color: 'var(--surface-text-2)' }}>{item.review}</p>
                  <div className="flex items-center justify-end gap-1 mt-4 pt-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <IconButton variant="ghost" title="Edit" onClick={() => openEdit(item)}>
                      <Pencil className="w-4 h-4" />
                    </IconButton>
                    <IconButton variant="danger" title="Delete" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="rounded-2xl w-full max-w-md shadow-2xl"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}
              >
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                  <IconButton variant="ghost" title="Close" onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></IconButton>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Customer name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Review *</label>
                    <textarea value={form.review} onChange={e => setForm({...form, review: e.target.value})} rows={3}
                      className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="What they said..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surface-text)' }}>Rating</label>
                    <StarRating value={form.rating} onChange={r => setForm({...form, rating: r})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Photo</label>
                    {photoPreview && <img src={photoPreview} alt="preview" className="w-16 h-16 object-cover rounded-full mb-2" style={{ border: '1px solid var(--surface-border)' }} />}
                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, photo: f}); setPhotoPreview(URL.createObjectURL(f)); } }}
                      className="w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium fast-transition"
                      style={{ color: 'var(--surface-text-2)' }} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    className="hover:border-brand-500 hover:text-brand-500"
                  >
                    Cancel
                  </Button>
                  <div className="flex-1 max-w-[160px]">
                    <GradientButton onClick={handleSave} disabled={saving} loading={saving} className="!py-2.5">
                      <span>{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</span>
                    </GradientButton>
                  </div>
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

export default Testimonials;
