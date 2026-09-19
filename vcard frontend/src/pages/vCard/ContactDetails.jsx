import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  FaPhoneAlt, FaWhatsapp, FaGlobe, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaYoutube,
  FaMapMarkerAlt, FaSpotify, FaTiktok, FaTelegram, FaGithub, FaDiscord, FaPinterest, FaSnapchat
} from 'react-icons/fa';
import { MdEmail, MdOutlineLink } from 'react-icons/md';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiMic } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';

// Smooth, premium page animations
const slowFadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }
});

const ContactDetails = () => {
  const plan = usePlan();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showVoiceFill, setShowVoiceFill] = useState(false);
  const [slug, setSlug] = useState('');

  const [links, setLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState({
    fieldType: 'Mobile / Phone',
    title: '',
    url: ''
  });
  const [editIndex, setEditIndex] = useState(null);

  const fieldOptions = [
    'Mobile / Phone', 'WhatsApp', 'Email', 'Website', 'Location',
    'LinkedIn', 'Instagram', 'Snapchat', 'Facebook', 'Twitter', 'YouTube', 'Telegram', 'TikTok', 'Custom URL'
  ];

  // Detects an appropriate icon for "Custom URL" entries based on
  // keywords found in the title or the URL itself (e.g. "Location",
  // "Spotify", "GitHub", etc). Falls back to a generic link icon.
  const detectCustomIcon = (title = '', url = '') => {
    const iconStyle = { color: 'var(--surface-text-2)' };
    const text = `${title} ${url}`.toLowerCase();

    if (/location|map|address|pin\b|gps|directions/.test(text)) {
      return <FaMapMarkerAlt className="w-4 h-4" style={iconStyle} />;
    }
    if (/spotify/.test(text)) {
      return <FaSpotify className="w-4 h-4" style={iconStyle} />;
    }
    if (/tiktok/.test(text)) {
      return <FaTiktok className="w-4 h-4" style={iconStyle} />;
    }
    if (/telegram|t\.me/.test(text)) {
      return <FaTelegram className="w-4 h-4" style={iconStyle} />;
    }
    if (/github/.test(text)) {
      return <FaGithub className="w-4 h-4" style={iconStyle} />;
    }
    if (/discord/.test(text)) {
      return <FaDiscord className="w-4 h-4" style={iconStyle} />;
    }
    if (/pinterest/.test(text)) {
      return <FaPinterest className="w-4 h-4" style={iconStyle} />;
    }
    if (/snapchat|snap\.com/.test(text)) {
      return <FaSnapchat className="w-4 h-4" style={iconStyle} />;
    }
    if (/whatsapp|wa\.me/.test(text)) {
      return <FaWhatsapp className="w-4 h-4" style={iconStyle} />;
    }
    if (/mail@|email|gmail|outlook/.test(text)) {
      return <MdEmail className="w-5 h-5" style={iconStyle} />;
    }
    if (/linkedin/.test(text)) {
      return <FaLinkedin className="w-4 h-4" style={iconStyle} />;
    }
    if (/instagram|insta\b/.test(text)) {
      return <FaInstagram className="w-4 h-4" style={iconStyle} />;
    }
    if (/facebook|fb\.com/.test(text)) {
      return <FaFacebook className="w-4 h-4" style={iconStyle} />;
    }
    if (/twitter|x\.com/.test(text)) {
      return <FaTwitter className="w-4 h-4" style={iconStyle} />;
    }
    if (/youtube|youtu\.be/.test(text)) {
      return <FaYoutube className="w-4 h-4" style={iconStyle} />;
    }

    return <MdOutlineLink className="w-5 h-5" style={iconStyle} />;
  };

  const getFieldIcon = (type, title = '', url = '') => {
    const iconStyle = { color: 'var(--surface-text-2)' };

    // For "Custom URL" entries, auto-detect a more relevant icon
    // based on what the user typed as the title / url.
    if (type === 'Custom URL') {
      return detectCustomIcon(title, url);
    }

    switch (type) {
      case 'Mobile / Phone': return <FaPhoneAlt className="w-4 h-4" style={iconStyle} />;
      case 'WhatsApp': return <FaWhatsapp className="w-4 h-4" style={iconStyle} />;
      case 'Email': return <MdEmail className="w-5 h-5" style={iconStyle} />;
      case 'Website': return <FaGlobe className="w-4 h-4" style={iconStyle} />;
      case 'LinkedIn': return <FaLinkedin className="w-4 h-4" style={iconStyle} />;
      case 'Instagram': return <FaInstagram className="w-4 h-4" style={iconStyle} />;
      case 'Facebook': return <FaFacebook className="w-4 h-4" style={iconStyle} />;
      case 'Twitter': return <FaTwitter className="w-4 h-4" style={iconStyle} />;
      case 'YouTube': return <FaYoutube className="w-4 h-4" style={iconStyle} />;
      case 'Location': return <FaMapMarkerAlt className="w-4 h-4" style={iconStyle} />;
      case 'Snapchat': return <FaSnapchat className="w-4 h-4" style={iconStyle} />;
      case 'Telegram': return <FaTelegram className="w-4 h-4" style={iconStyle} />;
      case 'TikTok': return <FaTiktok className="w-4 h-4" style={iconStyle} />;
      default: return <MdOutlineLink className="w-5 h-5" style={iconStyle} />;
    }
  };

  const getClickableUrl = (type, urlValue) => {
    if (!urlValue) return '#';
    const cleanUrl = urlValue.trim();

    switch (type) {
      case 'Mobile / Phone':
        return `tel:${cleanUrl.replace(/[^0-9+]/g, '')}`;
      case 'WhatsApp':
        return `https://wa.me/${cleanUrl.replace(/[^0-9+]/g, '')}`;
      case 'Email':
        return `mailto:${cleanUrl}`;
      case 'Location':
        if (/^https?:\/\//i.test(cleanUrl)) return cleanUrl;
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanUrl)}`;
      case 'Snapchat':
        if (!/^https?:\/\//i.test(cleanUrl) && !cleanUrl.includes('.')) return `https://www.snapchat.com/add/${cleanUrl.replace('@', '')}`;
        return /^https?:\/\//i.test(cleanUrl) ? cleanUrl : `https://${cleanUrl}`;
      case 'Website':
      case 'Telegram':
      case 'TikTok':
      case 'LinkedIn':
      case 'Instagram':
      case 'Facebook':
      case 'Twitter':
      case 'YouTube':
      case 'Custom URL':
        if (!/^https?:\/\//i.test(cleanUrl)) {
            return `https://${cleanUrl}`;
        }
        return cleanUrl;
      default:
        return cleanUrl;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
          headers: { 'x-auth-token': token }
        });

        if (res.data) {
          if (res.data.dynamicLinks) {
            setLinks(res.data.dynamicLinks);
          }
          if (res.data.username) {
            setSlug(res.data.username);
          }
        }
      } catch (error) {
        console.error('Error fetching links', error);
      }
    };
    fetchData();

    window.addEventListener('vcard:data-changed', fetchData);
    return () => window.removeEventListener('vcard:data-changed', fetchData);
  }, []);

  const handleAddOrUpdate = () => {
    if (!currentLink.title || !currentLink.url) {
      alert('Title and URL are required!');
      return;
    }
    if (editIndex !== null) {
      const updatedLinks = [...links];
      updatedLinks[editIndex] = currentLink;
      setLinks(updatedLinks);
      setEditIndex(null);
    } else {
      setLinks([...links, currentLink]);
    }
    setCurrentLink({ fieldType: 'Mobile / Phone', title: '', url: '' });
  };

  const handleEdit = (index) => {
    setCurrentLink(links[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const filteredLinks = links.filter((_, i) => i !== index);
    setLinks(filteredLinks);
  };

  const handleSaveAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { dynamicLinks: links }, {
        headers: { 'x-auth-token': token }
      });
      window.dispatchEvent(new Event('vcard:data-changed'));
      setShowPopup(true);
    } catch (err) {
      console.error('Error saving links', err);
      alert('Error saving links');
    }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.open(`/c/${slug}`, '_blank');
    } else {
      alert('Profile URL not found! Please create a profile first.');
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/products');
  };

  const handleVoiceFill = (fields) => {
    const newLinks = fields?.links || [];
    setLinks(prev => {
      const existingKeys = new Set(prev.map(l => `${l.fieldType}|${l.url}`));
      const toAdd = newLinks.filter(l => l.url && !existingKeys.has(`${l.fieldType}|${l.url}`));
      return [...prev, ...toAdd];
    });
  };

  return (
    <>
      <div className="max-w-5xl space-y-5">
        <GlassCard {...slowFadeUp(0)} className="relative overflow-hidden p-5 sm:p-6">
          <MeshBackground className="opacity-40" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>Contact & Social Links</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--surface-text-2)' }}>Add your phone numbers, emails, social media, and custom URLs here.</p>
            </div>
            {hasVoiceFill(plan) && (
              <motion.button
                whileHover={{ scale: 1.025, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.35, ease: "easeOut" }}
                type="button"
                onClick={() => setShowVoiceFill(true)}
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 fast-transition"
              >
                <FiMic className="w-4 h-4" />
                <span>Fill with Voice</span>
              </motion.button>
            )}
          </div>
        </GlassCard>

        {/* Add New Link Section */}
        <GlassCard {...slowFadeUp(0.08)} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--surface-text-2)' }}>Field Type</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5 pointer-events-none">
                  {getFieldIcon(currentLink.fieldType, currentLink.title, currentLink.url)}
                </div>
                <select
                  className="w-full pl-9 pr-3 py-2 rounded-md outline-none transition-all duration-500 text-sm appearance-none focus:ring-2 focus:ring-brand-400 focus:scale-[1.01]"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  value={currentLink.fieldType}
                  onChange={(e) => setCurrentLink({...currentLink, fieldType: e.target.value})}
                >
                  {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--surface-text-2)' }}>Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md outline-none transition-all duration-500 text-sm focus:ring-2 focus:ring-brand-400 focus:scale-[1.01]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder={{ Location: 'e.g. Our Office', Snapchat: 'e.g. My Snapchat', 'Mobile / Phone': 'e.g. Call Me', WhatsApp: 'e.g. WhatsApp Me', Email: 'e.g. Email Me' }[currentLink.fieldType] || 'e.g. Instagram Handle'}
                value={currentLink.title}
                onChange={(e) => setCurrentLink({...currentLink, title: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 sm:space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--surface-text-2)' }}>URL / Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md outline-none transition-all duration-500 text-sm focus:ring-2 focus:ring-brand-400 focus:scale-[1.01]"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  placeholder={{ Location: 'Full address or Google Maps link', Snapchat: 'Snapchat username or link', 'Mobile / Phone': '+91 98XXXXXXXX', WhatsApp: '+91 98XXXXXXXX', Email: 'you@example.com' }[currentLink.fieldType] || 'https://instagram.com/...'}
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.025, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.35, ease: "easeOut" }}
                onClick={handleAddOrUpdate}
                className="sm:mt-6 flex items-center justify-center space-x-1 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium px-4 rounded-md fast-transition hover:opacity-90 text-sm h-[38px] shrink-0"
              >
                {editIndex !== null ? <FiEdit2 className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                <span>{editIndex !== null ? 'Update' : 'Add'}</span>
              </motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Links Table */}
        {links.length > 0 ? (
          <GlassCard {...slowFadeUp(0.14)} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--surface-border)' }}>
                  <tr>
                    <th className="px-4 py-3 font-medium" style={{ color: 'var(--surface-text-2)' }}>Field Type</th>
                    <th className="px-4 py-3 font-medium" style={{ color: 'var(--surface-text-2)' }}>Title</th>
                    <th className="px-4 py-3 font-medium" style={{ color: 'var(--surface-text-2)' }}>URL / Number</th>
                    <th className="px-4 py-3 font-medium text-right" style={{ color: 'var(--surface-text-2)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {links.map((link, index) => (
                      <motion.tr
                        key={`${link.fieldType}-${link.url}-${index}`}
                        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="fast-transition hover:bg-brand-500/5"
                        style={{ borderBottom: '1px solid var(--surface-border)' }}
                      >
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--surface-text)' }}>
                          <div className="flex items-center space-x-2">
                            {getFieldIcon(link.fieldType, link.title, link.url)}
                            <span>{link.fieldType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--surface-text-2)' }}>{link.title}</td>
                        <td className="px-4 py-3 truncate max-w-xs">
                          <a
                            href={getClickableUrl(link.fieldType, link.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-500 hover:text-brand-600 hover:underline fast-transition flex items-center space-x-1"
                          >
                            <MdOutlineLink className="w-3.5 h-3.5 inline" />
                            <span className="truncate">{link.url}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleEdit(index)}
                              className="p-1.5 rounded fast-transition hover:text-brand-500 hover:bg-brand-500/10"
                              style={{ color: 'var(--surface-text-2)' }}
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(index)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded fast-transition">
                              <FiTrash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          <GlassCard {...slowFadeUp(0.14)} className="text-center py-10">
            <MdOutlineLink className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>No links added yet. Add your first link above.</p>
          </GlassCard>
        )}

        {/* Save Button */}
        <motion.div {...slowFadeUp(0.2)} className="pt-2 flex justify-end">
          <GradientButton onClick={handleSaveAll} className="sm:w-auto px-8">
            <FiSave className="w-4 h-4" />
            <span>Save All Links</span>
          </GradientButton>
        </motion.div>
      </div>

      <ActionPopup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        onPreview={handlePreview}
        onNext={handleNext}
      />

      {showVoiceFill && (
        <VoiceFillAssistant
          page="contact"
          onFill={handleVoiceFill}
          getKnown={() => ({ links })}
          onClose={() => setShowVoiceFill(false)}
        />
      )}
    </>
  );
};

export default ContactDetails;