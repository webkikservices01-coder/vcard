// import React, { useState, useEffect, useRef } from 'react';
// import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
// import { Menu, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
// import Sidebar from './Sidebar';
// import axios from 'axios';

// const breadcrumbMap = {
//   '/dashboard': 'Dashboard',
//   '/dashboard/vcard/all': 'All vCards',
//   '/dashboard/vcard/theme': 'Theme',
//   '/dashboard/vcard/profile': 'Profile',
//   '/dashboard/vcard/contact': 'Contact Details',
//   '/dashboard/vcard/products': 'Products & Services',
//   '/dashboard/vcard/portfolio': 'Portfolio',
//   '/dashboard/vcard/gallery': 'Gallery',
//   '/dashboard/vcard/testimonials': 'Testimonials',
//   '/dashboard/vcard/qr': 'QR Code',
//   '/dashboard/vcard/custom': 'Custom Sections',
//   '/dashboard/vcard/reorder': 'Reorder Sections',
//   '/dashboard/vcard/advanced': 'Advanced Settings',
//   '/dashboard/vcard/ai-persona': 'AI Persona Setup',
//   '/dashboard/plans': 'Plans',
//   '/dashboard/transactions': 'Transactions',
//   '/dashboard/support': 'Support',
//   '/dashboard/profile': 'My Profile',
// };

// const DashboardLayout = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [user, setUser] = useState({ name: 'User', plan: 'Free Trial' });
//   const dropdownRef = useRef(null);

//   const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';

//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get('http://localhost:5000/api/stats', {
//           headers: { 'x-auth-token': token }
//         });
//         if (res.data?.user) setUser(res.data.user);
//       } catch {}
//     };
//     fetchUser();
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };

//   const initials = user.name
//     ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
//     : 'U';

//   return (
//     <div className="flex h-screen bg-gray-50 font-['Inter']">
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} userPlan={user.plan} />

//       <div className="flex-1 flex flex-col overflow-hidden min-w-0">
//         {/* Header */}
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
//             >
//               <Menu className="w-5 h-5" />
//             </button>
//             <div>
//               <h2 className="text-base font-semibold text-gray-900">{pageTitle}</h2>
//               <p className="text-xs text-gray-400 hidden sm:block">
//                 Dashboard / {pageTitle}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center space-x-2">
//             <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg relative">
//               <Bell className="w-5 h-5" />
//             </button>

//             {/* User dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
//               >
//                 <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
//                   {initials}
//                 </div>
//                 <div className="hidden sm:block text-left">
//                   <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name}</p>
//                   <p className="text-[10px] text-gray-500">{user.plan}</p>
//                 </div>
//                 <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
//               </button>

//               {dropdownOpen && (
//                 <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
//                   <Link
//                     to="/dashboard/profile"
//                     onClick={() => setDropdownOpen(false)}
//                     className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
//                   >
//                     <User className="w-4 h-4" />
//                     <span>My Profile</span>
//                   </Link>
//                   <Link
//                     to="/dashboard/plans"
//                     onClick={() => setDropdownOpen(false)}
//                     className="flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
//                   >
//                     <Settings className="w-4 h-4" />
//                     <span>Plans</span>
//                   </Link>
//                   <div className="border-t border-gray-100 my-1" />
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default DashboardLayout;





import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Bell, User, ChevronDown, Settings, LogOut, Palette, Phone, ShoppingBag, Briefcase, Image as ImageIcon, Star, QrCode, Layout, ListOrdered, Settings2, FolderOpen, ShieldCheck } from 'lucide-react';
import Sidebar from './Sidebar';
import axios from 'axios';

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

// Jo items sidebar se hataye the, woh ab horizontal tabs ke liye yahan hain
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

  const pageTitle = breadcrumbMap[location.pathname] || 'Dashboard';
  
  // Check if we are in the vCard section (to show horizontal tabs)
  const isVcardSection = location.pathname.includes('/dashboard/vcard') && !location.pathname.includes('/dashboard/vcard/ai-persona');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/stats', {
          headers: { 'x-auth-token': token }
        });
        if (res.data?.user) setUser(res.data.user);
      } catch {}
    };
    fetchUser();
  }, []);

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
              className="lg:hidden p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{pageTitle}</h2>
              <p className="text-xs text-gray-400 hidden sm:block">
                Dashboard / {pageTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user.isAdmin && (
              <a
                href="/admin"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </a>
            )}
            <button className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-500">{user.plan}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
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
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Horizontal Navigation Tabs (Only visible when in vCard section) */}
        {isVcardSection && (
          <div className="bg-white border-b border-gray-200 overflow-x-auto custom-scrollbar shrink-0">
            <div className="flex px-4 md:px-6 min-w-max">
              {vcardTabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center space-x-2 px-4 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive 
                        ? 'border-black text-black' 
                        : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;