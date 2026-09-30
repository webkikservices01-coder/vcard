import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Loader2 } from 'lucide-react';
import { FAVICON_EMOJIS, faviconHref } from '../../utils/favicon';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const defaultSettings = {
  enquiryEmail: '', analyticsId: '',
  hideBranding: false, showPhonebook: true, showShare: true,
  showQr: true, showQrOnShare: true, showViews: true,
  showLanguage: true, seoIndexing: true, carouselMode: true,
  showEnquiryForm: true,
  orientation: 'vertical',
  favicon: '',
};

const checkboxOptions = [
  { key: 'hideBranding',    label: 'Hide "Powered by" Branding' },
  { key: 'showPhonebook',   label: 'Show Add to Phone Book button' },
  { key: 'showShare',       label: 'Show Share Button' },
  { key: 'showQr',          label: 'Show QR Code on Card' },
  { key: 'showQrOnShare',   label: 'Show QR Code on Share Popup' },
  { key: 'showViews',       label: 'Show card view count on card' },
  { key: 'showLanguage',    label: 'Show change language option on card' },
  { key: 'seoIndexing',     label: 'Search Engine Indexing' },
  { key: 'carouselMode',    label: 'Make section content carousel (Products, Portfolio)' },
  { key: 'showEnquiryForm', label: 'Show Enquiry Form on Card' },
];

