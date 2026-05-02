// import React, { useState, useEffect } from 'react';
// import { Plus, Pencil, Trash2, Search, X, Star } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const API = `${import.meta.env.VITE_API_URL}/api/testimonials`;
// const token = () => localStorage.getItem('token');
// const headers = () => ({ 'x-auth-token': token() });
// const emptyForm = { name: '', review: '', rating: 5, photo: null };

// const StarRating = ({ value, onChange }) => (
//   <div className="flex space-x-1">
//     {[1, 2, 3, 4, 5].map(n => (
//       <button key={n} type="button" onClick={() => onChange(n)}
//         className={`text-2xl transition-transform hover:scale-110 ${n <= value ? 'text-black' : 'text-gray-300'}`}>
//         ★
//       </button>
//     ))}
//   </div>
// );

// const Testimonials = () => {
//   const [items, setItems] = useState([]);
//   const [search, setSearch] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState(emptyForm);
//   const [photoPreview, setPhotoPreview] = useState('');
//   const [saving, setSaving] = useState(false);

//   const fetch = async () => {
//     try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
//     catch { toast.error('Failed to load testimonials'); }
//     finally { setLoading(false); }
//   };

//   useEffect(() => { fetch(); }, []);

//   const openCreate = () => { setForm(emptyForm); setPhotoPreview(''); setEditing(null); setModalOpen(true); };
//   const openEdit = (item) => {
//     setForm({ name: item.name, review: item.review, rating: item.rating, photo: null });
//     setPhotoPreview(item.photo || '');
//     setEditing(item._id); setModalOpen(true);
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.review) { toast.error('Name and review are required'); return; }
//     setSaving(true);
//     try {
//       const fd = new FormData();
//       fd.append('name', form.name); fd.append('review', form.review); fd.append('rating', form.rating);
//       if (form.photo) fd.append('photo', form.photo);
//       if (editing) { await axios.put(`${API}/${editing}`, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } }); toast.success('Updated'); }
//       else { await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } }); toast.success('Added'); }
//       setModalOpen(false); fetch();
//     } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
//     finally { setSaving(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this testimonial?')) return;
//     try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
//     catch { toast.error('Failed to delete'); }
//   };

//   const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.review?.toLowerCase().includes(search.toLowerCase()));

//   const Stars = ({ n }) => (
//     <span className="text-black text-sm tracking-tighter">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
//   );

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl font-bold text-gray-900">Testimonials</h2>
//           <p className="text-sm text-gray-500">Customer reviews and feedback</p>
//         </div>
//         <div className="flex items-center space-x-3">
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//             <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Search..." />
//           </div>
//           <button onClick={openCreate} className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
//             <Plus className="w-4 h-4" /><span>Add</span>
//           </button>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
//         {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
//         : filtered.length === 0 ? (
//           <div className="p-12 text-center">
//             <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//             <p className="text-gray-500 text-sm">No testimonials yet.</p>
//             <button onClick={openCreate} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Add Testimonial</button>
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Person</th>
//                 <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Review</th>
//                 <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
//                 <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filtered.map(item => (
//                 <tr key={item._id} className="hover:bg-gray-50 transition">
//                   <td className="px-5 py-4">
//                     <div className="flex items-center space-x-3">
//                       {item.photo ? <img src={item.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
//                         : <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">{item.name?.[0]?.toUpperCase()}</div>}
//                       <p className="text-sm font-medium text-gray-900">{item.name}</p>
//                     </div>
//                   </td>
//                   <td className="px-5 py-4 hidden md:table-cell"><p className="text-sm text-gray-500 truncate max-w-xs">{item.review}</p></td>
//                   <td className="px-5 py-4"><Stars n={item.rating || 5} /></td>
//                   <td className="px-5 py-4">
//                     <div className="flex items-center justify-end space-x-1">
//                       <button onClick={() => openEdit(item)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4" /></button>
//                       <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {modalOpen && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
//             <div className="flex items-center justify-between p-6 border-b border-gray-200">
//               <h3 className="text-lg font-bold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
//               <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
//             </div>
//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
//                 <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Customer name" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Review *</label>
//                 <textarea value={form.review} onChange={e => setForm({...form, review: e.target.value})} rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none" placeholder="What they said..." />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
//                 <StarRating value={form.rating} onChange={r => setForm({...form, rating: r})} />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
//                 {photoPreview && <img src={photoPreview} alt="preview" className="w-16 h-16 object-cover rounded-full mb-2 border border-gray-200" />}
//                 <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, photo: f}); setPhotoPreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:font-medium" />
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3 p-6 pt-0">
//               <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
//               <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Testimonials;





import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X, Star } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// STEP 1: Router aur ActionPopup import
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';

const API = `${import.meta.env.VITE_API_URL}/api/testimonials`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { name: '', review: '', rating: 5, photo: null };

const StarRating = ({ value, onChange }) => (
  <div className="flex space-x-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)}
        className={`text-2xl transition-transform hover:scale-110 ${n <= value ? 'text-black' : 'text-gray-300'}`}>
        ★
      </button>
    ))}
  </div>
);

const Testimonials = () => {
  // STEP 2: Navigate aur Popup States
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

  // STEP 3: Preview link ke liye slug fetch karna
  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
      if (res.data?.username) setSlug(res.data.username);
    } catch (err) { console.error("Error fetching slug", err); }
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
      // STEP 4: Success par Action Popup trigger
      setShowPopup(true);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  // STEP 5: Preview aur Next function
  const handlePreview = () => {
    setShowPopup(false);
    if (slug) window.open(`/c/${slug}`, '_blank');
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/custom'); // Agla route
  };

  const filtered = items.filter(i => i.name?.toLowerCase().includes(search.toLowerCase()) || i.review?.toLowerCase().includes(search.toLowerCase()));

  const Stars = ({ n }) => (
    <span className="text-black text-sm tracking-tighter">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
  );

  return (
    <>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Testimonials</h2>
            <p className="text-sm text-gray-500">Customer reviews and feedback</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Search..." />
            </div>
            <button onClick={openCreate} className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              <Plus className="w-4 h-4" /><span>Add</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No testimonials yet.</p>
              <button onClick={openCreate} className="mt-4 bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">Add Testimonial</button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Person</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Review</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Rating</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        {item.photo ? <img src={item.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          : <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold">{item.name?.[0]?.toUpperCase()}</div>}
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell"><p className="text-sm text-gray-500 truncate max-w-xs">{item.review}</p></td>
                    <td className="px-5 py-4"><Stars n={item.rating || 5} /></td>
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
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold">{editing ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Customer name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Review *</label>
                  <textarea value={form.review} onChange={e => setForm({...form, review: e.target.value})} rows={3} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none resize-none" placeholder="What they said..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <StarRating value={form.rating} onChange={r => setForm({...form, rating: r})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Photo</label>
                  {photoPreview && <img src={photoPreview} alt="preview" className="w-16 h-16 object-cover rounded-full mb-2 border border-gray-200" />}
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, photo: f}); setPhotoPreview(URL.createObjectURL(f)); } }} className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 file:text-sm file:font-medium" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 p-6 pt-0">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-60">{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
              </div>
            </div>
          </div>
        )}
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