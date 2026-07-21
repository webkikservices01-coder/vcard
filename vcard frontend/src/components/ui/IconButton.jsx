import { motion } from 'framer-motion';

// Consistent, thumb-friendly hit areas for every icon-only action in the app (nav, close,
// copy, delete, back-arrow, ...) — replaces one-off p-1/p-1.5/p-2 buttons scattered per file.
const SIZE_CLASSES = {
  sm: 'w-9 h-9 [&_svg]:w-4 [&_svg]:h-4',
  md: 'w-10 h-10 [&_svg]:w-[18px] [&_svg]:h-[18px]',
  lg: 'w-11 h-11 [&_svg]:w-5 [&_svg]:h-5',
};

const VARIANTS = {
  ghost: {
    className: 'hover:bg-[color:var(--glass-bg)]',
    style: { color: 'var(--surface-text-2)' },
  },
  solid: {
    className: 'hover:border-crimson-400',
    style: { background: 'var(--glass-bg)', border: '1px solid var(--surface-border)', color: 'var(--surface-text-2)' },
  },
  danger: {
    className: 'hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600',
    style: { color: 'var(--surface-text-2)' },
  },
  // No baked-in colors — for icon buttons living on a per-card theme (PublicVcard.jsx) or a
  // dark overlay, where the caller supplies its own bg/color via style or className.
  bare: { className: '', style: {} },
};

/**
 * size: 'sm' (36px) | 'md' (40px, default) | 'lg' (44px)
 * variant: 'ghost' | 'solid' | 'danger' | 'bare'
 */
const IconButton = ({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  style,
  children,
  title,
  ...props
}) => {
  const { className: variantClassName, style: variantStyle } = VARIANTS[variant] || VARIANTS.ghost;

  return (
    <motion.button
      type="button"
      title={title}
      aria-label={title}
      whileHover={disabled ? undefined : { scale: 1.08 }}
      whileTap={disabled ? undefined : { scale: 0.92 }}
      disabled={disabled}
      style={{ ...variantStyle, ...style }}
      className={`inline-flex items-center justify-center rounded-lg shrink-0 fast-transition
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${SIZE_CLASSES[size]} ${variantClassName} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default IconButton;
