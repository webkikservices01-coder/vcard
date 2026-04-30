import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'https://vcard-backend-uuq6.onrender.com/api/products';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const emptyForm = { title: '', description: '', price: '', link: '', coverImage: null };

const Products = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try {
      const res = await axios.get(API, { headers: headers() });
      setItems(res.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

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
        toast.success('Product updated');
      } else {
        await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      }
      setModalOpen(false);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`${API}/${id}`, { headers: headers() });
      toast.success('Deleted');
      fetch();
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products & Services</h2>
          <p className="text-sm text-gray-500">Showcase what you offer on your vCard</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="Search..." />
          </div>
          <button onClick={openCreate}
            className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /><span>Create</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No products yet. Add your first one.</p>
            <button onClick={openCreate} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Add Product</button>
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
              {filtered.map(item => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
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
                      <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                  placeholder="Product name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none"
                  placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₹)</label>
                  <input value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                    placeholder="999" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Link URL</label>
                  <input value={form.link} onChange={e => setForm({...form, link: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
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
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
