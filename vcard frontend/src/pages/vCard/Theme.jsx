// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { Upload, X, Palette } from 'lucide-react';

// export const allThemes = [
//   {
//     id: 'theme-one', name: 'Theme One', text: 'Classic White', type: 'basic', layout: 'classic',
//     styles: { bg: '#ffffff', cardBg: '#ffffff', nameColor: '#111827', designationColor: '#6b7280', contactBg: '#111827', contactText: '#ffffff', sectionBg: '#f9fafb', border: '#e5e7eb', accent: '#111827' }
//   },
//   {
//     id: 'theme-two', name: 'Theme Two', text: 'Dark Minimal', type: 'basic', layout: 'classic',
//     styles: { bg: '#0f172a', cardBg: '#0f172a', nameColor: '#f1f5f9', designationColor: '#94a3b8', contactBg: '#1e293b', contactText: '#f1f5f9', sectionBg: '#1e293b', border: '#334155', accent: '#38bdf8' }
//   },
//   {
//     id: 'theme-three', name: 'Theme Three', text: 'Soft Gray', type: 'basic', layout: 'wave',
//     styles: { bg: '#f8fafc', cardBg: '#f8fafc', nameColor: '#1e293b', designationColor: '#64748b', contactBg: '#1e293b', contactText: '#ffffff', sectionBg: '#ffffff', border: '#e2e8f0', accent: '#1e293b' }
//   },
//   {
//     id: 'theme-four', name: 'Theme Four', text: 'Zinc Dark', type: 'basic', layout: 'wave',
//     styles: { bg: '#18181b', cardBg: '#18181b', nameColor: '#fafafa', designationColor: '#a1a1aa', contactBg: '#27272a', contactText: '#fafafa', sectionBg: '#27272a', border: '#3f3f46', accent: '#a1a1aa' }
//   },
//   {
//     id: 'theme-five', name: 'Theme Five', text: 'Charcoal Pro', type: 'predefined', layout: 'hero',
//     gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
//     bannerGradient: 'linear-gradient(160deg, #111827 0%, #374151 60%, #4b5563 100%)',
//     styles: { bg: '#1f2937', cardBg: '#1f2937', nameColor: '#ffffff', designationColor: '#9ca3af', contactBg: '#374151', contactText: '#ffffff', sectionBg: '#374151', border: '#4b5563', accent: '#60a5fa' }
//   },
//   {
//     id: 'theme-six', name: 'Theme Six', text: 'Royal Slate', type: 'predefined', layout: 'hero',
//     gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
//     bannerGradient: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)',
//     styles: { bg: '#1e1b4b', cardBg: '#1e1b4b', nameColor: '#e0e7ff', designationColor: '#a5b4fc', contactBg: '#3730a3', contactText: '#e0e7ff', sectionBg: '#312e81', border: '#4338ca', accent: '#818cf8' }
//   },
//   {
//     id: 'theme-seven', name: 'Theme Seven', text: 'Midnight Glass', type: 'predefined', layout: 'glass',
//     gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
//     bannerGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
//     styles: { bg: '#0f0c29', cardBg: '#0f0c29', nameColor: '#ffffff', designationColor: '#c4b5fd', contactBg: 'rgba(255,255,255,0.12)', contactText: '#ffffff', sectionBg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', accent: '#a78bfa' }
//   },
//   {
//     id: 'theme-eight', name: 'Theme Eight', text: 'Aurora Dark', type: 'predefined', layout: 'glass',
//     gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)',
//     bannerGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #065f46 100%)',
//     styles: { bg: '#022c22', cardBg: '#022c22', nameColor: '#ecfdf5', designationColor: '#6ee7b7', contactBg: 'rgba(255,255,255,0.12)', contactText: '#ecfdf5', sectionBg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)', accent: '#34d399' }
//   },
// ];

// // Build a live theme object from custom settings — used by Theme.jsx preview + PublicVcard
// export const buildCustomTheme = (ct) => {
//   const bannerBg = ct.bannerImage
//     ? `url(${ct.bannerImage}) center/cover no-repeat`
//     : (ct.bannerColor || '#111827');
//   return {
//     id: 'custom',
//     name: 'Custom',
//     text: 'Your Design',
//     type: 'custom',
//     layout: ct.layout || 'classic',
//     gradient: bannerBg,
//     bannerGradient: bannerBg,
//     bgImage: ct.bgImage || '',
//     styles: {
//       bg: ct.bg || '#ffffff',
//       cardBg: ct.bg || '#ffffff',
//       nameColor: ct.nameColor || '#111827',
//       designationColor: ct.designationColor || '#6b7280',
//       contactBg: ct.contactBg || '#111827',
//       contactText: ct.contactText || '#ffffff',
//       sectionBg: ct.sectionBg || '#f9fafb',
//       border: ct.border || '#e5e7eb',
//       accent: ct.accent || '#111827',
//     }
//   };
// };

