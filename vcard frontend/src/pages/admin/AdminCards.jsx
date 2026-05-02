import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Eye, ExternalLink } from 'lucide-react';

const API = `${import.meta.env.VITE_API_URL}/api/admin`;
const h = () => ({ 'x-auth-token': localStorage.getItem('token') });
const planColor = { 'Free Trial': 'bg-gray-700 text-gray-300', 'DIGITAL CARD': 'bg-blue-900 text-blue-300', 'SMART AI CARD': 'bg-purple-900 text-purple-300', 'AI AGENT PRO': 'bg-green-900 text-green-300' };

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
      <h1 className="text-xl font-black text-white">Top Cards by Views</h1>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-gray-800">
          {loading ? (
            <p className="text-center py-10 text-gray-600 text-sm">Loading...</p>
          ) : cards.map((c, i) => (
            <div key={c._id} className="px-5 py-4 flex items-center space-x-4">
              <span className="text-2xl font-black text-gray-700 w-8 shrink-0">#{i+1}</span>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                {c.personalInfo?.profilePic
                  ? <img src={c.personalInfo.profilePic} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg font-black text-gray-500">
                      {c.personalInfo?.name?.[0] || '?'}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{c.personalInfo?.name || 'Unnamed'}</p>
                <p className="text-xs text-gray-500">{c.userId?.email}</p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${planColor[c.userId?.plan] || 'bg-gray-700 text-gray-300'}`}>{c.userId?.plan}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold text-white">{c.viewCount || 0}</span>
                </div>
                {c.username && (
                  <a href={`/c/${c.username}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-400 transition">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCards;
