import { Link } from 'react-router-dom';

// Login / Sign up switch at the top of the auth forms.
const AuthTabs = ({ active, isDark }) => {
  const tab = (to, label, on) => (
    <Link
      to={to}
      replace
      aria-current={on ? 'page' : undefined}
      className={`flex-1 rounded-xl py-2 text-center text-xs sm:text-sm font-bold transition-all duration-300 ${
        on
          ? 'bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white shadow-md shadow-[#E70C65]/30'
          : isDark
            ? 'text-slate-300 hover:text-white'
            : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className={`mb-6 flex gap-1 rounded-2xl p-1 ${isDark ? 'bg-white/[0.06] border border-white/10' : 'bg-slate-100 border border-slate-200'}`}>
      {tab('/login', 'Login', active === 'login')}
      {tab('/register', 'Sign up', active === 'register')}
    </div>
  );
};

export default AuthTabs;