// const defaultCustom = {
//   layout: 'classic',
//   bg: '#ffffff', bgImage: '',
//   bannerColor: '#111827', bannerImage: '',
//   nameColor: '#111827', designationColor: '#6b7280',
//   contactBg: '#111827', contactText: '#ffffff',
//   sectionBg: '#f9fafb', border: '#e5e7eb', accent: '#111827',
// };

// // ─── Small color picker swatch ───────────────────────────────────────────────
// const ColorSwatch = ({ value, onChange, label }) => (
//   <div className="flex items-center justify-between py-2">
//     <span className="text-xs text-gray-600">{label}</span>
//     <div className="flex items-center space-x-2">
//       <div className="relative w-7 h-7 rounded-lg border border-gray-300 overflow-hidden shrink-0" title={value}>
//         <div className="absolute inset-0" style={{ background: value }} />
//         <input
//           type="color" value={value} onChange={e => onChange(e.target.value)}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//         />
//       </div>
//       <span className="text-[10px] text-gray-400 font-mono w-14 shrink-0">{value}</span>
//     </div>
//   </div>
// );

// // ─── Background picker (color + optional image upload) ───────────────────────
// const BgPicker = ({ title, colorKey, imageKey, ct, setCt, uploading, onUpload }) => (
//   <div className="border border-gray-100 rounded-xl p-4 space-y-3">
//     <h4 className="text-sm font-bold text-gray-800">{title}</h4>
//     <ColorSwatch label="Color" value={ct[colorKey]} onChange={v => setCt(p => ({ ...p, [colorKey]: v }))} />
//     {ct[imageKey] ? (
//       <div className="relative mt-1">
//         <img src={ct[imageKey]} alt="bg" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
//         <button
//           onClick={() => setCt(p => ({ ...p, [imageKey]: '' }))}
//           className="absolute top-1 right-1 w-5 h-5 bg-pink-600/80 text-white rounded-full flex items-center justify-center"
//         >
//           <X className="w-3 h-3" />
//         </button>
//         <p className="text-[10px] text-gray-400 mt-1">Image is active — overrides color above</p>
//       </div>
//     ) : (
//       <label className={`flex items-center justify-center space-x-2 border-2 border-dashed border-gray-200 rounded-lg py-3 cursor-pointer hover:border-gray-400 transition text-xs text-gray-500 mt-1 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
//         <Upload className="w-3.5 h-3.5" />
//         <span>{uploading ? 'Uploading…' : 'Upload image (optional)'}</span>
//         <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
//       </label>
//     )}
//   </div>
// );

// // ─── Theme thumbnail mockup ───────────────────────────────────────────────────
// const ThemeMockup = ({ theme }) => {
//   const s = theme.styles;
//   const isLight = ['theme-one', 'theme-three'].includes(theme.id);
//   const bar = isLight ? '#d1d5db' : 'rgba(255,255,255,0.2)';

//   if (theme.layout === 'hero') return (
//     <div className="w-full h-28 rounded-lg overflow-hidden relative" style={{ background: theme.bannerGradient || theme.gradient || s.bg, border: `1px solid ${s.border}` }}>
//       <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 flex items-end space-x-2">
//         <div className="w-9 h-9 rounded-full border-2 border-white/30 shrink-0" style={{ background: s.contactBg }} />
//         <div className="flex-1 mb-1">
//           <div className="w-16 h-1.5 rounded mb-1" style={{ background: bar }} />
//           <div className="w-10 h-1 rounded" style={{ background: bar, opacity: 0.6 }} />
//         </div>
//       </div>
//       <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: s.accent || s.contactText, opacity: 0.6 }} />
//     </div>
//   );

