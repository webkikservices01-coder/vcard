import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, X, Image as ImageIcon, ExternalLink, Mic, FileText, Link2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import Button from '../../components/ui/Button';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';
import { siteShot } from '../../utils/media';

const API = `${import.meta.env.VITE_API_URL}/api/portfolio`;
const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });
const emptyForm = { title: '', description: '', url: '', coverImage: null, file: null, removeFile: false };

// Splits pasted text into unique http(s) links (one per line, or separated by spaces / commas).
const parseLinks = (text) => [...new Set((text.match(/https?:\/\/[^\s,]+/gi) || []).map((l) => l.replace(/[).,;]+$/, '')))];

const Portfolio = () => {
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
  const [existingFile, setExistingFile] = useState(null);
  const [uploadPct, setUploadPct] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  const fetch = async () => {
    try { 
      const res = await axios.get(API, { headers: headers() }); 
      setItems(res.data); 
    }
    catch { toast.error('Failed to load portfolio'); }
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
    fetch();
    fetchUserDetails();

    window.addEventListener('vcard:data-changed', fetch);
    return () => window.removeEventListener('vcard:data-changed', fetch);
  }, []);

  const openCreate = () => { setForm(emptyForm); setPreview(''); setExistingFile(null); setEditing(null); setModalOpen(true); };

  const openEdit = (item) => {
    setForm({ title: item.title, description: item.description, url: item.url, coverImage: null, file: null, removeFile: false });
    setExistingFile(item.file ? { url: item.file, name: item.fileName || 'Attached PDF' } : null);
    setPreview(getImageUrl(item.coverImage) || '');
    setEditing(item._id); setModalOpen(true);
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith('http') || imgPath.startsWith('blob:') || imgPath.startsWith('data:')) return imgPath;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${imgPath.startsWith('/') ? imgPath : '/' + imgPath}`;
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      ['title', 'description', 'url'].forEach((k) => fd.append(k, form[k] || ''));
      if (form.coverImage) fd.append('coverImage', form.coverImage);
      if (form.file) {
        // Big PDFs can't pass through the API host (≈4.5 MB request limit), so they go straight to storage.
        const { data: sig } = await axios.get(`${API}/upload-signature`, { headers: headers() });
        if (sig.mode === 'cloudinary') {
          const up = new FormData();
          up.append('file', form.file);
          up.append('api_key', sig.apiKey);
          up.append('timestamp', sig.timestamp);
          up.append('signature', sig.signature);
          up.append('folder', sig.folder);
          up.append('public_id', sig.publicId);
          setUploadPct(0);
          const { data: stored } = await axios.post(sig.uploadUrl, up, {
            onUploadProgress: (e) => e.total && setUploadPct(Math.round((e.loaded / e.total) * 100)),
          });
          fd.append('fileUrl', stored.secure_url);
          fd.append('fileName', form.file.name);
        } else {
          fd.append('file', form.file);
        }
      } else if (form.removeFile) fd.append('removeFile', 'true');

      if (editing) {
        await axios.put(`${API}/${editing}`, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(API, fd, { headers: { 'x-auth-token': token(), 'Content-Type': 'multipart/form-data' } });
      }

      setModalOpen(false);
      fetch();
      setShowPopup(true);
      toast.success('Portfolio item saved successfully!');
    } catch (err) {
      const d = err.response?.data;
      toast.error(d?.msg || d?.error?.message || (err.response?.status === 413 ? 'File is too large to upload.' : !err.response ? 'Network error — please check your connection and try again.' : 'Failed to save'));
    }
    finally { setSaving(false); setUploadPct(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await axios.delete(`${API}/${id}`, { headers: headers() }); toast.success('Deleted'); fetch(); }
    catch { toast.error('Failed to delete'); }
  };

  const bulkLinks = parseLinks(bulkText);
  const handleBulkSave = async () => {
    if (!bulkLinks.length) { toast.error('Paste at least one link starting with http:// or https://'); return; }
    setBulkSaving(true);
    try {
      const res = await axios.post(`${API}/bulk`, { links: bulkLinks }, { headers: headers() });
      toast.success(res.data?.msg || 'Projects added');
      setBulkOpen(false);
      setBulkText('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to add links'); }
    finally { setBulkSaving(false); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.open(`/${slug}`, '_blank');
    } else {
      toast.error('Profile not found! Please create a profile first.');
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/gallery');
  };

  const handleVoiceFill = (fields) => {
    setForm(prev => ({
      ...prev,
      title: fields.title ?? prev.title,
      description: fields.description ?? prev.description,
      url: fields.url ?? prev.url,
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
            <h2 className="text-2xl font-black text-white leading-tight">Portfolio</h2>
            <p className="text-sm text-white/70 mt-1">Showcase your work and projects</p>
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
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => setBulkOpen(true)}
              style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              className="hover:border-brand-500 hover:text-brand-500"
            >
              <Link2 className="w-4 h-4 mr-1.5 inline" />Add many links
            </Button>
            <GradientButton onClick={openCreate} className="!w-auto px-5 shrink-0">
              <Plus className="w-4 h-4" /><span>Add Item</span>
            </GradientButton>
          </div>
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
            <p className="text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>No portfolio items yet.</p>
            <GradientButton onClick={openCreate} className="!w-auto px-6 mx-auto">
              <Plus className="w-4 h-4" /><span>Add Item</span>
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
                    {item.coverImage || siteShot(item.url) ? (
                      <img src={getImageUrl(item.coverImage) || siteShot(item.url)} alt="" loading="lazy" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6" style={{ color: 'var(--surface-text-2)' }} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--surface-text)' }}>{item.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2 flex-1" style={{ color: 'var(--surface-text-2)' }}>{item.description || '—'}</p>
                  {item.url && (
                    <a
                      href={item.url} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs mt-1.5 hover:text-brand-500 fast-transition"
                      style={{ color: 'var(--surface-text-2)' }}
                    >
                      <span className="truncate max-w-[160px]">{item.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                  {item.file && (
                    <a
                      href={getImageUrl(item.file)} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs mt-1.5 font-semibold text-brand-600 hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[160px]">{item.fileName || 'PDF'}</span>
                    </a>
                  )}
                  <div className="mt-3 pt-3 flex items-center justify-end gap-1" style={{ borderTop: '1px solid var(--surface-border)' }}>
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

        {/* Modal for Creating/Editing */}
        {createPortal(
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
                  <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>{editing ? 'Edit Item' : 'Add Portfolio Item'}</h3>
                  <div className="flex items-center space-x-1">
                    {hasVoiceFill(plan) && (
                      <IconButton
                        variant="ghost"
                        title="Fill with Voice"
                        onClick={() => setShowVoiceFill(true)}
                      >
                        <Mic className="w-4 h-4" />
                      </IconButton>
                    )}
                    <IconButton variant="ghost" title="Close" onClick={() => setModalOpen(false)}>
                      <X className="w-5 h-5" />
                    </IconButton>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {[{ label: 'Title *', key: 'title', placeholder: 'Project name' }, { label: 'URL', key: 'url', placeholder: 'https://...' }].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>{label}</label>
                      <input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                        className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                        style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                        placeholder={placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      rows={3} className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none fast-transition focus:ring-2 focus:ring-brand-400"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                      placeholder="Describe this project..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Cover Image</label>
                    {preview && <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" style={{ border: '1px solid var(--surface-border)' }} />}
                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (f) { setForm({...form, coverImage: f}); setPreview(URL.createObjectURL(f)); } }}
                      className="w-full text-sm fast-transition file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:text-brand-600 file:text-sm file:font-medium hover:file:bg-brand-500/20"
                      style={{ color: 'var(--surface-text-2)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>PDF (optional)</label>
                    {existingFile && !form.removeFile && !form.file && (
                      <div className="flex items-center justify-between gap-2 mb-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}>
                        <a href={getImageUrl(existingFile.url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 truncate hover:text-brand-500">
                          <FileText className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{existingFile.name}</span>
                        </a>
                        <button type="button" onClick={() => setForm({ ...form, removeFile: true })} className="shrink-0 text-red-500 hover:underline cursor-pointer">Remove</button>
                      </div>
                    )}
                    <input type="file" accept="application/pdf,.pdf"
                      onChange={e => {
                        const f = e.target.files[0];
                        if (!f) return;
                        if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) { toast.error('Please choose a PDF file'); e.target.value = ''; return; }
                        if (f.size > 10 * 1024 * 1024) { toast.error('PDF must be under 10 MB'); e.target.value = ''; return; }
                        setForm({ ...form, file: f, removeFile: false });
                      }}
                      className="w-full text-sm fast-transition file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:text-brand-600 file:text-sm file:font-medium hover:file:bg-brand-500/20"
                      style={{ color: 'var(--surface-text-2)' }} />
                    <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Brochure, case study or catalogue. Visitors can open it from your card (max 10 MB).</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setModalOpen(false)}
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    className="hover:border-brand-500 hover:text-brand-500"
                  >
                    Cancel
                  </Button>
                  <GradientButton onClick={handleSave} disabled={saving} loading={saving} className="!w-auto px-6">
                    <span>{uploadPct !== null ? `Uploading PDF ${uploadPct}%` : saving ? 'Saving...' : editing ? 'Update' : 'Create'}</span>
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}

        {/* Bulk links: one project per link */}
        {createPortal(
        <AnimatePresence>
          {bulkOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setBulkOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            >
              <motion.div
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 340 }}
                className="glass rounded-2xl w-full max-w-lg"
              >
                <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--surface-text)' }}>Add many links</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>Paste your project links — each one becomes its own portfolio item. YouTube links get their title and thumbnail automatically.</p>
                  </div>
                  <IconButton variant="ghost" title="Close" onClick={() => setBulkOpen(false)}>
                    <X className="w-5 h-5" />
                  </IconButton>
                </div>
                <div className="p-6 space-y-3">
                  <textarea
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    rows={8}
                    autoFocus
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none resize-none fast-transition focus:ring-2 focus:ring-brand-400 font-mono"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    placeholder={'https://www.youtube.com/watch?v=...\nhttps://github.com/you/project\nhttps://yourclient.com'}
                  />
                  <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
                    {bulkLinks.length ? `${bulkLinks.length} link${bulkLinks.length === 1 ? '' : 's'} found${bulkLinks.length > 50 ? ' — only the first 50 will be added' : ''}` : 'One link per line (or separated by spaces / commas).'}
                  </p>
                </div>
                <div className="flex justify-end space-x-3 p-6 pt-0">
                  <Button
                    variant="ghost"
                    onClick={() => setBulkOpen(false)}
                    style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                    className="hover:border-brand-500 hover:text-brand-500"
                  >
                    Cancel
                  </Button>
                  <GradientButton onClick={handleBulkSave} disabled={bulkSaving || !bulkLinks.length} loading={bulkSaving} className="!w-auto px-6">
                    <span>{bulkSaving ? 'Adding…' : `Create ${Math.min(bulkLinks.length, 50) || ''} projects`}</span>
                  </GradientButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
        )}
      </div>

      <ActionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onPreview={handlePreview}
        onNext={handleNext}
      />

      {showVoiceFill && (
        <VoiceFillAssistant
          page="portfolio"
          onFill={handleVoiceFill}
          getKnown={() => ({ title: form.title, description: form.description, url: form.url })}
          onClose={() => setShowVoiceFill(false)}
        />
      )}
    </>
  );
};

export default Portfolio;