import React, { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const token = () => localStorage.getItem('token');
const headers = () => ({ 'x-auth-token': token() });

const UserProfile = () => {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', plan: '', status: 'active' });
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/settings/profile`, { headers: headers() });
        const u = res.data;
        const nameParts = (u.name || '').split(' ');
        setProfile({
          firstName: u.firstName || nameParts[0] || '',
          lastName: u.lastName || nameParts.slice(1).join(' ') || '',
          email: u.email || '',
          phone: u.phone || '',
          plan: u.plan || 'Free Trial',
          status: u.status || 'active'
        });
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/settings/profile`, profile, { headers: headers() });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!passwords.password) { toast.error('Enter a new password'); return; }
    if (passwords.password !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSavingPwd(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/settings/change-password`, { password: passwords.password }, { headers: headers() });
      toast.success('Password changed!');
      setPasswords({ password: '', confirm: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setSavingPwd(false); }
  };

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      <div className="h-24 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      <div className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-5">
      <div className="relative rounded-2xl overflow-hidden px-1 py-2">
        <MeshBackground className="opacity-40" />
        <motion.div {...fadeUp(0)} className="relative">
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>My Profile</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Manage your account details and settings</p>
        </motion.div>
      </div>

      {/* Avatar + Plan */}
      <GlassCard {...fadeUp(0.08)} className="p-6 flex items-center space-x-5">
        <div className="w-16 h-16 bg-gradient-to-br from-brand-600 to-brand-700 rounded-full flex items-center justify-center text-white text-xl font-black shrink-0">
          {initials}
        </div>
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--surface-text)' }}>{`${profile.firstName} ${profile.lastName}`.trim() || 'User'}</h3>
          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-1.5">
            <span className="inline-block border-2 border-brand-500 text-brand-500 text-xs font-bold px-3 py-1 rounded-full">{profile.plan}</span>
            <span
              className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${profile.status === 'active' ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white' : ''}`}
              style={profile.status !== 'active' ? { background: 'var(--surface-2)', color: 'var(--surface-text-2)' } : undefined}
            >
              {profile.status === 'active' ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Profile form */}
      <GlassCard {...fadeUp(0.14)} className="p-6">
        <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--surface-text)' }}>Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>First Name *</label>
              <input
                value={profile.firstName}
                onChange={e => setProfile({...profile, firstName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Last Name *</label>
              <input
                value={profile.lastName}
                onChange={e => setProfile({...profile, lastName: e.target.value})}
                className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Email Address</label>
            <input
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg text-sm cursor-not-allowed"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--surface-text-2)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)' }}>Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Phone Number</label>
            <input
              value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <GradientButton onClick={handleSave} disabled={saving} className="!w-auto px-6">
            <Save className="w-4 h-4" /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </GradientButton>
        </div>
      </GlassCard>

      {/* Change Password */}
      <GlassCard {...fadeUp(0.2)} className="p-6">
        <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--surface-text)' }}>Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>New Password</label>
            <input
              type="password"
              value={passwords.password}
              onChange={e => setPasswords({...passwords, password: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              placeholder="Min. 6 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full px-4 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-400 fast-transition"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <GradientButton onClick={handleChangePassword} disabled={savingPwd} className="!w-auto px-6">
            <Save className="w-4 h-4" /><span>{savingPwd ? 'Updating...' : 'Update Password'}</span>
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default UserProfile;
