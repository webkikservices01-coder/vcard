import { motion } from 'framer-motion';

// hover=true gives the card a premium 3D lift (scale + tilt + accent glow ring) on hover.
// premium=true swaps the lighter `.glass` surface for the heavier, more rounded `.glass-card`
// treatment (deeper shadow, larger radius) used for stat tiles and feature panels.
const GlassCard = ({ children, hover = false, premium = false, className = '', as: Component = motion.div, ...props }) => (
  <Component
    className={`${premium ? 'glass-card' : 'glass rounded-2xl'} ${hover ? 'hover-lift cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default GlassCard;
