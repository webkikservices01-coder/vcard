import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Copy, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';
import { useTheme } from '../../context/ThemeContext';

const QrCode = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
          headers: { 'x-auth-token': token }
        });
        setSlug(res.data.username || '');
      } catch { toast.error('Could not load card data'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cardUrl = `${window.location.origin}/c/${slug}`;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 400);
    const img = new Image();
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 400, 400);
      URL.revokeObjectURL(url);
      const link = document.createElement('a');
      link.download = `${slug}-qrcode.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    toast.success('URL copied to clipboard!');
  };

  return (
    <div className="max-w-lg mx-auto pb-12">
      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0.8; }
          50% { opacity: 1; }
          100% { top: 96%; opacity: 0.8; }
        }
        .laser-scan-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #E70C65, #ff80ab, #E70C65, transparent);
          box-shadow: 0 0 15px #E70C65, 0 0 25px #ff80ab;
          animation: scanLaser 3s ease-in-out infinite alternate;
          z-index: 20;
        }
      `}</style>

      {/* Top Header */}
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-3xl p-6 mb-6 text-white shadow-xl border border-white/15 bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44]">
        <MeshBackground className="opacity-30" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Smart Matrix
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">QR Code Studio</h2>
          <p className="text-xs sm:text-sm mt-1 text-pink-100 font-medium">Share your executive vCard with a high-end scannable matrix code.</p>
        </div>
      </motion.div>

      {/* Main Glass Card */}
      <GlassCard {...fadeUp(0.08)} className={`p-6 sm:p-8 relative overflow-hidden border shadow-2xl backdrop-blur-2xl transition-colors duration-300 ${
        isDark ? "border-white/20 bg-[#0b1329]/80 text-white" : "border-pink-100 bg-white/90 text-slate-900 shadow-pink-100/50"
      }`}>
        {/* Background Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#E70C65]/20 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-[90px] pointer-events-none" />

        {loading ? (
          <div className={`flex items-center justify-center h-64 text-sm font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading Matrix...</div>
        ) : !slug ? (
          <div className="text-center py-8">
            <p className={`text-sm mb-2 ${isDark ? "text-slate-400" : "text-slate-600"}`}>No vCard found.</p>
            <a href="/dashboard/vcard/profile" className="text-sm font-semibold text-[#E70C65] hover:underline">
              Create your profile first →
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 relative z-10">
            
            {/* QR Code Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, type: 'spring', damping: 20 }}
              whileHover={{ scale: 1.03 }}
              className={`relative p-4 rounded-3xl border backdrop-blur-xl shadow-xl transition-all ${
                isDark ? "border-white/30 bg-gradient-to-b from-white/10 to-black/40" : "border-pink-200 bg-gradient-to-b from-pink-50/80 to-white shadow-pink-100/60"
              }`}
            >
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#E70C65]" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#E70C65]" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#E70C65]" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#E70C65]" />

              <div ref={qrRef} className="relative p-5 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-inner">
                <div className="laser-scan-line" />
                <QRCodeSVG
                  value={cardUrl}
                  size={210}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </motion.div>

            {/* Card URL display */}
            <div className={`w-full rounded-2xl p-3.5 flex items-center justify-between gap-3 border shadow-inner transition-colors ${
              isDark ? "border-white/15 bg-white/[0.04] text-slate-200" : "border-pink-200 bg-pink-50/60 text-slate-800"
            }`}>
              <p className="text-xs truncate font-mono">{cardUrl}</p>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(231,12,101,0.15)' }} 
                whileTap={{ scale: 0.9 }} 
                onClick={handleCopy}
                className="shrink-0 p-2 rounded-xl transition-all text-[#E70C65] cursor-pointer" 
                title="Copy URL"
              >
                <Copy className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex-1">
                <GradientButton onClick={handleDownload} className="w-full py-3 rounded-2xl shadow-lg shadow-[#E70C65]/30 font-bold">
                  <Download className="w-4 h-4 mr-2 inline" />
                  <span>Download QR Code</span>
                </GradientButton>
              </div>
              <motion.a
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.97 }}
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs sm:text-sm font-bold border shadow-md transition-all ${
                  isDark 
                    ? "border-white/20 bg-white/[0.04] text-white hover:bg-white/[0.08]" 
                    : "border-pink-200 bg-white text-slate-800 hover:bg-pink-50"
                }`}
              >
                <ExternalLink className="w-4 h-4 text-[#E70C65]" />
                <span>View Live Card</span>
              </motion.a>
            </div>

            <p className={`text-xs text-center font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Scan this dynamic matrix code using any smartphone camera to open your profile instantly.
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default QrCode;