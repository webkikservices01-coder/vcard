import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Eye, ArrowRight, Pencil, QrCode,
  Zap, Package, Star, CreditCard, Sparkles,
  Bot, TrendingUp, Share2, ChevronRight,
  ShieldCheck, ArrowUpRight, Radio
} from 'lucide-react';
import axios from 'axios';
import DynamicCyberCard3D from '../components/ui/DynamicCyberCard3D';
import { useTheme } from '../context/ThemeContext';
import { allThemes, buildCustomTheme } from './vCard/Theme';

const PLAN_COLORS = {
  'Free Trial':    { badge: 'border-[#E70C65]/30 bg-[#E70C65]/10 text-[#ff6b9d]', bar: 'bg-gradient-to-r from-[#ff6b9d] to-[#E70C65]' },
  'DIGITAL CARD':  { badge: 'border-blue-500/30 bg-blue-500/10 text-blue-400', bar: 'bg-blue-500' },
  'SMART AI CARD': { badge: 'border-purple-500/30 bg-purple-500/10 text-purple-400', bar: 'bg-purple-500' },
  'AI AGENT PRO':  { badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', bar: 'bg-emerald-500' },
};

const sectionEntrance = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

const Dashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [stats, setStats] = useState(null);
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || '';
        
        const [statsRes, vcardRes] = await Promise.all([
          axios.get(`${apiUrl}/api/stats`, { headers: { 'x-auth-token': token } }),
          axios.get(`${apiUrl}/api/vcard/me`, { headers: { 'x-auth-token': token } }).catch(() => null)
        ]);

        setStats(statsRes.data);
        if (vcardRes?.data) {
          setCardData(vcardRes.data);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    load();

    window.addEventListener('vcard:data-changed', load);
    return () => window.removeEventListener('vcard:data-changed', load);
  }, []);

  if (loading) return (
    <div className="space-y-3 w-full max-w-7xl mx-auto py-3">
      <div className={`h-32 rounded-[22px] animate-pulse ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-slate-200'}`} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className={`lg:col-span-7 h-[360px] rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-slate-200'}`} />
        <div className={`lg:col-span-5 h-[360px] rounded-2xl animate-pulse ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-slate-200'}`} />
      </div>
    </div>
  );

  const plan       = stats?.currentPlan || 'Free Trial';
  const pc         = PLAN_COLORS[plan] || PLAN_COLORS['Free Trial'];
  const daysLeft   = stats?.remainingDays;
  const cardLimit  = stats?.user?.cardLimit || 1;
  const cardCount  = stats?.vcardCount || 0;
  
  const cardSlug   = cardData?.username || stats?.cardSlug || 'shubham';
  const personal   = cardData?.personalInfo || {};
  const cardName   = personal.name || stats?.cardName || stats?.user?.name || 'MD SHAHID';
  const cardRole   = personal.designation || stats?.cardDesignation || 'FULL STACK DEVELOPER';
  
  const firstName  = stats?.user?.name?.split(' ')[0] || 'Executive';
  const daysBar    = daysLeft != null ? Math.min(100, Math.round((daysLeft / 365) * 100)) : 0;

  const themeId    = cardData?.theme || 'midnight-tech';
  const activeThemeObj = themeId === 'custom' && cardData?.customTheme
    ? buildCustomTheme(cardData.customTheme)
    : (allThemes.find(t => t.id === themeId) || allThemes[0]);

  const activeStyles = activeThemeObj.styles || {};
  const laserColor = themeId === 'custom' && cardData?.customTheme?.accent ? cardData.customTheme.accent : (activeThemeObj.laserColor || activeStyles.accent || '#3B82F6');
  const cardBg = themeId === 'custom' && cardData?.customTheme?.cardBg ? cardData.customTheme.cardBg : (activeStyles.cardBg || '#1E293B');
  const surfaceBg = themeId === 'custom' && cardData?.customTheme?.bg ? cardData.customTheme.bg : (activeStyles.bg || '#0F172A');
  const linkBg = themeId === 'custom' && cardData?.customTheme?.linkBg ? cardData.customTheme.linkBg : (activeStyles.contactBg || '#3B82F6');
  const subText = themeId === 'custom' && cardData?.customTheme?.subTextColor ? cardData.customTheme.subTextColor : '#FFFFFF';

  const quickActions = [
    { label: 'Edit Profile', desc: 'Identity, visuals & bio', path: '/dashboard/vcard/profile', icon: Pencil },
    { label: 'Add Offerings', desc: 'Products, services & links', path: '/dashboard/vcard/products', icon: Package },
    { label: 'Branded QR', desc: 'Download smart matrix', path: '/dashboard/vcard/qr', icon: QrCode },
    { label: 'Upgrade Tier', desc: 'Unlock voice & AI agents', path: '/dashboard/plans', icon: Zap },
  ];

  const getProfilePicUrl = () => {
    let pic = personal.profilePic || stats?.cardProfilePic;
    if (!pic) return "/profile.png";
    if (pic.startsWith('http') || pic.startsWith('blob:')) return pic;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${pic.startsWith('/') ? pic : '/' + pic}`;
  };

  const getBannerUrl = () => {
    let banner = personal.bannerImage || stats?.cardBannerImage;
    if (!banner) return null;
    if (banner.startsWith('http') || banner.startsWith('blob:')) return banner;
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return `${apiUrl}${banner.startsWith('/') ? banner : '/' + banner}`;
  };

  return (
    <div className={`relative w-full max-w-7xl mx-auto space-y-4 pb-10 transition-colors duration-500 ${
      isDark ? 'text-slate-100 selection:bg-[#E70C65] selection:text-white' : 'text-slate-900 selection:bg-[#E70C65] selection:text-white'
    }`}>
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#6366f1] origin-left z-50 shadow-[0_0_12px_rgba(231,12,101,0.8)]"
        style={{ scaleX }}
      />

      <style>{`
        .clean-glass {
          background: ${isDark ? 'rgba(11, 15, 25, 0.75)' : '#ffffff'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(231, 12, 101, 0.12)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: ${isDark ? '0 10px 25px rgba(0, 0, 0, 0.3)' : '0 10px 25px rgba(231, 12, 101, 0.04)'};
        }
        .clean-glass:hover {
          border-color: rgba(231, 12, 101, 0.35);
        }
        .beam-ring {
          position: relative;
          border-radius: 22px;
          padding: 1.5px;
          overflow: hidden;
        }
        .beam-ring::before {
          content: '';
          position: absolute;
          inset: -150%;
          background: conic-gradient(transparent, #E70C65 20%, #6366f1 40%, transparent 60%);
          animation: beamSpin 7s linear infinite;
        }
        @keyframes beamSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className={`pointer-events-none fixed -right-24 -top-24 h-[400px] w-[400px] rounded-full blur-[120px] -z-10 ${
        isDark ? 'bg-gradient-to-br from-[#E70C65]/15 via-[#6366f1]/10 to-transparent' : 'bg-gradient-to-br from-[#ffccd9]/30 to-transparent'
      }`} />
      <div className={`pointer-events-none fixed -left-24 bottom-10 h-[400px] w-[400px] rounded-full blur-[120px] -z-10 ${
        isDark ? 'bg-gradient-to-tr from-[#9F1C44]/20 via-[#E70C65]/10 to-transparent' : 'bg-gradient-to-tr from-[#ffd6e2]/25 to-transparent'
      }`} />

      <motion.div variants={sectionEntrance} initial="hidden" animate="visible">
        <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#E70C65] via-[#cf0a55] to-[#9F1C44] p-5 sm:p-6 text-white shadow-xl shadow-[#E70C65]/20 border border-white/20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-white/20 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest backdrop-blur-md shadow-sm">
                <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" /> Workspace Active
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
                Welcome, {firstName}
              </h1>
              <p className="mt-0.5 text-xs text-pink-100 max-w-xl font-medium">
                Your AI card and interactive persona are live. Track views, manage offerings, and deploy leads seamlessly.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`/c/${cardSlug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white text-[#9F1C44] text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-slate-50 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#E70C65]" />
                <span>Preview Live Card</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { icon: Eye, label: 'Live Impressions', value: stats?.viewCount ?? 68, tag: 'Realtime' },
          { icon: Package, label: 'Products & Services', value: stats?.productCount ?? 0, tag: 'Showcase', link: '/dashboard/vcard/products' },
          { icon: Star, label: 'Testimonials', value: stats?.testimonialCount ?? 0, tag: 'Verified', link: '/dashboard/vcard/testimonials' },
          { icon: CreditCard, label: 'Active Cards', value: `${cardCount || 1} / ${cardLimit}`, tag: 'Capacity', link: '/dashboard/vcard/all' },
        ].map(({ icon: Icon, label, value, tag, link }) => {
          const content = (
            <div className="clean-glass rounded-xl p-3.5 group transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
                <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-pink-50 border-pink-100 text-[#9F1C44]'}`}>{tag}</span>
              </div>
              <div className="flex items-end justify-between">
                <p className={`text-2xl font-black tracking-tight transition-colors ${isDark ? 'text-white group-hover:text-[#ff6b9d]' : 'text-slate-900 group-hover:text-[#E70C65]'}`}>{value}</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E70C65]/10 text-[#E70C65] group-hover:bg-[#E70C65] group-hover:text-white transition-all shadow-sm">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
          return link ? <Link key={label} to={link} className="h-full">{content}</Link> : <div key={label} className="h-full">{content}</div>;
        })}
      </motion.div>

      <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }} className="beam-ring shadow-lg">
        <div className="relative overflow-hidden rounded-[20px] p-4.5 sm:p-5 clean-glass">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#6366f1] text-white shadow-sm shadow-[#E70C65]/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-sm sm:text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Persona & Assistant Engine</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${isDark ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                    <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" /> Active 24/7
                  </span>
                </div>
                <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}`}>
                  Train your customized intelligent persona to greet visitors, answer portfolio inquiries, and automatically schedule consultation calls while you are away.
                </p>
              </div>
            </div>

            <Link to="/dashboard/vcard/ai-persona" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#E70C65]/25 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer">
              <span>Configure AI Engine</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5">
          <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1 flex flex-col">
            <h3 className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Quick Operations</h3>
            <div className="grid gap-3 sm:grid-cols-2 flex-1">
              {quickActions.map((a) => (
                <Link key={a.path} to={a.path} className="clean-glass group flex items-center gap-3 rounded-xl p-3.5 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-sm shadow-[#E70C65]/30 group-hover:scale-105 transition-transform">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-xs truncate transition-colors ${isDark ? 'text-white group-hover:text-[#ff6b9d]' : 'text-slate-900 group-hover:text-[#E70C65]'}`}>{a.label}</p>
                    <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>{a.desc}</p>
                  </div>
                  <ArrowRight className={`h-3.5 w-3.5 shrink-0 transition-all ${isDark ? 'text-slate-400 group-hover:text-[#ff6b9d] group-hover:translate-x-1' : 'text-slate-400 group-hover:text-[#E70C65] group-hover:translate-x-1'}`} />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="clean-glass rounded-xl p-3.5 h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-500 font-bold border border-emerald-500/20 shadow-sm shrink-0">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Contactless NFC Beam</h4>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>Apple Wallet & Smart Matrix Ready</p>
                </div>
              </div>
            </div>

            <div className="clean-glass rounded-xl p-3.5 h-full flex items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-500 font-bold border border-indigo-500/20 shadow-sm shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Live Traffic Stream</h4>
                  <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>Real-time conversion metrics</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 space-y-3.5">
          <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active 3D Card</h3>
              <Link to="/dashboard/vcard/all" className={`text-xs font-bold ${isDark ? 'text-[#ff6b9d]' : 'text-[#E70C65]'} hover:underline transition-colors`}>All Cards →</Link>
            </div>

            <div className="clean-glass rounded-2xl p-3 shadow-md">
              <DynamicCyberCard3D
                name={cardName}
                designation={cardRole}
                slug={cardSlug}
                photoUrl={getProfilePicUrl()}
                bgImageUrl={getBannerUrl()}
                themeColor={laserColor}
                cardBgColor={cardBg}
                surfaceBgColor={surfaceBg}
                backBgColor={surfaceBg}
                linkBgColor={linkBg}
                subTextColor={subText}
                isDark={isDark}
              />
              
              <div className={`mt-2 pt-2 flex items-center justify-between border-t px-1 ${isDark ? 'border-white/10' : 'border-pink-100'}`}>
                <div className="flex items-center gap-1.5">
                  <Link to="/dashboard/vcard/profile" className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[#E70C65]/15 text-[#ff6b9d] hover:bg-[#E70C65]/25 transition-all">
                    Edit Card
                  </Link>
                  <Link to="/dashboard/vcard/qr" className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${isDark ? 'border-white/10 text-slate-300 hover:text-white' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    Get QR
                  </Link>
                </div>
                <a href={`/c/${cardSlug}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#E70C65] hover:underline flex items-center gap-1">
                  <span>Visit Live</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>

          <motion.div variants={sectionEntrance} initial="hidden" whileInView="visible" viewport={{ once: true }} className="clean-glass rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Membership Status</span>
              <Link to="/dashboard/plans" className={`text-xs font-bold ${isDark ? 'text-[#ff6b9d]' : 'text-[#E70C65]'} hover:underline`}>Manage →</Link>
            </div>

            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#E70C65]/30">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className={`text-xs font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan}</p>
                <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500 font-medium'}`}>{daysLeft != null ? `${daysLeft} days active` : 'Standard tier'}</p>
              </div>
            </div>

            {daysLeft != null && (
              <div className="space-y-1">
                <div className={`flex justify-between text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>Annual Validity</span>
                  <span>{daysLeft} / 365 days</span>
                </div>
                <div className={`w-full h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <motion.div className={`h-full rounded-full ${pc.bar}`} initial={{ width: 0 }} whileInView={{ width: `${daysBar}%` }} viewport={{ once: true }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                </div>
              </div>
            )}

            <div className={`mt-2.5 pt-2 flex items-center justify-between border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <div>
                <p className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Limit</p>
                <p className={`text-[11px] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{cardCount || 1} <span className="font-normal text-[9px] opacity-75">/ {cardLimit} Allowed</span></p>
              </div>
              <div className="text-right">
                <p className={`text-[9px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Security</p>
                <p className={`text-[10px] font-bold text-emerald-500 flex items-center gap-1`}><ShieldCheck className="w-3 h-3" /> Verified</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;