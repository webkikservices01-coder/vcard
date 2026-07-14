import { motion } from 'framer-motion';

// hover=true gives the card a premium 3D lift (scale + tilt + accent glow ring) on hover.
const GlassCard = ({ children, hover = false, className = '', as: Component = motion.div, ...props }) => (
  <Component
    className={`glass rounded-2xl ${hover ? 'hover-lift cursor-pointer' : ''} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default GlassCard;
