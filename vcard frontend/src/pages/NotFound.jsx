import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="relative min-h-screen flex flex-col items-center justify-center bg-white p-4 font-['Inter'] overflow-hidden">
    <motion.div
      className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.14), transparent 70%)' }}
      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.h1
      initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative text-8xl font-black text-black mb-4"
    >
      404
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
      className="relative text-lg text-gray-600 mb-8 text-center"
    >
      The page you were looking for could not be found.
    </motion.p>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
      <Link to="/">
        <motion.span
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="relative inline-flex items-center space-x-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back Home</span>
        </motion.span>
      </Link>
    </motion.div>
  </div>
);

export default NotFound;
