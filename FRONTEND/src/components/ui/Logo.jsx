import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LogoMark from './LogoMark';

// Aicardly wordmark: the "A" mark + pink "Ai" + "cardly".
const Logo = ({ size = 36, to = '/', className = '', light = false, showWordmark = true }) => (
  <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
    <motion.span
      className="inline-flex shrink-0"
      whileHover={{ rotate: -6, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <LogoMark size={size} />
    </motion.span>
    {showWordmark && (
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : ''}`} style={light ? undefined : { color: 'var(--surface-text)' }}>
        <span style={{ color: '#ED2460' }}>Ai</span>cardly
      </span>
    )}
  </Link>
);

export default Logo;
