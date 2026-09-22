import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Layout, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';
import { useTheme } from '../../context/ThemeContext';

const API = `${import.meta.env.VITE_API_URL}/api/custom-sections`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { title: '', content: '' };

// Shadow DOM component with automatic light/dark theme text color support
const SafeHtml = ({ html, textColor }) => {
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (containerRef.current) {
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) shadow = containerRef.current.attachShadow({ mode: 'open' });

      // Fallback text color depending on global theme if textColor is not explicitly provided
      const defaultColor = textColor || (isDark ? '#e2e8f0' : '#1e293b');

      shadow.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: inherit;
            color: ${defaultColor};
          }
          p, span, div, h1, h2, h3, h4, h5, h6, li {
            color: inherit;
          }
        </style>
        <div>${html || '<p style="opacity: 0.5; text-align: center; font-style: italic;">Your custom HTML content will appear here...</p>'}</div>
      `;
    }
  }, [html, textColor, isDark]);

  return <div ref={containerRef} className="w-full text-xs leading-relaxed break-words" />;
};

const CustomSections = () => {
  const navigate = useNavigate();
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [previewData, setPreviewData] = useState(null);

  const fetchItems = async () => {
    try { const res = await axios.get(API, { headers: headers() }); setItems(res.data); }
    catch { toast.error('Failed to load sections'); }
    finally { setLoading(false); }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
      if (res.data?.username) {
        setSlug(res.data.username);
        const resPublic = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/public/${res.data.username}`);
        setPreviewData(resPublic.data);
      }
    } catch (err) { console.error('Error fetching slug', err); }
  };

  useEffect(() => {
    fetchItems();
    fetchUserDetails();
  }, []);

  const openCreate = () => { setForm(emptyForm); setEditing(null); setFormOpen(true); };
  const openEdit = (item) => { setForm({ title: item.title, content: item.content }); setEditing(item._id); setFormOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.content) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      if (editing) { await axios.put(`${API}/${editing}`, form, { headers: headers() }); }
      else { await axios.post(API, form, { headers: headers() }); }

      setFormOpen(false);
      fetchItems();
      setShowPopup(true);
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetchItems(); }
    catch { toast.error('Failed to delete'); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) window.open(`/c/${slug}`, '_blank');
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/reorder');
  };

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()));

  const info = previewData?.card?.personalInfo || {};
  const s = previewData?.card?.customTheme || {
    bg: '#0b1329', sectionBg: '#121b33', nameColor: '#ffffff',
    designationColor: '#ff80ab', border: 'rgba(255,255,255,0.15)', contactBg: '#1e293b', contactText: '#fff'
  };

  let profilePicUrl = info.profilePic || '';
  if (profilePicUrl && !profilePicUrl.startsWith('http') && !profilePicUrl.startsWith('blob:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    profilePicUrl = `${apiUrl}${profilePicUrl.startsWith('/') ? profilePicUrl : '/' + profilePicUrl}`;
  }

  let bannerUrl = info.bannerImage || '';
  if (bannerUrl && !bannerUrl.startsWith('http') && !bannerUrl.startsWith('blob:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    bannerUrl = `${apiUrl}${bannerUrl.startsWith('/') ? bannerUrl : '/' + bannerUrl}`;
  }

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start relative">

        {/* LEFT COLUMN: Editor & List */}
        <div className="flex-1 w-full max-w-lg space-y-6">
          <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl border border-white/15 bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44]">
            <MeshBackground className="opacity-30" />
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Modular Matrix
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">Custom Sections</h2>
                <p className="text-xs sm:text-sm mt-1 text-pink-100 font-medium">Add custom HTML & CSS content blocks to your digital vCard</p>
              </div>
              {!formOpen && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full sm:w-44 pl-9 pr-4 py-2 rounded-xl text-xs outline-none border border-white/20 bg-white/15 text-white placeholder:text-slate-300 focus:ring-2 focus:ring-[#E70C65] transition-all font-medium"
                      placeholder="Search..."
                    />
                  </div>
                  <div className="w-28 shrink-0">
                    <GradientButton onClick={openCreate} className="py-2! text-xs font-bold shadow-lg">
                      <Plus className="w-4 h-4" /><span>Create</span>
                    </GradientButton>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {formOpen ? (
              <GlassCard
                key="form"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border shadow-2xl backdrop-blur-2xl"
                style={{
                  background: isDark ? 'rgba(11, 15, 25, 0.75)' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(231, 12, 101, 0.2)',
                }}
              >
                <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>
                  <h3 className="text-base font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{editing ? 'Edit Custom Section' : 'Create Custom Section'}</h3>
                  <IconButton
                    variant="solid"
                    title="Close"
                    onClick={() => setFormOpen(false)}
                    className="bg-white/10 text-slate-700 dark:text-white hover:bg-[#E70C65]/30 hover:text-[#ff80ab]"
                  >
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>Section Title *</label>
                    <input
                      value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm outline-none border transition-all font-medium"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                        color: isDark ? '#ffffff' : '#0f172a'
                      }}
                      placeholder="e.g., About My Work" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 flex justify-between" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
                      <span>Content (HTML/CSS allowed) *</span>
                      <span className="text-xs text-[#E70C65] font-bold">Live Previewing 👉</span>
                    </label>
                    <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={10}
                      className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm outline-none resize-none font-mono border transition-all"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                        borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                        color: isDark ? '#ffffff' : '#0f172a'
                      }}
                      placeholder={`<style>\n  .my-text { color: #E70C65; }\n</style>\n<h1 class="my-text">Hello World</h1>`} />
                    <p className="text-[11px] mt-2 font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Note: CSS written here is isolated inside Shadow DOM and will not break site styles.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setFormOpen(false)}
                    className="border text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1' }}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={saving} className="!w-auto px-6 font-bold shadow-lg shadow-[#E70C65]/30">
                    {saving ? 'Saving...' : editing ? 'Update Section' : 'Create Section'}
                  </Button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard
                key="table"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border shadow-xl backdrop-blur-2xl"
                style={{
                  background: isDark ? 'rgba(11, 15, 25, 0.75)' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(231, 12, 101, 0.2)',
                }}
              >
                {loading ? <div className="p-8 text-center text-sm font-bold" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Loading Sections...</div>
                : filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <Layout className="w-10 h-10 mx-auto mb-3 text-slate-400 opacity-50" />
                    <p className="text-sm font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>No custom sections created yet.</p>
                    <Button variant="primary" onClick={openCreate} className="!w-auto mt-4 font-bold shadow-lg shadow-[#E70C65]/30">Create First Section</Button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>#</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Title</th>
                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase hidden md:table-cell" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Preview</th>
                        <th className="px-5 py-3.5 text-right text-xs font-bold uppercase" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.04 }}
                          className="transition-colors"
                          style={{ borderTop: idx === 0 ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}` }}
                        >
                          <td className="px-5 py-4 text-xs font-mono" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{idx + 1}</td>
                          <td className="px-5 py-4 text-sm font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>{item.title}</td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-xs truncate max-w-[150px] font-mono" style={{ color: isDark ? '#cbd5e1' : '#475569' }}>{item.content?.replace(/<[^>]*>?/gm, '').substring(0, 45)}...</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end space-x-1.5">
                              <IconButton variant="ghost" title="Edit" onClick={() => openEdit(item)} className="text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"><Pencil className="w-4 h-4" /></IconButton>
                              <IconButton variant="danger" title="Delete" onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-500/20"><Trash2 className="w-4 h-4" /></IconButton>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </GlassCard>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: Live Mobile Preview with Lighting & Glow Animation */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="hidden lg:flex w-[360px] shrink-0 sticky top-6 justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-3 rounded-[3.5rem] bg-gradient-to-tr from-[#E70C65]/50 via-indigo-500/35 to-pink-500/40 blur-2xl opacity-75 animate-pulse pointer-events-none" />

            <div className="w-[330px] h-[660px] border-[10px] border-slate-900 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative bg-slate-950 overflow-hidden flex flex-col z-10">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-50 flex items-center justify-center">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
              </div>

              <div
                className="w-full h-full overflow-y-auto pb-10 scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
                style={{ background: s.bg || '#0b1329' }}
              >
                <div className="h-32 w-full relative bg-slate-900">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#E70C65]/40 to-indigo-600/40" />
                  )}
                </div>

                <div className="flex justify-center -mt-10 relative z-10">
                  <div className="w-20 h-20 rounded-2xl border-2 p-0.5 shadow-xl overflow-hidden backdrop-blur-md" style={{ borderColor: '#facc15', background: '#0b0f19' }}>
                    {profilePicUrl ? (
                      <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full rounded-xl flex items-center justify-center text-xl font-black text-white" style={{ background: '#E70C65' }}>
                        {info.name?.[0]?.toUpperCase() || 'SK'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center px-4 mt-2.5 mb-6">
                  <h2 className="font-black text-base leading-tight text-white" style={{ color: s.nameColor || '#ffffff' }}>
                    {info.name || 'SHUBHAM KHURANA'}
                  </h2>
                  <p className="text-[11px] font-bold mt-1 tracking-wider uppercase" style={{ color: s.designationColor || '#ff80ab' }}>
                    {info.designation || 'FOUNDER & CEO'}
                  </p>
                </div>

                <div className="space-y-4 px-4 pb-6">
                  {formOpen ? (
                    <div className="py-2" style={{ borderTop: `1px solid ${s.border || 'rgba(255,255,255,0.15)'}` }}>
                      <div className="flex items-center justify-center space-x-3 mb-4 mt-2">
                        <div className="flex-1 h-px bg-white/20" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff80ab]">
                          {form.title || 'Section Title'}
                        </h3>
                        <div className="flex-1 h-px bg-white/20" />
                      </div>
                      <SafeHtml html={form.content} textColor={s.designationColor || '#cbd5e1'} />
                    </div>
                  ) : (
                    items.map(section => (
                      <div key={section._id} className="py-2" style={{ borderTop: `1px solid ${s.border || 'rgba(255,255,255,0.15)'}` }}>
                        <div className="flex items-center justify-center space-x-3 mb-4 mt-2">
                          <div className="flex-1 h-px bg-white/20" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff80ab]">{section.title}</h3>
                          <div className="flex-1 h-px bg-white/20" />
                        </div>
                        <SafeHtml html={section.content} textColor={s.designationColor || '#cbd5e1'} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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

export default CustomSections;