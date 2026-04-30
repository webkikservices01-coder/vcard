import React, { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
        const res = await axios.get('https://vcard-backend-uuq6.onrender.com/api/settings/profile', { headers: headers() });
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
      await axios.put('https://vcard-backend-uuq6.onrender.com/api/settings/profile', profile, { headers: headers() });
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
      await axios.post('https://vcard-backend-uuq6.onrender.com/api/settings/change-password', { password: passwords.password }, { headers: headers() });
      toast.success('Password changed!');
      setPasswords({ password: '', confirm: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setSavingPwd(false); }
  };

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || 'U';

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading profile...</div>;

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">Manage your account details and settings</p>
      </div>

      {/* Avatar + Plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center space-x-5">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-xl font-black shrink-0">
          {initials}
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{`${profile.firstName} ${profile.lastName}`.trim() || 'User'}</h3>
          <div className="flex items-center space-x-2 mt-1.5 flex-wrap gap-1.5">
            <span className="inline-block border-2 border-black text-black text-xs font-bold px-3 py-1 rounded-full">{profile.plan}</span>
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${profile.status === 'active' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
              {profile.status === 'active' ? '● Active' : '○ Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Personal Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
              <input value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name *</label>
              <input value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
            <input value={profile.email} disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="+91 98765 43210" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-60">
            <Save className="w-4 h-4" /><span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-5">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
            <input type="password" value={passwords.password} onChange={e => setPasswords({...passwords, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none" placeholder="••••••••" />
          </div>
        </div>
        <div className="flex justify-end mt-5">
          <button onClick={handleChangePassword} disabled={savingPwd}
            className="flex items-center space-x-2 bg-black text-white font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-60">
            <Save className="w-4 h-4" /><span>{savingPwd ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
