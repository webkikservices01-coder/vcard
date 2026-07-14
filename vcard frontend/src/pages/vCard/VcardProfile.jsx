import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Copy, Eye, Save, Image as ImageIcon, UserCircle, Mic } from 'lucide-react';
import axios from 'axios';
import ActionPopup from '../../components/ActionPopup';
import VoiceFillAssistant from '../../components/VoiceFillAssistant';
import { useNavigate } from 'react-router-dom';
import { usePlan, hasVoiceFill } from '../../utils/plan';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const VcardProfile = () => {
  const navigate = useNavigate();
  const plan = usePlan();

  const [formData, setFormData] = useState({
    profileImage: null,
    bannerImage: null,
    slug: '',
    title: '',
    subTitle: '',
    description: ''
  });

  const [showPopup, setShowPopup] = useState(false);
  const [showVoiceFill, setShowVoiceFill] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
          headers: { 'x-auth-token': token }
        });

        if (res.data) {
          setFormData({
            profileImage: res.data.personalInfo?.profilePic || null,
            bannerImage: res.data.personalInfo?.bannerImage || null,
            slug: res.data.username || '',
            title: res.data.personalInfo?.name || '',
            subTitle: res.data.personalInfo?.designation || '',
            description: res.data.personalInfo?.bio || ''
          });
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchProfileData();

    // Jarvis voice assistant can update this profile from anywhere in the dashboard — refetch when it does
    window.addEventListener('vcard:data-changed', fetchProfileData);
    return () => window.removeEventListener('vcard:data-changed', fetchProfileData);
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [type]: imageUrl }));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('username', formData.slug);
    data.append('title', formData.title);
    data.append('designation', formData.subTitle);
    data.append('bio', formData.description);

    const profileFileInput = document.querySelector('input[type="file"][name="profileImage"]');
    const bannerFileInput = document.querySelector('input[type="file"][name="bannerImage"]');

    if (profileFileInput?.files[0]) data.append('profileImage', profileFileInput.files[0]);
    if (bannerFileInput?.files[0]) data.append('bannerImage', bannerFileInput.files[0]);

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
          profileImage: res.data.card.personalInfo?.profilePic || prev.profileImage,
          bannerImage: res.data.card.personalInfo?.bannerImage || prev.bannerImage,
        }));
      }

      // Save hone par popup show karein
      setShowPopup(true);
    } catch (error) {
      alert('Update Failed');
    }
  };

  const handlePreview = () => {
    setShowPopup(false);
    if (formData.slug) {
      window.open(`/c/${formData.slug}`, '_blank');
    } else {
      alert("Pehle profile save karein jisme slug/url ho!");
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    navigate('/dashboard/vcard/theme');

  };

  const handleVoiceFill = (fields) => {
    setFormData(prev => ({
      ...prev,
      title: fields.title ?? prev.title,
      subTitle: fields.subTitle ?? prev.subTitle,
      description: fields.description ?? prev.description,
    }));
  };

  return (
    <>
      <div className="max-w-4xl space-y-5">

        {/* ── Header ─────────────────────────────────── */}
        <GlassCard {...fadeUp(0)} className="relative overflow-hidden p-5 sm:p-6">
          <MeshBackground className="opacity-40" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>Profile Details</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--surface-text-2)' }}>Manage your card's identity, images, and short bio.</p>
            </div>
            {hasVoiceFill(plan) && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => setShowVoiceFill(true)}
                className="shrink-0 w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 fast-transition"
              >
                <Mic className="w-4 h-4" />
                <span>Fill with Voice</span>
              </motion.button>
            )}
          </div>
        </GlassCard>

        {/* ── Form ─────────────────────────────────── */}
        <GlassCard {...fadeUp(0.08)} className="p-4 sm:p-8">
          <motion.form onSubmit={handleSubmit} {...staggerContainer(0.08, 0.12)} className="space-y-8">

            {/* Images Section */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8" style={{ borderBottom: '1px solid var(--surface-border)' }}>

              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--surface-text)' }}>Profile Image</label>
                <div className="flex items-center space-x-6">
                  <motion.div layout className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ border: '2px solid var(--surface-border)', background: 'var(--surface-2)' }}>
                    {formData.profileImage ? (
                      <img
                        src={getImageUrl(formData.profileImage)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <UserCircle className="w-10 h-10" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
                    )}
                  </motion.div>
                  <div>
                    <motion.label
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="cursor-pointer text-brand-500 hover:border-brand-500 text-sm font-medium py-2 px-4 rounded-md fast-transition inline-flex items-center space-x-2"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Profile</span>
                      <input type="file" name="profileImage" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profileImage')} />
                    </motion.label>
                    <p className="text-xs mt-2" style={{ color: 'var(--surface-text-2)' }}>Recommended: 500x500px</p>
                  </div>
                </div>
              </div>

              {/* Banner Image */}
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--surface-text)' }}>Banner Image</label>
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-20 rounded-lg overflow-hidden flex items-center justify-center shrink-0" style={{ border: '2px solid var(--surface-border)', background: 'var(--surface-2)' }}>
                    {formData.bannerImage ? (
                      <img src={getImageUrl(formData.bannerImage)} alt="Banner" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                    ) : (
                      <ImageIcon className="w-8 h-8" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }} />
                    )}
                  </div>
                  <div>
                    <motion.label
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      className="cursor-pointer text-brand-500 hover:border-brand-500 text-sm font-medium py-2 px-4 rounded-md fast-transition inline-flex items-center space-x-2"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Banner</span>
                      <input type="file" name="bannerImage" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'bannerImage')} />
                    </motion.label>
                    <p className="text-xs mt-2" style={{ color: 'var(--surface-text-2)' }}>Recommended: 1000x400px</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Slug / Card URL */}
            <motion.div variants={staggerItem}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Slug / Card URL <span className="text-red-500">*</span></label>
              <div className="flex rounded-md min-w-0">
                <span className="inline-flex items-center px-3 rounded-l-md text-xs shrink-0" style={{ border: '1px solid var(--surface-border)', borderRight: 'none', background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}>
                  mycardlink.site/
                </span>
                <input
                  type="text" name="slug" value={formData.slug} onChange={handleChange}
                  className="flex-1 min-w-0 block px-3 py-2.5 rounded-none rounded-r-md outline-none fast-transition text-sm focus:ring-2 focus:ring-brand-400"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  required
                />
              </div>
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Title <span className="text-red-500">*</span></label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-md outline-none fast-transition text-sm focus:ring-2 focus:ring-brand-400"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  placeholder="e.g. Shubham Khurana" required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Sub Title <span className="text-red-500">*</span></label>
                <input
                  type="text" name="subTitle" value={formData.subTitle} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-md outline-none fast-transition text-sm focus:ring-2 focus:ring-brand-400"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                  placeholder="e.g. Founder - Webkik" required
                />
              </div>
            </motion.div>

            {/* Short Description */}
            <motion.div variants={staggerItem}>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Short Description <span className="text-red-500">*</span></label>
              <textarea
                name="description" value={formData.description} onChange={handleChange} rows="4"
                className="w-full px-4 py-2.5 rounded-md outline-none fast-transition text-sm resize-none focus:ring-2 focus:ring-brand-400"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="Write a short and crisp bio..." required
              ></textarea>
            </motion.div>

            {/* Action Buttons (Footer) */}
            <motion.div variants={staggerItem} className="pt-6 flex flex-col sm:flex-row sm:flex-wrap sm:justify-end gap-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                type="button"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 text-brand-500 hover:bg-brand-500/10 hover:border-brand-500 font-medium py-2 px-4 rounded-md fast-transition text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}
              >
                <Copy className="w-4 h-4" />
                <span>Copy URL</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => {
                  if (formData.slug) window.open(`/c/${formData.slug}`, '_blank');
                }}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 text-brand-500 hover:bg-brand-500/10 hover:border-brand-500 font-medium py-2 px-4 rounded-md fast-transition text-sm"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </motion.button>

              <GradientButton type="submit" className="sm:w-auto px-8">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </GradientButton>
            </motion.div>
          </motion.form>
        </GlassCard>
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