//   if (theme.layout === 'glass') return (
//     <div className="w-full h-28 rounded-lg overflow-hidden relative" style={{ background: theme.bannerGradient || theme.gradient || s.bg, border: `1px solid ${s.border}` }}>
//       <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
//         <div className="flex items-center space-x-2">
//           <div className="w-8 h-8 rounded-full border border-white/30 shrink-0" style={{ background: s.contactBg }} />
//           <div>
//             <div className="w-14 h-1.5 rounded mb-1" style={{ background: 'rgba(255,255,255,0.7)' }} />
//             <div className="w-10 h-1 rounded" style={{ background: 'rgba(255,255,255,0.4)' }} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   if (theme.layout === 'wave') return (
//     <div className="w-full h-28 rounded-lg overflow-hidden flex flex-col items-center justify-start" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
//       <div className="w-full h-10 relative" style={{ background: theme.gradient || s.contactBg }}>
//         <svg viewBox="0 0 100 20" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '10px' }}>
//           <path d="M0,10 Q25,0 50,10 Q75,20 100,10 L100,20 L0,20 Z" fill={s.bg} />
//         </svg>
//       </div>
//       <div className="w-8 h-8 rounded-full -mt-4 mb-1 border-2 z-10" style={{ background: s.contactBg, borderColor: s.bg }} />
//       <div className="w-14 h-1.5 rounded mb-1" style={{ background: bar }} />
//       <div className="w-10 h-1 rounded mb-1.5" style={{ background: bar, opacity: 0.6 }} />
//       <div className="w-4/5 h-4 rounded" style={{ background: s.contactBg, opacity: 0.25 }} />
//     </div>
//   );

//   return (
//     <div className="w-full h-28 rounded-lg overflow-hidden flex flex-col items-center justify-start" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
//       <div className="w-full h-10" style={{ background: theme.gradient || s.contactBg }} />
//       <div className="w-9 h-9 rounded-full -mt-4 mb-1 border-2 z-10" style={{ background: s.contactBg, borderColor: s.bg }} />
//       <div className="w-14 h-1.5 rounded mb-1" style={{ background: bar }} />
//       <div className="w-10 h-1 rounded mb-2" style={{ background: bar, opacity: 0.6 }} />
//       <div className="w-4/5 h-4 rounded" style={{ background: s.contactBg, opacity: 0.25 }} />
//     </div>
//   );
// };

// const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

// const Theme = () => {
//   const [selected, setSelected] = useState('theme-one');
//   const [ct, setCt] = useState(defaultCustom);
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState({ bg: false, banner: false });

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
//         if (res.data?.theme) setSelected(res.data.theme);
//         if (res.data?.customTheme) setCt(prev => ({ ...prev, ...res.data.customTheme }));
//       } catch {} finally { setLoading(false); }
//     };
//     load();
//   }, []);

//   const uploadImage = async (file, key) => {
//     const which = key === 'bgImage' ? 'bg' : 'banner';
//     setUploading(p => ({ ...p, [which]: true }));
//     try {
//       const fd = new FormData();
//       fd.append('image', file);
//       const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/upload-image`, fd, {
//         headers: { ...headers(), 'Content-Type': 'multipart/form-data' }
//       });
//       setCt(p => ({ ...p, [key]: res.data.url }));
//       toast.success('Image uploaded!');
//     } catch { toast.error('Image upload failed'); }
//     finally { setUploading(p => ({ ...p, [which]: false })); }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       if (selected === 'custom') {
//         await Promise.all([
//           axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: 'custom' }, { headers: headers() }),
//           axios.put(`${import.meta.env.VITE_API_URL}/api/vcard/custom-theme`, ct, { headers: headers() }),
//         ]);
//       } else {
//         await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: selected }, { headers: headers() });
//       }
//       toast.success('Theme saved!');
//     } catch { toast.error('Failed to save. Make sure you have created a vCard profile first.'); }
//     finally { setSaving(false); }
//   };

//   const layouts = [
//     { value: 'classic', label: 'Classic', desc: 'Centered' },
//     { value: 'wave',    label: 'Wave',    desc: 'Curved header' },
//     { value: 'hero',    label: 'Hero',    desc: 'Side layout' },
//     { value: 'glass',   label: 'Glass',   desc: 'Glassmorphism' },
//   ];

//   const previewTheme = buildCustomTheme(ct);

//   if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>;

//   const ThemeCard = ({ theme }) => (
//     <button
//       onClick={() => setSelected(theme.id)}
//       className={`rounded-xl p-3 border-2 transition-all ${selected === theme.id ? 'border-black shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
//     >
//       <ThemeMockup theme={theme} />
//       <p className="text-xs font-semibold text-gray-700 mt-2 text-center">{theme.name}</p>
//       <p className="text-[10px] text-gray-400 text-center">{theme.text}</p>
//       {selected === theme.id && (
//         <div className="mt-2 flex justify-center">
//           <span className="bg-black text-white text-[9px] font-bold px-2 py-0.5 rounded-full">✓ SELECTED</span>
//         </div>
//       )}
//     </button>
//   );

