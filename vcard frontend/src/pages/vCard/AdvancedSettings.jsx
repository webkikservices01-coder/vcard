import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const defaultSettings = {
  enquiryEmail: '', analyticsId: '',
  hideBranding: false, showPhonebook: true, showShare: true,
  showQr: true, showQrOnShare: true, showViews: true,
  showLanguage: true, seoIndexing: true, carouselMode: true,
  orientation: 'vertical',
};

const checkboxOptions = [
  { key: 'hideBranding',  label: 'Hide "Powered by" Branding' },
  { key: 'showPhonebook', label: 'Show Add to Phone Book button' },
  { key: 'showShare',     label: 'Show Share Button' },
  { key: 'showQr',        label: 'Show QR Code on Card' },
  { key: 'showQrOnShare', label: 'Show QR Code on Share Popup' },
  { key: 'showViews',     label: 'Show card view count on card' },
  { key: 'showLanguage',  label: 'Show change language option on card' },
  { key: 'seoIndexing',   label: 'Search Engine Indexing' },
  { key: 'carouselMode',  label: 'Make section content carousel (Products, Portfolio)' },
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

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading settings...</div>;

  return (
    <>
      <div className="max-w-2xl space-y-5 relative">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h2 className="text-xl font-bold text-gray-900">Advanced Settings</h2>
          <p className="text-sm text-gray-500">Fine-tune your vCard's behavior and integrations</p>
        </motion.div>

        {/* Integrations */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Integrations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enquiry Email</label>
              <input
                type="email"
                value={settings.enquiryEmail}
                onChange={e => setSettings({ ...settings, enquiryEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                placeholder="enquiries@yourdomain.com"
              />
              <p className="text-xs text-gray-400 mt-1">Enquiry form submissions will be sent to this address</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Analytics ID</label>
              <input
                type="text"
                value={settings.analyticsId}
                onChange={e => setSettings({ ...settings, analyticsId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-400 outline-none"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
              />
            </div>
          </div>
        </motion.div>

        {/* Card Orientation */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Card Orientation</h3>
          <p className="text-xs text-gray-500 mb-4">Choose how your vCard is displayed to visitors</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'vertical', label: 'Vertical', desc: 'Standard top-to-bottom layout', icon: '▯' },
              { value: 'horizontal', label: 'Horizontal', desc: 'Side-by-side business card layout', icon: '▭' },
            ].map(opt => (
              <motion.button
                key={opt.value}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setSettings(s => ({ ...s, orientation: opt.value }))}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${settings.orientation === opt.value ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <p className="text-sm font-bold mt-2">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${settings.orientation === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Visibility Options */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Visibility & Features</h3>
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
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      settings[key] ? 'bg-pink-600 border-pink-600' : 'border-gray-300 group-hover:border-gray-400'
                    }`}
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
                <span className="text-sm text-gray-700 leading-tight">{label}</span>
              </label>
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
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </motion.button>
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
