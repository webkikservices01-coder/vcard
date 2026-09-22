import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { fadeUp } from '../../utils/motion';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const planColor = {
  'Free Trial':    'bg-gray-500/15 text-gray-400',
  'DIGITAL CARD':  'bg-blue-500/15 text-blue-400',
  'SMART AI CARD': 'bg-purple-500/15 text-purple-400',
  'AI AGENT PRO':  'bg-emerald-500/15 text-emerald-400',
};

const AdminCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/cards`, { headers: h() })
      .then(r => setCards(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-black" style={{ color: 'var(--surface-text)' }}>Top Cards by Views</h1>
      <GlassCard {...fadeUp(0)} className="overflow-hidden">
        <div>
          {loading ? (
            <p className="text-center py-10 text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</p>
          ) : cards.map((c, i) => (
            <div
              key={c._id}
              className="px-5 py-4 flex items-center space-x-4 hover:bg-brand-500/5 fast-transition"
              style={i > 0 ? { borderTop: '1px solid var(--surface-border)' } : undefined}
            >
              <span className="text-2xl font-black w-8 shrink-0" style={{ color: 'var(--surface-text-2)', opacity: 0.5 }}>#{i+1}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0" style={{ background: 'var(--surface-2)' }}>
                {c.personalInfo?.profilePic
                  ? <img src={c.personalInfo.profilePic} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg font-black" style={{ color: 'var(--surface-text-2)' }}>
                      {c.personalInfo?.name?.[0] || '?'}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: 'var(--surface-text)' }}>{c.personalInfo?.name || 'Unnamed'}</p>
                <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>{c.userId?.email}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${planColor[c.userId?.plan] || 'bg-gray-500/15 text-gray-400'}`}>{c.userId?.plan}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center space-x-1" style={{ color: 'var(--surface-text-2)' }}>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold" style={{ color: 'var(--surface-text)' }}>{c.viewCount || 0}</span>
                </div>
                {c.username && (
                  <a
                    href={`/c/${c.username}`} target="_blank" rel="noopener noreferrer"
                    className="hover:text-brand-500 fast-transition" style={{ color: 'var(--surface-text-2)' }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminCards;