//   return (
//     <div className="space-y-6 max-w-4xl">

//       {/* Basic Themes */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-base font-bold text-gray-900 mb-1">Basic Themes</h3>
//         <p className="text-sm text-gray-500 mb-5">Clean, minimal themes for your digital card.</p>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {allThemes.filter(t => t.type === 'basic').map(t => <ThemeCard key={t.id} theme={t} />)}
//         </div>
//       </div>

//       {/* Predefined Themes */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-base font-bold text-gray-900 mb-1">Predefined Themes</h3>
//         <p className="text-sm text-gray-500 mb-5">Fixed color &amp; layout — visually distinct designs.</p>
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {allThemes.filter(t => t.type === 'predefined').map(t => <ThemeCard key={t.id} theme={t} />)}
//         </div>
//       </div>

//       {/* Custom Theme */}
//       <div className={`bg-white rounded-xl border-2 transition-all p-6 ${selected === 'custom' ? 'border-black' : 'border-gray-200'}`}>
//         <div className="flex items-center justify-between mb-5">
//           <div className="flex items-center space-x-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
//               <Palette className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h3 className="text-base font-bold text-gray-900">Custom Theme</h3>
//               <p className="text-sm text-gray-500">Set your own colors, backgrounds &amp; layout</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setSelected('custom')}
//             className={`px-4 py-2 rounded-lg text-sm font-semibold transition shrink-0 ${selected === 'custom' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
//           >
//             {selected === 'custom' ? '✓ Active' : 'Use This'}
//           </button>
//         </div>

//         {selected === 'custom' && (
//           <div className="space-y-5">

//             {/* Live preview + layout picker */}
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="shrink-0">
//                 <p className="text-xs text-gray-500 mb-2 text-center font-medium">Live Preview</p>
//                 <div className="w-36">
//                   <ThemeMockup theme={previewTheme} />
//                 </div>
//               </div>
//               <div className="flex-1 space-y-2">
//                 <p className="text-sm font-bold text-gray-800">Card Layout</p>
//                 <div className="grid grid-cols-2 gap-2">
//                   {layouts.map(l => (
//                     <button
//                       key={l.value}
//                       onClick={() => setCt(p => ({ ...p, layout: l.value }))}
//                       className={`text-left px-3 py-2.5 rounded-lg border text-xs transition ${ct.layout === l.value ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
//                     >
//                       <span className="font-bold block">{l.label}</span>
//                       <span className={ct.layout === l.value ? 'text-gray-300' : 'text-gray-400'}>{l.desc}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Background pickers */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <BgPicker
//                 title="Card Background"
//                 colorKey="bg" imageKey="bgImage"
//                 ct={ct} setCt={setCt}
//                 uploading={uploading.bg}
//                 onUpload={f => uploadImage(f, 'bgImage')}
//               />
//               <BgPicker
//                 title="Banner / Header Background"
//                 colorKey="bannerColor" imageKey="bannerImage"
//                 ct={ct} setCt={setCt}
//                 uploading={uploading.banner}
//                 onUpload={f => uploadImage(f, 'bannerImage')}
//               />
//             </div>

//             {/* Text & accent colors */}
//             <div className="border border-gray-100 rounded-xl p-4">
//               <h4 className="text-sm font-bold text-gray-800 mb-1">Text &amp; Accent Colors</h4>
//               <div className="divide-y divide-gray-50">
//                 <ColorSwatch label="Name / Title Color" value={ct.nameColor} onChange={v => setCt(p => ({ ...p, nameColor: v }))} />
//                 <ColorSwatch label="Subtitle / Designation Color" value={ct.designationColor} onChange={v => setCt(p => ({ ...p, designationColor: v }))} />
//                 <ColorSwatch label="Accent / Highlight Color" value={ct.accent} onChange={v => setCt(p => ({ ...p, accent: v }))} />
//                 <ColorSwatch label="Section Background" value={ct.sectionBg} onChange={v => setCt(p => ({ ...p, sectionBg: v }))} />
//                 <ColorSwatch label="Border Color" value={ct.border} onChange={v => setCt(p => ({ ...p, border: v }))} />
//               </div>
//             </div>

