import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import MeshBackground from '../components/ui/MeshBackground';
import { fadeUp } from '../utils/motion';

const NotFound = () => (
  <div className="relative min-h-screen flex flex-col items-center justify-center p-4 font-['Inter'] overflow-hidden" style={{ background: 'var(--surface-bg)' }}>
    <MeshBackground className="opacity-50" />

    <GlassCard premium {...fadeUp(0)} className="relative z-10 w-full max-w-md text-center px-8 py-12 sm:px-10">
      <motion.h1
        initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="text-7xl sm:text-8xl font-black mb-4 bg-gradient-to-br from-brand-600 to-rose-600 bg-clip-text text-transparent"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.16 }}
        className="text-base mb-8"
        style={{ color: 'var(--surface-text-2)' }}
      >
        The page you were looking for could not be found.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
      >
        <Link
          to="/"
          className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl fast-transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back Home</span>
        </Link>
      </motion.div>
    </GlassCard>
  </div>
);

export default NotFound;
