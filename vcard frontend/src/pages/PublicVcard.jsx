import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
  FaPhoneAlt, FaWhatsapp, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaYoutube, FaGlobe
} from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdOutlineLink } from 'react-icons/md';
import { Eye, Share2, X, Download, QrCode, ChevronRight } from 'lucide-react';
import { allThemes, buildCustomTheme } from './vCard/Theme';

// SafeHtml Component (Shadow DOM) for CSS Isolation & Overflow Fix
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
            color: ${textColor || 'inherit'};
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          img, video, iframe { max-width: 100%; height: auto; border-radius: 8px; }
          .custom-wrapper {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .custom-wrapper::-webkit-scrollbar { height: 4px; }
          .custom-wrapper::-webkit-scrollbar-track { background: transparent; }
          .custom-wrapper::-webkit-scrollbar-thumb { background: rgba(150, 150, 150, 0.4); border-radius: 10px; }
        </style>
        <div class="custom-wrapper">${html || ''}</div>
      `;
    }
  }, [html, textColor]);

  return <div ref={containerRef} className="w-full text-xs leading-relaxed" />;
};

// ── Avatar glow — soft pulsing accent behind the profile picture ────────────
const AvatarGlow = ({ color, size = 110 }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      width: size, height: size,
      left: '50%', top: '50%',
      background: `radial-gradient(circle, ${color || '#6366f1'}, transparent 70%)`,
      filter: 'blur(14px)',
      translateX: '-50%', translateY: '-50%',
      zIndex: -1,
    }}
    animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.12, 1] }}
    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
  />
);

// ─── Icon map ────────────────────────────────────────────────────────────────
const iconMap = {
  'Mobile / Phone': <FaPhoneAlt className="w-4 h-4" />,
  'WhatsApp':       <FaWhatsapp className="w-4 h-4" />,
  'Email':          <MdEmail className="w-5 h-5" />,
  'Website':        <FaGlobe className="w-4 h-4" />,
  'LinkedIn':       <FaLinkedin className="w-4 h-4" />,
  'Instagram':      <FaInstagram className="w-4 h-4" />,
  'Facebook':       <FaFacebook className="w-4 h-4" />,
  'Twitter':        <FaTwitter className="w-4 h-4" />,
  'YouTube':        <FaYoutube className="w-4 h-4" />,
  'Location':       <MdLocationOn className="w-5 h-5" />,
  'Custom URL':     <MdOutlineLink className="w-5 h-5" />,
};

const getHref = (type, val) => {
  if (!val) return '#';
  const clean = val.trim();
  if (type === 'Mobile / Phone') return `tel:${clean.replace(/[^0-9+]/g, '')}`;
  if (type === 'WhatsApp') return `https://wa.me/${clean.replace(/[^0-9+]/g, '')}`;
  if (type === 'Email') return `mailto:${clean}`;
  if (!/^https?:\/\//i.test(clean)) return `https://${clean}`;
  return clean;
};

const Stars = ({ n }) => <span className="text-yellow-400 text-sm">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;

// ─── Section renderers ────────────────────────────────────────────────────────
const SectionTitle = ({ children, color }) => (
  <div className="flex items-center justify-center space-x-3 mb-4">
    <div className="flex-1 h-px" style={{ background: color, opacity: 0.15 }} />
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color }}>
      {children}
    </h3>
    <div className="flex-1 h-px" style={{ background: color, opacity: 0.15 }} />
  </div>
);