//             {/* Button colors */}
//             <div className="border border-gray-100 rounded-xl p-4">
//               <h4 className="text-sm font-bold text-gray-800 mb-1">Contact Button Colors</h4>
//               <div className="divide-y divide-gray-50">
//                 <ColorSwatch label="Button Background" value={ct.contactBg} onChange={v => setCt(p => ({ ...p, contactBg: v }))} />
//                 <ColorSwatch label="Button Text / Icon" value={ct.contactText} onChange={v => setCt(p => ({ ...p, contactText: v }))} />
//               </div>
//             </div>

//           </div>
//         )}
//       </div>

//       <div className="flex justify-end">
//         <button
//           onClick={handleSave} disabled={saving}
//           className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition disabled:opacity-60"
//         >
//           {saving ? 'Saving…' : 'Save Theme'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Theme;










import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, X, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';

export const allThemes = [
  {
    id: 'theme-one', name: 'Theme One', text: 'Classic White', type: 'basic', layout: 'classic',
    styles: { bg: '#ffffff', cardBg: '#ffffff', nameColor: '#111827', designationColor: '#6b7280', contactBg: '#111827', contactText: '#ffffff', sectionBg: '#f9fafb', border: '#e5e7eb', accent: '#111827' }
  },
  {
    id: 'theme-two', name: 'Theme Two', text: 'Dark Minimal', type: 'basic', layout: 'classic',
    styles: { bg: '#0f172a', cardBg: '#0f172a', nameColor: '#f1f5f9', designationColor: '#94a3b8', contactBg: '#1e293b', contactText: '#f1f5f9', sectionBg: '#1e293b', border: '#334155', accent: '#38bdf8' }
  },
  {
    id: 'theme-three', name: 'Theme Three', text: 'Soft Gray', type: 'basic', layout: 'wave',
    styles: { bg: '#f8fafc', cardBg: '#f8fafc', nameColor: '#1e293b', designationColor: '#64748b', contactBg: '#1e293b', contactText: '#ffffff', sectionBg: '#ffffff', border: '#e2e8f0', accent: '#1e293b' }
  },
  {
    id: 'theme-four', name: 'Theme Four', text: 'Zinc Dark', type: 'basic', layout: 'wave',
    styles: { bg: '#18181b', cardBg: '#18181b', nameColor: '#fafafa', designationColor: '#a1a1aa', contactBg: '#27272a', contactText: '#fafafa', sectionBg: '#27272a', border: '#3f3f46', accent: '#a1a1aa' }
  },
  {
    id: 'theme-five', name: 'Theme Five', text: 'Charcoal Pro', type: 'predefined', layout: 'hero',
    gradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    bannerGradient: 'linear-gradient(160deg, #111827 0%, #374151 60%, #4b5563 100%)',
    styles: { bg: '#1f2937', cardBg: '#1f2937', nameColor: '#ffffff', designationColor: '#9ca3af', contactBg: '#374151', contactText: '#ffffff', sectionBg: '#374151', border: '#4b5563', accent: '#60a5fa' }
  },
  {
    id: 'theme-six', name: 'Theme Six', text: 'Royal Slate', type: 'predefined', layout: 'hero',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)',
    bannerGradient: 'linear-gradient(160deg, #1e1b4b 0%, #3730a3 60%, #4f46e5 100%)',
    styles: { bg: '#1e1b4b', cardBg: '#1e1b4b', nameColor: '#e0e7ff', designationColor: '#a5b4fc', contactBg: '#3730a3', contactText: '#e0e7ff', sectionBg: '#312e81', border: '#4338ca', accent: '#818cf8' }
  },
  {
    id: 'theme-seven', name: 'Theme Seven', text: 'Midnight Glass', type: 'predefined', layout: 'glass',
    gradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    bannerGradient: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    styles: { bg: '#0f0c29', cardBg: '#0f0c29', nameColor: '#ffffff', designationColor: '#c4b5fd', contactBg: 'rgba(255,255,255,0.12)', contactText: '#ffffff', sectionBg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', accent: '#a78bfa' }
  },
  {
    id: 'theme-eight', name: 'Theme Eight', text: 'Aurora Dark', type: 'predefined', layout: 'glass',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 40%, #0f766e 100%)',
    bannerGradient: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #065f46 100%)',
    styles: { bg: '#022c22', cardBg: '#022c22', nameColor: '#ecfdf5', designationColor: '#6ee7b7', contactBg: 'rgba(255,255,255,0.12)', contactText: '#ecfdf5', sectionBg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.12)', accent: '#34d399' }
  },
];

