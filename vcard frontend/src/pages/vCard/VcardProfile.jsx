import React, { useState, useEffect } from 'react';
import { Upload, Copy, Eye, Save, Image as ImageIcon, UserCircle } from 'lucide-react';
import axios from 'axios';

const VcardProfile = () => {
  // 1. Initial state ko empty/blank rakhein
  const [formData, setFormData] = useState({
    profileImage: null,
    bannerImage: null,
    slug: '',
    title: '',
    subTitle: '',
    description: ''
  });

  // 2. Component load hote hi backend se data mangwane ka logic
  useEffect(() => {
  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://vcard-backend-uuq6.onrender.com/api/vcard/me', {
        headers: { 'x-auth-token': token }
      });

      if (res.data) {
        setFormData({
          // Backend ke Schema ke hisaab se links uthana
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
}, []);

  // Backend se aane wali relative URLs ko full URL banata hai
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `https://vcard-backend-uuq6.onrender.com${url.startsWith('/') ? url : '/' + url}`;
  };

  // Image Preview Logic
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
      const res = await axios.post('https://vcard-backend-uuq6.onrender.com/api/vcard', data, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data'
        }
      });
      // Save ke baad backend se aaye naye URLs state me update karo
      if (res.data?.card) {
        setFormData(prev => ({
          ...prev,
          profileImage: res.data.card.personalInfo?.profilePic || prev.profileImage,
          bannerImage: res.data.card.personalInfo?.bannerImage || prev.bannerImage,
        }));
      }
      alert('vCard Updated Successfully!');
    } catch (error) {
      alert('Update Failed');
    }
  };

  return (
    <div className="max-w-4xl bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-black tracking-tight">Profile Details</h2>
        <p className="text-sm text-gray-500 mt-1">Manage your card's identity, images, and short bio.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Images Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-100">
          
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">Profile Image</label>
            <div className="flex items-center space-x-6">
              {/* Profile Image Preview */}
<div className="w-24 h-24 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
  {formData.profileImage ? (
    <img
      src={getImageUrl(formData.profileImage)}
      alt="Profile"
      className="w-full h-full object-cover"
      onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
    />
  ) : (
    <UserCircle className="w-10 h-10 text-gray-300" />
  )}
</div>
              <div>
                <label className="cursor-pointer bg-white border border-gray-300 hover:border-black text-black text-sm font-medium py-2 px-4 rounded-md transition-all inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Profile</span>
                  <input type="file" name="profileImage" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profileImage')} />
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: 500x500px</p>
              </div>
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className="block text-sm font-medium text-black mb-3">Banner Image</label>
            <div className="flex items-center space-x-6">
              <div className="w-32 h-20 rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                {formData.bannerImage ? (
                  <img src={getImageUrl(formData.bannerImage)} alt="Banner" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <label className="cursor-pointer bg-white border border-gray-300 hover:border-black text-black text-sm font-medium py-2 px-4 rounded-md transition-all inline-flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Banner</span>
                  <input type="file" name="bannerImage" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'bannerImage')} />
                </label>
                <p className="text-xs text-gray-500 mt-2">Recommended: 1000x400px</p>
              </div>
            </div>
          </div>
        </div>

        {/* Slug / Card URL */}
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Slug / Card URL <span className="text-red-500">*</span></label>
          <div className="flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              https://mycardlink.site/
            </span>
            <input 
              type="text" name="slug" value={formData.slug} onChange={handleChange}
              className="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-none rounded-r-md border border-gray-300 focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
              required
            />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Title <span className="text-red-500">*</span></label>
            <input 
              type="text" name="title" value={formData.title} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
              placeholder="e.g. Shubham Khurana" required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-1.5">Sub Title <span className="text-red-500">*</span></label>
            <input 
              type="text" name="subTitle" value={formData.subTitle} onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm"
              placeholder="e.g. Founder - Webkik" required
            />
          </div>
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Short Description <span className="text-red-500">*</span></label>
          <textarea 
            name="description" value={formData.description} onChange={handleChange} rows="4"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-all text-sm resize-none"
            placeholder="Write a short and crisp bio..." required
          ></textarea>
        </div>

        {/* Action Buttons (Footer) */}
        <div className="pt-6 border-t border-gray-100 flex flex-wrap justify-end gap-3">
          <button 
            type="button" 
            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-black font-medium py-2 px-4 rounded-md transition duration-200 text-sm"
          >
            <Copy className="w-4 h-4" />
            <span>Copy URL</span>
          </button>
          
          <button 
            type="button" 
            className="flex items-center space-x-2 bg-white border border-gray-300 hover:bg-gray-50 text-black font-medium py-2 px-4 rounded-md transition duration-200 text-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>

          <button 
            type="submit" 
            className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition duration-200 text-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default VcardProfile;