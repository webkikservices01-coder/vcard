import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = 'http://localhost:5000/api/gallery';
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ type: 'image', url: '', image: null });
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
    catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

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
      toast.success('Added to gallery');
      setModalOpen(false);
      setForm({ type: 'image', url: '', image: null }); setPreview('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove from gallery?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Removed'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const filtered = items.filter(i => i.type?.toLowerCase().includes(search.toLowerCase()) || i.url?.toLowerCase().includes(search.toLowerCase()));

  const getYoutubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500">Images and videos for your vCard</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Search..." />
          </div>
          <button onClick={() => { setModalOpen(true); setForm({ type: 'image', url: '', image: null }); setPreview(''); }}
            className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /><span>Add</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Gallery is empty. Add images or videos.</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Preview</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">URL</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => {
                  const thumb = item.type === 'video' ? getYoutubeThumbnail(item.url) : item.url;
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.type === 'video' ? 'bg-gray-100 text-gray-700' : 'bg-black text-white'}`}>
                          {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                          <span className="capitalize">{item.type}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {thumb ? <img src={thumb} alt="preview" className="w-16 h-12 object-cover rounded-lg border border-gray-200" onError={e => { e.target.style.display = 'none'; }} /> : <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell"><p className="text-xs text-gray-500 truncate max-w-xs">{item.url}</p></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold">Add to Gallery</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {['image', 'video'].map(t => (
                    <button key={t} onClick={() => setForm({...form, type: t})}
                      className={`py-2.5 rounded-lg border text-sm font-medium transition capitalize ${form.type === t ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                      {t === 'image' ? '🖼️' : '🎬'} {t}
                    </button>
                  ))}
                </div>
              </div>
              {form.type === 'image' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Image</label>
                  {preview && <img src={preview} alt="preview" className="w-full h-36 object-cover rounded-lg mb-2 border border-gray-200" />}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, image: f}); setPreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:font-medium" />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">YouTube URL</label>
                  <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="https://youtube.com/watch?v=..." />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-6 pt-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">{saving ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
