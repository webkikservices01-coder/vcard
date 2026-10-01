import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, IdCard, Layers, ShieldCheck, ScrollText, LifeBuoy, Activity, UserCog, LogOut, Menu, X, Inbox, Search, Sun, Moon, ExternalLink } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useTheme } from '../lib/theme';
import { initials } from '../lib/format';

const NAV = [
  { title: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard.view', end: true }] },
  {
    title: 'Customers',
    items: [
      { to: '/users', label: 'Users', icon: Users, perm: 'users.view' },
      { to: '/cards', label: 'Cards', icon: IdCard, perm: 'cards.view' },
      { to: '/leads', label: 'Leads', icon: Inbox, perm: 'leads.view' },
      { to: '/support', label: 'Support', icon: LifeBuoy, perm: 'support.view' },
    ],
  },
  {
    title: 'Money',
    items: [
      { to: '/payments', label: 'Payments', icon: CreditCard, perm: 'payments.view' },
      { to: '/plans', label: 'Plans', icon: Layers, perm: 'plans.view' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/logs', label: 'App logs & AI', icon: Activity, perm: 'logs.view' },
      { to: '/audit', label: 'Audit log', icon: ScrollText, perm: 'audit.view' },
      { to: '/admins', label: 'Admins', icon: ShieldCheck, perm: 'admins.manage' },
    ],
  },
];

const ROLE_LABEL = { super_admin: 'Super admin', admin: 'Admin', support: 'Support' };

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-gradient text-sm font-black text-white shadow-brand">A</span>
      <div className="leading-tight">
        <p className="text-[15px] font-bold text-slate-950">
          <span className="text-brand-gradient">Ai</span>cardly
        </p>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-500">Admin console</p>
      </div>
    </div>
  );
}

function Nav({ onNavigate }) {
  const { can } = useAuth();
  return (
    <nav className="scroll-thin flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin">
      {NAV.map((group) => {
        const items = group.items.filter((n) => can(n.perm));
        if (!items.length) return null;
        return (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group.title}</p>
            <div className="space-y-0.5">
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive ? 'bg-brand-gradient text-white shadow-brand' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function ThemeButton() {
  const [theme, toggle] = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-surface text-slate-600 transition-colors hover:text-slate-950"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

// Jump to a user from anywhere: name, email or phone.
function QuickSearch() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [q, setQ] = useState('');
  if (!can('users.view')) return <div className="flex-1" />;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate(`/users?q=${encodeURIComponent(q.trim())}`);
      }}
      className="relative flex-1 sm:max-w-md"
      role="search"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Find a user by name, email or phone…"
        aria-label="Find a user"
        className="h-10 w-full rounded-xl border border-slate-200 bg-surface-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </form>
  );
}

export default function Layout() {
  const { admin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>
      <Nav onNavigate={() => setOpen(false)} />
      <div className="border-t border-slate-200 p-3">
        <a href="https://aicardly.com" target="_blank" rel="noreferrer noopener" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open aicardly.com
        </a>
        <NavLink to="/account" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-100">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-gradient text-xs font-bold text-white">{initials(admin?.name)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-slate-950">{admin?.name}</span>
            <span className="block truncate text-xs text-slate-500">{ROLE_LABEL[admin?.role] || admin?.role}</span>
          </span>
          <UserCog className="h-4 w-4 text-slate-400" aria-hidden="true" />
        </NavLink>
        <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700">
          <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-surface/80 backdrop-blur-xl lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-slate-200 bg-surface shadow-2xl">
            <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-canvas/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button type="button" onClick={() => setOpen(true)} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <QuickSearch key={location.pathname} />
          <div className="ml-auto flex items-center gap-2">
            <ThemeButton />
            <NavLink to="/account" className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-surface py-1 pl-1 pr-3 sm:flex" title="My account">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient text-[11px] font-bold text-white">{initials(admin?.name)}</span>
              <span className="text-xs font-semibold text-slate-800">{admin?.name?.split(' ')[0]}</span>
            </NavLink>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
