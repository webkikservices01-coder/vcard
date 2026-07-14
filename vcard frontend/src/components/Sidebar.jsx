import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, UserCircle, LifeBuoy, CreditCard, Receipt, LogOut,
  ChevronDown, Bot, X
} from 'lucide-react';
import { hasChatFill } from '../utils/plan';

const aiSubItems = [
  { name: 'AI Persona Setup', icon: Bot, path: '/dashboard/vcard/ai-persona' },
];

const mainItems = [
  { name: 'Plans',        icon: CreditCard, path: '/dashboard/plans' },
  { name: 'Transactions', icon: Receipt,    path: '/dashboard/transactions' },
  { name: 'Support',      icon: LifeBuoy,   path: '/dashboard/support' },
];

const NavPill = ({ active, children, ...props }) => (
  <div className="relative">
    {active && (
      <motion.div
        layoutId="sidebar-active-pill"
        className="absolute inset-0 bg-pink-600 rounded-lg"
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
    )}
    <div className={`relative z-10 flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active ? 'text-white' : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
    }`} {...props}>
      {children}
    </div>
  </div>
);

const Sidebar = ({ isOpen, onClose, userPlan }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(location.pathname.includes('/dashboard/vcard/ai'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const isVcardActive = location.pathname.includes('/dashboard/vcard') && !location.pathname.includes('/dashboard/vcard/ai');
  const isAiActive = location.pathname.includes('ai-persona');
  const hasAi = hasChatFill(userPlan);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose}
          />
        )}
      </AnimatePresence>

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
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-pink-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <Link to="/dashboard" onClick={onClose}>
            <NavPill active={isActive('/dashboard')}>
              <Home className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavPill>
          </Link>

          <Link to="/dashboard/vcard/profile" onClick={onClose}>
            <NavPill active={isVcardActive}>
              <UserCircle className="w-4 h-4 shrink-0" />
              <span>My vCard</span>
            </NavPill>
          </Link>

          {/* AI Features section */}
          <div>
            <button onClick={() => setIsAiOpen(!isAiOpen)} className="w-full text-left">
              <NavPill active={isAiActive}>
                <Bot className="w-4 h-4 shrink-0" />
                <span className="flex-1">AI Features</span>
                {!hasAi && (
                  <span className="text-[9px] bg-gray-100 text-gray-500 font-bold px-1.5 py-0.5 rounded">PRO</span>
                )}
                {hasAi && (
                  <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">ON</span>
                )}
                <motion.span animate={{ rotate: isAiOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </NavPill>
            </button>

            <AnimatePresence initial={false}>
              {isAiOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-0.5 ml-3 pl-3 border-l-2 border-gray-100 space-y-0.5 pb-0.5">
                    {aiSubItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-all text-sm ${
                          isActive(item.path)
                            ? 'bg-pink-600 text-white font-medium'
                            : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'
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
                        className="flex items-center px-3 py-1.5 text-[11px] text-pink-600 font-semibold hover:underline"
                      >
                        Upgrade to unlock →
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {mainItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={onClose}>
              <NavPill active={isActive(item.path)}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavPill>
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
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-600 hover:bg-pink-50 hover:text-pink-600 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </motion.button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
