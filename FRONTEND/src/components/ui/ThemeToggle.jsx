import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`group relative w-14 h-8 rounded-full border transition-all duration-500 flex items-center px-1 cursor-pointer backdrop-blur-xl ${
        isDark
          ? 'border-white/15 bg-[#0c101a]/90 shadow-lg shadow-black/40 hover:border-[#E70C65]/60 hover:shadow-[0_0_15px_rgba(231,12,101,0.3)]'
          : 'border-slate-300 bg-white/90 shadow-md shadow-slate-200 hover:border-[#E70C65]/60 hover:shadow-[0_0_15px_rgba(231,12,101,0.2)]'
      } ${className}`}
    >
      <motion.div
        animate={{ 
          x: isDark ? 24 : 0,
          rotate: isDark ? 360 : 0
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-[#E70C65]/40'
            : 'bg-gradient-to-br from-[#ff6b9d] to-[#E70C65] text-white shadow-[#ff6b9d]/50'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        )}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;