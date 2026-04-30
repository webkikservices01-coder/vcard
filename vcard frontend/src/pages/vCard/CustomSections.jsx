import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Layout } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'https://vcard-backend-uuq6.onrender.com/api/custom-sections';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { title: '', content: '' };

const CustomSections = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
    catch { toast.error('Failed to load sections'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };
  const openEdit = (item) => { setForm({ title: item.title, content: item.content }); setEditing(item._id); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      if (editing) { await axios.put(`${API}/${editing}`, form, { headers: headers() }); toast.success('Updated'); }
      else { await axios.post(API, form, { headers: headers() }); toast.success('Section created'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Custom Sections</h2>
          <p className="text-sm text-gray-500">Add custom HTML content blocks to your vCard</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Search..." />
          </div>
          <button onClick={openCreate} className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /><span>Create</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Layout className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No custom sections yet.</p>
            <button onClick={openCreate} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Create Section</button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Content Preview</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((item, idx) => (
                <tr key={item._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.title}</td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-gray-500 truncate max-w-sm" dangerouslySetInnerHTML={{ __html: item.content?.substring(0, 100) + '...' }} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">{editing ? 'Edit Section' : 'Create Section'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Section Title *</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="e.g., About My Work" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content (HTML allowed) *</label>
                <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none font-mono"
                  placeholder="<p>Your custom HTML content here...</p>" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 pt-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSections;
