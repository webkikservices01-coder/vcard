import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Webcard.ai wordmark: animated gradient card-glyph + "Webcard" + gradient ".ai".
const Logo = ({ size = 36, to = '/', className = '', light = false, showWordmark = true }) => (
  <Link to={to} className={`flex items-center gap-2.5 ${className}`}>
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className="shrink-0"
      whileHover={{ rotate: -6, scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
    >
      <rect width="48" height="48" rx="14" fill="url(#logo-grad)" />
      <rect width="48" height="48" rx="14" fill="url(#logo-shine)" fillOpacity="0.3" />
      <path
        d="M16 14h12c4.4 0 8 3.6 8 8s-3.6 8-8 8h-4l6 4H16V14z"
        fill="white"
        fillOpacity="0.95"
      />
      <circle cx="30" cy="22" r="2.5" fill="#9F1C44" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#9F1C44" />
          <stop offset="1" stopColor="#E70C65" />
        </linearGradient>
        <linearGradient id="logo-shine" x1="0" y1="0" x2="24" y2="24">
          <stop stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
    </motion.svg>
    {showWordmark && (
      <span className={`text-lg font-bold tracking-tight ${light ? 'text-white' : ''}`} style={light ? undefined : { color: 'var(--surface-text)' }}>
        Webcard<span className="text-gradient-crimson">.ai</span>
      </span>
    )}
  </Link>
);

export default Logo;
