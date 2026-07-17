import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
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
        if (res.data?.username) {
          setSlug(res.data.username);
        }
      } catch (err) { console.error('Error fetching slug', err); }
    };

    fetchSettings();
    fetchUserDetails();
  }, []);

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
      window.open(`/c/${slug}`, '_blank');
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
