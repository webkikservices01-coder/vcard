import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon, Mic } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { usePlan, hasVoiceFill } from '../../utils/plan';

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
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Products & Services</h2>
            <p className="text-sm text-gray-500">Showcase what you offer on your vCard</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                placeholder="Search..." />
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={openCreate}
              className="flex items-center space-x-2 bg-pink-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-pink-700 transition">
              <Plus className="w-4 h-4" /><span>Create</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No products yet. Add your first one.</p>
              <button onClick={openCreate} className="mt-4 bg-pink-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-pink-700">Add Product</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Description</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Price</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {filtered.map((item, idx) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25, delay: idx * 0.04 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          {item.coverImage ? (
                            <img src={item.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-500 truncate max-w-xs">{item.description || '—'}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm font-medium text-gray-900">{item.price ? `₹${item.price}` : '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end space-x-1">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-pink-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Pencil className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Product Form Modal (Creation/Editing) */}
        <AnimatePresence>
          {modalOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h3>
                  <div className="flex items-center space-x-1">
                    {hasVoiceFill(plan) && (
                      <button
                        type="button"
                        onClick={() => setShowVoiceFill(true)}
                        title="Fill with Voice"
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-pink-600"
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                    <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                      placeholder="Product name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none resize-none"
                      placeholder="Brief description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                      <input value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                        placeholder="999" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                      <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                        placeholder="https://..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Image</label>
                    {preview && <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2 border border-gray-200" />}
                    <input type="file" accept="image/*" onChange={e => {
                      const f = e.target.files[0];
                      if (f) { setForm({...form, coverImage: f}); setPreview(URL.createObjectURL(f)); }
                    }} className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:font-medium hover:file:bg-gray-200" />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-0">
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 disabled:opacity-60">
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </motion.button>
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
