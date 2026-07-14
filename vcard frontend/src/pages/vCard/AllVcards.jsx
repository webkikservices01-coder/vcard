import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Trash2, Plus, Search, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

const AllVcards = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/all`, {
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
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/vcard/${id}`, {
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
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl">
        <MeshBackground className="opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-3 py-1">
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>All vCards</h2>
            <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Manage your digital business cards</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surface-text-2)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none fast-transition focus:ring-2 focus:ring-brand-400"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
                placeholder="Search cards..."
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                to="/dashboard/vcard/profile"
                className="flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-bold px-4 py-2 rounded-lg hover:opacity-90 fast-transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Card</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeUp(0.08)} className="text-center py-16 rounded-2xl" style={{ border: '2px dashed var(--surface-border)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--surface-2)' }}>
            <Plus className="w-7 h-7" style={{ color: 'var(--surface-text-2)' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--surface-text-2)' }}>No vCards yet</p>
          <p className="text-xs mt-1" style={{ color: 'var(--surface-text-2)', opacity: 0.8 }}>Create your first digital card</p>
          <Link to="/dashboard/vcard/profile" className="inline-block mt-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 fast-transition">
            Create vCard
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div {...staggerContainer(0.06, 0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((card) => (
                <GlassCard key={card._id} variants={staggerItem} exit={{ opacity: 0, scale: 0.94 }} hover className="p-5 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {card.personalInfo?.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--surface-text)' }}>{card.personalInfo?.name || 'Unnamed Card'}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--surface-text-2)' }}>{card.personalInfo?.designation || 'No designation'}</p>
                    </div>
                  </div>

                  <a
                    href={`/c/${card.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs hover:text-brand-500 fast-transition mb-3 w-fit"
                    style={{ color: 'var(--surface-text-2)' }}
                  >
                    <span>/c/{card.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1 text-sm mb-4" style={{ color: 'var(--surface-text-2)' }}>
                    <Eye className="w-3.5 h-3.5" />
                    <span>{card.viewCount || 0} views</span>
                  </div>

                  <div className="flex items-center justify-end gap-1 mt-auto pt-3" style={{ borderTop: '1px solid var(--surface-border)' }}>
                    <a
                      href={`/c/${card.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg fast-transition hover:text-brand-500 hover:bg-brand-500/10"
                      style={{ color: 'var(--surface-text-2)' }}
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <Link
                      to="/dashboard/vcard/profile"
                      className="p-2 rounded-lg fast-transition hover:text-brand-500 hover:bg-brand-500/10"
                      style={{ color: 'var(--surface-text-2)' }}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(card._id)}
                      className="p-2 rounded-lg fast-transition hover:text-red-500 hover:bg-red-500/10"
                      style={{ color: 'var(--surface-text-2)' }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </GlassCard>
              ))}
            </AnimatePresence>
          </motion.div>
          <p className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Showing {filtered.length} of {cards.length} cards</p>
        </>
      )}
    </div>
  );
};

export default AllVcards;
