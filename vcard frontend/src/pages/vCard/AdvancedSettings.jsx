// import React, { useState, useEffect } from 'react';
// import { Save } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const token = () => localStorage.getItem('token');
// const headers = () => ({ 'x-auth-token': token() });

// const defaultSettings = {
//   enquiryEmail: '', analyticsId: '',
//   hideBranding: false, showPhonebook: true, showShare: true,
//   showQr: true, showQrOnShare: true, showViews: true,
//   showLanguage: true, seoIndexing: true, carouselMode: true,
//   orientation: 'vertical',
// };

// const checkboxOptions = [
//   { key: 'hideBranding',  label: 'Hide "Powered by" Branding' },
//   { key: 'showPhonebook', label: 'Show Add to Phone Book button' },
//   { key: 'showShare',     label: 'Show Share Button' },
//   { key: 'showQr',        label: 'Show QR Code on Card' },
//   { key: 'showQrOnShare', label: 'Show QR Code on Share Popup' },
//   { key: 'showViews',     label: 'Show card view count on card' },
//   { key: 'showLanguage',  label: 'Show change language option on card' },
//   { key: 'seoIndexing',   label: 'Search Engine Indexing' },
//   { key: 'carouselMode',  label: 'Make section content carousel (Products, Portfolio)' },
// ];

// const AdvancedSettings = () => {
//   const [settings, setSettings] = useState(defaultSettings);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     const fetch = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings`, { headers: headers() });
//         if (res.data && Object.keys(res.data).length > 0) {
//           setSettings(prev => ({ ...prev, ...res.data }));
//         }
//       } catch {} finally { setLoading(false); }
//     };
//     fetch();
//   }, []);

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, settings, { headers: headers() });
//       toast.success('Settings saved!');
//     } catch { toast.error('Failed to save settings'); }
//     finally { setSaving(false); }
//   };

//   if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading settings...</div>;

//   return (
//     <div className="max-w-2xl space-y-5">
//       <div>
//         <h2 className="text-xl font-bold text-gray-900">Advanced Settings</h2>
//         <p className="text-sm text-gray-500">Fine-tune your vCard's behavior and integrations</p>
//       </div>

//       {/* Integrations */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-sm font-bold text-gray-900 mb-4">Integrations</h3>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Enquiry Email</label>
//             <input
//               type="email"
//               value={settings.enquiryEmail}
//               onChange={e => setSettings({ ...settings, enquiryEmail: e.target.value })}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
//               placeholder="enquiries@yourdomain.com"
//             />
//             <p className="text-xs text-gray-400 mt-1">Enquiry form submissions will be sent to this address</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Analytics ID</label>
//             <input
//               type="text"
//               value={settings.analyticsId}
//               onChange={e => setSettings({ ...settings, analyticsId: e.target.value })}
//               className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
//               placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Card Orientation */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-sm font-bold text-gray-900 mb-1">Card Orientation</h3>
//         <p className="text-xs text-gray-500 mb-4">Choose how your vCard is displayed to visitors</p>
//         <div className="grid grid-cols-2 gap-3">
//           {[
//             { value: 'vertical', label: 'Vertical', desc: 'Standard top-to-bottom layout', icon: '▯' },
//             { value: 'horizontal', label: 'Horizontal', desc: 'Side-by-side business card layout', icon: '▭' },
//           ].map(opt => (
//             <button
//               key={opt.value}
//               onClick={() => setSettings(s => ({ ...s, orientation: opt.value }))}
//               className={`p-4 rounded-xl border-2 text-left transition ${settings.orientation === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
//             >
//               <span className="text-2xl">{opt.icon}</span>
//               <p className="text-sm font-bold mt-2">{opt.label}</p>
//               <p className={`text-xs mt-0.5 ${settings.orientation === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</p>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Visibility Options */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-sm font-bold text-gray-900 mb-4">Visibility & Features</h3>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           {checkboxOptions.map(({ key, label }) => (
//             <label key={key} className="flex items-start space-x-3 cursor-pointer group">
//               <div className="relative mt-0.5">
//                 <input
//                   type="checkbox"
//                   checked={settings[key] || false}
//                   onChange={e => setSettings({ ...settings, [key]: e.target.checked })}
//                   className="sr-only"
//                 />
//                 <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
//                   settings[key] ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'
//                 }`}>
//                   {settings[key] && (
//                     <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                     </svg>
//                   )}
//                 </div>
//               </div>
//               <span className="text-sm text-gray-700 leading-tight">{label}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div className="flex justify-end">
//         <button
//           onClick={handleSave}
//           disabled={saving}
//           className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-60"
//         >
//           <Save className="w-4 h-4" />
//           <span>{saving ? 'Saving...' : 'Save Settings'}</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdvancedSettings;





import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

// STEP 1: Router aur ActionPopup import karein
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
  // STEP 2: Navigate aur Popup States
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
      } catch {} finally { setLoading(false); }
    };

    // STEP 3: Preview link ke liye slug fetch karna
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
        if (res.data?.username) {
          setSlug(res.data.username);
        }
      } catch (err) { console.error("Error fetching slug", err); }
    };

    fetchSettings();
    fetchUserDetails();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings`, settings, { headers: headers() });
      
      // toast.success('Settings saved!'); // Alert hide kar diya 
      
      // STEP 4: Success hone par Action Popup trigger karein
      setShowPopup(true);

    } catch { toast.error('Failed to save settings'); }
    finally { setSaving(false); }
  };

  // STEP 5: Preview aur Next function
  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.open(`/c/${slug}`, '_blank');
    } else {
      toast.error("Profile not found! Please create a profile first.");
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    // Settings save karne ke baad usually hum main dashboard list par bhejte hain
    navigate('/dashboard/vcard/all'); 
  };

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading settings...</div>;

  return (
    <>
      <div className="max-w-2xl space-y-5 relative">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Advanced Settings</h2>
          <p className="text-sm text-gray-500">Fine-tune your vCard's behavior and integrations</p>
        </div>

        {/* Integrations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Integrations</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enquiry Email</label>
              <input
                type="email"
                value={settings.enquiryEmail}
                onChange={e => setSettings({ ...settings, enquiryEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        {/* Card Orientation */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-1">Card Orientation</h3>
          <p className="text-xs text-gray-500 mb-4">Choose how your vCard is displayed to visitors</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'vertical', label: 'Vertical', desc: 'Standard top-to-bottom layout', icon: '▯' },
              { value: 'horizontal', label: 'Horizontal', desc: 'Side-by-side business card layout', icon: '▭' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSettings(s => ({ ...s, orientation: opt.value }))}
                className={`p-4 rounded-xl border-2 text-left transition ${settings.orientation === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <p className="text-sm font-bold mt-2">{opt.label}</p>
                <p className={`text-xs mt-0.5 ${settings.orientation === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Visibility Options */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    settings[key] ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {settings[key] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-700 leading-tight">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* STEP 6: Action Popup Component */}
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