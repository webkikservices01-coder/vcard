import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Camera, User, Briefcase, Phone, Link2, ArrowRight, ArrowLeft, Check, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import AuthBrandPanel from '../components/AuthBrandPanel';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import IconButton from '../components/ui/IconButton';
import ThemeToggle from '../components/ui/ThemeToggle';
import MeshBackground from '../components/ui/MeshBackground';
import Logo from '../components/ui/Logo';
import { PRICING_ENABLED } from '../utils/plan';
import { useUsernameCheck, toUsername } from '../utils/username';
import { TEMPLATE_META, TemplateThumb, templateMeta, DEFAULT_TEMPLATE_ID } from '../webcard/templates/TemplatePicker';

const API = `${import.meta.env.VITE_API_URL}/api`;
const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const slugify = (s) => s
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const springy = { type: 'spring', stiffness: 380, damping: 28 };

const TemplateSwatch = ({ template, name, selected, onClick, index }) => (
  <motion.button
    type="button"
    onClick={onClick}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.03 }}
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.96 }}
    className="relative text-left"
    title={template.name}
  >
    <TemplateThumb t={{ ...template, badge: null }} name={name || 'Your Name'} selected={selected} />
    <p className="mt-1 px-0.5 text-[10px] font-semibold truncate" style={{ color: 'var(--surface-text)' }}>{template.name}</p>
    <AnimatePresence>
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
          transition={springy}
          className="absolute top-1.5 right-1.5 w-[18px] h-[18px] rounded-full bg-brand-600 flex items-center justify-center shadow-sm"
        >
          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.button>
);

