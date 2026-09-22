import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
  FaPhoneAlt, FaWhatsapp, FaLinkedin, FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaGlobe,
  FaGithub, FaTelegramPlane, FaPinterestP, FaBehance, FaDribbble, FaSnapchatGhost, FaTiktok, FaHome, FaMapMarkerAlt,
  FaSpotify, FaDiscord
} from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdOutlineLink, MdCall } from 'react-icons/md';
import { 
  Eye, Share2, X, Download, QrCode as QrIcon, 
  Sparkles, Send, ExternalLink, Calendar
} from 'lucide-react';
import { allThemes, buildCustomTheme } from './vCard/Theme';
import IconButton from '../components/ui/IconButton';
import DynamicCyberCard3D from '../components/ui/DynamicCyberCard3D';
import ChatWidget from '../components/chatbot/ChatWidget';
import Modal from '../components/public/Modal';
import { ProductsCarousel, TestimonialsCarousel, PortfolioCarousel, GalleryCarousel } from '../components/public/MediaSections';
import { getVideoRoomUrl } from '../utils/videoRoom';

const SafeHtml = ({ html, textColor }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      let shadow = containerRef.current.shadowRoot;
      if (!shadow) shadow = containerRef.current.attachShadow({ mode: 'open' });

      shadow.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: inherit;
            color: ${textColor || '#0f172a'};
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          img, video, iframe { max-width: 100%; height: auto; border-radius: 8px; }
          .custom-wrapper { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        </style>
        <div class="custom-wrapper">${html || ''}</div>
      `;
    }
  }, [html, textColor]);

  return <div ref={containerRef} className="w-full text-xs leading-relaxed" />;
};

const iconMap = {
  'instagram': <FaInstagram className="w-3.5 h-3.5 text-white" />,
  'facebook': <FaFacebookF className="w-3.5 h-3.5 text-white" />,
  'twitter': <FaTwitter className="w-3.5 h-3.5 text-white" />,
  'youtube': <FaYoutube className="w-3.5 h-3.5 text-white" />,
  'whatsapp': <FaWhatsapp className="w-3.5 h-3.5 text-white" />,
  'linkedin': <FaLinkedin className="w-3.5 h-3.5 text-white" />,
  'github': <FaGithub className="w-3.5 h-3.5 text-white" />,
  'email': <MdEmail className="w-3.5 h-3.5 text-red-500" />,
  'phone': <FaPhoneAlt className="w-3.5 h-3.5 text-white" />,
  'mobile': <FaPhoneAlt className="w-3.5 h-3.5 text-white" />,
  'website': <FaGlobe className="w-3.5 h-3.5 text-white" />,
  'location': <MdLocationOn className="w-3.5 h-3.5 text-white" />,
  'address': <FaMapMarkerAlt className="w-3.5 h-3.5 text-white" />,
  'home': <FaHome className="w-3.5 h-3.5 text-white" />,
  'snapchat': <FaSnapchatGhost className="w-4 h-4 text-black" />,
  'telegram': <FaTelegramPlane className="w-3.5 h-3.5 text-white" />,
  'tiktok': <FaTiktok className="w-3.5 h-3.5 text-white" />,
  'pinterest': <FaPinterestP className="w-3.5 h-3.5 text-white" />,
  'behance': <FaBehance className="w-3.5 h-3.5 text-white" />,
  'dribbble': <FaDribbble className="w-3.5 h-3.5 text-white" />,
  'spotify': <FaSpotify className="w-3.5 h-3.5 text-white" />,
  'discord': <FaDiscord className="w-3.5 h-3.5 text-white" />,
  'custom url': <MdOutlineLink className="w-3.5 h-3.5 text-white" />,
};

const socialBrand = {
  'instagram': 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
  'facebook': '#1877F2',
  'twitter': '#1DA1F2',
  'youtube': '#FF0000',
  'github': '#181717',
  'linkedin': '#0A66C2',
  'telegram': '#229ED9',
  'whatsapp': '#25D366',
  'email': '#ffffff',
  'website': '#0284C7',
  'phone': '#25D366',
  'mobile': '#25D366',
  'home': '#059669',
  'location': '#EA4335',
  'address': '#EA4335',
  'snapchat': '#FFFC00',
  'tiktok': '#000000',
  'pinterest': '#E60023',
  'behance': '#1769FF',
  'dribbble': '#EA4C89',
  'spotify': '#1DB954',
  'discord': '#5865F2',
};

// Ordered so specific platforms win; each pattern is matched against the label first, then the URL.
const PLATFORM_RULES = [
  ['location', /location|address|directions|\bmaps?\b|\bgps\b|google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/],
  ['snapchat', /snapchat|snap\.com/],
  ['instagram', /insta/],
  ['facebook', /facebook|fb\.com|fb\.me/],
  ['twitter', /twitter|tweet|\bx\.com/],
  ['youtube', /youtube|youtu\.be/],
  ['whatsapp', /whatsapp|wa\.me/],
  ['linkedin', /linkedin/],
  ['github', /github/],
  ['telegram', /telegram|t\.me\//],
  ['tiktok', /tiktok/],
  ['pinterest', /pinterest/],
  ['behance', /behance/],
  ['dribbble', /dribbble/],
  ['spotify', /spotify/],
  ['discord', /discord/],
  ['email', /e-?mail|mailto:/],
  ['phone', /phone|mobile|\bcall\b|tel:/],
  ['home', /\bhome\b/],
];

const detectPlatform = (link) => {
  const label = `${link.fieldType || ''} ${link.title || ''}`.toLowerCase();
  const url = (link.url || '').toLowerCase();
  for (const [name, re] of PLATFORM_RULES) if (re.test(label)) return name;
  for (const [name, re] of PLATFORM_RULES) if (re.test(url)) return name;
  return (link.fieldType || '').trim().toLowerCase();
};

const isUrl = (v) => /^https?:\/\//i.test(v);

const getHref = (link, platform) => {
  const val = link.url;
  if (!val) return '#';
  const clean = val.trim();
  if (platform === 'phone') return `tel:${clean.replace(/[^0-9+]/g, '')}`;
  if (platform === 'whatsapp') return isUrl(clean) ? clean : `https://wa.me/${clean.replace(/[^0-9]/g, '')}`;
  if (platform === 'email') return clean.startsWith('mailto:') ? clean : `mailto:${clean}`;
  if (platform === 'location' && !isUrl(clean)) {
    return /^[\w.-]+\.[a-z]{2,}\//i.test(clean) ? `https://${clean}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
  }
  if (platform === 'snapchat' && !isUrl(clean) && !clean.includes('.')) return `https://www.snapchat.com/add/${clean.replace('@', '')}`;
  if (!isUrl(clean)) return `https://${clean}`;
  return clean;
};

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-2 mb-2 mt-3">
    <h3 className="text-[9px] font-black uppercase tracking-[0.14em] text-[#E70C65] shrink-0">
      {children}
    </h3>
    <div className="flex-1 h-[1px] bg-pink-100" />
  </div>
);

