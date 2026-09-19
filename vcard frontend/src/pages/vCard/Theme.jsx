import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Palette, Save, Radio, Sliders, Sparkles, Wand2, Undo2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import DynamicCyberCard3D from '../../components/ui/DynamicCyberCard3D';
import { useTheme } from '../../context/ThemeContext';
import { fadeUp } from '../../utils/motion';

export const allThemes = [
  {
    id: 'midnight-tech',
    name: 'Midnight — Tech/Developer',
    text: 'Sleek dark developer layout',
    type: 'basic',
    laserColor: '#3B82F6',
    styles: { bg: '#0F172A', cardBg: '#1E293B', nameColor: '#F8FAFC', designationColor: '#94A3B8', contactBg: '#3B82F6', contactText: '#F8FAFC', sectionBg: '#1E293B', border: '#334155', accent: '#3B82F6', subTextColor: '#FFFFFF' }
  },
  {
    id: 'corporate-business',
    name: 'Corporate — Business/Company',
    text: 'Clean professional presentation',
    type: 'basic',
    laserColor: '#2563EB',
    styles: { bg: '#FFFFFF', cardBg: '#F3F4F6', nameColor: '#111827', designationColor: '#4B5563', contactBg: '#2563EB', contactText: '#FFFFFF', sectionBg: '#F3F4F6', border: '#E5E7EB', accent: '#2563EB', subTextColor: '#4B5563' }
  },
  {
    id: 'royal-premium',
    name: 'Royal — Premium/Creative',
    text: 'Deep violet creative finish',
    type: 'basic',
    laserColor: '#8B5CF6',
    styles: { bg: '#1E1B4B', cardBg: '#312E81', nameColor: '#F5F3FF', designationColor: '#C4B5FD', contactBg: '#8B5CF6', contactText: '#F5F3FF', sectionBg: '#312E81', border: '#4338CA', accent: '#8B5CF6', subTextColor: '#C4B5FD' }
  },
  {
    id: 'emerald-fresh',
    name: 'Emerald — Fresh/Modern',
    text: 'Vibrant modern green tones',
    type: 'basic',
    laserColor: '#10B981',
    styles: { bg: '#064E3B', cardBg: '#065F46', nameColor: '#ECFDF5', designationColor: '#A7F3D0', contactBg: '#10B981', contactText: '#ECFDF5', sectionBg: '#065F46', border: '#047857', accent: '#10B981', subTextColor: '#A7F3D0' }
  },
  {
    id: 'dark-gold-luxury',
    name: 'Dark Gold — Luxury',
    text: 'Exclusive dark gold aesthetics',
    type: 'basic',
    laserColor: '#D4AF37',
    styles: { bg: '#18181B', cardBg: '#27272A', nameColor: '#FAFAFA', designationColor: '#D4AF37', contactBg: '#D4AF37', contactText: '#18181B', sectionBg: '#27272A', border: '#3F3F46', accent: '#D4AF37', subTextColor: '#D4AF37' }
  }
];

export const buildCustomTheme = (ct) => {
  if (!ct) return allThemes[0];
  const bannerBg = ct.bannerImage ? `url(${ct.bannerImage}) center/cover no-repeat` : (ct.accent || '#3B82F6');
  return {
    id: 'custom',
    name: 'Custom RGB Studio',
    text: 'Real-time RGB Tuning',
    type: 'custom',
    layout: ct.layout || 'classic',
    gradient: bannerBg,
    bannerGradient: bannerBg,
    bgImage: ct.bgImage || '',
    styles: {
      bg: ct.bg || '#0F172A',
      cardBg: ct.cardBg || '#1E293B',
      nameColor: ct.text || '#F8FAFC',
      designationColor: ct.accent || '#3B82F6',
      contactBg: ct.linkBg || '#3B82F6',
      contactText: ct.text || '#F8FAFC',
      sectionBg: ct.cardBg || '#1E293B',
      border: ct.accent || '#334155',
      accent: ct.accent || '#3B82F6',
      subTextColor: ct.subTextColor || '#FFFFFF',
    }
  };
};

