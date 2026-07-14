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
        className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg"
        transition={{ type: 'spring', stiffness: 500, damping: 38 }}
      />
    )}
    <div
      className={`relative z-10 flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium fast-transition ${
        active ? 'text-white' : 'hover:bg-brand-500/10'
      }`}
      style={!active ? { color: 'var(--surface-text-2)' } : undefined}
      {...props}
    >
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 glass rounded-none lg:rounded-r-2xl
          flex flex-col h-full overflow-y-auto transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight leading-tight" style={{ color: 'var(--surface-text)' }}>MYcardLINK</h1>
            <p className="text-[9px] font-medium tracking-widest uppercase" style={{ color: 'var(--surface-text-2)' }}>CARD · QR · DIGITAL</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:text-brand-500 fast-transition" style={{ color: 'var(--surface-text-2)' }}>
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
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}>PRO</span>
                )}
                {hasAi && (
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-500 font-bold px-1.5 py-0.5 rounded">ON</span>
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
                  <div className="mt-0.5 ml-3 pl-3 space-y-0.5 pb-0.5" style={{ borderLeft: '2px solid var(--surface-border)' }}>
                    {aiSubItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md fast-transition text-sm ${
                          isActive(item.path)
                            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium'
                            : 'hover:bg-brand-500/10 hover:text-brand-500'
                        }`}
                        style={!isActive(item.path) ? { color: 'var(--surface-text-2)' } : undefined}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.name}</span>
                        {!hasAi && <span className="ml-auto text-[9px]">🔒</span>}
                      </Link>
                    ))}
                    {!hasAi && (
                      <Link
                        to="/dashboard/plans"
                        onClick={onClose}
                        className="flex items-center px-3 py-1.5 text-[11px] text-brand-500 font-semibold hover:underline"
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
        <div className="p-3 shrink-0 space-y-1" style={{ borderTop: '1px solid var(--surface-border)' }}>
          {userPlan && (
            <div className="px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
              <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--surface-text-2)' }}>Current Plan</p>
              <p className="text-xs font-black truncate" style={{ color: 'var(--surface-text)' }}>{userPlan}</p>
            </div>
          )}
          <motion.button
            whileHover={{ x: 2 }}
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition text-sm font-medium"
            style={{ color: 'var(--surface-text-2)' }}
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
