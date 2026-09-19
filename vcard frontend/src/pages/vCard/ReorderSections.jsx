import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Save, Sparkles, Layers } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import IconButton from '../../components/ui/IconButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';
import { useTheme } from '../../context/ThemeContext';

const allSections = [
  { id: 'contact',      label: 'Contact Details',     emoji: '📞' },
  { id: 'products',     label: 'Products & Services', emoji: '🛍️' },
  { id: 'portfolio',    label: 'Portfolio',           emoji: '💼' },
  { id: 'gallery',      label: 'Gallery',             emoji: '🖼️' },
  { id: 'testimonials', label: 'Testimonials',        emoji: '⭐' },
  { id: 'custom',       label: 'Custom Sections',     emoji: '📝' },
  { id: 'enquiry',      label: 'Enquiry Form',        emoji: '✉️' },
  { id: 'qr',           label: 'QR Code',             emoji: '🔲' },
];

const getSectionById = (id) => allSections.find(s => s.id === id);

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const ReorderSections = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
      r.style.background = i === idx ? 'rgba(231, 12, 101, 0.1)' : '';
      r.style.borderTop = i === idx && idx !== dragItem.current ? '2px solid #E70C65' : '';
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

  if (loading) return <div className={`p-12 text-center text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Loading Order Matrix...</div>;

  return (
    <>
      <style>{`
        @keyframes slowSlideLeftToRight {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .anim-item-1 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .anim-item-2 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
        .anim-item-3 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both; }
        .anim-item-4 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .anim-item-5 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both; }
        .anim-item-6 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both; }
        .anim-item-7 { animation: slowSlideLeftToRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) 1.0s both; }
      `}</style>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start relative px-4">

        {/* LEFT COLUMN: Drag and Drop Editor */}
        <div className="flex-1 w-full max-w-lg space-y-6">
          <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl border border-white/15 bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44] anim-item-1">
            <MeshBackground className="opacity-30" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Flow Matrix
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">Reorder Sections</h2>
              <p className="text-xs sm:text-sm mt-1 text-pink-100 font-medium">Drag or use arrow buttons to arrange sections on your digital vCard</p>
            </div>
          </motion.div>

          <GlassCard {...fadeUp(0.08)} className={`overflow-hidden border shadow-2xl backdrop-blur-2xl transition-colors duration-300 anim-item-2 ${
            isDark ? "border-white/20 bg-[#0b1329]/85 text-white" : "border-pink-100 bg-white/95 text-slate-900 shadow-pink-100/50"
          }`}>
            <div className={`px-5 py-3.5 flex items-center justify-between border-b transition-colors ${
              isDark ? "border-white/10 bg-white/[0.04]" : "border-pink-100 bg-pink-50/50"
            }`}>
              <p className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                <Layers className="w-3.5 h-3.5 text-[#E70C65]" /> Drag rows or use ▲ ▼ buttons
              </p>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                isDark ? "text-white bg-[#E70C65]/30 border-[#E70C65]/40" : "text-[#9F1C44] bg-pink-100 border-pink-200"
              }`}>{sections.length} active</span>
            </div>

            <div>
              {sections.map((section, idx) => {
                const animClass = `anim-item-${Math.min(idx + 3, 7)}`;
                return (
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
                    className={`flex items-center gap-3 px-5 py-4 transition-colors cursor-grab active:cursor-grabbing select-none ${animClass} ${
                      isDark ? "hover:bg-white/[0.06]" : "hover:bg-pink-50/60"
                    }`}
                    style={{ borderBottom: idx === sections.length - 1 ? 'none' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(231,12,101,0.1)') }}
                  >
                    <GripVertical className={`w-5 h-5 shrink-0 ${isDark ? "text-slate-400" : "text-slate-500"}`} />

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      isDark ? "bg-white/10 border-white/15 text-white" : "bg-pink-100 border-pink-200 text-[#9F1C44]"
                    }`}>
                      <span className="text-[11px] font-bold">{idx + 1}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-base">{section.emoji}</span>
                      <span className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>{section.label}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <IconButton
                        variant="ghost"
                        title="Move up"
                        onClick={() => moveUp(idx)}
                        disabled={idx === 0}
                        className={`disabled:opacity-30 ${isDark ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-pink-100"}`}
                      >▲</IconButton>
                      <IconButton
                        variant="ghost"
                        title="Move down"
                        onClick={() => moveDown(idx)}
                        disabled={idx === sections.length - 1}
                        className={`disabled:opacity-30 ${isDark ? "text-slate-300 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-pink-100"}`}
                      >▼</IconButton>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>

          <div className="flex justify-end anim-item-7">
            <div className="w-full sm:w-48">
              <GradientButton onClick={handleSave} disabled={saving} className="py-3 rounded-2xl shadow-lg shadow-[#E70C65]/30 font-bold cursor-pointer">
                {saving ? (
                  <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
                ) : (
                  <Save className="w-4 h-4 mr-2 inline" />
                )}
                <span>{saving ? 'Saving Order...' : 'Save Order'}</span>
              </GradientButton>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Mobile Preview */}
        <motion.div
          initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex w-[350px] shrink-0 sticky top-6 justify-center ml-auto"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-[3.5rem] bg-gradient-to-tr from-[#E70C65]/50 via-indigo-500/35 to-pink-500/40 blur-2xl opacity-75 animate-pulse pointer-events-none" />

            <div className="w-[330px] h-[660px] border-[10px] border-slate-900 rounded-[3rem] shadow-[0_25px_60px_rgba(0,0,0,0.8)] relative bg-slate-950 overflow-hidden flex flex-col z-10">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-50 flex items-center justify-center">
                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
              </div>

              <div
                className="w-full h-full overflow-y-auto pb-10 scroll-smooth [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full"
                style={{ background: s.bg || '#0b1329' }}
              >
                {/* Banner Image */}
                <div className="h-32 w-full relative bg-slate-900">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#E70C65]/40 to-indigo-600/40" />
                  )}
                </div>

                {/* Profile Avatar */}
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

                {/* Name & Designation */}
                <div className="text-center px-4 mt-2.5 mb-6">
                  <h2 className="font-black text-base leading-tight text-white" style={{ color: s.nameColor || '#ffffff' }}>
                    {info.name || 'SHUBHAM KHURANA'}
                  </h2>
                  <p className="text-[11px] font-bold mt-1 tracking-wider uppercase" style={{ color: s.designationColor || '#ff80ab' }}>
                    {info.designation || 'FOUNDER & CEO'}
                  </p>
                </div>

                {/* Ordered Sections including QR Code */}
                <div className="space-y-3 px-4 pb-6">
                  {sections.map(sec => (
                    <motion.div
                      key={sec.id}
                      layout
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      className="rounded-2xl p-3.5 border shadow-md backdrop-blur-md"
                      style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-sm">{sec.emoji}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#ff80ab]">
                          {sec.label}
                        </span>
                      </div>
                      <div className="mt-2.5 h-6 rounded-lg w-full mx-auto bg-white/10"></div>
                    </motion.div>
                  ))}
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
        nextText="Ready your card view now"
      />
    </>
  );
};

export default ReorderSections;