import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import {
  FaPhoneAlt, FaWhatsapp, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaYoutube, FaGlobe
} from 'react-icons/fa';
import { MdEmail, MdLocationOn, MdOutlineLink } from 'react-icons/md';
import { Eye, Share2, X, Download, QrCode, ChevronRight, Bot, Send } from 'lucide-react';
import { allThemes, buildCustomTheme } from './vCard/Theme';

// ─── Rich chat message renderer ───────────────────────────────────────────────
const ChatMessage = ({ content, isUser }) => {
  if (isUser) return <span>{content}</span>;

  const renderLine = (text, key) => {
    const parts = [];
    // Order matters: image first, then link, then bold, then raw URL
    const pattern = /!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s]+)/g;
    let last = 0, match, k = 0;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > last) {
        parts.push(<span key={`t${k++}`}>{text.slice(last, match.index)}</span>);
      }

      if (match[2] && match[0].startsWith('!')) {
        // ![alt](url) — image
        parts.push(
          <div key={`i${k++}`} className="mt-2 mb-1">
            <img
              src={match[2]} alt={match[1] || 'preview'}
              className="rounded-lg w-full max-h-40 object-cover cursor-pointer shadow-sm"
              onClick={() => window.open(match[2], '_blank')}
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        );
      } else if (match[4]) {
        // [label](url) — link
        const href = match[4];
        const isWa = href.includes('wa.me');
        const isTel = href.startsWith('tel:');
        const isMail = href.startsWith('mailto:');
        parts.push(
          <a key={`l${k++}`} href={href}
            target={isTel || isMail ? '_self' : '_blank'}
            rel="noopener noreferrer"
            className={`inline-flex items-center font-semibold underline decoration-dotted ${isWa ? 'text-green-600' : 'text-blue-600'}`}
          >
            {match[3]}
          </a>
        );
      } else if (match[5]) {
        // **bold**
        parts.push(<strong key={`b${k++}`} className="font-bold">{match[5]}</strong>);
      } else if (match[6]) {
        // raw URL fallback
        const url = match[6];
        parts.push(
          <a key={`r${k++}`} href={url} target="_blank" rel="noopener noreferrer"
            className="text-blue-600 underline break-all text-xs">
            {url.length > 40 ? url.slice(0, 40) + '…' : url}
          </a>
        );
      }
      last = match.index + match[0].length;
    }

    if (last < text.length) parts.push(<span key={`e${k++}`}>{text.slice(last)}</span>);
    return <div key={key}>{parts}</div>;
  };

  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) =>
        line.trim() === ''
          ? <div key={i} className="h-1.5" />
          : renderLine(line, i)
      )}
    </div>
  );
};

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
const SectionTitle = ({ children, accent, color }) => (
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
            <a
              key={idx}
              href={getHref(link.fieldType, link.url)}
              target={['Mobile / Phone', 'WhatsApp', 'Email'].includes(link.fieldType) ? '_self' : '_blank'}
              rel="noopener noreferrer"
              className="flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all active:scale-95"
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
            </a>
          ))}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {settings?.showPhonebook !== false && (
              <button
                onClick={data.onPhonebook}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-bold transition active:scale-95"
                style={{ border: `1.5px solid ${s.contactBg}`, color: s.nameColor }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Contact</span>
              </button>
            )}
            {settings?.showShare !== false && (
              <button
                onClick={data.onShare}
                className="flex items-center justify-center space-x-2 py-3 rounded-2xl text-xs font-bold transition active:scale-95"
                style={{ background: s.contactBg, color: s.contactText }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
            )}
          </div>
        </div>
      ) : null;

    case 'products':
      return products.length > 0 ? (
        <div key="products" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Products &amp; Services</SectionTitle>
          <div className="space-y-3">
            {products.map(p => (
              <div key={p._id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${s.border}`, background: s.sectionBg }}>
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
              </div>
            ))}
          </div>
        </div>
      ) : null;

    case 'portfolio':
      return portfolio.length > 0 ? (
        <div key="portfolio" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Portfolio</SectionTitle>
          <div className="space-y-3">
            {portfolio.map(p => (
              <a key={p._id} href={p.url || '#'} target="_blank" rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden transition-all active:scale-95"
                style={{ border: `1px solid ${s.border}`, background: s.sectionBg }}>
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
              </a>
            ))}
          </div>
        </div>
      ) : null;

    case 'testimonials':
      return testimonials.length > 0 ? (
        <div key="testimonials" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Testimonials</SectionTitle>
          <div className="space-y-3">
            {testimonials.map(t => (
              <div key={t._id} className="rounded-2xl p-4" style={{ background: s.sectionBg, border: `1px solid ${s.border}` }}>
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
              </div>
            ))}
          </div>
        </div>
      ) : null;

    case 'gallery':
      return gallery.length > 0 ? (
        <div key="gallery" className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>Gallery</SectionTitle>
          <div className="grid grid-cols-3 gap-1.5">
            {gallery.map(item => {
              if (item.type === 'video') {
                const match = item.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                const thumb = match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
                return (
                  <a key={item._id} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="relative aspect-square rounded-xl overflow-hidden" style={{ background: s.sectionBg }}>
                    {thumb && <img src={thumb} alt="video" className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
                        <span className="text-black text-xs ml-0.5">▶</span>
                      </div>
                    </div>
                  </a>
                );
              }
              return (
                <div key={item._id} className="aspect-square rounded-xl overflow-hidden">
                  <img src={item.url} alt="gallery" className="w-full h-full object-cover" style={{ background: s.sectionBg }} />
                </div>
              );
            })}
          </div>
        </div>
      ) : null;

    case 'custom':
      return customSections.length > 0 ? customSections.map(section => (
        <div key={section._id} className="px-4 py-5" style={{ borderTop: `1px solid ${s.border}` }}>
          <SectionTitle color={s.designationColor}>{section.title}</SectionTitle>
          <div className="text-xs leading-relaxed" style={{ color: s.designationColor }}
            dangerouslySetInnerHTML={{ __html: section.content }} />
        </div>
      )) : null;

    default: return null;
  }
};

// ─── Main component ───────────────────────────────────────────────────────────
const PublicVcard = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Chat state
  const [aiConfig, setAiConfig] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const cardUrl = `${window.location.origin}/c/${slug}`;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/vcard/public/${slug}`);
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  // Check if AI chat is enabled for this card
  useEffect(() => {
    if (!slug) return;
    axios.get(`http://localhost:5000/api/ai/public/${slug}`)
      .then(res => {
        if (res.data?.enabled) {
          setAiConfig(res.data);
          setMessages([{ role: 'assistant', content: res.data.greeting || 'Hi! How can I help you?' }]);
        }
      })
      .catch(() => {});
  }, [slug]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatOpen]);

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

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const userMsg = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setChatInput('');
    setChatLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/ai/chat/${slug}`, {
        messages: updated.filter(m => m.role !== 'system')
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: err.response?.data?.msg || 'Sorry, I could not process that. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter']">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Loading card...</p>
      </div>
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Inter'] p-4">
      <div className="text-center">
        <h1 className="text-5xl font-black text-black mb-3">404</h1>
        <p className="text-gray-500 text-sm mb-5">This vCard doesn't exist or has been removed.</p>
        <a href="/" className="bg-black text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition">Go Home</a>
      </div>
    </div>
  );

  const { card, products = [], portfolio = [], testimonials = [], gallery = [], customSections = [], settings = {} } = data;
  const { personalInfo = {}, dynamicLinks = [], viewCount = 0, theme: themeId = 'theme-one' } = card;

  // Get theme styles — custom theme reads from card.customTheme
  const theme = themeId === 'custom' && card.customTheme
    ? buildCustomTheme(card.customTheme)
    : (allThemes.find(t => t.id === themeId) || allThemes[0]);
  const s = theme.styles;

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
      <div
        className={`w-full min-h-screen relative shadow-2xl ${settings.orientation === 'horizontal' ? 'max-w-2xl' : 'max-w-sm'}`}
        style={theme.bgImage
          ? { backgroundImage: `url(${theme.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top', backgroundColor: s.bg }
          : { background: s.bg }
        }
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3">
          <div className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            MYcardLINK
          </div>
          <div className="flex items-center space-x-2">
            {settings.showViews !== false && (
              <div className="bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full flex items-center space-x-1">
                <Eye className="w-3 h-3" /><span>{viewCount}</span>
              </div>
            )}
            {settings.showShare !== false && (
              <button onClick={() => setShareOpen(true)} className="bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full">
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}
            {settings.showQr !== false && (
              <button onClick={() => setQrOpen(true)} className="bg-black/70 backdrop-blur-sm text-white p-1.5 rounded-full">
                <QrCode className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── HORIZONTAL LAYOUT ────────────────────────────────────────── */}
        {settings.orientation === 'horizontal' && (
          <div className="flex flex-col sm:flex-row">
            {/* Left panel — profile info */}
            <div className="sm:w-48 sm:min-h-screen shrink-0 flex flex-col items-center pt-16 pb-6 px-4 sm:sticky sm:top-0 sm:h-screen" style={{ background: theme.gradient || s.contactBg }}>
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 mb-3 shadow-xl" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
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
                  <p className="text-[9px] text-center uppercase tracking-widest opacity-40 text-white">MYcardLINK</p>
                </div>
              )}
            </div>
            {/* Right panel — sections */}
            <div className="flex-1 min-w-0">
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
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 flex items-end space-x-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
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
            </div>
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
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
              <div className="rounded-2xl p-4 flex items-center space-x-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border" style={{ borderColor: 'rgba(255,255,255,0.2)', background: s.sectionBg }}>
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
            </div>
            {/* Decorative orbs */}
            <div className="absolute top-6 left-6 w-20 h-20 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${s.accent || '#fff'}, transparent)` }} />
            <div className="absolute top-4 right-8 w-12 h-12 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${s.accent || '#fff'}, transparent)` }} />
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
            <div className="flex justify-center -mt-10 mb-2 relative z-10">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-3" style={{ border: `3px solid ${s.bg}`, background: s.sectionBg }}>
                {personalInfo?.profilePic
                  ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                      {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                }
              </div>
            </div>
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
            <div className="flex justify-center -mt-11 mb-3 relative z-10">
              <div className="relative">
                <div className="w-22 h-22 rounded-full overflow-hidden shadow-xl border-4" style={{ borderColor: s.bg, background: s.sectionBg, width: '88px', height: '88px' }}>
                  {personalInfo?.profilePic
                    ? <img src={personalInfo.profilePic} alt="Profile" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ background: s.contactBg, color: s.contactText }}>
                        {personalInfo?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                  }
                </div>
                {/* Online badge */}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 bg-green-400" style={{ borderColor: s.bg }} />
              </div>
            </div>
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
              <a href="/" className="font-black hover:underline" style={{ color: s.designationColor }}>MYcardLINK</a>
            </p>
          </div>
        )}
        </>}
      </div>

      {/* AI Chat Widget */}
      {aiConfig && (
        <>
          {/* Chat Bubble Button */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="fixed bottom-6 right-6 w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform"
              title={`Chat with ${aiConfig.aiName}`}
            >
              <Bot className="w-6 h-6" />
            </button>
          )}

          {/* Chat Window */}
          {chatOpen && (
            <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200" style={{ height: '420px' }}>
              {/* Header */}
              <div className="bg-black text-white px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight">{aiConfig.aiName}</p>
                    <p className="text-[10px] text-gray-300">AI Assistant · Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                    }`}>
                      <ChatMessage content={msg.content} isUser={msg.role === 'user'} />
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="px-3 py-3 border-t border-gray-100 bg-white flex items-center space-x-2 shrink-0">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-8 h-8 bg-black text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition disabled:opacity-40"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center sm:items-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
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
                <button onClick={handleCopy} className="shrink-0 text-xs font-bold text-black hover:underline">
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
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center space-y-4 max-w-xs w-full">
            <div className="flex items-center justify-between w-full">
              <h3 className="font-bold text-gray-900">QR Code</h3>
              <button onClick={() => setQrOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <QRCodeSVG value={cardUrl} size={200} bgColor="#fff" fgColor="#000" level="H" />
            <p className="text-xs text-gray-400 text-center">Scan to open this digital card</p>
            <button onClick={() => setQrOpen(false)} className="w-full bg-black text-white font-bold py-2.5 rounded-xl text-sm hover:bg-gray-800 transition">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicVcard;
