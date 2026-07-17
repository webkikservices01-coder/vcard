import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, CreditCard, LifeBuoy, LogOut, Menu, X, Globe } from 'lucide-react';
import ThemeToggle from './ui/ThemeToggle';
import Logo from './ui/Logo';

const navItems = [
  { path: '/admin',              label: 'Overview',      icon: LayoutDashboard },
  { path: '/admin/users',        label: 'Users',         icon: Users },
  { path: '/admin/transactions', label: 'Transactions',  icon: CreditCard },
  { path: '/admin/support',      label: 'Support',       icon: LifeBuoy },
  { path: '/admin/cards',        label: 'Top Cards',     icon: Globe },
];

const NavPill = ({ active, children, ...props }) => (
  <div className="relative">
    {active && (
      <motion.div
        layoutId="admin-active-pill"
        className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg shadow-glow-crimson"
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

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };
  const isActive = (p) => p === '/admin' ? location.pathname === p : location.pathname.startsWith(p);
  const pageTitle = navItems.find(n => isActive(n.path))?.label || 'Admin';

  return (
    <div className="flex h-screen font-['Inter']" style={{ background: 'var(--surface-bg)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-56 glass rounded-none lg:rounded-r-2xl
          flex flex-col h-full overflow-y-auto transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <div>
            <Logo size={26} to="/admin" showWordmark={true} />
            <p className="text-[9px] font-bold tracking-widest uppercase mt-0.5 ml-0.5" style={{ color: 'var(--surface-text-2)' }}>Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden p-1 hover:text-brand-500 fast-transition" style={{ color: 'var(--surface-text-2)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}>
              <NavPill active={isActive(path)}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </NavPill>
            </Link>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <Link
            to="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 text-xs rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition"
            style={{ color: 'var(--surface-text-2)' }}
          >
            ← User Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg hover:bg-brand-500/10 hover:text-brand-500 fast-transition text-sm font-medium"
            style={{ color: 'var(--surface-text-2)' }}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 glass rounded-none flex items-center justify-between px-4 md:px-6 shrink-0 z-20 border-x-0 border-t-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 hover:text-brand-500 hover:bg-brand-500/10 rounded-lg fast-transition"
              style={{ color: 'var(--surface-text-2)' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={pageTitle}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className="text-base font-semibold"
                style={{ color: 'var(--surface-text)' }}
              >
                {pageTitle}
              </motion.span>
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs" style={{ color: 'var(--surface-text-2)' }}>Admin</span>
            </div>
            <ThemeToggle />
          </div>
        </header>

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
    </div>
  );
};

export default AdminLayout;
