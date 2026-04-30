// import React, { useState } from 'react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import {
//   Home, UserCircle, LifeBuoy, CreditCard, Receipt, LogOut,
//   ChevronDown, ChevronUp, Palette, User, Phone, ShoppingBag,
//   Briefcase, Image as ImageIcon, Star, QrCode, Layout,
//   ListOrdered, Settings2, FolderOpen, X, Bot
// } from 'lucide-react';

// const AI_PLANS = ['SMART AI CARD', 'AI AGENT PRO'];

// const vcardSubItems = [
//   { name: 'All vCards',          icon: FolderOpen,  path: '/dashboard/vcard/all' },
//   { name: 'Theme',               icon: Palette,      path: '/dashboard/vcard/theme' },
//   { name: 'Profile',             icon: User,         path: '/dashboard/vcard/profile' },
//   { name: 'Contact Details',     icon: Phone,        path: '/dashboard/vcard/contact' },
//   { name: 'Products & Services', icon: ShoppingBag,  path: '/dashboard/vcard/products' },
//   { name: 'Portfolio',           icon: Briefcase,    path: '/dashboard/vcard/portfolio' },
//   { name: 'Gallery',             icon: ImageIcon,    path: '/dashboard/vcard/gallery' },
//   { name: 'Testimonials',        icon: Star,         path: '/dashboard/vcard/testimonials' },
//   { name: 'QR Code',             icon: QrCode,       path: '/dashboard/vcard/qr' },
//   { name: 'Custom Sections',     icon: Layout,       path: '/dashboard/vcard/custom' },
//   { name: 'Reorder Sections',    icon: ListOrdered,  path: '/dashboard/vcard/reorder' },
//   { name: 'Advanced',            icon: Settings2,    path: '/dashboard/vcard/advanced' },
// ];

// const aiSubItems = [
//   { name: 'AI Persona Setup', icon: Bot, path: '/dashboard/vcard/ai-persona' },
// ];

// const mainItems = [
//   { name: 'Plans',        icon: CreditCard, path: '/dashboard/plans' },
//   { name: 'Transactions', icon: Receipt,    path: '/dashboard/transactions' },
//   { name: 'Support',      icon: LifeBuoy,   path: '/dashboard/support' },
// ];

// const Sidebar = ({ isOpen, onClose, userPlan }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isVcardOpen, setIsVcardOpen] = useState(location.pathname.includes('/dashboard/vcard'));
//   const [isAiOpen, setIsAiOpen] = useState(location.pathname.includes('/dashboard/vcard/ai'));

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//   };

//   const isActive = (path) => location.pathname === path;
//   const isVcardActive = location.pathname.includes('/dashboard/vcard');
//   const hasAi = AI_PLANS.includes(userPlan);

//   return (
//     <>
//       {/* Mobile overlay */}
//       {isOpen && (
//         <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
//       )}

//       <aside className={`
//         fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
//         flex flex-col h-full overflow-y-auto transition-transform duration-300
//         ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
//       `}>
//         {/* Logo */}
//         <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
//           <div>
//             <h1 className="text-lg font-bold text-black tracking-tight leading-tight">MYcardLINK</h1>
//             <p className="text-[9px] text-gray-400 font-medium tracking-widest uppercase">CARD · QR · DIGITAL</p>
//           </div>
//           <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-black">
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
//           <Link
//             to="/dashboard"
//             onClick={onClose}
//             className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
//               isActive('/dashboard') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
//             }`}
//           >
//             <Home className="w-4 h-4 shrink-0" />
//             <span>Dashboard</span>
//           </Link>

//           {/* My vCard dropdown */}
//           <div>
//             <button
//               onClick={() => setIsVcardOpen(!isVcardOpen)}
//               className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
//                 isVcardActive ? 'text-black bg-gray-50' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <UserCircle className="w-4 h-4 shrink-0" />
//                 <span>My vCard</span>
//               </div>
//               {isVcardOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
//             </button>

//             {isVcardOpen && (
//               <div className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
//                 {vcardSubItems.map((item) => (
//                   <Link
//                     key={item.path}
//                     to={item.path}
//                     onClick={onClose}
//                     className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all text-sm ${
//                       isActive(item.path)
//                         ? 'bg-black text-white font-medium'
//                         : 'text-gray-500 hover:bg-gray-100 hover:text-black'
//                     }`}
//                   >
//                     <item.icon className="w-3.5 h-3.5 shrink-0" />
//                     <span>{item.name}</span>
//                   </Link>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* AI Features section — only for Plan 2 & 3 */}
//           <div>
//             <button
//               onClick={() => setIsAiOpen(!isAiOpen)}
//               className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
//                 location.pathname.includes('ai-persona') ? 'text-black bg-gray-50' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
//               }`}
//             >
//               <div className="flex items-center space-x-3">
//                 <Bot className="w-4 h-4 shrink-0" />
//                 <span>AI Features</span>
//                 {!hasAi && (
//                   <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">PRO</span>
//                 )}
//                 {hasAi && (
//                   <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">ON</span>
//                 )}
//               </div>
//               {isAiOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
//             </button>