const EnquiryForm = ({ slug }) => {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', message: '' });
  const [status, setStatus] = useState('idle');

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    setStatus('sending');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/public/${slug}/enquiry`, form);
      setStatus('sent');
      setForm({ name: '', email: '', mobile: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const inputStyle = { background: '#ffffff', border: '1px solid #fbcfe8', color: '#0f172a' };
  const inputClass = "w-full px-3 py-2 rounded-xl text-xs outline-none placeholder:text-slate-400 transition-all focus:border-[#E70C65] focus:bg-white font-medium shadow-sm";

  if (status === 'sent') {
    return (
      <div className="rounded-xl p-3 text-center border border-pink-300 bg-pink-50 text-pink-900">
        <Sparkles className="w-4 h-4 text-[#E70C65] mx-auto mb-1" />
        <p className="text-[11px] font-bold">Transmission Successful 🎉</p>
        <button onClick={() => setStatus('idle')} className="text-[10px] font-bold mt-1 text-[#E70C65] underline cursor-pointer">Send another message</button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <input required placeholder="Your Full Name" value={form.name} onChange={set('name')} className={inputClass} style={inputStyle} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-2"
      >
        <input type="email" placeholder="Email Address" value={form.email} onChange={set('email')} className={inputClass} style={inputStyle} />
        <input placeholder="Phone / WhatsApp" value={form.mobile} onChange={set('mobile')} className={inputClass} style={inputStyle} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <textarea required placeholder="Write requirements..." rows={2} value={form.message} onChange={set('message')} className={`${inputClass} resize-none`} style={inputStyle} />
      </motion.div>

      {status === 'error' && <p className="text-[10px] text-red-600">Unable to transmit. Check network.</p>}

      <motion.div
        initial={{ opacity: 0, y: -25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.1 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.button
          type="button"
          onClick={submit}
          disabled={status === 'sending'}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="relative overflow-hidden w-full inline-flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold text-white shadow-md cursor-pointer bg-gradient-to-r from-[#E70C65] via-[#ff2e83] to-[#cf0a55] hover:opacity-95 transition-all shadow-pink-500/25"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(231,12,101,0.3)'
          }}
        >
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span>{status === 'sending' ? 'Transmitting…' : 'Send Inquiry'}</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

const renderSection = (id, data) => {
  const { products, portfolio, testimonials, gallery, customSections, dynamicLinks, settings, slug, cardUrl } = data;

  switch (id) {
    case 'contact': {
      if (!dynamicLinks || !dynamicLinks.length) return null;

      return (
        <div key="contact" className="px-3.5 sm:px-4 pb-2 space-y-2">
          <SectionTitle>Contact Channels</SectionTitle>
          
          <div className="grid grid-cols-4 gap-2.5">
            {dynamicLinks.map((link, idx) => {
              const platform = detectPlatform(link);
              const brandBg = socialBrand[platform] || '#E70C65';
              const matchedIcon = iconMap[platform] || <MdOutlineLink className="w-3.5 h-3.5 text-white" />;

              return (
                <motion.a
                  key={idx}
                  href={getHref(link, platform)}
                  target={platform === 'phone' || platform === 'whatsapp' || platform === 'email' ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: idx * 0.08, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-pink-50/60 border border-pink-100 hover:border-pink-300 transition-all cursor-pointer shadow-xs text-center group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <motion.span 
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.35 }}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm mb-1.5 transition-transform relative z-10"
                    style={{ 
                      background: brandBg,
                      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(0,0,0,0.15)`
                    }}
                  >
                    {matchedIcon}
                  </motion.span>
                  <span className="text-[9px] font-bold text-slate-800 tracking-tight leading-tight w-full truncate relative z-10">
                    {link.title || link.fieldType}
                  </span>
                </motion.a>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <motion.a
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              href="https://calendly.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative overflow-hidden w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-[10px] font-bold text-[#E70C65] bg-gradient-to-r from-pink-50 via-rose-50/80 to-white hover:bg-pink-100/60 border border-pink-200/85 transition-all cursor-pointer shadow-sm text-center"
              style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(231,12,101,0.06)' }}
            >
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-pink-200/40 to-transparent pointer-events-none" />
              <Calendar className="w-3 h-3 shrink-0 text-[#E70C65]" />
              <span className="truncate">Schedule Call</span>
            </motion.a>

            {settings?.showShare !== false && (
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.1 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={data.onShare}
                className="relative overflow-hidden w-full flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-full text-[10px] font-bold text-[#E70C65] bg-gradient-to-r from-pink-50 via-rose-50/80 to-white hover:bg-pink-100/60 border border-pink-200/85 transition-all cursor-pointer shadow-sm text-center"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 8px rgba(231,12,101,0.06)' }}
              >
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-pink-200/40 to-transparent pointer-events-none" />
                <Share2 className="w-3 h-3 shrink-0 text-[#E70C65]" />
                <span className="truncate">Share and Save Card</span>
              </motion.button>
            )}
          </div>
        </div>
      );
    }

    case 'products':
      return products.length > 0 ? (
        <div key="products" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <SectionTitle>Products &amp; Solutions</SectionTitle>
          <ProductsCarousel products={products} />
        </div>
      ) : null;

    case 'portfolio':
      return portfolio.length > 0 ? (
        <div key="portfolio" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <SectionTitle>Featured Works</SectionTitle>
          <PortfolioCarousel portfolio={portfolio} />
        </div>
      ) : null;

    case 'testimonials':
      return testimonials.length > 0 ? (
        <div key="testimonials" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <SectionTitle>Verified Reviews</SectionTitle>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      ) : null;

    case 'gallery':
      return gallery.length > 0 ? (
        <div key="gallery" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <SectionTitle>Media Gallery</SectionTitle>
          <GalleryCarousel gallery={gallery} />
        </div>
      ) : null;

    case 'custom':
      return customSections.length > 0 ? customSections.map(section => (
        <div key={section._id} className="px-3.5 sm:px-4 py-2 border-t border-pink-100 w-full overflow-hidden">
          <SectionTitle>{section.title}</SectionTitle>
          <SafeHtml html={section.content} textColor="#0f172a" />
        </div>
      )) : null;

    case 'enquiry':
      return settings?.showEnquiryForm !== false && slug ? (
        <div key="enquiry" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <div className="rounded-xl p-3 border border-pink-100 bg-[#faf8fa] space-y-2">
            <SectionTitle>Direct Inquiry</SectionTitle>
            <EnquiryForm slug={slug} />
          </div>
        </div>
      ) : null;

    case 'qr':
      return slug && cardUrl ? (
        <div key="qr" className="px-3.5 sm:px-4 py-2 border-t border-pink-100">
          <SectionTitle>Smart Matrix QR</SectionTitle>
          <motion.div 
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl p-3 border border-pink-100 bg-[#faf8fa] shadow-2xs flex flex-col items-center space-y-2.5"
          >
            <div className="relative p-2.5 bg-pink-50/50 rounded-xl shadow-xs border border-pink-200 overflow-hidden">
              <QRCodeSVG value={cardUrl} size={120} bgColor="#ffffff" fgColor="#000000" level="H" />
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E70C65] to-transparent shadow-[0_0_10px_#E70C65] pointer-events-none animate-scan z-20" />
            </div>
            <p className="text-[11px] text-slate-900 text-center font-bold tracking-tight">
              Scan to connect directly with this profile
            </p>
          </motion.div>
        </div>
      ) : null;

    default: return null;
  }
};

