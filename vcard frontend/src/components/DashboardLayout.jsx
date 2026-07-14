import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, User, ChevronDown, Settings, LogOut, Palette, Phone, ShoppingBag, Briefcase, Image as ImageIcon, Star, QrCode, Layout, ListOrdered, Settings2, FolderOpen, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';
import JarvisWidget from './JarvisWidget';
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

const vcardTabs = [
  { name: 'All vCards',      icon: FolderOpen,  path: '/dashboard/vcard/all' },
  { name: 'Profile',         icon: User,        path: '/dashboard/vcard/profile' },
  { name: 'Theme',           icon: Palette,     path: '/dashboard/vcard/theme' },
  { name: 'Contact Details', icon: Phone,       path: '/dashboard/vcard/contact' },
  { name: 'Products & Services', icon: ShoppingBag, path: '/dashboard/vcard/products' },
  { name: 'Portfolio',       icon: Briefcase,   path: '/dashboard/vcard/portfolio' },
  { name: 'Gallery',         icon: ImageIcon,   path: '/dashboard/vcard/gallery' },
  { name: 'Testimonials',    icon: Star,        path: '/dashboard/vcard/testimonials' },
  { name: 'QR Code',         icon: QrCode,      path: '/dashboard/vcard/qr' },
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
  const tabMenuRef = useRef(null);

  const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';
  const isVcardSection = location.pathname.includes('/dashboard/vcard') && !location.pathname.includes('/dashboard/vcard/ai-persona');

  // Current Active Tab Find karna mobile dropdown ke liye
  const activeTab = vcardTabs.find(tab => tab.path === location.pathname) || vcardTabs[0];

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

  // Handle clicking outside for both dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (tabMenuRef.current && !tabMenuRef.current.contains(e.target)) {
        setMobileTabMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="flex h-screen bg-gray-50 font-['Inter']">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userPlan={user.plan} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={pageTitle}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18 }}
                  className="text-base font-semibold text-gray-900"
                >
                  {pageTitle}
                </motion.h2>
              </AnimatePresence>
              <p className="text-xs text-gray-400 hidden sm:block">
                Dashboard / {pageTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user.isAdmin && (
              <a
                href="/admin"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-pink-600 text-white text-xs font-bold rounded-lg hover:bg-pink-700 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </a>
            )}
            <button className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg relative">
              <Bell className="w-5 h-5" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.plan}</p>
                </div>
                <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="hidden sm:block">
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50"
                  >
                    <Link
                      to="/dashboard/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/dashboard/plans"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Plans</span>
                    </Link>
                    {user.isAdmin && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <a
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2.5 text-sm text-purple-700 hover:bg-purple-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </a>
                      </>
                    )}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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

        {/* vCard sub-navigation */}
        {isVcardSection && (
          <div className="bg-white border-b border-gray-200 z-10 relative">

            {/* Mobile: dropdown menu */}
            <div className="lg:hidden px-4 py-3 relative" ref={tabMenuRef}>
              <button
                onClick={() => setMobileTabMenuOpen(!mobileTabMenuOpen)}
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-900 shadow-sm"
              >
                <div className="flex items-center space-x-2.5">
                  <activeTab.icon className="w-4 h-4 text-pink-600" />
                  <span>{activeTab.name}</span>
                </div>
                <motion.span animate={{ rotate: mobileTabMenuOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </motion.span>
              </button>

              <AnimatePresence>
                {mobileTabMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-4 right-4 top-[60px] bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 max-h-[60vh] overflow-y-auto"
                  >
                    {vcardTabs.map((tab) => {
                      const isActive = location.pathname === tab.path;
                      return (
                        <Link
                          key={tab.path}
                          to={tab.path}
                          onClick={() => setMobileTabMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium transition-colors ${
                            isActive ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                          }`}
                        >
                          <tab.icon className={`w-4 h-4 ${isActive ? 'text-pink-600' : 'opacity-60'}`} />
                          <span>{tab.name}</span>
                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-600" />}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop: pill tabs with sliding active indicator */}
            <div className="hidden lg:flex px-6 py-4 flex-wrap justify-center gap-2.5">
              {vcardTabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link key={tab.path} to={tab.path} className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="vcard-tab-pill"
                        className="absolute inset-0 bg-pink-600 rounded-xl shadow-md"
                        transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                      />
                    )}
                    <div className={`relative z-10 flex items-center space-x-2 px-3.5 py-2 text-sm font-semibold rounded-xl border transition-colors ${
                      isActive ? 'text-white border-pink-600' : 'text-gray-600 border-gray-200 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600'
                    }`}>
                      <tab.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-60'}`} />
                      <span>{tab.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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
