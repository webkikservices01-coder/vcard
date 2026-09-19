import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, User, ChevronDown, Settings, LogOut, Palette, Phone, ShoppingBag, Briefcase, Image as ImageIcon, Star, QrCode, Layout, ListOrdered, Settings2, FolderOpen, ShieldCheck, X, Sparkles } from 'lucide-react';
import Sidebar from './Sidebar';
import JarvisWidget from './JarvisWidget';
import ThemeToggle from './ui/ThemeToggle';
import MeshBackground from './ui/MeshBackground';
import IconButton from './ui/IconButton';
import axios from 'axios';
import { hasChatFill } from '../utils/plan';

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/dashboard/vcard/all': 'All vCards',
  '/dashboard/vcard/theme': 'Theme',
  '/dashboard/vcard/profile': 'Profile',
  '/dashboard/vcard/contact': 'Contact Details',
  '/dashboard/vcard/products': 'Products & Services',
  '/dashboard/vcard/portfolio': 'Portfolio',
  '/dashboard/vcard/gallery': 'Gallery',
  '/dashboard/vcard/testimonials': 'Testimonials',
  '/dashboard/vcard/qr': 'QR Code',
  '/dashboard/vcard/custom': 'Custom Sections',
  '/dashboard/vcard/reorder': 'Reorder Sections',
  '/dashboard/vcard/advanced': 'Advanced Settings',
  '/dashboard/vcard/ai-persona': 'AI Persona Setup',
  '/dashboard/plans': 'Plans',
  '/dashboard/transactions': 'Transactions',
  '/dashboard/support': 'Support',  
  '/dashboard/profile': 'My Profile',
};

const primaryVcardTabs = [
  { name: 'All vCards',      icon: FolderOpen,  path: '/dashboard/vcard/all' },
  { name: 'Profile',         icon: User,        path: '/dashboard/vcard/profile' },
  { name: 'Theme',           icon: Palette,     path: '/dashboard/vcard/theme' },
  { name: 'Contact Details', icon: Phone,       path: '/dashboard/vcard/contact' },
  { name: 'Products & Services', icon: ShoppingBag, path: '/dashboard/vcard/products' },
  { name: 'Portfolio',       icon: Briefcase,   path: '/dashboard/vcard/portfolio' },
  { name: 'Gallery',         icon: ImageIcon,   path: '/dashboard/vcard/gallery' },
  { name: 'Testimonials',    icon: Star,        path: '/dashboard/vcard/testimonials' },
  { name: 'QR Code',         icon: QrCode,      path: '/dashboard/vcard/qr' },
];