const _viewedSlugs = new Set();

const PublicVcard = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiPersona, setAiPersona] = useState(null);

  const cardUrl = `${window.location.origin}/c/${slug}`;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/public/${slug}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();

    const interval = setInterval(load, 5000);

    axios.get(`${import.meta.env.VITE_API_URL}/api/ai/public/${slug}`)
      .then(res => setAiPersona(res.data))
      .catch(() => setAiPersona(null));

    return () => clearInterval(interval);
  }, [slug]);

  useEffect(() => {
    if (!slug || _viewedSlugs.has(slug)) return;
    _viewedSlugs.add(slug);
    axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/public/${slug}/view`)
      .then(res => setData(prev => prev ? { ...prev, card: { ...prev.card, viewCount: res.data.viewCount } } : prev))
      .catch(() => {});
  }, [slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#faf8f9] font-['Inter']">
      <div className="text-center">
        <div className="w-7 h-7 border-2 border-[#E70C65] border-t-transparent rounded-full mx-auto mb-2 animate-spin" />
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Loading Profile...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-dvh flex items-center justify-center bg-[#faf8f9] font-['Inter'] p-4">
      <div className="text-center text-slate-900">
        <h1 className="text-3xl font-black text-[#E70C65] mb-2">404</h1>
        <p className="text-slate-600 text-xs mb-3">This profile does not exist.</p>
        <a href="/" className="px-4 py-2 rounded-full bg-[#E70C65] text-white text-xs font-bold shadow-sm">Go to Home</a>
      </div>
    </div>
  );

  const { card, products = [], portfolio = [], testimonials = [], gallery = [], customSections = [], settings = {} } = data;
  const { personalInfo = {}, dynamicLinks = [], viewCount = 0, theme: themeId = 'theme-one' } = card;

  const theme = themeId === 'custom' && card.customTheme
    ? buildCustomTheme(card.customTheme)
    : (allThemes.find(t => t.id === themeId) || allThemes[0]);
  const s = theme.styles;
  const themeLaserColor = theme.laserColor || s.accent || '#E70C65';
  
  // Extract subTextColor properly from customTheme or active theme styles
  const subText = themeId === 'custom' && card.customTheme?.subTextColor 
    ? card.customTheme.subTextColor 
    : (s.subTextColor || '#FFFFFF');

  let userAvatar = personalInfo?.profilePic || null;
  if (userAvatar && !userAvatar.startsWith('http') && !userAvatar.startsWith('blob:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    userAvatar = `${apiUrl}${userAvatar.startsWith('/') ? userAvatar : '/' + userAvatar}`;
  }

  let userBanner = personalInfo?.bannerImage || null;
  if (userBanner && !userBanner.startsWith('http') && !userBanner.startsWith('blob:')) {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    userBanner = `${apiUrl}${userBanner.startsWith('/') ? userBanner : '/' + userBanner}`;
  }

  const defaultSectionOrder = ['contact', 'products', 'portfolio', 'gallery', 'testimonials', 'custom', 'enquiry', 'qr'];
  const sectionOrder = settings?.sectionOrder?.length > 0
    ? [...settings.sectionOrder, ...defaultSectionOrder.filter(id => !settings.sectionOrder.includes(id))]
    : defaultSectionOrder;

  const sectionData = {
    products, portfolio, testimonials, gallery, customSections,
    dynamicLinks, settings, slug, cardUrl,
    onShare: () => setShareOpen(true),
  };

  return (
    <div className="min-h-dvh font-['Inter'] w-full flex justify-center bg-[#faf8f9] relative overflow-x-hidden text-slate-800">
      <style>{`
        @keyframes scanLine {
          0% { top: 0%; opacity: 0.8; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.8; }
        }
        .animate-scan {
          animation: scanLine 2.2s ease-in-out infinite alternate;
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="w-full min-h-dvh relative z-25 shadow-lg max-w-sm sm:my-0 sm:rounded-none border-0 overflow-hidden bg-[#ffffff] flex flex-col">
        
        {/* Top Control Bar */}
        <div className="sticky top-0 left-0 right-0 z-30 flex items-center justify-end px-3 py-1 bg-white/95 backdrop-blur-md">
          <div className="flex items-center space-x-1">
            {settings.showViews !== false && (
              <div className="bg-pink-50/80 text-slate-700 text-[9px] px-2 py-0.5 rounded-md flex items-center space-x-1">
                <Eye className="w-2.5 h-2.5 text-[#E70C65]" /><span>{viewCount}</span>
              </div>
            )}
            {settings.showShare !== false && (
              <button 
                title="Share" 
                onClick={() => setShareOpen(true)} 
                className="bg-pink-50/80 hover:bg-pink-100 text-slate-700 rounded-md w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Share2 className="w-3 h-3 text-[#E70C65]" />
              </button>
            )}
            {settings.showQr !== false && (
              <button 
                title="QR Code" 
                onClick={() => setQrOpen(true)} 
                className="bg-pink-50/80 hover:bg-pink-100 text-slate-700 rounded-md w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
              >
                <QrIcon className="w-3 h-3 text-[#E70C65]" />
              </button>
            )}
          </div>
        </div>

        {/* ── 3D CYBER CARD ON TOP & UNIFIED PROFILE SECTION BELOW ── */}
        <div className="pt-0 pb-2 px-3 sm:px-3.5 space-y-3">
          <div className="w-full overflow-hidden flex justify-center pt-1">
            <DynamicCyberCard3D
              name={personalInfo?.name || 'Unnamed'}
              designation={personalInfo?.designation || ''}
              slug={slug}
              photoUrl={userAvatar}
              bgImageUrl={userBanner}
              themeColor={themeLaserColor}
              cardBgColor={s.cardBg}
              surfaceBgColor={s.bg}
              textColor={s.nameColor}
              linkBgColor={s.contactBg}
              subTextColor={subText}
              isDark={false}
            />
          </div>

          {/* Unified Single Container Card with Balanced Font Sizes */}
          <div className="bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm">
            
            {/* Edge-to-Edge Banner Header */}
            <div 
              className="relative w-full h-24 sm:h-28 overflow-hidden bg-slate-900"
              style={{
                backgroundImage: userBanner 
                  ? `url(${userBanner})`
                  : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-white bg-black/40 backdrop-blur-md border border-white/20">
                Webcard.ai
              </div>
            </div>

            {/* Profile Info Section with Balanced Sizes */}
            <div className="relative pt-2 pb-3 px-3.5">
              <div className="relative -mt-10 sm:-mt-11 w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-white shadow-md border-2 border-[#E70C65] overflow-hidden flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#E70C65] text-white font-bold flex items-center justify-center text-sm">
                    {personalInfo?.name?.[0] || 'U'}
                  </div>
                )}
              </div>

              <div className="mt-2.5">
                {/* Balanced Name Size */}
                <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                  {personalInfo?.name || 'User Name'}
                </h1>
                {/* Balanced Designation Size */}
                <p className="text-[15px] sm:text-xs font-extrabold text-[#E70C65] uppercase tracking-wider truncate mt-0.5">
                  {personalInfo?.designation || 'Full Stack Developer'}
                </p>
              </div>

              {/* Balanced Bio Size */}
              <div className="mt-2.5 pt-2 border-t border-pink-100/60">
                <p className=" leading-relaxed text-slate-700 font-semibold" style={{ fontSize: '14px', lineHeight: '1.3rem' }}>
                  {personalInfo?.bio || "Connecting digital intelligence with professional direct communications."}
                </p>
              </div>
            </div>
{/* text-[10px] sm:text-xs */}
          </div>
        </div>

        {/* ── Content Sections (Gapless flow) ─────────────────────── */}
        <div className="flex-1 pb-2">
          {sectionOrder.map(id => renderSection(id, sectionData))}
        </div>

        {/* ── Executive Footer ─────────────────────────────────────── */}
        {settings.hideBranding !== true && (
          <div className="text-center py-2.5 border-t border-pink-100 bg-[#faf8fa] mt-auto">
            <p className="text-[8px] uppercase tracking-[0.2em] font-black text-slate-400">
              Powered by{' '}
              <a href="/" className="text-slate-900 hover:text-[#E70C65] transition-colors underline font-bold">Webcard.ai</a>
            </p>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} label="Share digital identity" panelClassName="sm:max-w-sm">
        <div className="overflow-hidden rounded-[24px] border border-pink-200 bg-white text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between border-b border-pink-100 px-4 py-3">
            <h3 className="text-xs font-bold">Share Digital Identity</h3>
            <IconButton variant="bare" title="Close" onClick={() => setShareOpen(false)} className="text-slate-500 hover:text-slate-900"><X className="w-4 h-4" /></IconButton>
          </div>
          <div className="space-y-2.5 p-4">
            {settings.showQrOnShare !== false && (
              <div className="mx-auto flex w-fit justify-center rounded-xl border border-pink-200 bg-pink-50/50 p-2 shadow-inner">
                <QRCodeSVG value={cardUrl} size={100} bgColor="#ffffff" fgColor="#000000" level="H" />
              </div>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-pink-200 bg-[#faf8fa] px-3 py-1.5">
              <p className="flex-1 truncate font-mono text-[10px] text-slate-700">{cardUrl}</p>
              <button onClick={handleCopy} className="shrink-0 cursor-pointer text-[10px] font-bold text-[#E70C65] hover:underline">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'WhatsApp', color: 'bg-emerald-600', href: `https://wa.me/?text=${encodeURIComponent(cardUrl)}` },
                { label: 'Facebook', color: 'bg-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}` },
                { label: 'Twitter',  color: 'bg-slate-800', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(cardUrl)}` },
              ].map(({ label, color, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={`rounded-xl py-2 text-center text-[10px] font-bold text-white shadow-xs transition ${color}`}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} label="Smart Matrix QR" panelClassName="sm:max-w-xs">
        <div className="relative overflow-hidden rounded-[24px] border border-pink-300 bg-white p-4 text-slate-900 shadow-2xl">
          <div className="relative z-10 mb-2.5 flex items-center justify-between border-b border-pink-100 pb-2">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E70C65]">
              <Sparkles className="h-3 w-3 animate-pulse text-[#E70C65]" /> Smart Matrix QR
            </span>
            <button onClick={() => setQrOpen(false)} aria-label="Close" className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-pink-50 text-slate-600 transition-colors hover:text-slate-900">
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="relative z-10 flex flex-col items-center space-y-2.5">
            <div className="relative overflow-hidden rounded-xl border border-pink-200 bg-pink-50/50 p-2.5 shadow-xs">
              <QRCodeSVG value={cardUrl} size={160} bgColor="#ffffff" fgColor="#000000" level="H" />
              <div className="animate-scan pointer-events-none absolute left-0 right-0 z-20 h-1 bg-gradient-to-r from-transparent via-[#E70C65] to-transparent shadow-[0_0_10px_#E70C65]" />
            </div>
            <p className="text-center text-[10px] font-medium text-slate-600">Scan to connect directly with this executive profile</p>
            <button onClick={() => setQrOpen(false)} className="w-full cursor-pointer rounded-xl bg-[#E70C65] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-[#cf0a55]">
              Close
            </button>
          </div>
        </div>
      </Modal>

      {aiPersona?.enabled && (
        <ChatWidget
          slug={slug}
          aiName={aiPersona.aiName}
          greeting={aiPersona.greeting}
          profile={{ name: personalInfo?.name, avatar: userAvatar, links: dynamicLinks }}
          videoRoomUrl={getVideoRoomUrl(card._id)}
        />
      )}
    </div>
  );
};

export default PublicVcard;