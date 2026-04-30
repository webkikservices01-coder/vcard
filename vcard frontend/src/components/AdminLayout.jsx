import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LifeBuoy, LogOut, Menu, X, Globe } from 'lucide-react';

const navItems = [
  { path: '/admin',              label: 'Overview',      icon: LayoutDashboard },
  { path: '/admin/users',        label: 'Users',         icon: Users },
  { path: '/admin/transactions', label: 'Transactions',  icon: CreditCard },
  { path: '/admin/support',      label: 'Support',       icon: LifeBuoy },
  { path: '/admin/cards',        label: 'Top Cards',     icon: Globe },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => { localStorage.removeItem('token'); navigate('/'); };
  const isActive = (p) => p === '/admin' ? location.pathname === p : location.pathname.startsWith(p);

  return (
    <div className="flex h-screen bg-gray-950 font-['Inter'] text-white">
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 bg-black border-r border-gray-800 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
          <div>
            <p className="text-sm font-black tracking-tight">MYcardLINK</p>
            <p className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Admin Panel</p>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} onClick={() => setOpen(false)}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(path) ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-900 hover:text-white'}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-800">
          <Link to="/dashboard" className="flex items-center space-x-3 px-3 py-2 text-xs text-gray-500 hover:text-white transition rounded-lg hover:bg-gray-900">
            ← User Dashboard
          </Link>
          <button onClick={logout} className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:bg-gray-900 hover:text-white text-sm font-medium transition">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-black border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
          <button onClick={() => setOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-gray-300">
            {navItems.find(n => isActive(n.path))?.label || 'Admin'}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gray-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