const secondaryVcardTabs = [
  { name: 'Custom Sections', icon: Layout,      path: '/dashboard/vcard/custom' },
  { name: 'Reorder',         icon: ListOrdered, path: '/dashboard/vcard/reorder' },
  { name: 'Advanced',        icon: Settings2,   path: '/dashboard/vcard/advanced' },
];

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState({ name: 'User', plan: 'Free Trial' });
  const dropdownRef = useRef(null);

  // Mobile Tabs Dropdown State
  const [mobileTabMenuOpen, setMobileTabMenuOpen] = useState(false);

  const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';
  const isVcardSection = location.pathname.includes('/dashboard/vcard') && !location.pathname.includes('/dashboard/vcard/ai-persona');

  const allTabsCombined = [...primaryVcardTabs, ...secondaryVcardTabs];
  const activeTab = allTabsCombined.find(tab => tab.path === location.pathname) || primaryVcardTabs[0];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/stats`, {
          headers: { 'x-auth-token': token }
        });
        if (res.data?.user) setUser(res.data.user);

        const { vcardCount, cardName, cardSlug } = res.data || {};
        if (!vcardCount || !cardName || !cardSlug) {
          navigate('/onboarding', { replace: true });
        }
      } catch { /* ignore */ }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen w-full font-['Inter'] relative overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
      <style>{`
        @keyframes lightingSlideRightToLeft {
          0% {
            opacity: 0;
            transform: translateX(50px);
            filter: brightness(1.4);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            filter: brightness(1);
          }
        }
        .animate-lighting-right-to-left {
          animation: lightingSlideRightToLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      <MeshBackground fixed className="opacity-[0.18] -z-10" />

      {/* Sidebar fixed height */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userPlan={user.plan} />

      {/* Right side container strictly scrollable */}
      <div className="flex-1 flex flex-col h-screen min-w-0 relative overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 h-16 glass flex items-center justify-between px-4 md:px-6 shrink-0 z-35 border-x-0 border-t-0 shadow-sm">
          <div className="flex items-center space-x-3">
            <IconButton
              onClick={() => setSidebarOpen(true)}
              title="Open menu"
              className="lg:hidden hover:text-brand-500 hover:bg-brand-500/10"
            >
              <Menu className="w-5 h-5" />
            </IconButton>
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={pageTitle}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="text-base font-semibold"
                  style={{ color: 'var(--surface-text)' }}
                >
                  {pageTitle}
                </motion.h2>
              </AnimatePresence>
              <p className="text-xs hidden sm:block" style={{ color: 'var(--surface-text-2)' }}>
                Dashboard / {pageTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {user.isAdmin && (
              <a
                href="/admin"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white text-xs font-bold rounded-lg hover:opacity-90 fast-transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </a>
            )}
            <IconButton title="Notifications" className="hover:text-brand-500 hover:bg-brand-500/10">
              <Bell className="w-5 h-5" />
            </IconButton>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 hover:bg-brand-500/10 rounded-lg fast-transition cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--surface-text)' }}>{user.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--surface-text-2)' }}>{user.plan}</p>
                </div>
                <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="hidden sm:block">
                  <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--surface-text-2)' }} />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="glass absolute right-0 top-full mt-1 w-48 rounded-xl py-1 z-50 shadow-xl"
                  >
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-brand-500/10 fast-transition"
                      style={{ color: 'var(--surface-text)' }}
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/dashboard/plans"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm hover:bg-brand-500/10 fast-transition"
                      style={{ color: 'var(--surface-text)' }}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Plans</span>
                    </Link>
                    {user.isAdmin && (
                      <>
                        <div style={{ borderTop: '1px solid var(--surface-border)' }} className="my-1" />
                        <a
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-purple-500 hover:bg-purple-500/10 fast-transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </a>
                      </>
                    )}
                    <div style={{ borderTop: '1px solid var(--surface-border)' }} className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 w-full text-left fast-transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* vCard sub-navigation positioned safely below header */}
        {isVcardSection && (
          <div className="sticky top-16 glass shrink-0 z-30 border-x-0 border-t-0 py-3 px-4 md:px-6 shadow-md">
            {/* Mobile: Clean Trigger Button */}
            <div className="lg:hidden relative">
              <button
                onClick={() => setMobileTabMenuOpen(true)}
                className="flex items-center justify-between w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg border border-white/20 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <activeTab.icon className="w-4 h-4 text-yellow-300" />
                  <span>{activeTab.name}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-white" />
              </button>

              {/* Mobile Modal Drawer */}
              <AnimatePresence>
                {mobileTabMenuOpen && (
                  <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setMobileTabMenuOpen(false)}
                      className="absolute inset-0 bg-black/70 backdrop-blur-md"
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 50, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="relative w-full max-w-sm rounded-[32px] p-5 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-white/20 bg-slate-950 text-white overflow-hidden z-10"
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" /> Select vCard Section
                        </span>
                        <button 
                          onClick={() => setMobileTabMenuOpen(false)} 
                          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                        {allTabsCombined.map((tab) => {
                          const isActive = location.pathname === tab.path;
                          return (
                            <Link
                              key={tab.path}
                              to={tab.path}
                              onClick={() => setMobileTabMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                                isActive ? 'bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <tab.icon className={`w-4 h-4 ${isActive ? 'text-yellow-300' : 'text-pink-400'}`} />
                              <span>{tab.name}</span>
                              {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#facc15]" />}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: Two Clean Structured Rows */}
            <div className="hidden lg:flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {primaryVcardTabs.map((tab) => {
                  const isActive = location.pathname === tab.path;
                  return (
                    <Link key={tab.path} to={tab.path} className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="vcard-tab-pill-1"
                          className="absolute inset-0 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] rounded-xl shadow-[0_4px_20px_rgba(231,12,101,0.4)]"
                          transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        />
                      )}
                      <div
                        className={`relative z-10 flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          isActive ? 'text-white scale-105' : 'hover:bg-[#E70C65]/10 hover:text-[#E70C65]'
                        }`}
                        style={!isActive ? { color: 'var(--surface-text-2)', border: '1px solid var(--surface-border)' } : undefined}
                      >
                        <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'opacity-70'}`} />
                        <span>{tab.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/10 w-full max-w-xl">
                {secondaryVcardTabs.map((tab) => {
                  const isActive = location.pathname === tab.path;
                  return (
                    <Link key={tab.path} to={tab.path} className="relative">
                      {isActive && (
                        <motion.div
                          layoutId="vcard-tab-pill-2"
                          className="absolute inset-0 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] rounded-xl shadow-[0_4px_20px_rgba(231,12,101,0.4)]"
                          transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                        />
                      )}
                      <div
                        className={`relative z-10 flex items-center space-x-1.5 px-4 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                          isActive ? 'text-white scale-105' : 'hover:bg-[#E70C65]/10 hover:text-[#E70C65]'
                        }`}
                        style={!isActive ? { color: 'var(--surface-text-2)', border: '1px solid var(--surface-border)' } : undefined}
                      >
                        <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'opacity-70'}`} />
                        <span>{tab.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content scrollable area */}
        <main className="flex-1 p-4 md:p-6 z-10 animate-lighting-right-to-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {hasChatFill(user.plan) && <JarvisWidget plan={user.plan} />}
    </div>
  );
};

export default DashboardLayout;