const renderSection = (id, data, theme) => {
  const { products, portfolio, testimonials, gallery, customSections, dynamicLinks, settings } = data;
  const s = theme.styles;

  switch (id) {
    case 'contact':
      return dynamicLinks.length > 0 ? (
        <div key="contact" className="px-4 pb-5 space-y-2.5">
          {dynamicLinks.map((link, idx) => (
            <motion.a
              key={idx}
              href={getHref(link.fieldType, link.url)}
              target={['Mobile / Phone', 'WhatsApp', 'Email'].includes(link.fieldType) ? '_self' : '_blank'}
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl"
              style={{ background: s.contactBg, color: s.contactText, border: `1px solid ${s.border}` }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                {iconMap[link.fieldType] || <MdOutlineLink className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide opacity-50">{link.fieldType}</p>
                <p className="text-sm font-bold truncate leading-tight mt-0.5">{link.title || link.url}</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-30 shrink-0" />
            </motion.a>
          ))}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {settings?.showPhonebook !== false && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                onClick={data.onPhonebook}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-bold"
                style={{ border: `1.5px solid ${s.contactBg}`, color: s.nameColor }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Contact</span>
              </motion.button>
            )}
            {settings?.showShare !== false && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                onClick={data.onShare}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-bold"
                style={{ background: s.contactBg, color: s.contactText }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </motion.button>
            )}
          </div>
        </div>
      ) : null;

    case 'products':
      return products.length > 0 ? (
        <div key="products" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Products &amp; Services</SectionTitle>
          <div className="space-y-3">
            {products.map((p, idx) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${s.border}`, background: s.sectionBg }}
              >
                {p.coverImage && (
                  <div className="h-36 overflow-hidden">
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3.5">
                  <p className="text-sm font-bold" style={{ color: s.nameColor }}>{p.title}</p>
                  {p.description && <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: s.designationColor }}>{p.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    {p.price && <p className="text-base font-black" style={{ color: s.nameColor }}>₹{p.price}</p>}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: s.contactBg, color: s.contactText }}>
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null;

    case 'portfolio':
      return portfolio.length > 0 ? (
        <div key="portfolio" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Portfolio</SectionTitle>
          <div className="space-y-3">
            {portfolio.map((p, idx) => (
              <motion.a
                key={p._id} href={p.url || '#'} target="_blank" rel="noopener noreferrer"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="block rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${s.border}`, background: s.sectionBg }}
              >
                {p.coverImage && (
                  <div className="h-32 overflow-hidden">
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-3.5 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate" style={{ color: s.nameColor }}>{p.title}</p>
                    {p.description && <p className="text-xs mt-0.5 truncate" style={{ color: s.designationColor }}>{p.description}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 ml-2 opacity-40" style={{ color: s.nameColor }} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      ) : null;

    case 'testimonials':
      return testimonials.length > 0 ? (
        <div key="testimonials" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Testimonials</SectionTitle>
          <div className="space-y-3">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t._id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="rounded-2xl p-4"
                style={{ background: s.sectionBg, border: `1px solid ${s.border}` }}
              >
                <div className="flex items-start space-x-3">
                  {t.photo
                    ? <img src={t.photo} alt={t.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                    : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black shrink-0" style={{ background: s.contactBg, color: s.contactText }}>{t.name?.[0]}</div>}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold truncate" style={{ color: s.nameColor }}>{t.name}</p>
                      <Stars n={t.rating || 5} />
                    </div>
                    <p className="text-xs leading-relaxed mt-1.5" style={{ color: s.designationColor }}>"{t.review}"</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null;

    case 'gallery':
      return gallery.length > 0 ? (
        <div key="gallery" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Gallery</SectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.map((item, idx) => {
              if (item.type === 'video') {
                const match = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                const thumb = match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
                return (
                  <motion.a
                    key={item._id} href={item.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.35, delay: idx * 0.04 }}
                    whileHover={{ scale: 1.04 }}
                    className="relative aspect-square rounded-xl overflow-hidden" style={{ background: s.sectionBg }}
                  >
                    {thumb && <img src={thumb} alt="video" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs ml-0.5">▶</span>
                      </div>
                    </div>
                  </motion.a>
                );
              }
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  whileHover={{ scale: 1.04 }}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img src={item.url} alt="gallery" className="w-full h-full object-cover" style={{ background: s.sectionBg }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : null;

    case 'custom':
      return customSections.length > 0 ? customSections.map(section => (
        <div key={section._id} className="px-4 py-5 w-full overflow-hidden" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>{section.title}</SectionTitle>
          <SafeHtml html={section.content} textColor={s.designationColor} />
        </div>
      )) : null;

    default: return null;
  }
};

// Module-level set — persists across StrictMode double-mounts, resets on full page reload
const _viewedSlugs = new Set();

// ─── Main component ───────────────────────────────────────────────────────────
const PublicVcard = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
  }, [slug]);

  // View count — fires once per slug per page load (module-level Set blocks StrictMode double-fire)
  useEffect(() => {
    if (!slug || _viewedSlugs.has(slug)) return;
    _viewedSlugs.add(slug);
    axios.post(`${import.meta.env.VITE_API_URL}/api/vcard/public/${slug}/view`)
      .then(res => setData(prev => prev ? { ...prev, card: { ...prev.card, viewCount: res.data.viewCount } } : prev))
      .catch(() => {});
  }, [slug]);


  const handlePhonebook = () => {
    if (!data?.card) return;
    const { personalInfo, dynamicLinks = [] } = data.card;
    const phone = dynamicLinks.find(l => l.fieldType === 'Mobile / Phone')?.url || '';
    const email = dynamicLinks.find(l => l.fieldType === 'Email')?.url || '';
    const vcf = `BEGIN:VCARD\nVERSION:3.0\nFN:${personalInfo?.name || ''}\nTITLE:${personalInfo?.designation || ''}\nTEL:${phone}\nEMAIL:${email}\nURL:${cardUrl}\nEND:VCARD`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([vcf], { type: 'text/vcard' }));
    link.download = `${slug}.vcf`;
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter']">
      <div className="text-center">
        <motion.div
          className="w-10 h-10 border-2 border-pink-600 border-t-transparent rounded-full mx-auto mb-3"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
        <p className="text-sm text-gray-500">Loading card...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter'] p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-5xl font-black text-black mb-3">404</h1>
        <p className="text-gray-500 text-sm mb-5">This vCard doesn't exist or has been removed.</p>
        <a href="/" className="bg-pink-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-pink-700 transition">Go Home</a>
      </motion.div>
    </div>
  );

  const { card, products = [], portfolio = [], testimonials = [], gallery = [], customSections = [], settings = {} } = data;
  const { personalInfo = {}, dynamicLinks = [], viewCount = 0, theme: themeId = 'theme-one' } = card;

  // Get theme styles — custom theme reads from card.customTheme
  const theme = themeId === 'custom' && card.customTheme
    ? buildCustomTheme(card.customTheme)
    : (allThemes.find(t => t.id === themeId) || allThemes[0]);
  const s = theme.styles;
  const glowColor = s.accent || s.contactBg;

  // Section order from settings, fallback to default
  const sectionOrder = settings?.sectionOrder?.length > 0
    ? settings.sectionOrder
    : ['contact', 'products', 'portfolio', 'gallery', 'testimonials', 'custom'];

  // Data bundle passed into each section renderer
  const sectionData = {
    products, portfolio, testimonials, gallery, customSections,
    dynamicLinks, settings,
    onPhonebook: handlePhonebook,
    onShare: () => setShareOpen(true),
  };

  return (
    <div className="min-h-screen font-['Inter'] flex justify-center" style={{ background: theme.layout === 'glass' || theme.layout === 'hero' ? s.bg : '#e2e8f0' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full min-h-screen relative shadow-2xl ${settings.orientation === 'horizontal' ? 'max-w-2xl' : 'max-w-sm overflow-x-hidden'}`}
        style={theme.bgImage
          ? { backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundColor: s.bg }
          : { background: s.bg }
        }
      >
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3"
        >
          <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Webcard.ai
          </div>
          <div className="flex items-center space-x-2">
            {settings.showViews !== false && (
              <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center space-x-1">
                <Eye className="w-3 h-3" /><span>{viewCount}</span>
              </div>
            )}
            {settings.showShare !== false && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShareOpen(true)} className="bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full">
                <Share2 className="w-3.5 h-3.5" />
              </motion.button>
            )}
            {settings.showQr !== false && (
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setQrOpen(true)} className="bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full">
                <QrCode className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ── HORIZONTAL LAYOUT ────────────────────────────────────────── */}
        {settings.orientation === 'horizontal' && (
          <div className="flex flex-col sm:flex-row w-full overflow-hidden">
            {/* Left panel — profile info */}
            <div className="sm:w-48 sm:min-h-screen shrink-0 flex flex-col items-center pt-16 pb-6 px-4 sm:sticky sm:top-0 sm:h-screen" style={{ background: theme.gradient || s.contactBg }}>
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 mb-3 shadow-xl" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
                <AvatarGlow color={glowColor} size={100} />
                {personalInfo?.profilePic
                  ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: s.contactText }}>
                      {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </div>
              <h1 className="text-sm font-black text-center text-white leading-tight">{personalInfo?.name || 'Unnamed'}</h1>
              {personalInfo?.designation && (
                <p className="text-[11px] text-center mt-1 opacity-70 text-white">{personalInfo.designation}</p>
              )}
              {personalInfo?.bio && (
                <p className="text-[10px] text-center mt-3 leading-relaxed text-white opacity-60">{personalInfo.bio}</p>
              )}
              {s.accent && <div className="mt-4 w-8 h-0.5 rounded-full mx-auto" style={{ background: s.accent }} />}
              {settings.hideBranding !== true && (
                <div className="mt-auto pt-6">
                  <p className="text-[9px] text-center uppercase tracking-widest opacity-40 text-white">Webcard.ai</p>
                </div>
              )}
            </div>
            {/* Right panel — sections */}
            <div className="flex-1 min-w-0 max-w-full overflow-hidden">
              {/* Top bar for horizontal */}
              <div className="flex items-center justify-end px-4 py-3 space-x-2" style={{ borderBottom: `1px solid ${s.border}` }}>
                {settings.showViews !== false && (
                  <div className="flex items-center space-x-1 text-xs" style={{ color: s.designationColor }}>
                    <Eye className="w-3 h-3" /><span>{viewCount}</span>
                  </div>
                )}
                {settings.showShare !== false && (
                  <button onClick={() => setShareOpen(true)} className="p-1.5 rounded-lg" style={{ background: s.sectionBg, color: s.nameColor }}>
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {settings.showQr !== false && (
                  <button onClick={() => setQrOpen(true)} className="p-1.5 rounded-lg" style={{ background: s.sectionBg, color: s.nameColor }}>
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {sectionOrder.map(id => renderSection(id, sectionData, theme))}
            </div>
          </div>
        )}

        {/* ── VERTICAL LAYOUT (default) ────────────────────────────────── */}
        {settings.orientation !== 'horizontal' && <>

        {/* ── HEADER: layout-aware ─────────────────────────────────────── */}
        {theme.layout === 'hero' ? (
          /* HERO layout — profile bottom-left, name right */
          <div className="relative" style={{ height: '220px' }}>
            {/* Banner */}
            <div className="absolute inset-0 overflow-hidden">
              {personalInfo?.bannerImage
                ? <img src={personalInfo.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full" style={{ background: theme.bannerGradient || theme.gradient || s.contactBg }} />
              }
            </div>
            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-28" style={{ background: `linear-gradient(to top, ${s.bg}, transparent)` }} />
            {/* Profile + Name row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
              className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-end space-x-4"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
                <AvatarGlow color={glowColor} />
                {personalInfo?.profilePic
                  ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                      {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-xl font-black leading-tight drop-shadow-sm" style={{ color: s.nameColor }}>
                  {personalInfo?.name || 'Unnamed'}
                </h1>
                {personalInfo?.designation && (
                  <p className="text-xs font-semibold mt-0.5 opacity-80" style={{ color: s.designationColor }}>{personalInfo.designation}</p>
                )}
                {s.accent && (
                  <div className="mt-1.5 w-8 h-0.5 rounded-full" style={{ background: s.accent }} />
                )}
              </div>
            </motion.div>
            {/* Accent dot decoration */}
            <div className="absolute top-14 right-5 w-3 h-3 rounded-full opacity-60" style={{ background: s.accent || s.contactText }} />
            <div className="absolute top-8 right-12 w-1.5 h-1.5 rounded-full opacity-40" style={{ background: s.accent || s.contactText }} />
          </div>
        ) : theme.layout === 'glass' ? (
          /* GLASS layout — name overlaid on banner with glass panel */
          <div className="relative" style={{ height: '240px' }}>
            {/* Full banner */}
            <div className="absolute inset-0 overflow-hidden">
              {personalInfo?.bannerImage
                ? <img src={personalInfo.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full" style={{ background: theme.bannerGradient || theme.gradient || s.contactBg }} />
              }
            </div>
            {/* Glass panel overlay */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
              className="absolute bottom-0 left-0 right-0 px-4 pb-5"
            >
              <div className="rounded-2xl p-4 flex items-center space-x-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
                  <AvatarGlow color={glowColor} size={90} />
                  {personalInfo?.profilePic
                    ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                        {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-black text-white leading-tight truncate">{personalInfo?.name || 'Unnamed'}</h1>
                  {personalInfo?.designation && (
                    <p className="text-xs font-medium mt-0.5 truncate" style={{ color: s.designationColor }}>{personalInfo.designation}</p>
                  )}
                  {s.accent && <div className="mt-2 w-6 h-0.5 rounded-full" style={{ background: s.accent }} />}
                </div>
              </div>
            </motion.div>
            {/* Decorative orbs */}
            <motion.div
              className="absolute top-6 left-6 w-20 h-20 rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, ${s.accent || '#fff'}, transparent)` }}
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-4 right-8 w-12 h-12 rounded-full opacity-15"
              style={{ background: `radial-gradient(circle, ${s.accent || '#fff'}, transparent)` }}
              animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          </div>
        ) : theme.layout === 'wave' ? (
          /* WAVE layout — curved banner bottom */
          <div>
            <div className="relative overflow-hidden" style={{ height: '140px' }}>
              {personalInfo?.bannerImage
                ? <img src={personalInfo.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full" style={{ background: theme.gradient || `linear-gradient(135deg, ${s.contactBg}, ${s.sectionBg})` }} />
              }
              {/* Wave SVG */}
              <svg viewBox="0 0 390 30" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: '30px' }}>
                <path d="M0,15 Q97.5,0 195,15 Q292.5,30 390,15 L390,30 L0,30 Z" fill={s.bg} />
              </svg>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1, type: 'spring', damping: 18 }}
              className="flex justify-center -mt-10 mb-2 relative z-10"
            >
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-3" style={{ border: `3px solid ${s.bg}`, background: s.sectionBg }}>
                <AvatarGlow color={glowColor} />
                {personalInfo?.profilePic
                  ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                      {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </div>
            </motion.div>
            <div className="text-center px-6 pb-5">
              <h1 className="text-xl font-black leading-tight" style={{ color: s.nameColor }}>{personalInfo?.name || 'Unnamed'}</h1>
              {personalInfo?.designation && (
                <div className="inline-flex items-center mt-1.5 px-3 py-0.5 rounded-full text-xs font-semibold" style={{ background: s.contactBg, color: s.contactText }}>
                  {personalInfo.designation}
                </div>
              )}
              {personalInfo?.bio && (
                <p className="text-xs mt-2.5 leading-relaxed" style={{ color: s.designationColor }}>{personalInfo.bio}</p>
              )}
            </div>
          </div>
        ) : (
          /* CLASSIC layout — standard centered */
          <div>
            <div className="relative h-44 overflow-hidden">
              {personalInfo?.bannerImage
                ? <img src={personalInfo.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                : <div className="w-full h-full" style={{ background: theme.gradient || `linear-gradient(135deg, ${s.contactBg}, ${s.sectionBg})` }} />
              }
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1, type: 'spring', damping: 18 }}
              className="flex justify-center -mt-11 mb-3 relative z-10"
            >
              <div className="relative">
                <div className="relative w-22 h-22 rounded-full overflow-hidden shadow-xl border-4" style={{ borderColor: s.bg, background: s.sectionBg, width: '88px', height: '88px' }}>
                  <AvatarGlow color={glowColor} />
                  {personalInfo?.profilePic
                    ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                        {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                </div>
                {/* Online badge */}
                <motion.div
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 bg-green-400" style={{ borderColor: s.bg }}
                  animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
            <div className="text-center px-6 pb-5">
              <h1 className="text-xl font-black leading-tight" style={{ color: s.nameColor }}>{personalInfo?.name || 'Unnamed'}</h1>
              {personalInfo?.designation && (
                <p className="text-sm font-medium mt-0.5" style={{ color: s.designationColor }}>{personalInfo.designation}</p>
              )}
              {personalInfo?.bio && (
                <p className="text-xs mt-2 leading-relaxed max-w-xs mx-auto" style={{ color: s.designationColor }}>{personalInfo.bio}</p>
              )}
            </div>
          </div>
        )}

        {/* Bio for hero/glass layouts (bio shown below header) */}
        {(theme.layout === 'hero' || theme.layout === 'glass') && personalInfo?.bio && (
          <div className="px-5 pb-4 pt-3">
            <p className="text-xs leading-relaxed text-center" style={{ color: s.designationColor }}>{personalInfo.bio}</p>
          </div>
        )}

        {/* Sections in saved order */}
        {sectionOrder.map(id => renderSection(id, sectionData, theme))}

        {/* Branding footer */}
        {settings.hideBranding !== true && (
          <div className="text-center py-6" style={{ borderTop: `1px solid ${s.border}` }}>
            <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: s.designationColor, opacity: 0.5 }}>
              Powered by{' '}
              <a href="/" className="font-black hover:underline" style={{ color: s.designationColor }}>Webcard.ai</a>
            </p>
          </div>
        )}
        </>}
      </motion.div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShareOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-4"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Share Card</h3>
                <button onClick={() => setShareOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-5 space-y-4">
                {settings.showQrOnShare !== false && (
                  <div className="flex justify-center py-2">
                    <QRCodeSVG value={cardUrl} size={140} bgColor="#fff" fgColor="#000" level="H" />
                  </div>
                )}
                <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-gray-600 flex-1 truncate font-mono">{cardUrl}</p>
                  <button onClick={handleCopy} className="shrink-0 text-xs font-bold text-pink-600 hover:underline">
                    {copied ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(cardUrl)}` },
                    { label: 'Facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}` },
                    { label: 'Twitter',  color: '#000000', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(cardUrl)}` },
                  ].map(({ label, color, href }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="text-white text-xs font-bold text-center py-2.5 rounded-lg hover:opacity-90 transition"
                      style={{ background: color }}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setQrOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center space-y-4 max-w-xs w-full"
            >
              <div className="flex items-center justify-between w-full">
                <h3 className="font-bold text-gray-900">QR Code</h3>
                <button onClick={() => setQrOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <QRCodeSVG value={cardUrl} size={200} bgColor="#fff" fgColor="#000" level="H" />
              <p className="text-xs text-gray-400 text-center">Scan to open this digital card</p>
              <button onClick={() => setQrOpen(false)} className="w-full bg-pink-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-pink-700 transition">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicVcard;
