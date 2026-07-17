import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';

const allSections = [
  { id: 'contact',      label: 'Contact Details',     emoji: '📞' },
  { id: 'products',     label: 'Products & Services', emoji: '🛍️' },
  { id: 'portfolio',    label: 'Portfolio',           emoji: '💼' },
  { id: 'gallery',      label: 'Gallery',             emoji: '🖼️' },
  { id: 'testimonials', label: 'Testimonials',        emoji: '⭐' },
  { id: 'custom',       label: 'Custom Sections',     emoji: '📝' },
  { id: 'enquiry',      label: 'Enquiry Form',        emoji: '✉️' },
];

const getSectionById = (id) => allSections.find(s => s.id === id);

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const ReorderSections = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  const [sections, setSections] = useState(allSections);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [previewData, setPreviewData] = useState(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const resSettings = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`, { headers: headers() });
        const order = resSettings.data?.sectionOrder;
        if (Array.isArray(order) && order.length > 0) {
          const ordered = order.map(id => getSectionById(id)).filter(Boolean);
          const missing = allSections.filter(s => !order.includes(s.id));
          setSections([...ordered, ...missing]);
        }

        const resUser = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
        if (resUser.data?.username) {
          const userSlug = resUser.data.username;
          setSlug(userSlug);

          const resPublic = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/public/${userSlug}`);
          setPreviewData(resPublic.data);
        }
      } catch (err) {
        console.error('Data load failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Native HTML5 drag-and-drop — reorder is committed only on dragEnd, using refs to avoid stale closures.
  // Visual feedback (opacity/highlight) is applied directly to the DOM to stay perfectly in sync with the drag gesture;
  // the actual list re-order below is what drives the framer-motion `layout` animation on each row.
  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      if (e.currentTarget) e.currentTarget.style.opacity = '0.4';
    }, 0);
  };

  const handleDragEnter = (e, idx) => {
    e.preventDefault();
    dragOverItem.current = idx;
    const rows = document.querySelectorAll('[data-drag-row]');
    rows.forEach((r, i) => {
      r.style.background = i === idx ? '#f3f4f6' : '';
      r.style.borderTop = i === idx && idx !== dragItem.current ? '2px solid #000' : '';
    });
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    document.querySelectorAll('[data-drag-row]').forEach(r => {
      r.style.background = ''; r.style.borderTop = '';
    });

    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) { dragItem.current = null; dragOverItem.current = null; return; }

    const updated = [...sections];
    const [moved] = updated.splice(dragItem.current, 1);
    updated.splice(dragOverItem.current, 0, moved);
    setSections(updated);

    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e) => e.preventDefault();

  const moveUp = (idx) => {
    if (idx === 0) return;
    const updated = [...sections];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    setSections(updated);
  };

  const moveDown = (idx) => {
    if (idx === sections.length - 1) return;
    const updated = [...sections];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    setSections(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, {
        sectionOrder: sections.map(s => s.id)
      }, { headers: headers() });

      setShowPopup(true);
    } catch { toast.error('Failed to save order'); }
    finally { setSaving(false); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) window.open(`/c/${slug}`, '_blank');
    else toast.error('Profile not found!');
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/all');
  };

  const info = previewData?.card?.personalInfo || {};
  const s = previewData?.card?.customTheme || {
    bg: '#f8fafc', sectionBg: '#ffffff', nameColor: '#1e293b',
    designationColor: '#64748b', border: '#e2e8f0', contactBg: '#1e293b', contactText: '#fff'
  };

  if (loading) return <div className="p-8 text-center text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>;

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start relative">

        {/* LEFT COLUMN: Drag and Drop Editor */}
        <div className="flex-1 w-full max-w-lg space-y-5">
          <div className="relative rounded-2xl overflow-hidden">
            <MeshBackground className="opacity-30" />
            <motion.div {...fadeUp(0)} className="relative p-1">
              <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Reorder Sections</h2>
              <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Drag or use arrows to arrange sections on your vCard</p>
            </motion.div>
          </div>

          <GlassCard {...fadeUp(0.08)} className="overflow-hidden">
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-2)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--surface-text-2)' }}>Drag rows or use ▲ ▼ buttons to reorder</p>
              <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{sections.length} sections</span>
            </div>

            {/* NOTE: drag-and-drop mechanics below (data-drag-row, draggable, onDragStart/Enter/Over/End,
                the dragItem/dragOverItem refs, and the layout/transition props that drive the framer-motion
                reorder animation) are untouched — only className/style (purely visual) were changed. */}
            <div>
              {sections.map((section, idx) => (
                <motion.div
                  key={section.id}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  data-drag-row
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 px-5 py-4 hover:bg-[var(--surface-2)] fast-transition cursor-grab active:cursor-grabbing select-none"
                  style={{ borderBottom: idx === sections.length - 1 ? 'none' : '1px solid var(--surface-border)' }}
                >
                  <GripVertical className="w-5 h-5 shrink-0" style={{ color: 'var(--surface-text-2)' }} />

                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--surface-2)' }}>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--surface-text-2)' }}>{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="text-lg leading-none">{section.emoji}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--surface-text)' }}>{section.label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-brand-500 hover:bg-brand-500/10 disabled:opacity-20 disabled:cursor-not-allowed fast-transition"
                      style={{ color: 'var(--surface-text-2)' }}
                    >▲</button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === sections.length - 1}
                      className="w-6 h-6 flex items-center justify-center rounded hover:text-brand-500 hover:bg-brand-500/10 disabled:opacity-20 disabled:cursor-not-allowed fast-transition"
                      style={{ color: 'var(--surface-text-2)' }}
                    >▼</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <div className="flex justify-end">
            <div className="w-full sm:w-48">
              <GradientButton onClick={handleSave} disabled={saving}>
                {saving ? (
                  <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Order'}</span>
              </GradientButton>
            </div>
          </div>
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

              <div className="space-y-4 px-4">
                {sections.map(sec => (
                  <motion.div
                    key={sec.id}
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                    className="rounded-2xl p-4 border shadow-sm"
                    style={{ background: s.sectionBg, borderColor: s.border }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-base">{sec.emoji}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: s.designationColor }}>
                        {sec.label}
                      </span>
                    </div>
                    <div className="mt-3 h-8 rounded-lg w-full mx-auto" style={{ background: s.contactBg, opacity: 0.08 }}></div>
                  </motion.div>
                ))}
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
        nextText="Ready your card view now"
      />
    </>
  );
};

export default ReorderSections;