export const buildCustomTheme = (ct) => {
  const bannerBg = ct.bannerImage
    ? `url(${ct.bannerImage}) center/cover no-repeat`
    : (ct.bannerColor || '#111827');
  return {
    id: 'custom',
    name: 'Custom',
    text: 'Your Design',
    type: 'custom',
    layout: ct.layout || 'classic',
    gradient: bannerBg,
    bannerGradient: bannerBg,
    bgImage: ct.bgImage || '',
    styles: {
      bg: ct.bg || '#ffffff',
      cardBg: ct.bg || '#ffffff',
      nameColor: ct.nameColor || '#111827',
      designationColor: ct.designationColor || '#6b7280',
      contactBg: ct.contactBg || '#111827',
      contactText: ct.contactText || '#ffffff',
      sectionBg: ct.sectionBg || '#f9fafb',
      border: ct.border || '#e5e7eb',
      accent: ct.accent || '#111827',
    }
  };
};

const defaultCustom = {
  layout: 'classic',
  bg: '#ffffff', bgImage: '',
  bannerColor: '#111827', bannerImage: '',
  nameColor: '#111827', designationColor: '#6b7280',
  contactBg: '#111827', contactText: '#ffffff',
  sectionBg: '#f9fafb', border: '#e5e7eb', accent: '#111827',
};

