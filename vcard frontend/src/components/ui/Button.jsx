import { motion } from 'framer-motion';
import GradientButton from './GradientButton';

// Shared spinner used by every button variant so a "loading" state always looks the same
// across the app, whether it's rendered inside GradientButton or a plain motion.button.
export const Spinner = ({ className = '' }) => (
  <motion.span
    className={`w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent shrink-0 ${className}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
  />
);

const SIZE_CLASSES = {
  sm: 'min-h-[36px] py-1.5 px-3.5 text-xs rounded-lg gap-1.5',
  md: 'min-h-[44px] py-2.5 px-5 text-sm rounded-xl gap-2',
  lg: 'min-h-[48px] py-3 px-6 text-sm rounded-xl gap-2',
};

// variant -> { className, style } for the non-primary variants (primary delegates to GradientButton)
const VARIANTS = {
  secondary: {
    className:
      'text-crimson-700 dark:text-crimson-300 hover:border-crimson-500 hover:text-crimson-600 fast-transition',
    style: { border: '1.5px solid var(--surface-border)', background: 'var(--glass-bg)' },
  },
  ghost: {
    className:
      'hover:bg-[color:var(--glass-bg)] fast-transition',
    style: { color: 'var(--surface-text-2)' },
  },
  danger: {
    className:
      'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 fast-transition',
    style: { border: '1.5px solid rgb(239 68 68 / 0.3)' },
  },
  // No baked-in colors — for content whose background/text is driven by a per-card theme
  // (e.g. PublicVcard.jsx). Callers pass their own `style`; Button only adds sizing/motion/loading.
  themed: {
    className: 'fast-transition',
    style: {},
  },
};

/**
 * variant: 'primary' (full-width brand gradient, delegates to GradientButton) |
 *          'secondary' | 'ghost' | 'danger' | 'themed'
 * size: 'sm' | 'md' | 'lg'
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  children,
  className = '',
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    // GradientButton owns its own sizing (py-3/rounded-xl/w-full) — don't fight it with
    // conflicting utility classes here, just pass through extra, non-conflicting className.
    return (
      <GradientButton
        disabled={isDisabled}
        className={className}
        style={style}
        {...props}
      >
        {loading ? <Spinner /> : leftIcon}
        <span>{children}</span>
        {!loading && rightIcon}
      </GradientButton>
    );
  }

  const { className: variantClassName, style: variantStyle } = VARIANTS[variant] || VARIANTS.ghost;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      disabled={isDisabled}
      style={{ ...variantStyle, ...style }}
      className={`inline-flex items-center justify-center font-bold
        disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0
        ${SIZE_CLASSES[size]} ${variantClassName} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </motion.button>
  );
};

export default Button;
