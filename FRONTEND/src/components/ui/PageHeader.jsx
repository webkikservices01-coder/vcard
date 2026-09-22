import { motion } from 'framer-motion';

// Standard "page enter" motion signature used at the top of every dashboard page.
const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
  >
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--surface-text)' }}>{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm" style={{ color: 'var(--surface-text-2)' }}>{subtitle}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </motion.div>
);

export default PageHeader;
