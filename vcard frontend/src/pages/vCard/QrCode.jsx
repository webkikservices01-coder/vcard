import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ExternalLink, Copy } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QrCode = () => {
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const qrRef = useRef(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://vcard-backend-uuq6.onrender.com/api/vcard/me', {
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
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
        <p className="text-sm text-gray-500">Share your vCard with a scannable QR code</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Loading...</div>
        ) : !slug ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm mb-2">No vCard found.</p>
            <a href="/dashboard/vcard/profile" className="text-sm font-semibold text-black hover:underline">
              Create your profile first →
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6">
            {/* QR Code */}
            <div ref={qrRef} className="p-5 border-2 border-gray-200 rounded-2xl bg-white shadow-sm">
              <QRCodeSVG
                value={cardUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Card URL display */}
            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2">
              <p className="text-xs text-gray-600 truncate font-mono">{cardUrl}</p>
              <button onClick={handleCopy} className="shrink-0 p-1.5 hover:bg-gray-200 rounded transition" title="Copy URL">
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center space-x-2 bg-black text-white py-2.5 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download QR Code</span>
              </button>
              <a
                href={cardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Card</span>
              </a>
            </div>

            <p className="text-xs text-gray-400 text-center">
              Scan this QR code to open your digital business card
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QrCode;