const defaultCustom = {
  text: '#F8FAFC',
  bg: '#0F172A',
  cardBg: '#1E293B',
  accent: '#3B82F6',
  linkBg: '#3B82F6',
  subTextColor: '#FFFFFF',
};

const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const AI_VIBES = ['Luxury dark gold', 'Fresh modern startup', 'Clean & minimal light', 'Bold & creative'];

const Theme = () => {
  const navigate = useNavigate();
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  const [selected, setSelected] = useState('midnight-tech');
  const [ct, setCt] = useState(defaultCustom);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(null); // null | 'generate' | 'harmonize'
  const [aiPrev, setAiPrev] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const [cardDetails, setCardDetails] = useState({
    name: '',
    designation: '',
    slug: '',
    photoUrl: null,
    bannerUrl: null
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
        if (res.data?.theme) {
          setSelected(res.data.theme);
          if (res.data.theme !== 'custom') {
            const found = allThemes.find(t => t.id === res.data.theme);
            if (found) {
              setCt({
                bg: found.styles.bg,
                cardBg: found.styles.cardBg,
                accent: found.laserColor,
                linkBg: found.styles.contactBg,
                subTextColor: found.styles.subTextColor || '#FFFFFF',
                text: found.styles.nameColor,
              });
            }
          }
        }
        if (res.data?.customTheme) {
          setCt(prev => ({
            ...prev,
            ...res.data.customTheme,
            subTextColor: res.data.customTheme.subTextColor || '#FFFFFF'
          }));
        }
        
        if (res.data) {
          const personal = res.data.personalInfo || {};
          let profilePic = personal.profilePic || null;
          if (profilePic && !profilePic.startsWith('http') && !profilePic.startsWith('blob:') && !profilePic.startsWith('data:')) {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            profilePic = `${apiUrl}${profilePic.startsWith('/') ? profilePic : '/' + profilePic}`;
          }

          let bannerImg = personal.bannerImage || null;
          if (bannerImg && !bannerImg.startsWith('http') && !bannerImg.startsWith('blob:') && !bannerImg.startsWith('data:')) {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            bannerImg = `${apiUrl}${bannerImg.startsWith('/') ? bannerImg : '/' + bannerImg}`;
          }

          setCardDetails({
            name: personal.name || res.data.title || '',
            designation: personal.designation || res.data.subTitle || '',
            slug: res.data.username || '',
            photoUrl: profilePic,
            bannerUrl: bannerImg
          });
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected === 'custom') {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: 'custom', customTheme: ct }, { headers: headers() });
        await axios.put(`${import.meta.env.VITE_API_URL}/api/vcard/custom-theme`, ct, { headers: headers() });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: selected, customTheme: ct }, { headers: headers() });
      }
      window.dispatchEvent(new Event('vcard:data-changed'));
      toast.success('Theme saved & synchronized successfully!');
      setShowPopup(true);
    } catch { toast.error('Failed to save theme.'); }
    finally { setSaving(false); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (cardDetails.slug) window.open(`/c/${cardDetails.slug}`, '_blank');
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/contact'); 
  };

  const handlePresetSelect = (t) => {
    setSelected(t.id);
    const newPresetCt = {
      bg: t.styles.bg,
      cardBg: t.styles.cardBg,
      accent: t.laserColor,
      linkBg: t.styles.contactBg,
      subTextColor: t.styles.subTextColor || '#FFFFFF',
      text: t.styles.nameColor,
    };
    setCt(newPresetCt);
    setAiResult(null);
  };

  const runAiTheme = async (mode) => {
    if (aiBusy) return;
    setAiBusy(mode);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ai/theme`,
        { mode, prompt: aiPrompt, current: ct },
        { headers: headers() }
      );
      setAiPrev({ ct, selected });
      setSelected('custom');
      setCt(prev => ({ ...prev, ...res.data.theme }));
      setAiResult({ name: res.data.name, reason: res.data.reason });
      toast.success(`AI theme applied: ${res.data.name}`);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'AI theme failed. Please try again.');
    } finally { setAiBusy(null); }
  };

  const undoAiTheme = () => {
    if (!aiPrev) return;
    setCt(aiPrev.ct);
    setSelected(aiPrev.selected);
    setAiPrev(null);
    setAiResult(null);
  };

  const handleRgbChange = (key, val) => {
    setSelected('custom');
    setCt(prev => ({ ...prev, [key]: val }));
  };

  const activeLaserColor = selected === 'custom' ? ct.accent : (allThemes.find(t => t.id === selected)?.laserColor || ct.accent || '#3B82F6');
  const activeCardBg = selected === 'custom' ? ct.cardBg : (allThemes.find(t => t.id === selected)?.styles.cardBg || ct.cardBg || '#1E293B');
  const activeSurfaceBg = selected === 'custom' ? ct.bg : (allThemes.find(t => t.id === selected)?.styles.bg || ct.bg || '#0F172A');
  const activeLinkBg = selected === 'custom' ? ct.linkBg : (allThemes.find(t => t.id === selected)?.styles.contactBg || ct.linkBg || '#3B82F6');
  const activeSubText = selected === 'custom' ? (ct.subTextColor || '#FFFFFF') : (allThemes.find(t => t.id === selected)?.styles.subTextColor || '#FFFFFF');

  if (loading) return (
    <div className="space-y-4 max-w-4xl mx-auto py-6">
      <div className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
      <div className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
    </div>
  );

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        <motion.div {...fadeUp(0)} className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[26px] p-7 sm:p-8 text-white shadow-xl border border-white/15 overflow-hidden">
          <MeshBackground className="opacity-20" />
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 shadow-inner border border-white/10">
              <Palette className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Professional Theme Studio</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">Select high-grade aesthetic presets or configure custom real-time RGB tones.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <GlassCard {...fadeUp(0.04)} className="p-6 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-fuchsia-500/25 to-indigo-500/25 blur-3xl pointer-events-none" />
              <div className="relative flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-fuchsia-500/30">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Theme Designer</h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Describe your vibe, or let AI match colors to your profession and brand color. Always readable, always on-brand.</p>
                </div>
              </div>

              <div className="relative space-y-3">
                <input
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') runAiTheme('generate'); }}
                  maxLength={300}
                  placeholder="e.g. luxury dark gold for a lawyer, or fresh & friendly for a yoga coach"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none border transition-colors focus:border-fuchsia-500 ${isDark ? 'bg-white/[0.04] border-white/15 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
                <div className="flex flex-wrap gap-1.5">
                  {AI_VIBES.map(v => (
                    <button
                      key={v}
                      onClick={() => setAiPrompt(v)}
                      className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors hover:border-fuchsia-500 cursor-pointer ${isDark ? 'border-white/15 text-slate-300' : 'border-slate-200 text-slate-600'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => runAiTheme('generate')}
                    disabled={!!aiBusy}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-fuchsia-500/25 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {aiBusy === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{aiBusy === 'generate' ? 'Designing…' : 'Generate with AI'}</span>
                  </button>
                  <button
                    onClick={() => runAiTheme('harmonize')}
                    disabled={!!aiBusy}
                    title="Keeps your accent color and rebuilds everything else around it"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer ${isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-slate-300 text-slate-800 hover:bg-slate-50'}`}
                  >
                    {aiBusy === 'harmonize' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
                    <span>{aiBusy === 'harmonize' ? 'Matching…' : 'Match my accent color'}</span>
                  </button>
                </div>

                {aiResult && (
                  <div className={`flex items-center gap-3 rounded-xl border p-3 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex shrink-0 -space-x-1.5">
                      {[ct.bg, ct.cardBg, ct.accent, ct.linkBg].map((c, i) => (
                        <span key={i} className="w-6 h-6 rounded-full border-2 border-white/40 shadow-sm" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{aiResult.name}</p>
                      <p className={`text-[11px] leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{aiResult.reason}</p>
                    </div>
                    {aiPrev && (
                      <button onClick={undoAiTheme} className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${isDark ? 'bg-white/10 text-slate-200' : 'bg-white text-slate-700 border border-slate-200'}`}>
                        <Undo2 className="w-3 h-3" /> Undo
                      </button>
                    )}
                  </div>
                )}
                <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Preview updates live on the right — press Save Theme to publish it to your card.</p>
              </div>
            </GlassCard>

            <GlassCard {...fadeUp(0.08)} className="p-6">
              <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Curated Theme Presets</h3>
              <p className={`text-xs mb-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Professional color systems optimized for identity profiles.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handlePresetSelect(t)}
                    className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                      selected === t.id 
                        ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]' 
                        : isDark ? 'border-white/10 bg-white/[0.02] hover:border-white/20' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.laserColor }} />
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.name}</span>
                    </div>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t.text}</p>
                    {selected === t.id && (
                      <span className="inline-block mt-3 bg-blue-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard {...fadeUp(0.14)} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Realistic Real-time RGB Studio</h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Directly calibrate background, card base, link &amp; sub-text colors.</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected('custom')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selected === 'custom' ? 'bg-blue-600 text-white' : isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {selected === 'custom' ? 'RGB Custom Active' : 'Enable Custom RGB'}
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/10">
                {[
                  { label: 'Background Hue (BG)', key: 'bg', val: ct.bg },
                  { label: 'Card Surface Base', key: 'cardBg', val: ct.cardBg },
                  { label: 'Laser & Accent Glow', key: 'accent', val: ct.accent },
                  { label: 'Link / Button Color', key: 'linkBg', val: ct.linkBg },
                  { label: 'Sub-Text / Link Color', key: 'subTextColor', val: ct.subTextColor || '#FFFFFF' },
                  { label: 'Name / Heading Text', key: 'text', val: ct.text || '#F8FAFC' },
                ].map(({ label, key, val }) => (
                  <div key={key} className="relative flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 hover:border-blue-500/50 transition-colors shadow-xs">
                    <span className="text-xs font-black tracking-wide text-slate-900 dark:text-slate-100">{label}</span>
                    <div className="flex items-center space-x-3">
                      <label className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/30 shadow-sm cursor-pointer block" title="Click to pick color">
                        <div className="absolute inset-0" style={{ background: val || '#3B82F6' }} />
                        <input
                          type="color" 
                          value={val || '#3B82F6'} 
                          onChange={e => handleRgbChange(key, e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input 
                        type="text" 
                        value={val || ''} 
                        onChange={e => handleRgbChange(key, e.target.value)}
                        className="text-[11px] font-mono w-20 bg-white dark:bg-black/30 border border-slate-300 dark:border-white/15 rounded-lg px-2 py-1 text-slate-900 dark:text-white uppercase tracking-wider outline-none focus:border-blue-500" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <div className="flex justify-end">
              <div className="w-full sm:w-56">
                <GradientButton onClick={handleSave} disabled={saving} loading={saving}>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving…' : 'Save Theme'}</span>
                </GradientButton>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 sticky top-24">
            <GlassCard className="p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-2 px-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Real-time Card Simulation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">
                  Live Preview
                </span>
              </div>

              <DynamicCyberCard3D
                name={cardDetails.name}
                designation={cardDetails.designation}
                slug={cardDetails.slug}
                photoUrl={cardDetails.photoUrl}
                bgImageUrl={cardDetails.bannerUrl}
                themeColor={activeLaserColor}
                cardBgColor={activeCardBg}
                surfaceBgColor={activeSurfaceBg}
                backBgColor={activeSurfaceBg}
                linkBgColor={activeLinkBg}
                subTextColor={activeSubText}
                isDark={isDark}
              />

              <p className={`text-center text-[11px] mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Rotate card to preview live RGB lighting finishes.
              </p>
            </GlassCard>
          </div>
        </div>
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

export default Theme;