//             {isAiOpen && (
//               <div className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
//                 {aiSubItems.map((item) => (
//                   <Link
//                     key={item.path}
//                     to={item.path}
//                     onClick={onClose}
//                     className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all text-sm ${
//                       isActive(item.path)
//                         ? 'bg-black text-white font-medium'
//                         : 'text-gray-500 hover:bg-gray-100 hover:text-black'
//                     }`}
//                   >
//                     <item.icon className="w-3.5 h-3.5 shrink-0" />
//                     <span>{item.name}</span>
//                     {!hasAi && <span className="ml-auto text-[9px] text-gray-400">🔒</span>}
//                   </Link>
//                 ))}
//                 {!hasAi && (
//                   <Link
//                     to="/dashboard/plans"
//                     onClick={onClose}
//                     className="flex items-center px-3 py-1.5 text-[11px] text-black font-semibold hover:underline"
//                   >
//                     Upgrade to unlock →
//                   </Link>
//                 )}
//               </div>
//             )}
//           </div>

//           {mainItems.map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               onClick={onClose}
//               className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
//                 isActive(item.path) ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
//               }`}
//             >
//               <item.icon className="w-4 h-4 shrink-0" />
//               <span>{item.name}</span>
//             </Link>
//           ))}
//         </nav>

//         {/* Plan badge + Logout */}
//         <div className="p-3 border-t border-gray-200 shrink-0 space-y-1">
//           {userPlan && (
//             <div className="px-3 py-2 bg-gray-50 rounded-lg">
//               <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Current Plan</p>
//               <p className="text-xs font-black text-gray-900 truncate">{userPlan}</p>
//             </div>
//           )}
//           <button
//             onClick={handleLogout}
//             className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-all text-sm font-medium"
//           >
//             <LogOut className="w-4 h-4 shrink-0" />
//             <span>Logout</span>
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;



import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, UserCircle, LifeBuoy, CreditCard, Receipt, LogOut,
  ChevronDown, ChevronUp, Bot, X
} from 'lucide-react';

const AI_PLANS = ['SMART AI CARD', 'AI AGENT PRO'];

const aiSubItems = [
  { name: 'AI Persona Setup', icon: Bot, path: '/dashboard/vcard/ai-persona' },
];

const mainItems = [
  { name: 'Plans',        icon: CreditCard, path: '/dashboard/plans' },
  { name: 'Transactions', icon: Receipt,    path: '/dashboard/transactions' },
  { name: 'Support',      icon: LifeBuoy,   path: '/dashboard/support' },
];

const Sidebar = ({ isOpen, onClose, userPlan }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(location.pathname.includes('/dashboard/vcard/ai'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  // Jab bhi user /dashboard/vcard ke andar kisi bhi page par hoga, tab yeh active dikhega
  const isVcardActive = location.pathname.includes('/dashboard/vcard') && !location.pathname.includes('/dashboard/vcard/ai');
  const hasAi = AI_PLANS.includes(userPlan);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200
        flex flex-col h-full overflow-y-auto transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-black tracking-tight leading-tight">MYcardLINK</h1>
            <p className="text-[9px] text-gray-400 font-medium tracking-widest uppercase">CARD · QR · DIGITAL</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-black">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={onClose}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isActive('/dashboard') ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>

          {/* My vCard - Ab yeh sirf ek link hai, dropdown nahi */}
          <Link
            to="/dashboard/vcard/profile" // Default sub-page par le jayega
            onClick={onClose}
            className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
              isVcardActive ? 'text-black bg-gray-50' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
            }`}
          >
            <UserCircle className="w-4 h-4 shrink-0" />
            <span>My vCard</span>
          </Link>

          {/* AI Features section */}
          <div>
            <button
              onClick={() => setIsAiOpen(!isAiOpen)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                location.pathname.includes('ai-persona') ? 'text-black bg-gray-50' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bot className="w-4 h-4 shrink-0" />
                <span>AI Features</span>
                {!hasAi && (
                  <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">PRO</span>
                )}
                {hasAi && (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">ON</span>
                )}
              </div>
              {isAiOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {isAiOpen && (
              <div className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5">
                {aiSubItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all text-sm ${
                      isActive(item.path)
                        ? 'bg-black text-white font-medium'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.name}</span>
                    {!hasAi && <span className="ml-auto text-[9px] text-gray-400">🔒</span>}
                  </Link>
                ))}
                {!hasAi && (
                  <Link
                    to="/dashboard/plans"
                    onClick={onClose}
                    className="flex items-center px-3 py-1.5 text-[11px] text-black font-semibold hover:underline"
                  >
                    Upgrade to unlock →
                  </Link>
                )}
              </div>
            )}
          </div>

          {mainItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                isActive(item.path) ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Plan badge + Logout */}
        <div className="p-3 border-t border-gray-200 shrink-0 space-y-1">
          {userPlan && (
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">Current Plan</p>
              <p className="text-xs font-black text-gray-900 truncate">{userPlan}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;