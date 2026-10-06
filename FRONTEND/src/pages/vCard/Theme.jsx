import { useState, useEffect, useDeferredValue, startTransition } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LayoutTemplate, Save, Radio, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { useTheme } from '../../context/ThemeContext';
import { fadeUp } from '../../utils/motion';
import WebCard from '../../webcard/WebCard';
import LiveTemplatePicker from '../../webcard/components/LiveTemplatePicker';
import { ThemeControls } from '../../webcard/components/ThemeSheet';
import { templateIdOf, templateMeta } from '../../webcard/templates/TemplatePicker';
import { readThemeCache, writeThemeCache, loadThemeStudio } from '../../utils/themeStudioCache';
import FreePlanNotice from '../../components/FreePlanNotice';
import { PRICING_ENABLED } from '../../utils/plan';

const API = import.meta.env.VITE_API_URL;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const lookOf = (card) => {
  const o = card?.themeOptions || {};
  return { palette: o.palette || 0, mode: o.mode || '', counter: o.counter !== false };
};

// Template Studio: pick one of the WebCard templates and see it live with the owner's own content.
const Theme = () => {
  const navigate = useNavigate();
  const { theme: appTheme } = useTheme();
  const isDark = appTheme === 'dark';

  // Last loaded card, so the studio opens instantly next time and refreshes in the background.
  const [cached] = useState(readThemeCache);
  const cachedCard = cached?.payload?.card;
  const cachedLook = lookOf(cachedCard);
  const [selected, setSelected] = useState(templateIdOf(cachedCard?.theme));
  const [saved, setSaved] = useState(cachedCard?.theme ? templateIdOf(cachedCard.theme) : null);
  // Look of the template (5 palettes, light/dark, visitor counter), saved with it.
  const [look, setLook] = useState(cachedLook);
  const [savedLook, setSavedLook] = useState(cachedLook);
  const [payload, setPayload] = useState(cached?.payload || null);
  const [aiPersona, setAiPersona] = useState(cached?.aiPersona || null);
  const [slug, setSlug] = useState(cachedCard?.username || '');
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { card, payload: full, aiPersona: ai } = await loadThemeStudio();
        const current = templateIdOf(card.theme);
        setSelected(current);
        setSaved(card.theme ? current : null);
        const l = lookOf(card);
        setLook(l);
        setSavedLook(l);
        setSlug(card.username || '');
        setAiPersona(ai);
        setPayload(full);
      } catch {
        // No card yet: the preview shows sample content (never another account's card).
        setPayload(null);
        setAiPersona(null);
        setSlug('');
        setSaved(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/api/vcard`, { theme: selected, themeOptions: look }, { headers: headers() });
      setSaved(selected);
      setSavedLook(look);
      if (payload?.card) writeThemeCache({ payload: { ...payload, card: { ...payload.card, theme: selected, themeOptions: look } }, aiPersona });
      window.dispatchEvent(new Event('vcard:data-changed'));
      toast.success('Template saved!');
      setShowPopup(true);
    } catch (err) {
      if (err.response?.data?.upgrade) {
        toast.error(err.response.data.msg, { duration: 6000 });
        navigate('/dashboard/plans');
      } else toast.error(err.response?.data?.msg || 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const openLive = (id) => {
    if (!slug) {
      toast.error('Set your card link in Vcard Profile first.');
      return;
    }
    const target = id || selected;
    const detail = target && (target !== saved || lookDirty) ? { template: target, palette: look.palette, mode: look.mode || undefined } : null;
    window.dispatchEvent(new CustomEvent('card:preview', { detail }));
  };

  const meta = templateMeta(selected);
  const lookDirty = look.palette !== savedLook.palette || look.mode !== savedLook.mode || look.counter !== savedLook.counter;
  const dirty = selected !== saved || lookDirty;
  // Picker and Theme controls share one value: template + palette + mode + counter.
  const choice = { template: selected, ...look };
  const onChoice = (c) => {
    startTransition(() => {
      setSelected(c.template);
      setLook({ palette: c.palette, mode: c.mode, counter: c.counter ?? look.counter });
    });
  };
  const previewTemplate = useDeferredValue(selected);
  const previewLook = useDeferredValue(look);

  if (loading)
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-6">
        <div className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
        <div className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />
      </div>
    );

  return (
    <>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        <motion.div
          {...fadeUp(0)}
          className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[26px] p-7 sm:p-8 text-white shadow-xl border border-white/15 overflow-hidden"
        >
          <MeshBackground className="opacity-20" />
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 shadow-inner border border-white/10">
              <LayoutTemplate className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">Template Studio</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Same content, ten looks. Pick a template, check it live with your details, then save.
              </p>
            </div>
          </div>
        </motion.div>

        {PRICING_ENABLED && <FreePlanNotice show={['theme']} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <GlassCard {...fadeUp(0.05)} className="lg:col-span-7 p-5 sm:p-6">
            <div className="flex items-center justify-end gap-3 mb-2">
              {saved && (
                <span className="shrink-0 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-500">
                  Live: {templateMeta(saved)?.name}
                </span>
              )}
            </div>
            <LiveTemplatePicker value={choice} onChange={(c) => onChoice({ ...c, counter: look.counter })} dark={isDark} />

            {/* Theme: 5 palettes, Light/Dark, live visitor counter (upstream Theme sheet) */}
            <div className={`mt-8 pt-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="mb-4">
                <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Theme</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {meta?.name} · palette 1 in its own mode is the original design.
                </p>
              </div>
              <ThemeControls value={choice} onChange={onChoice} dark={isDark} />
            </div>
          </GlassCard>

          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <GlassCard className="p-4 sm:p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2 min-w-0">
                  <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse shrink-0" />
                  <span className={`text-xs font-bold uppercase tracking-wider truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {meta?.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-500 shrink-0">Live Preview</span>
              </div>
              {meta && <p className={`text-[11px] mb-3 px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Best for: {meta.for}</p>}

              {/* The transform makes the templates' fixed bars/launchers stay inside this phone frame. */}
              <div
                className="relative mx-auto w-full max-w-[390px] h-[70vh] max-h-[760px] min-h-[520px] rounded-[34px] border-[6px] border-slate-900 bg-[#E7E7EA] overflow-hidden shadow-xl"
                style={{ transform: 'translateZ(0)', '--wc-vw': '390px' }}
              >
                <div className="h-full overflow-y-auto overscroll-contain" style={{ scrollbarWidth: 'none' }}>
                  <WebCard template={previewTemplate} palette={previewLook.palette} mode={previewLook.mode || undefined} counter={previewLook.counter} data={payload} aiPersona={aiPersona} />
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => openLive(selected)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                  isDark ? 'border-white/20 text-white hover:bg-white/5' : 'border-slate-300 text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <GradientButton onClick={handleSave} disabled={saving || !dirty} loading={saving}>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving…' : selected !== saved ? 'Use this template' : dirty ? 'Save look' : 'Saved'}</span>
              </GradientButton>
            </div>
          </div>
        </div>
      </div>

      <ActionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onPreview={() => {
          setShowPopup(false);
          openLive();
        }}
        onNext={() => {
          setShowPopup(false);
          navigate('/dashboard/vcard/contact');
        }}
      />
    </>
  );
};

export default Theme;
