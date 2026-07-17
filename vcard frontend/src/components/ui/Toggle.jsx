import { motion } from 'framer-motion';

// Generic boolean pill-switch: spring-animated knob, gradient-crimson track when on.
const Toggle = ({ checked, onChange, disabled = false, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className={`relative w-11 h-6 rounded-full shrink-0 fast-transition disabled:opacity-50 disabled:cursor-not-allowed ${
      checked ? 'bg-gradient-crimson' : ''
    } ${className}`}
    style={checked ? undefined : { background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}
  >
    <motion.span
      layout
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md"
      style={{ x: checked ? 20 : 0 }}
    />
  </button>
);

export default Toggle;
