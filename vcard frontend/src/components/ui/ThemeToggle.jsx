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
      className={`w-14 h-8 rounded-full glass flex items-center px-1 cursor-pointer ${className}`}
    >
      <motion.div
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md"
      >
        {isDark ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-white" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
