import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, Copy, Save, UserCircle, 
  Mic, Sparkles, CheckCheck, Radio, 
  Image as ImageIcon, Loader2, Trash2, X 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { useNavigate } from 'react-router-dom';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import MeshBackground from '../../components/ui/MeshBackground';
import DynamicCyberCard3D from '../../components/ui/DynamicCyberCard3D';
import { useTheme } from '../../context/ThemeContext';
import { allThemes, buildCustomTheme } from './Theme';

const MAX_BIO_WORDS = 50;

const countWords = (text) => {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
};

const zoomHeaderVariant = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const tapCompression = {
  scale: 0.97,
  transition: { duration: 0.15, ease: 'easeOut' },
};

const VcardProfile = () => {
  const navigate = useNavigate();
  const plan = usePlan();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const profileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [formData, setFormData] = useState({
    profileImage: '',
    bannerImage: '',
    slug: '',
    title: '',
    subTitle: '',
    description: ''
  });

  const [rawFiles, setRawFiles] = useState({
    profile: null,
    banner: null
  });

  const [cardThemeData, setCardThemeData] = useState({
    theme: 'midnight-tech',
    customTheme: null
  });

  const [uploading, setUploading] = useState({ profile: false, banner: false });
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showVoiceFill, setShowVoiceFill] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
          headers: { 'x-auth-token': token }
        });

        if (res.data) {
          setFormData({
            profileImage: res.data.personalInfo?.profilePic || '',
            bannerImage: res.data.personalInfo?.bannerImage || '',
            slug: res.data.username || '',
            title: res.data.personalInfo?.name || '',
            subTitle: res.data.personalInfo?.designation || '',
            description: res.data.personalInfo?.bio || ''
          });

          setCardThemeData({
            theme: res.data.theme || 'midnight-tech',
            customTheme: res.data.customTheme || null
          });
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchProfileData();

    window.addEventListener('vcard:data-changed', fetchProfileData);
    return () => window.removeEventListener('vcard:data-changed', fetchProfileData);
  }, []);

  const getImageUrl = (url) => {
    if (!url || url.trim() === '') return null;
    if (url.startsWith('blob:') || url.startsWith('http') || url.startsWith('data:')) return url;
    return `${import.meta.env.VITE_API_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setFormData(prev => ({ ...prev, [type]: localUrl }));
    setRawFiles(prev => ({ ...prev, [type === 'profileImage' ? 'profile' : 'banner']: file }));
  };

  const handleRemoveImage = (type) => {
    if (type === 'profileImage') {
      setFormData(prev => ({ ...prev, profileImage: '' }));
      setRawFiles(prev => ({ ...prev, profile: null }));
      if (profileInputRef.current) profileInputRef.current.value = '';
      toast.success('Avatar removed. Click Save & Deploy to update.');
    } else if (type === 'bannerImage') {
      setFormData(prev => ({ ...prev, bannerImage: '' }));
      setRawFiles(prev => ({ ...prev, banner: null }));
      if (bannerInputRef.current) bannerInputRef.current.value = '';
      toast.success('Background removed. Click Save & Deploy to update.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      const words = value.trim() === '' ? [] : value.trim().split(/\s+/);
      if (words.length > MAX_BIO_WORDS) {
        const trimmed = words.slice(0, MAX_BIO_WORDS).join(' ');
        setFormData(prev => ({ ...prev, description: trimmed }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyUrl = () => {
    if (!formData.slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/c/${formData.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('username', formData.slug);
    data.append('title', formData.title);
    data.append('designation', formData.subTitle);
    data.append('bio', formData.description);

    data.append('profilePic', formData.profileImage && !formData.profileImage.startsWith('blob:') ? formData.profileImage : '');
    data.append('bannerImage', formData.bannerImage && !formData.bannerImage.startsWith('blob:') ? formData.bannerImage : '');

    if (rawFiles.profile) {
      data.append('profileImage', rawFiles.profile);
    }
    if (rawFiles.banner) {
      data.append('bannerImage', rawFiles.banner);
    }

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.card) {
        setFormData(prev => ({
          ...prev,
          profileImage: res.data.card.personalInfo?.profilePic || '',
          bannerImage: res.data.card.personalInfo?.bannerImage || '',
        }));
        setRawFiles({ profile: null, banner: null });
      }

      window.dispatchEvent(new Event('vcard:data-changed'));
      toast.success('Profile saved & synchronized with database!');
      setShowPopup(true);
    } catch (error) {
      console.error('Save error', error);
      const msg = error.response?.data?.msg || 'Failed to save profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (formData.slug) {
      window.open(`/c/${formData.slug}`, '_blank');
    } else {
      toast.error("Pehle profile save karein!");
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/theme');
  };

  const handleVoiceFill = (fields) => {
    setFormData(prev => {
      let nextDescription = fields.description ?? prev.description;

      if (typeof nextDescription === 'string') {
        const words = nextDescription.trim() === '' ? [] : nextDescription.trim().split(/\s+/);
        if (words.length > MAX_BIO_WORDS) {
          nextDescription = words.slice(0, MAX_BIO_WORDS).join(' ');
        }
      }

      return {
        ...prev,
        title: fields.title ?? prev.title,
        subTitle: fields.subTitle ?? prev.subTitle,
        description: nextDescription,
      };
    });
  };

  const activeThemeObj = cardThemeData.theme === 'custom' && cardThemeData.customTheme
    ? buildCustomTheme(cardThemeData.customTheme)
    : (allThemes.find(t => t.id === cardThemeData.theme) || allThemes[0]);

  const activeStyles = activeThemeObj.styles || {};
  const laserColor = cardThemeData.theme === 'custom' && cardThemeData.customTheme?.accent ? cardThemeData.customTheme.accent : (activeThemeObj.laserColor || activeStyles.accent || '#3B82F6');
  const cardBg = cardThemeData.theme === 'custom' && cardThemeData.customTheme?.cardBg ? cardThemeData.customTheme.cardBg : (activeStyles.cardBg || '#1E293B');
  const surfaceBg = cardThemeData.theme === 'custom' && cardThemeData.customTheme?.bg ? cardThemeData.customTheme.bg : (activeStyles.bg || '#0F172A');
  const linkBg = cardThemeData.theme === 'custom' && cardThemeData.customTheme?.linkBg ? cardThemeData.customTheme.linkBg : (activeStyles.contactBg || '#3B82F6');
  const subText = cardThemeData.theme === 'custom' && cardThemeData.customTheme?.subTextColor ? cardThemeData.customTheme.subTextColor : '#FFFFFF';

  const hasAvatar = Boolean(formData.profileImage && formData.profileImage.trim() !== '');
  const hasBg = Boolean(formData.bannerImage && formData.bannerImage.trim() !== '');

  const bioWordCount = countWords(formData.description);

  return (
    <>
      <div className={`w-full max-w-7xl mx-auto space-y-8 pb-16 transition-colors duration-500 ${
        isDark ? 'text-slate-100 selection:bg-[#E70C65] selection:text-white' : 'text-slate-900 selection:bg-[#E70C65] selection:text-white'
      }`}>
        <style>{`
          .clean-glass {
            background: ${isDark ? 'rgba(11, 15, 25, 0.75)' : '#ffffff'};
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(231, 12, 101, 0.12)'};
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: ${isDark ? '0 15px 35px rgba(0, 0, 0, 0.4)' : '0 15px 35px rgba(231, 12, 101, 0.04)'};
          }
          .cyber-input {
            background: ${isDark ? 'rgba(255, 255, 255, 0.03)' : '#faf8fa'};
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(231, 12, 101, 0.18)'};
            color: ${isDark ? '#f8fafc' : '#0f172a'};
            transition: all 0.25s ease;
          }
          .cyber-input:focus {
            border-color: #E70C65;
            box-shadow: 0 0 16px rgba(231, 12, 101, 0.2);
            background: ${isDark ? 'rgba(255, 255, 255, 0.06)' : '#ffffff'};
          }
        `}</style>

        <motion.div variants={zoomHeaderVariant} initial="hidden" animate="visible">
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44] p-7 sm:p-8 text-white shadow-xl shadow-[#E70C65]/20 border border-white/20">
            <MeshBackground className="opacity-30" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Live Profile Studio
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Identity & Visuals
                </h1>
                <p className="text-xs sm:text-sm mt-1 text-pink-100 font-medium">
                  Update your contact avatar, card background surface, and custom routing link.
                </p>
              </div>

              {hasVoiceFill(plan) && (
                <motion.button
                  whileHover={{ scale: 1.04 }} 
                  whileTap={tapCompression}
                  type="button"
                  onClick={() => setShowVoiceFill(true)}
                  className="shrink-0 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-[#9F1C44] text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4 animate-pulse text-[#E70C65]" />
                  <span>Fill with Voice</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <div className="clean-glass rounded-3xl p-6 sm:p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-pink-50/40 border-pink-100'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Avatar Photo
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-2xl border-2 border-[#E70C65]/50 bg-white/5 shadow-md flex items-center justify-center shrink-0">
                        {hasAvatar ? (
                          <>
                            <img
                              src={getImageUrl(formData.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('profileImage')}
                              title="Delete Avatar"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer z-40 transition-transform hover:scale-110 active:scale-95"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </>
                        ) : (
                          <UserCircle className="w-8 h-8 text-slate-400 opacity-60" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label className={`cursor-pointer text-xs font-bold py-2 px-3 rounded-xl border inline-flex items-center gap-1.5 transition-all shadow-sm ${
                            isDark 
                              ? 'border-white/15 bg-white/[0.05] text-slate-200 hover:border-[#E70C65] hover:text-[#ff6b9d]' 
                              : 'border-[#E70C65]/30 bg-white text-slate-800 hover:bg-pink-50 hover:text-[#9F1C44]'
                          } ${uploading.profile ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="w-3.5 h-3.5 text-[#E70C65]" />
                            <span>{hasAvatar ? 'Change' : 'Avatar'}</span>
                            <input 
                              ref={profileInputRef}
                              type="file" 
                              name="profileImage" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleImageChange(e, 'profileImage')} 
                            />
                          </label>

                          {hasAvatar && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('profileImage')}
                              title="Delete Avatar"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all cursor-pointer shadow-sm flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>500x500px</p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-pink-50/40 border-pink-100'}`}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Card Background
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-2xl border-2 border-white/20 bg-white/5 shadow-md flex items-center justify-center shrink-0">
                        {hasBg ? (
                          <>
                            <img
                              src={getImageUrl(formData.bannerImage)}
                              alt="Background"
                              className="w-full h-full object-cover rounded-2xl"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('bannerImage')}
                              title="Delete Background"
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer z-40 transition-transform hover:scale-110 active:scale-95"
                            >
                              <X className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </>
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400 opacity-60" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <label className={`cursor-pointer text-xs font-bold py-2 px-3 rounded-xl border inline-flex items-center gap-1.5 transition-all shadow-sm ${
                            isDark 
                              ? 'border-white/15 bg-white/[0.05] text-slate-200 hover:border-[#E70C65] hover:text-[#ff6b9d]' 
                              : 'border-slate-200 bg-white text-slate-800 hover:bg-pink-50 hover:text-[#9F1C44]'
                          } ${uploading.banner ? 'opacity-50 pointer-events-none' : ''}`}>
                            <Upload className="w-3.5 h-3.5 text-[#E70C65]" />
                            <span>{hasBg ? 'Change' : 'Background'}</span>
                            <input 
                              ref={bannerInputRef}
                              type="file" 
                              name="bannerImage" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => handleImageChange(e, 'bannerImage')} 
                            />
                          </label>

                          {hasBg && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage('bannerImage')}
                              title="Delete Background"
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 transition-all cursor-pointer shadow-sm flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className={`text-[10px] mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Card surface texture</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    Routing Vanity URL <span className="text-[#E70C65]">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden shadow-inner">
                    <span className={`inline-flex items-center px-4 text-xs font-bold shrink-0 border-r ${
                      isDark ? 'bg-white/[0.05] border-white/10 text-slate-400' : 'bg-pink-100/60 border-pink-200 text-slate-700'
                    }`}>
                      mycardlink.site/
                    </span>
                    <input
                      type="text" 
                      name="slug" 
                      value={formData.slug} 
                      onChange={handleChange}
                      className="cyber-input flex-1 min-w-0 px-4 py-2.5 text-xs sm:text-sm outline-none font-medium"
                      placeholder="your-name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs sm:text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Full Name <span className="text-[#E70C65]">*</span>
                    </label>
                    <input
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleChange}
                      className="cyber-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none font-medium"
                      placeholder="e.g. MD SHAHID" 
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-xs sm:text-sm font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Designation & Company <span className="text-[#E70C65]">*</span>
                    </label>
                    <input
                      type="text" 
                      name="subTitle" 
                      value={formData.subTitle} 
                      onChange={handleChange}
                      className="cyber-input w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none font-medium"
                      placeholder="e.g. Full Stack Developer" 
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className={`block text-xs sm:text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      Executive Bio <span className="text-[#E70C65]">*</span>
                    </label>
                    <span className={`text-[10px] font-semibold ${
                      bioWordCount >= MAX_BIO_WORDS
                        ? 'text-[#E70C65]'
                        : isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      {bioWordCount}/{MAX_BIO_WORDS} words
                    </span>
                  </div>
                  <textarea
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows="3"
                    className="cyber-input w-full px-4 py-3 rounded-xl text-xs sm:text-sm outline-none resize-none font-medium"
                    placeholder="Write a concise executive summary..." 
                    required
                  />
                </div>

                <div className={`pt-4 flex flex-wrap items-center justify-end gap-3 border-t ${
                  isDark ? 'border-white/10' : 'border-slate-100'
                }`}>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className={`inline-flex items-center gap-1.5 font-bold py-2.5 px-4 rounded-xl border text-xs transition-all cursor-pointer ${
                      isDark 
                        ? 'border-white/10 bg-white/[0.04] text-slate-300 hover:text-white hover:border-[#E70C65]' 
                        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#E70C65]" />}
                    <span>{copied ? 'Copied!' : 'Copy URL'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#E70C65]/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{saving ? 'Deploying…' : 'Save & Deploy'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="clean-glass rounded-3xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-[#ff6b9d] animate-pulse" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Live 3D Hardware Sync
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Theme Synced
                </span>
              </div>

              <DynamicCyberCard3D
                name={formData.title}
                designation={formData.subTitle}
                slug={formData.slug}
                photoUrl={getImageUrl(formData.profileImage)}
                bgImageUrl={getImageUrl(formData.bannerImage)}
                themeColor={laserColor}
                cardBgColor={cardBg}
                surfaceBgColor={surfaceBg}
                backBgColor={surfaceBg}
                linkBgColor={linkBg}
                subTextColor={subText}
                isDark={isDark}
              />

              <p className={`text-center text-[11px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Card matches your Theme Studio colors and database profile in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ActionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onPreview={handlePreview}
        onNext={handleNext}
      />

      {showVoiceFill && (
        <VoiceFillAssistant
          page="profile"
          onFill={handleVoiceFill}
          getKnown={() => ({ title: formData.title, subTitle: formData.subTitle, description: formData.description })}
          onClose={() => setShowVoiceFill(false)}
        />
      )}
    </>
  );
};

export default VcardProfile;