const SelectedTemplate = ({ template }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={template.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl px-4 py-3 border"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}
    >
      <p className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{template.name}</p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>{template.mood} · Best for {template.for.charAt(0).toLowerCase() + template.for.slice(1)}</p>
    </motion.div>
  </AnimatePresence>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({ name: '', designation: '', phone: '', slug: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const slugCheck = useUsernameCheck(form.slug.replace(/-+$/, ''));
  const [themeId, setThemeId] = useState(DEFAULT_TEMPLATE_ID);
  // Free plan: one template (the default); the rest show a lock and open with any paid plan.
  const [paid, setPaid] = useState(!PRICING_ENABLED);
  const selectedTemplate = templateMeta(themeId);

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await axios.get(`${API}/stats`, { headers: headers() });
        const { cardName, cardSlug, vcardCount, user } = res.data;
        if (res.data.paid) setPaid(true);

        if (vcardCount > 0 && cardName && cardSlug) {
          navigate('/dashboard', { replace: true });
          return;
        }

        setForm(f => ({
          ...f,
          name: cardName || user?.name || '',
          phone: user?.phone || '',
        }));
      } catch {
        /* proceed with empty form */
      } finally {
        setChecking(false);
      }
    };
    fetchInitial();
  }, [navigate]);

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm(f => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  };

  const handlePhotoPick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const goToTheme = () => {
    if (!form.name.trim() || !form.designation.trim() || !form.slug.trim()) {
      toast.error('Naam, designation aur username zaroori hai');
      return;
    }
    if (slugCheck.state === 'bad') {
      toast.error(slugCheck.msg || 'Yeh username available nahi hai');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append('username', form.slug.replace(/-+$/, ''));
      data.append('title', form.name);
      data.append('designation', form.designation);
      data.append('theme', themeId);
      if (photoFile) data.append('profileImage', photoFile);

      await axios.post(`${API}/vcard`, data, {
        headers: { ...headers(), 'Content-Type': 'multipart/form-data' },
      });

      if (form.phone.trim()) {
        await axios.post(`${API}/vcard`, {
          dynamicLinks: [{ fieldType: 'phone', title: 'Phone', url: form.phone.trim() }],
        }, { headers: headers() });
      }

      setSuccess(true);
      // With pricing switched off, new users go straight to their dashboard.
      setTimeout(() => navigate(PRICING_ENABLED ? '/dashboard/plans' : '/dashboard', { replace: true, state: { justOnboarded: true } }), 1100);
    } catch (err) {
      const msg = err.response?.data?.msg || '';
      if (/username|duplicate|E11000/i.test(msg)) {
        toast.error(/duplicate|E11000/i.test(msg) ? 'Yeh username already liya gaya hai, koi aur try karein' : msg);
        setStep(1);
      } else {
        toast.error(msg || 'Kuch gadbad hui, dobara try karein');
      }
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-bg)' }}>
        <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-['Inter'] relative" style={{ background: 'var(--surface-bg)' }}>
      <div className="lg:hidden absolute inset-0"><MeshBackground /></div>
      <AuthBrandPanel />

      <ThemeToggle className="fixed top-5 right-5 z-20" />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <Logo size={30} />
          </div>

          <GlassCard className="p-6 sm:p-7">
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', damping: 12, delay: 0.05 }}
                    className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </motion.div>
                  <h2 className="font-display text-xl font-bold mb-1" style={{ color: 'var(--surface-text)' }}>Card ready!</h2>
                  <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>{PRICING_ENABLED ? 'Ab plan choose karte hain...' : 'Dashboard khul raha hai...'}</p>
                </motion.div>
              ) : (
                <motion.div key={`step-${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                      <motion.div
                        className="h-full bg-gradient-to-r from-brand-600 to-brand-700 rounded-full"
                        initial={false}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={springy}
                      />
                    </div>
                    <span className="text-[11px] font-semibold shrink-0" style={{ color: 'var(--surface-text-2)' }}>Step {step}/2</span>
                  </div>

                  <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-1.5 inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick setup · 2 min
                  </p>
                  <h2 className="font-display text-2xl font-bold mb-1" style={{ color: 'var(--surface-text)' }}>
                    {step === 1 ? "Let's build your card" : 'Pick your look'}
                  </h2>
                  <p className="text-sm mb-6" style={{ color: 'var(--surface-text-2)' }}>
                    {step === 1
                      ? 'Basic details ab, baaki sab baad me dashboard se add kar sakte hain.'
                      : 'Ek theme choose karein — baad me kabhi bhi badal sakte hain.'}
                  </p>

                  <AnimatePresence mode="wait" initial={false}>
                    {step === 1 ? (
                      <motion.div
                        key="fields"
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-4"
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
                          className="flex items-center gap-4"
                        >
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center overflow-hidden shrink-0"
                          >
                            {!photoPreview && (
                              <motion.span
                                className="absolute inset-0 rounded-full border-2 border-dashed border-brand-400/50"
                                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                              />
                            )}
                            {photoPreview
                              ? <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                              : <Camera className="w-5 h-5 text-brand-400" />}
                          </motion.button>
                          <div className="text-xs" style={{ color: 'var(--surface-text-2)' }}>
                            <p className="font-semibold" style={{ color: 'var(--surface-text)' }}>Profile photo</p>
                            <p>Optional — baad me bhi add kar sakte hain</p>
                          </div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
                        </motion.div>

                        {[
                          { key: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Shubham Khurana', onChange: handleNameChange },
                          { key: 'designation', label: 'Designation / Company', icon: Briefcase, type: 'text', placeholder: 'Founder, Acme Studio' },
                          { key: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: '+91 98765 43210' },
                        ].map(({ key, label, icon: Icon, type, placeholder, onChange }, i) => (
                          <motion.div
                            key={key}
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.06 + i * 0.05 }}
                          >
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>{label}</label>
                            <div className="relative">
                              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                              <input
                                type={type}
                                required={key !== 'phone'}
                                value={form[key]}
                                onChange={onChange || ((e) => setForm(f => ({ ...f, [key]: e.target.value })))}
                                placeholder={placeholder}
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400 fast-transition"
                                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                              />
                            </div>
                          </motion.div>
                        ))}

                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.21 }}>
                          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Card URL</label>
                          <div className="relative">
                            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
                            <input
                              type="text" required value={form.slug}
                              onChange={(e) => { setSlugTouched(true); setForm(f => ({ ...f, slug: toUsername(e.target.value) })); }}
                              placeholder="shubham-khurana"
                              className="w-full pl-10 pr-4 py-2.5 rounded-lg outline-none transition text-sm focus:ring-2 focus:ring-brand-400 fast-transition"
                              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                            />
                          </div>
                          <p className="text-[11px] mt-1" style={{ color: 'var(--surface-text-2)' }}>{window.location.host}/{form.slug || 'your-name'}</p>
                          {slugCheck.state !== 'idle' && (
                            <p className={`text-[11px] mt-0.5 font-semibold ${slugCheck.state === 'ok' ? 'text-emerald-600' : slugCheck.state === 'bad' ? 'text-red-500' : ''}`} style={slugCheck.state === 'checking' ? { color: 'var(--surface-text-2)' } : undefined}>
                              {slugCheck.state === 'checking' ? 'Checking…' : slugCheck.msg}
                            </p>
                          )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }} className="pt-2">
                          <Button type="button" onClick={goToTheme} rightIcon={<ArrowRight className="w-4 h-4" />}>
                            Continue
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="theme"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-5"
                      >
                        <SelectedTemplate template={selectedTemplate} />

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {TEMPLATE_META.map((t, i) => {
                            const locked = !paid && t.id !== DEFAULT_TEMPLATE_ID;
                            return (
                              <div key={t.id} className="relative">
                                <TemplateSwatch template={t} name={form.name} index={i} selected={themeId === t.id} onClick={() => (locked ? toast('This template comes with any paid plan. The free plan includes Webkik Signature, you can upgrade any time.', { icon: '🔒' }) : setThemeId(t.id))} />
                                {locked && <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">🔒 PRO</span>}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <IconButton
                            variant="solid" size="lg"
                            type="button"
                            title="Back"
                            onClick={() => setStep(1)}
                            className="hover:border-brand-400 hover:text-brand-500"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </IconButton>
                          <div className="flex-1">
                            <Button
                              type="button" onClick={handleSubmit} loading={saving}
                              rightIcon={<ArrowRight className="w-4 h-4" />}
                            >
                              {saving ? 'Saving...' : PRICING_ENABLED ? 'Continue to Pricing' : 'Create my card'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
