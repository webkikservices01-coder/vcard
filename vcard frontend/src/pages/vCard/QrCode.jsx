import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Copy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import MeshBackground from '../../components/ui/MeshBackground';
import { fadeUp } from '../../utils/motion';

const QrCode = () => {
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
    <div className="max-w-lg">
      <motion.div {...fadeUp(0)} className="relative overflow-hidden rounded-2xl mb-6">
        <MeshBackground className="opacity-40" />
        <div className="relative py-1">
          <h2 className="text-xl font-bold" style={{ color: 'var(--surface-text)' }}>QR Code</h2>
          <p className="text-sm" style={{ color: 'var(--surface-text-2)' }}>Share your vCard with a scannable QR code</p>
        </div>
      </motion.div>

      <GlassCard {...fadeUp(0.08)} className="p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-sm" style={{ color: 'var(--surface-text-2)' }}>Loading...</div>
        ) : !slug ? (
          <div className="text-center py-8">
            <p className="text-sm mb-2" style={{ color: 'var(--surface-text-2)' }}>No vCard found.</p>
            <a href="/dashboard/vcard/profile" className="text-sm font-semibold text-brand-500 hover:underline">
              Create your profile first →
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            {/* QR Code — presented inside a glass "physical card" frame */}
            <GlassCard
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15, type: 'spring', damping: 18 }}
              className="p-3"
            >
              <div ref={qrRef} className="p-4 rounded-xl flex items-center justify-center" style={{ background: '#ffffff' }}>
                <QRCodeSVG
                  value={cardUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </GlassCard>

            {/* Card URL display */}
            <div className="w-full rounded-lg p-3 flex items-center justify-between gap-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
              <p className="text-xs truncate font-mono" style={{ color: 'var(--surface-text-2)' }}>{cardUrl}</p>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleCopy}
                className="shrink-0 p-1.5 rounded fast-transition hover:bg-brand-500/10 hover:text-brand-500" title="Copy URL" style={{ color: 'var(--surface-text-2)' }}>
                <Copy className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <div className="flex-1">
                <GradientButton onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  <span>Download QR Code</span>
                </GradientButton>
              </div>
              <motion.a
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-medium fast-transition hover:border-brand-500 hover:text-brand-500"
                style={{ border: '1px solid var(--surface-border)', color: 'var(--surface-text)' }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Card</span>
              </motion.a>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--surface-text-2)' }}>
              Scan this QR code to open your digital business card
            </p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default QrCode;
