import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Layout } from 'lucide-react';
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

const API = `${import.meta.env.VITE_API_URL}/api/custom-sections`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { title: '', content: '' };

// Shadow DOM component for CSS isolation — user's custom HTML/CSS never leaks into the rest of the site
const SafeHtml = ({ html, textColor }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) shadow = containerRef.current.attachShadow({ mode: 'open' });

      shadow.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: inherit;
            color: ${textColor || 'inherit'};
          }
        </style>
        <div>${html || '<p style="opacity: 0.5; text-align: center; font-style: italic;">Your custom HTML content will appear here...</p>'}</div>
      `;
    }
  }, [html, textColor]);

  return <div ref={containerRef} className="w-full text-xs leading-relaxed break-words" />;
};

const CustomSections = () => {
  const navigate = useNavigate();
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
    bg: '#f8fafc', sectionBg: '#ffffff', nameColor: '#1e293b',
    designationColor: '#64748b', border: '#e2e8f0', contactBg: '#1e293b', contactText: '#fff'
  };

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start relative">

        {/* LEFT COLUMN: Editor & List */}
        <div className="flex-1 w-full max-w-lg space-y-5">
          <div className="relative rounded-2xl overflow-hidden">
            <MeshBackground className="opacity-30" />
            <motion.div {...fadeUp(0)} className="relative flex flex-wrap items-center justify-between gap-3 p-1">
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Custom Sections</h2>
                <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Add custom HTML content blocks to your vCard</p>
              </div>
              {!formOpen && (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Search..."
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <GradientButton onClick={openCreate} className="py-2! text-sm">
                      <Plus className="w-4 h-4" /><span>Create</span>
                    </GradientButton>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {formOpen ? (
              <GlassCard
                key="form"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-2)' }}>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>{editing ? 'Edit Section' : 'Create Section'}</h3>
                  <IconButton
                    variant="solid"
                    title="Close"
                    onClick={() => setFormOpen(false)}
                    style={{ background: 'var(--surface-1)' }}
                    className="hover:bg-brand-500/10 hover:text-brand-500 hover:border-brand-400"
                  >
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Section Title *</label>
                    <input
                      value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="e.g., About My Work" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 flex justify-between" style={{ color: 'var(--surface-text)' }}>
                      <span>Content (HTML/CSS allowed) *</span>
                      <span className="text-xs text-brand-500 font-medium">Live Previewing 👉</span>
                    </label>
                    <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={12}
                      className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none font-mono focus:ring-2 focus:ring-brand-400 fast-transition"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder={`<style>\n  .my-text { color: red; }\n</style>\n<h1 class="my-text">Hello</h1>`} />
                    <p className="text-xs mt-2" style={{ color: 'var(--surface-text-2)' }}>Note: CSS written here is completely isolated. It will not break the rest of the site!</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setFormOpen(false)}
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    className="hover:border-brand-500 hover:text-brand-500"
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSave} loading={saving} className="!w-auto px-6">
                    {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                  </Button>
                </div>
              </GlassCard>
            ) : (
              <GlassCard
                key="table"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {loading ? <div className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>
                : filtered.length === 0 ? (
                  <div className="p-12 text-center">
                    <Layout className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--surface-text-2)', opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>No custom sections yet.</p>
                    <Button variant="primary" onClick={openCreate} className="!w-auto mt-4">Create Section</Button>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
                      <tr>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>#</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Title</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden md:table-cell" style={{ color: 'var(--surface-text-2)' }}>Content Preview</th>
                        <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase" style={{ color: 'var(--surface-text-2)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((item, idx) => (
                        <motion.tr
                          key={item._id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.04 }}
                          className="hover:bg-brand-500/5 fast-transition"
                          style={{ borderTop: idx === 0 ? 'none' : '1px solid var(--surface-border)' }}
                        >
                          <td className="px-5 py-4 text-sm font-mono" style={{ color: 'var(--surface-text-2)' }}>{idx + 1}</td>
                          <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{item.title}</td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <p className="text-xs truncate max-w-[150px]" style={{ color: 'var(--surface-text-2)' }}>{item.content?.replace(/<[^>]*>?/gm, '').substring(0, 50)}...</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end space-x-1">
                              <IconButton variant="ghost" title="Edit" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></IconButton>
                              <IconButton variant="danger" title="Delete" onClick={() => handleDelete(item._id)}><Trash2 className="w-4 h-4" /></IconButton>
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

        {/* RIGHT COLUMN: Live Mobile Preview */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
          className="hidden lg:flex w-[350px] shrink-0 sticky top-6 justify-center"
        >
          <div className="w-[320px] h-[650px] border-[12px] border-gray-900 rounded-[3rem] shadow-2xl relative bg-white overflow-hidden flex flex-col">

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-50"></div>

            <div
              className="w-full h-full overflow-y-auto pb-10 scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/80"
              style={{ background: s.bg }}
            >
              <div className="h-32 w-full relative" style={{ background: s.contactBg }}>
                {info.bannerImage && <img src={info.bannerImage} alt="Banner" className="w-full h-full object-cover" />}
              </div>
              <div className="flex justify-center -mt-10 relative z-10">
                <div className="w-20 h-20 rounded-full border-4 overflow-hidden shadow-md" style={{ borderColor: s.bg, background: s.sectionBg }}>
                  {info.profilePic
                    ? <img src={info.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-xl font-bold" style={{ color: s.nameColor }}>{info.name?.[0]?.toUpperCase() || '?'}</div>
                  }
                </div>
              </div>
              <div className="text-center px-4 mt-2 mb-6">
                <h2 className="font-black text-lg leading-tight" style={{ color: s.nameColor }}>{info.name || 'Your Name'}</h2>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: s.designationColor }}>{info.designation || 'Your Designation'}</p>
              </div>

              <div className="space-y-4 px-4 pb-6">
                {formOpen ? (
                  <div className="py-2" style={{ borderTop: `1px solid ${s.border}` }}>
                    <div className="flex items-center justify-center space-x-3 mb-4 mt-2">
                      <div className="flex-1 h-px" style={{ background: s.designationColor, opacity: 0.15 }} />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: s.designationColor }}>
                        {form.title || 'Section Title'}
                      </h3>
                      <div className="flex-1 h-px" style={{ background: s.designationColor, opacity: 0.15 }} />
                    </div>
                    <SafeHtml html={form.content} textColor={s.designationColor} />
                  </div>
                ) : (
                  items.map(section => (
                    <div key={section._id} className="py-2" style={{ borderTop: `1px solid ${s.border}` }}>
                      <div className="flex items-center justify-center space-x-3 mb-4 mt-2">
                        <div className="flex-1 h-px" style={{ background: s.designationColor, opacity: 0.15 }} />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: s.designationColor }}>{section.title}</h3>
                        <div className="flex-1 h-px" style={{ background: s.designationColor, opacity: 0.15 }} />
                      </div>
                      <SafeHtml html={section.content} textColor={s.designationColor} />
                    </div>
                  ))
                )}
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