const AdvancedSettings = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');
  const [card, setCard] = useState({});
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`, { headers: headers() });
        if (res.data && Object.keys(res.data).length > 0) {
          setSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    };

    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
        if (res.data) setCard(res.data);
        if (res.data?.username) {
          setSlug(res.data.username);
        }
      } catch (err) { console.error('Error fetching slug', err); }
    };

    fetchSettings();
    fetchUserDetails();
  }, []);

  // Custom favicon image → server upload → saved as the favicon value.
  const uploadIcon = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Please use an image under 2 MB.');
    setUploadingIcon(true);
    try {
      const fd = new FormData();
      fd.append('favicon', file);
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/favicon`, fd, { headers: headers() });
      setSettings((p) => ({ ...p, favicon: data.url }));
      toast.success('Icon uploaded. Save settings to apply it.');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, settings, { headers: headers() });
      setShowPopup(true);
    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.dispatchEvent(new Event('card:preview'));
    } else {
      toast.error('Profile not found! Please create a profile first.');
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/all');
  };

  if (loading) return (
    <div className="max-w-2xl space-y-5">
      <div className="h-14 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-40 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-56 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
    </div>
  );

  return (
    <>
      <div className="max-w-2xl space-y-5 relative">
        <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl">
          <MeshBackground className="opacity-40" />
          <div className="relative py-1">
            <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>Advanced Settings</h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Fine-tune your vCard's behavior and integrations</p>
          </div>
        </motion.div>

        {/* Integrations */}
        <GlassCard {...fadeUp(0.06)} className="p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--surface-text)' }}>Integrations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Enquiry Email</label>
              <input
                type="email"
                value={settings.enquiryEmail}
                onChange={e => setSettings({ ...settings, enquiryEmail: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="enquiries@yourdomain.com"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)', opacity: 0.8 }}>Enquiry form submissions will be sent to this address</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Google Analytics ID</label>
              <input
                type="text"
                value={settings.analyticsId}
                onChange={e => setSettings({ ...settings, analyticsId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
              />
            </div>
          </div>
        </GlassCard>

        {/* Card Orientation */}
        <GlassCard {...fadeUp(0.12)} className="p-6">
          <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--surface-text)' }}>Card Orientation</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--surface-text-2)' }}>Choose how your vCard is displayed to visitors</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'vertical', label: 'Vertical', desc: 'Standard top-to-bottom layout', icon: '▯' },
              { value: 'horizontal', label: 'Horizontal', desc: 'Side-by-side business card layout', icon: '▭' },
            ].map(opt => {
              const active = settings.orientation === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSettings(s => ({ ...s, orientation: opt.value }))}
                  className={`p-4 rounded-xl text-left fast-transition ${active ? 'bg-gradient-to-br from-brand-600 to-brand-700 text-white border-transparent' : 'hover:border-brand-400'}`}
                  style={!active ? { border: '2px solid var(--surface-border)', color: 'var(--surface-text)' } : { border: '2px solid transparent' }}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="text-sm font-bold mt-2">{opt.label}</p>
                  <p className="text-xs mt-0.5" style={!active ? { color: 'var(--surface-text-2)' } : { color: 'rgba(255,255,255,0.75)' }}>{opt.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </GlassCard>

        {/* Card favicon */}
        <GlassCard {...fadeUp(0.15)} className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>Card favicon</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--surface-text-2)' }}>The small icon in the browser tab when someone opens your card.</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 shrink-0" style={{ background: 'var(--surface-2)' }} title="Preview">
              <img src={faviconHref(settings.favicon, card)} alt="" className="h-5 w-5 rounded" />
              <span className="text-xs font-medium max-w-[120px] truncate" style={{ color: 'var(--surface-text)' }}>{card?.personalInfo?.name || 'Your card'}</span>
            </div>
          </div>
          {(() => {
            const cur = settings.favicon || 'photo';
            const tile = (on) =>
              `relative grid place-items-center h-12 w-12 rounded-xl border-2 fast-transition cursor-pointer ${on ? 'border-brand-600 ring-2 ring-brand-500/30' : 'hover:border-brand-400'}`;
            const tileStyle = (on) => (on ? { background: 'var(--surface-1)' } : { borderColor: 'var(--surface-border)', background: 'var(--surface-1)' });
            const isCustom = /^(https?:|\/uploads\/)/.test(cur);
            return (
              <>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    ['photo', 'Your photo'],
                    ['initials', 'Initials'],
                    ['aicardly', 'Aicardly logo'],
                  ].map(([v, label]) => (
                    <button key={v} type="button" onClick={() => setSettings({ ...settings, favicon: v })} className="flex flex-col items-center gap-1" aria-pressed={cur === v}>
                      <span className={tile(cur === v)} style={tileStyle(cur === v)}>
                        <img src={faviconHref(v, card)} alt="" className="h-7 w-7 rounded" />
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--surface-text-2)' }}>{label}</span>
                    </button>
                  ))}
                  <label className="flex flex-col items-center gap-1 cursor-pointer" aria-pressed={isCustom}>
                    <span className={tile(isCustom)} style={tileStyle(isCustom)}>
                      {uploadingIcon ? (
                        <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--surface-text-2)' }} />
                      ) : isCustom ? (
                        <img src={faviconHref(cur, card)} alt="" className="h-7 w-7 rounded" />
                      ) : (
                        <Upload className="h-5 w-5" style={{ color: 'var(--surface-text-2)' }} />
                      )}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--surface-text-2)' }}>Upload</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/vnd.microsoft.icon" className="sr-only" onChange={uploadIcon} />
                  </label>
                </div>
                <p className="text-xs font-semibold mt-5 mb-2" style={{ color: 'var(--surface-text)' }}>Or pick an icon</p>
                <div className="grid grid-cols-8 gap-2">
                  {FAVICON_EMOJIS.map((e) => {
                    const v = 'emoji:' + e;
                    return (
                      <button
                        key={e}
                        type="button"
                        aria-label={`Use ${e} as favicon`}
                        aria-pressed={cur === v}
                        onClick={() => setSettings({ ...settings, favicon: v })}
                        className={`grid aspect-square place-items-center rounded-xl border-2 text-xl fast-transition ${cur === v ? 'border-brand-600 ring-2 ring-brand-500/30' : 'hover:border-brand-400'}`}
                        style={cur === v ? { background: 'var(--surface-1)' } : { borderColor: 'var(--surface-border)', background: 'var(--surface-1)' }}
                      >
                        {e}
                      </button>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </GlassCard>

        {/* Visibility Options */}
        <GlassCard {...fadeUp(0.18)} className="p-6">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--surface-text)' }}>Visibility & Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {checkboxOptions.map(({ key, label }) => (
              <label key={key} className="flex items-start space-x-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={settings[key] || false}
                    onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
                    className="sr-only"
                  />
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className={`w-5 h-5 rounded flex items-center justify-center fast-transition ${settings[key] ? 'bg-gradient-to-br from-brand-600 to-brand-700' : ''}`}
                    style={!settings[key] ? { border: '2px solid var(--surface-border)' } : { border: '2px solid transparent' }}
                  >
                    {settings[key] && (
                      <motion.svg
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                        className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </motion.svg>
                    )}
                  </motion.div>
                </div>
                <span className="text-sm leading-tight fast-transition group-hover:text-brand-500" style={{ color: 'var(--surface-text)' }}>{label}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        <div className="flex justify-end">
          <div className="w-full sm:w-auto min-w-[180px]">
            <GradientButton onClick={handleSave} disabled={saving} loading={saving}>
              {saving ? (
                <motion.span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </GradientButton>
          </div>
        </div>
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

export default AdvancedSettings;