const ColorSwatch = ({ value, onChange, label }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-xs text-gray-600">{label}</span>
    <div className="flex items-center space-x-2">
      <div className="relative w-7 h-7 rounded-lg border border-gray-300 overflow-hidden shrink-0" title={value}>
        <div className="absolute inset-0" style={{ background: value }} />
        <input
          type="color" value={value} onChange={e => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-[10px] text-gray-400 font-mono w-14 shrink-0">{value}</span>
    </div>
  </div>
);

const BgPicker = ({ title, colorKey, imageKey, ct, setCt, uploading, onUpload }) => (
  <div className="border border-gray-100 rounded-xl p-4 space-y-3">
    <h4 className="text-sm font-bold text-gray-800">{title}</h4>
    <ColorSwatch label="Color" value={ct[colorKey]} onChange={v => setCt(p => ({ ...p, [colorKey]: v }))} />
    {ct[imageKey] ? (
      <div className="relative mt-1">
        <img src={ct[imageKey]} alt="bg" className="w-full h-20 object-cover rounded-lg border border-gray-200" />
        <button
          onClick={() => setCt(p => ({ ...p, [imageKey]: '' }))}
          className="absolute top-1 right-1 w-5 h-5 bg-pink-600/80 text-white rounded-full flex items-center justify-center"
        >
          <X className="w-3 h-3" />
        </button>
        <p className="text-[10px] text-gray-400 mt-1">Image is active — overrides color above</p>
      </div>
    ) : (
      <label className={`flex items-center justify-center space-x-2 border-2 border-dashed border-gray-200 rounded-lg py-3 cursor-pointer hover:border-gray-400 transition text-xs text-gray-500 mt-1 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Upload className="w-3.5 h-3.5" />
        <span>{uploading ? 'Uploading…' : 'Upload image (optional)'}</span>
        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && onUpload(e.target.files[0])} />
      </label>
    )}
  </div>
);

const ThemeMockup = ({ theme }) => {
  const s = theme.styles;
  const isLight = ['theme-one', 'theme-three'].includes(theme.id);
  const bar = isLight ? '#d1d5db' : 'rgba(255,255,255,0.2)';

  if (theme.layout === 'hero') return (
    <div className="w-full h-28 rounded-lg overflow-hidden relative" style={{ background: theme.bannerGradient || theme.gradient || s.bg, border: `1px solid ${s.border}` }}>
      <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 flex items-end space-x-2">
        <div className="w-9 h-9 rounded-full border-2 border-white/30 shrink-0" style={{ background: s.contactBg }} />
        <div className="flex-1 mb-1">
          <div className="w-16 h-1.5 rounded mb-1" style={{ background: bar }} />
          <div className="w-10 h-1 rounded" style={{ background: bar, opacity: 0.6 }} />
        </div>
      </div>
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: s.accent || s.contactText, opacity: 0.6 }} />
    </div>
  );

  if (theme.layout === 'glass') return (
    <div className="w-full h-28 rounded-lg overflow-hidden relative" style={{ background: theme.bannerGradient || theme.gradient || s.bg, border: `1px solid ${s.border}` }}>
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full border border-white/30 shrink-0" style={{ background: s.contactBg }} />
          <div>
            <div className="w-14 h-1.5 rounded mb-1" style={{ background: 'rgba(255,255,255,0.7)' }} />
            <div className="w-10 h-1 rounded" style={{ background: 'rgba(255,255,255,0.4)' }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (theme.layout === 'wave') return (
    <div className="w-full h-28 rounded-lg overflow-hidden flex flex-col items-center justify-start" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="w-full h-10 relative" style={{ background: theme.gradient || s.contactBg }}>
        <svg viewBox="0 0 100 20" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '10px' }}>
          <path d="M0,10 Q25,0 50,10 Q75,20 100,10 L100,20 L0,20 Z" fill={s.bg} />
        </svg>
      </div>
      <div className="w-8 h-8 rounded-full -mt-4 mb-1 border-2 z-10" style={{ background: s.contactBg, borderColor: s.bg }} />
      <div className="w-14 h-1.5 rounded mb-1" style={{ background: bar }} />
      <div className="w-10 h-1 rounded mb-1.5" style={{ background: bar, opacity: 0.6 }} />
      <div className="w-4/5 h-4 rounded" style={{ background: s.contactBg, opacity: 0.25 }} />
    </div>
  );

  return (
    <div className="w-full h-28 rounded-lg overflow-hidden flex flex-col items-center justify-start" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="w-full h-10" style={{ background: theme.gradient || s.contactBg }} />
      <div className="w-9 h-9 rounded-full -mt-4 mb-1 border-2 z-10" style={{ background: s.contactBg, borderColor: s.bg }} />
      <div className="w-14 h-1.5 rounded mb-1" style={{ background: bar }} />
      <div className="w-10 h-1 rounded mb-2" style={{ background: bar, opacity: 0.6 }} />
      <div className="w-4/5 h-4 rounded" style={{ background: s.contactBg, opacity: 0.25 }} />
    </div>
  );
};

const headers = () => ({ 'x-auth-token': localStorage.getItem('token') });

const Theme = () => {
  const navigate = useNavigate(); // STEP 2: Initiate navigate
  const [selected, setSelected] = useState('theme-one');
  const [ct, setCt] = useState(defaultCustom);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ bg: false, banner: false });
  
  // STEP 2: State for popup & slug
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, { headers: headers() });
        if (res.data?.theme) setSelected(res.data.theme);
        if (res.data?.customTheme) setCt(prev => ({ ...prev, ...res.data.customTheme }));
        
        // STEP 3: Save slug for preview link
        if (res.data?.username) setSlug(res.data.username);
        
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    load();
  }, []);

  const uploadImage = async (file, key) => {
    const which = key === 'bgImage' ? 'bg' : 'banner';
    setUploading(p => ({ ...p, [which]: true }));
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/upload-image`, fd, {
        headers: { ...headers(), 'Content-Type': 'multipart/form-data' }
      });
      setCt(p => ({ ...p, [key]: res.data.url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(p => ({ ...p, [which]: false })); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selected === 'custom') {
        await Promise.all([
          axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: 'custom' }, { headers: headers() }),
          axios.put(`${import.meta.env.VITE_API_URL}/api/vcard/custom-theme`, ct, { headers: headers() }),
        ]);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { theme: selected }, { headers: headers() });
      }
      toast.success('Theme saved!');
      
      // STEP 4: Show popup on success
      setShowPopup(true);

    } catch { toast.error('Failed to save. Make sure you have created a vCard profile first.'); }
    finally { setSaving(false); }
  };

  // STEP 4: Next aur Preview ke functions
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
    // Yahan maine contact-details route daala hai, apne route ke hisaab se badal lena
    navigate('/dashboard/vcard/contact'); 
  };

  const layouts = [
    { value: 'classic', label: 'Classic', desc: 'Centered' },
    { value: 'wave',    label: 'Wave',    desc: 'Curved header' },
    { value: 'hero',    label: 'Hero',    desc: 'Side layout' },
    { value: 'glass',   label: 'Glass',   desc: 'Glassmorphism' },
  ];

  const previewTheme = buildCustomTheme(ct);

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>;

  const ThemeCard = ({ theme, idx }) => (
    <motion.button
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.05 }}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
      onClick={() => setSelected(theme.id)}
      className={`rounded-xl p-3 border-2 transition-colors ${selected === theme.id ? 'border-pink-600 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
    >
      <ThemeMockup theme={theme} />
      <p className="text-xs font-semibold text-gray-700 mt-2 text-center">{theme.name}</p>
      <p className="text-[10px] text-gray-400 text-center">{theme.text}</p>
      <AnimatePresence>
        {selected === theme.id && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            exit={{ opacity: 0, scale: 0.7, height: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="mt-2 flex justify-center overflow-hidden"
          >
            <span className="bg-pink-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">✓ SELECTED</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <>
      <div className="space-y-6 max-w-4xl relative">

        {/* Basic Themes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Basic Themes</h3>
          <p className="text-sm text-gray-500 mb-5">Clean, minimal themes for your digital card.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allThemes.filter(t => t.type === 'basic').map((t, i) => <ThemeCard key={t.id} theme={t} idx={i} />)}
          </div>
        </motion.div>

        {/* Predefined Themes */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-1">Predefined Themes</h3>
          <p className="text-sm text-gray-500 mb-5">Fixed color &amp; layout — visually distinct designs.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allThemes.filter(t => t.type === 'predefined').map((t, i) => <ThemeCard key={t.id} theme={t} idx={i} />)}
          </div>
        </motion.div>

        {/* Custom Theme */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
          className={`bg-white rounded-xl border-2 transition-colors p-6 ${selected === 'custom' ? 'border-pink-600' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Custom Theme</h3>
                <p className="text-sm text-gray-500">Set your own colors, backgrounds &amp; layout</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setSelected('custom')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0 ${selected === 'custom' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {selected === 'custom' ? '✓ Active' : 'Use This'}
            </motion.button>
          </div>

          <AnimatePresence initial={false}>
          {selected === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5 overflow-hidden"
            >

              {/* Live preview + layout picker */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="shrink-0">
                  <p className="text-xs text-gray-500 mb-2 text-center font-medium">Live Preview</p>
                  <div className="w-36">
                    <ThemeMockup theme={previewTheme} />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-bold text-gray-800">Card Layout</p>
                  <div className="grid grid-cols-2 gap-2">
                    {layouts.map(l => (
                      <motion.button
                        key={l.value}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setCt(p => ({ ...p, layout: l.value }))}
                        className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${ct.layout === l.value ? 'border-pink-600 bg-pink-600 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
                      >
                        <span className="font-bold block">{l.label}</span>
                        <span className={ct.layout === l.value ? 'text-gray-300' : 'text-gray-400'}>{l.desc}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Background pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BgPicker
                  title="Card Background"
                  colorKey="bg" imageKey="bgImage"
                  ct={ct} setCt={setCt}
                  uploading={uploading.bg}
                  onUpload={f => uploadImage(f, 'bgImage')}
                />
                <BgPicker
                  title="Banner / Header Background"
                  colorKey="bannerColor" imageKey="bannerImage"
                  ct={ct} setCt={setCt}
                  uploading={uploading.banner}
                  onUpload={f => uploadImage(f, 'bannerImage')}
                />
              </div>

              {/* Text & accent colors */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-800 mb-1">Text &amp; Accent Colors</h4>
                <div className="divide-y divide-gray-50">
                  <ColorSwatch label="Name / Title Color" value={ct.nameColor} onChange={v => setCt(p => ({ ...p, nameColor: v }))} />
                  <ColorSwatch label="Subtitle / Designation Color" value={ct.designationColor} onChange={v => setCt(p => ({ ...p, designationColor: v }))} />
                  <ColorSwatch label="Accent / Highlight Color" value={ct.accent} onChange={v => setCt(p => ({ ...p, accent: v }))} />
                  <ColorSwatch label="Section Background" value={ct.sectionBg} onChange={v => setCt(p => ({ ...p, sectionBg: v }))} />
                  <ColorSwatch label="Border Color" value={ct.border} onChange={v => setCt(p => ({ ...p, border: v }))} />
                </div>
              </div>

              {/* Button colors */}
              <div className="border border-gray-100 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-800 mb-1">Contact Button Colors</h4>
                <div className="divide-y divide-gray-50">
                  <ColorSwatch label="Button Background" value={ct.contactBg} onChange={v => setCt(p => ({ ...p, contactBg: v }))} />
                  <ColorSwatch label="Button Text / Icon" value={ct.contactText} onChange={v => setCt(p => ({ ...p, contactText: v }))} />
                </div>
              </div>

            </motion.div>
          )}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={handleSave} disabled={saving}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 inline-flex items-center gap-2"
          >
            {saving && (
              <motion.span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
            )}
            {saving ? 'Saving…' : 'Save Theme'}
          </motion.button>
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