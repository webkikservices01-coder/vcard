import { motion } from 'framer-motion';

// Scroll-reveal wrapper: fades + rises into view once, the first time it enters the viewport.
const FadeIn = ({ children, delay = 0, y = 24, className = '', ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

export default FadeIn;
