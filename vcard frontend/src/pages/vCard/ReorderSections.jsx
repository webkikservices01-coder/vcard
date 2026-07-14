import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';

const allSections = [
  { id: 'contact',      label: 'Contact Details',     emoji: '📞' },
  { id: 'products',     label: 'Products & Services', emoji: '🛍️' },
  { id: 'portfolio',    label: 'Portfolio',           emoji: '💼' },
  { id: 'gallery',      label: 'Gallery',             emoji: '🖼️' },
  { id: 'testimonials', label: 'Testimonials',        emoji: '⭐' },
  { id: 'custom',       label: 'Custom Sections',     emoji: '📝' },
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

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>;

  return (
    <>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start relative">

        {/* LEFT COLUMN: Drag and Drop Editor */}
        <div className="flex-1 w-full max-w-lg space-y-5">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <h2 className="text-xl font-bold text-gray-900">Reorder Sections</h2>
            <p className="text-sm text-gray-500">Drag or use arrows to arrange sections on your vCard</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-medium">Drag rows or use ▲ ▼ buttons to reorder</p>
              <span className="text-xs text-gray-400">{sections.length} sections</span>
            </div>

            <div className="divide-y divide-gray-100">
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
                  className="flex items-center space-x-3 px-5 py-4 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing select-none"
                >
                  <GripVertical className="w-5 h-5 text-gray-400 shrink-0" />

                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-gray-500">{idx + 1}</span>
                  </div>

                  <div className="flex items-center space-x-2.5 flex-1">
                    <span className="text-lg leading-none">{section.emoji}</span>
                    <span className="text-sm font-medium text-gray-900">{section.label}</span>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition"
                    >▲</button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === sections.length - 1}
                      className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-not-allowed transition"
                    >▼</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-pink-700 transition disabled:opacity-60"
            >
              {saving ? (
                <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Order'}</span>
            </motion.button>
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
