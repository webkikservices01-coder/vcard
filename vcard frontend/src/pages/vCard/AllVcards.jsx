import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Pencil, Trash2, Plus, Search, Sparkles, ChevronLeft, ChevronRight,
  User, Palette, Phone, ShoppingBag, Briefcase, Image as ImageIcon, Star, QrCode, Layout, Edit3, X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MeshBackground from '../../components/ui/MeshBackground';
import { allThemes, buildCustomTheme } from './Theme';
import { fadeUp, staggerContainer, staggerItem } from '../../utils/motion';

function getInitials(fullName) {
  if (!fullName || typeof fullName !== 'string') return 'AI';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ── Smokee & Smoky-Glow Orbiting Tech Animation Component ────────
const OrbitingTechAnimation = ({ matrixText }) => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[480px] flex items-center justify-center overflow-hidden bg-transparent p-4">
      <style>{`
        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinReverseSlow {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes floatCore {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.06); }
        }
        .orbit-ring-1 {
          animation: spinSlow 34s linear infinite;
        }
        .orbit-ring-2 {
          animation: spinReverseSlow 46s linear infinite;
        }
        .core-pulse {
          animation: floatCore 4s ease-in-out infinite;
        }
        .smoky-watermark {
          text-shadow: 0 0 25px rgba(231, 12, 101, 0.15), 0 0 50px rgba(0, 0, 0, 0.08);
          filter: blur(0.4px);
        }
      `}</style>

      {/* Smokee Cinematic Watermark Background Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 px-2">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-900/[0.09] dark:text-white/[0.05] font-serif text-center break-words max-w-full leading-tight smoky-watermark transition-colors">
          {matrixText}
        </h1>
      </div>

      {/* Ambient background smoky glow */}
      <div className="absolute w-80 h-80 rounded-full bg-[#E70C65]/15 dark:bg-[#E70C65]/20 blur-[110px] pointer-events-none z-10" />

      {/* Orbit Container */}
      <div className="relative z-20 w-full h-[420px] flex items-center justify-center">
        {/* Center Core */}
        <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#E70C65] to-[#cf0a55] p-0.5 shadow-[0_0_40px_rgba(231,12,101,0.4)] core-pulse">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[22px] flex items-center justify-center transition-colors">
              <Sparkles className="w-11 h-11 text-[#E70C65] dark:text-yellow-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Orbit Ring 1 (Inner) */}
        <div className="absolute w-[280px] h-[280px] rounded-full border border-slate-300/80 dark:border-white/10 orbit-ring-1 transition-colors">
          <div 
            onClick={() => navigate('/dashboard/vcard/profile')}
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-[#E70C65]/40 flex items-center justify-center text-[#E70C65] dark:text-[#ff80ab] shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Profile Setup"
          >
            <User className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/theme')}
            className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-pink-500/40 flex items-center justify-center text-pink-600 dark:text-pink-400 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Theme Studio"
          >
            <Palette className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/contact')}
            className="absolute top-1/2 -left-5 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Contact Details"
          >
            <Phone className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/products')}
            className="absolute top-1/2 -right-5 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-[#E70C65]/40 flex items-center justify-center text-[#E70C65] dark:text-[#ff80ab] shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Products & Services"
          >
            <ShoppingBag className="w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Orbit Ring 2 (Outer) */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-dashed border-slate-300/80 dark:border-white/10 orbit-ring-2 transition-colors">
          <div 
            onClick={() => navigate('/dashboard/vcard/portfolio')}
            className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Portfolio"
          >
            <Briefcase className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/gallery')}
            className="absolute bottom-6 right-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Gallery"
          >
            <ImageIcon className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/custom')}
            className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="Custom Sections"
          >
            <Layout className="w-5 h-5 pointer-events-none" />
          </div>
          <div 
            onClick={() => navigate('/dashboard/vcard/qr')}
            className="absolute bottom-6 left-6 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-pink-500/40 flex items-center justify-center text-pink-600 dark:text-pink-300 shadow-lg dark:shadow-xl backdrop-blur-md cursor-pointer hover:scale-125 transition-all z-30"
            title="QR Code"
          >
            <QrCode className="w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ── 2D Card Tile Component with Larger Profile Avatar Section ───────
const LiveCardTile2D = ({ card, onDelete }) => {
  const personalInfo = card.personalInfo || {};
  const name = personalInfo.name || "Your Name";
  const designation = personalInfo.designation || "Executive / Member";
  const slug = card.username || "user";
  const viewCount = card.viewCount || 0;

  const themeId = card.theme || 'midnight-tech';
  const theme = themeId === 'custom' && card.customTheme
    ? buildCustomTheme(card.customTheme)
    : (allThemes.find(t => t.id === themeId) || allThemes[0]);
  
  const s = theme.styles;
  const themeColor = themeId === 'custom' && card.customTheme?.accent ? card.customTheme.accent : (theme.laserColor || s.accent || '#E70C65');
  
  const linkBgColor = themeId === 'custom' && card.customTheme?.linkBg 
    ? card.customTheme.linkBg 
    : (s.contactBg || themeColor);

  const subText = themeId === 'custom' && card.customTheme?.subTextColor 
    ? card.customTheme.subTextColor 
    : (s.subTextColor || '#ff80ab');

  let photoUrl = personalInfo.profilePic || null;
  if (photoUrl && !photoUrl.startsWith('http') && !photoUrl.startsWith('blob:') && !photoUrl.startsWith('data:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    photoUrl = `${apiUrl}${photoUrl.startsWith('/') ? photoUrl : '/' + photoUrl}`;
  }

  let bgImageUrl = personalInfo.bannerImage || null;
  if (bgImageUrl && !bgImageUrl.startsWith('http') && !bgImageUrl.startsWith('blob:') && !bgImageUrl.startsWith('data:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    bgImageUrl = `${apiUrl}${bgImageUrl.startsWith('/') ? bgImageUrl : '/' + bgImageUrl}`;
  }

  const initials = getInitials(name);
  const cardUrl = `${window.location.origin}/c/${slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="rounded-[32px] border border-slate-200 dark:border-white/20 bg-white/90 dark:bg-[#121b33]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-hidden relative group max-w-lg mx-auto transition-colors"
      style={{ boxShadow: `0 20px 40px rgba(0,0,0,0.18), 0 0 25px ${themeColor}25` }}
    >
      <div
        className="relative w-full aspect-[1.58/1] rounded-[24px] p-5 overflow-hidden shadow-2xl border flex flex-col justify-between select-none"
        style={{
          backgroundImage: bgImageUrl 
            ? `linear-gradient(rgba(18, 24, 38, 0.4), rgba(18, 24, 38, 0.75)), url(${bgImageUrl})` 
            : 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          boxShadow: `0 12px 35px rgba(0,0,0,0.5), 0 0 25px ${themeColor}35`
        }}
      >
        <div 
          className="pointer-events-none absolute -inset-0.5 rounded-[24px] opacity-40 blur-sm"
          style={{ background: `linear-gradient(135deg, ${themeColor}, transparent 65%)` }}
        />

        <div className="relative z-10 flex items-start justify-between">
          {/* Larger & Prominent Profile Picture Container */}
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] p-1 shadow-2xl shrink-0 overflow-hidden flex items-center justify-center border-[3px] backdrop-blur-md"
            style={{ borderColor: '#facc15', background: 'rgba(15, 23, 42, 0.85)' }}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-[14px]" />
            ) : (
              <div 
                className="w-full h-full rounded-[14px] flex items-center justify-center text-white text-base font-black shadow-inner"
                style={{ background: themeColor }}
              >
                {initials}
              </div>
            )}
          </div>

          <div 
            className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-md border border-white/30"
            style={{ background: linkBgColor }}
          >
            Webcard.ai
          </div>
        </div>

        <div className="relative z-10 space-y-1 mt-auto pr-14">
          <h3 className="text-base sm:text-lg font-black tracking-wide text-white drop-shadow-md truncate">
            {name.toUpperCase()}
          </h3>
          <p className="text-xs sm:text-sm font-bold tracking-wider truncate uppercase" style={{ color: linkBgColor }}>
            {designation.toUpperCase()}
          </p>
          <p className="text-[11px] font-medium tracking-tight truncate opacity-90" style={{ color: subText }}>
            mycardlink.site/{slug}
          </p>
        </div>

        {/* Live QR Code on 2D Card */}
        <div className="absolute bottom-3.5 right-3.5 z-20 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 flex flex-col items-center">
          <div className="relative p-1 bg-white rounded-xl overflow-hidden">
            <QRCodeSVG value={cardUrl} size={44} bgColor="#ffffff" fgColor="#000000" level="M" />
          </div>
        </div>

        <div 
          className="absolute bottom-0 left-0 right-0 h-1.5 shadow-[0_0_12px_rgba(231,12,101,0.9)]"
          style={{ background: themeColor }}
        />
      </div>

      <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold">
          <Eye className="w-4 h-4" style={{ color: themeColor }} />
          <span>{viewCount} Views</span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={`/c/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all shadow-md cursor-pointer"
            title="View Live Card"
          >
            <Eye className="w-4 h-4" />
          </a>
          <Link
            to="/dashboard/vcard/profile"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-all shadow-md"
            title="Edit Card"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <motion.button
            whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(card._id)}
            className="p-2.5 rounded-xl bg-red-500/10 dark:bg-red-500/20 hover:bg-red-500/20 dark:hover:bg-red-500/30 text-red-600 dark:text-red-300 transition-all shadow-md cursor-pointer"
            title="Delete Card"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main AllVcards Component ─────────────────────────────────────
const AllVcards = () => {
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Custom Matrix Text State
  const [matrixText, setMatrixText] = useState(() => localStorage.getItem('matrix_custom_text') || 'WEBKIK SERVICES');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempText, setTempText] = useState(matrixText);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/all`, {
        headers: { 'x-auth-token': token }
      });
      setCards(res.data);
    } catch {
      toast.error('Failed to load vCards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCards(); 
    const handleDataChanged = () => fetchCards();
    window.addEventListener('vcard:data-changed', handleDataChanged);
    return () => window.removeEventListener('vcard:data-changed', handleDataChanged);
  }, []);

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

  const handleSaveMatrixText = (e) => {
    e.preventDefault();
    if (!tempText.trim()) return;
    setMatrixText(tempText.trim());
    localStorage.setItem('matrix_custom_text', tempText.trim());
    setIsModalOpen(false);
    toast.success('Matrix branding text updated!');
  };

  const filtered = cards.filter(c =>
    (c.personalInfo?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handlePrev = () => {
    setCurrentIndex(prev => (prev === 0 ? filtered.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev === filtered.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl p-6 text-white shadow-xl border border-white/15 bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44]">
        <MeshBackground className="opacity-30" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Digital Portfolio
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">All vCards</h2>
            <p className="text-xs sm:text-sm mt-1 text-pink-100 font-medium">Manage and preview your live digital business cards</p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto flex-wrap gap-y-2">
            {/* Customize Matrix Text Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setTempText(matrixText); setIsModalOpen(true); }}
              className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md border border-white/20 backdrop-blur-md transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-yellow-300" />
              <span>Customize Text</span>
            </motion.button>

            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-44 pl-9 pr-4 py-2.5 rounded-xl text-xs outline-none border border-white/20 bg-white/10 text-white placeholder:text-slate-300 focus:ring-2 focus:ring-[#E70C65] transition-all"
                placeholder="Search cards..."
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
              <Link
                to="/dashboard/vcard/profile"
                className="flex items-center space-x-2 bg-white text-[#9F1C44] text-xs font-bold px-5 py-3 rounded-xl shadow-lg hover:bg-pink-50 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Card</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 h-96 rounded-3xl animate-pulse bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" />
          <div className="lg:col-span-6 h-96 rounded-3xl animate-pulse bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div {...fadeUp(0.08)} className="text-center py-16 rounded-3xl border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-white/[0.02]">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 bg-slate-200 dark:bg-white/10 text-[#E70C65] dark:text-[#ff80ab]">
            <Plus className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-slate-800 dark:text-white">No vCards found</p>
          <p className="text-xs sm:text-sm mt-1 text-slate-500 dark:text-slate-400">Create your first cyber-holographic digital card</p>
          <Link to="/dashboard/vcard/profile" className="inline-block mt-4 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#E70C65]/30">
            Create vCard
          </Link>
        </motion.div>
      ) : (
        /* Split Layout: Left Card Slider, Right Smokee Orbiting Animation */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Card Slider */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative">
              <AnimatePresence mode="wait">
                <LiveCardTile2D
                  key={filtered[currentIndex]?._id || currentIndex}
                  card={filtered[currentIndex]}
                  onDelete={handleDelete}
                />
              </AnimatePresence>

              {/* Slider Navigation Buttons & Indicators */}
              <div className="flex items-center justify-between mt-5 px-3 max-w-lg mx-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-[#E70C65] hover:text-white text-slate-800 dark:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer backdrop-blur-md border border-slate-300 dark:border-white/15 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </motion.button>

                {/* Dot Indicators */}
                <div className="flex items-center space-x-1.5">
                  {filtered.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentIndex === idx ? 'w-6 bg-[#E70C65]' : 'w-2 bg-slate-300 dark:bg-white/20 hover:bg-slate-400'
                      }`}
                      title={`Go to card ${idx + 1}`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-[#E70C65] hover:text-white text-slate-800 dark:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer backdrop-blur-md border border-slate-300 dark:border-white/15 shadow-md"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right Column: Smokee Orbiting Animation */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <OrbitingTechAnimation matrixText={matrixText} />
          </div>
        </div>
      )}

      {/* Customize Text Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md rounded-[28px] p-6 shadow-2xl bg-slate-950 border border-white/20 text-white z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-yellow-300" /> Customize Watermark Text
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMatrixText} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Enter Watermark Brand Text
                  </label>
                  <input
                    type="text"
                    value={tempText}
                    onChange={(e) => setTempText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-sm outline-none focus:ring-2 focus:ring-[#E70C65]"
                    placeholder="e.g. WEBKIK SERVICES"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-xs font-bold text-white shadow-lg shadow-[#E70C65]/30 cursor-pointer transition-all"
                  >
                    Save Text
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllVcards;