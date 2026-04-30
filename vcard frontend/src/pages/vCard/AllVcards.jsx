import React, { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AllVcards = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/vcard/all', {
        headers: { 'x-auth-token': token }
      });
      setCards(res.data);
    } catch (err) {
      toast.error('Failed to load vCards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vCard? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/vcard/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('vCard deleted');
      fetchCards();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = cards.filter(c =>
    (c.personalInfo?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All vCards</h2>
          <p className="text-sm text-gray-500">Manage your digital business cards</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
              placeholder="Search cards..."
            />
          </div>
          <Link
            to="/dashboard/vcard/profile"
            className="flex items-center space-x-2 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Card</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No vCards yet</p>
            <p className="text-gray-400 text-xs mt-1">Create your first digital card</p>
            <Link to="/dashboard/vcard/profile" className="inline-block mt-4 bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition">
              Create vCard
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">vCard</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Slug</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Views</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {card.personalInfo?.name?.[0]?.toUpperCase() || 'V'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{card.personalInfo?.name || 'Unnamed Card'}</p>
                          <p className="text-xs text-gray-500">{card.personalInfo?.designation || 'No designation'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <a
                        href={`/c/${card.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-600 hover:text-black flex items-center space-x-1"
                      >
                        <span>/c/{card.username}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className="inline-flex items-center space-x-1 text-sm text-gray-600">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{card.viewCount || 0}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end space-x-1">
                        <a
                          href={`/c/${card.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          to="/dashboard/vcard/profile"
                          className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Showing {filtered.length} of {cards.length} cards</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllVcards;
