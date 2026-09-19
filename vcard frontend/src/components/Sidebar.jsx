import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, UserCircle, LifeBuoy, CreditCard, Receipt, LogOut,
  ChevronDown, Bot, X
} from 'lucide-react';
import { hasChatFill } from '../utils/plan';
import Logo from './ui/Logo';
import IconButton from './ui/IconButton';

const aiSubItems = [
  { name: 'AI Persona Setup', icon: Bot, path: '/dashboard/vcard/ai-persona' },
];

const mainItems = [
  { name: 'Plans',        icon: CreditCard, path: '/dashboard/plans' },
  { name: 'Transactions', icon: Receipt,    path: '/dashboard/transactions' },
  { name: 'Support',      icon: LifeBuoy,   path: '/dashboard/support' },
];

const NavPill = ({ active, children, delay = 0, ...props }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.90, x: -20 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ 
      duration: 0.7, 
      ease: [0.16, 1, 0.3, 1], 
      delay: delay 
    }}
    className="relative my-1"
  >
    {active && (
      <motion.div
        layoutId="sidebar-active-pill"
        className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl shadow-glow-crimson"
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      />
    )}
    <motion.div
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative z-10 flex items-center space-x-3.5 px-3.5 py-3 rounded-xl text-sm font-medium cursor-pointer transition-colors ${
        active ? 'text-white font-semibold shadow-sm' : 'hover:bg-brand-500/10'
      }`}
      style={!active ? { color: 'var(--surface-text-2)' } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  </motion.div>
);

const Sidebar = ({ isOpen, onClose, userPlan }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(location.pathname.includes('/dashboard/vcard/ai'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
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
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`
          fixed lg:sticky top-0 inset-y-0 left-0 z-40 w-68 glass rounded-none lg:rounded-r-2xl
          flex flex-col h-screen shrink-0 overflow-y-auto border-r
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
        style={{ borderColor: 'var(--surface-border)' }}
      >
        {/* Logo Header */}
        <div className="h-20 flex items-center justify-between px-6 shrink-0" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <Logo size={32} to="/dashboard" />
          <IconButton onClick={onClose} title="Close menu" size="sm" className="lg:hidden hover:text-brand-500">
            <X className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Navigation Section with Clean Spacing */}
        <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
          <Link to="/dashboard" onClick={onClose} className="block">
            <NavPill active={isActive('/dashboard')} delay={0.05}>
              <Home className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavPill>
          </Link>

          <Link to="/dashboard/vcard/profile" onClick={onClose} className="block">
            <NavPill active={isVcardActive} delay={0.1}>
              <UserCircle className="w-4 h-4 shrink-0" />
              <span>My vCard</span>
            </NavPill>
          </Link>

          {/* AI Features dropdown */}
          <div className="pt-1">
            <button onClick={() => setIsAiOpen(!isAiOpen)} className="w-full text-left">
              <NavPill active={isAiActive} delay={0.15}>
                <Bot className="w-4 h-4 shrink-0" />
                <span className="flex-1">AI Features</span>
                {!hasAi && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider" style={{ background: 'var(--surface-2)', color: 'var(--surface-text-2)' }}>PRO</span>
                )}
                {hasAi && (
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-500 font-bold px-1.5 py-0.5 rounded">ON</span>
                )}
                <motion.span animate={{ rotate: isAiOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </motion.span>
              </NavPill>
            </button>

            <AnimatePresence initial={false}>
              {isAiOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 ml-4 pl-3 space-y-1.5 py-1" style={{ borderLeft: '2px solid var(--surface-border)' }}>
                    {aiSubItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className="block"
                      >
                        <motion.div
                          whileHover={{ scale: 1.01, x: 3 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            isActive(item.path)
                              ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white font-medium shadow-sm'
                              : 'hover:bg-brand-500/10 hover:text-brand-500'
                          }`}
                          style={!isActive(item.path) ? { color: 'var(--surface-text-2)' } : undefined}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.name}</span>
                          {!hasAi && <span className="ml-auto text-[10px] opacity-60">🔒</span>}
                        </motion.div>
                      </Link>
                    ))}
                    {!hasAi && (
                      <Link
                        to="/dashboard/plans"
                        onClick={onClose}
                        className="flex items-center px-3 py-2 text-xs text-brand-500 font-semibold hover:underline"
                      >
                        Upgrade to unlock →
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-2 pb-1">
            <div className="h-[1px] w-full" style={{ background: 'var(--surface-border)' }} />
          </div>

          {mainItems.map((item, idx) => (
            <Link key={item.path} to={item.path} onClick={onClose} className="block">
              <NavPill active={isActive(item.path)} delay={0.2 + (idx * 0.05)}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavPill>
            </Link>
          ))}
        </nav>

        {/* Footer: Current Plan & Logout */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="p-4 shrink-0 space-y-3 mt-auto" 
          style={{ borderTop: '1px solid var(--surface-border)' }}
        >
          {userPlan && (
            <div className="px-4 py-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70" style={{ color: 'var(--surface-text-2)' }}>Current Plan</p>
                <p className="text-xs font-black tracking-wide mt-0.5 truncate" style={{ color: 'var(--surface-text)' }}>{userPlan}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleLogout}
            className="flex items-center space-x-3.5 px-3.5 py-3 w-full rounded-xl hover:bg-brand-500/10 hover:text-brand-500 text-sm font-medium cursor-pointer transition-colors"
            style={{ color: 'var(--surface-text-2)' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Sidebar;