import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import MeshBackground from '../components/ui/MeshBackground';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { fadeUp } from '../utils/motion';

const LINKS = [
  ['Features', '/features'],
  ['Pricing', '/pricing'],
  ['Metal NFC Card', '/metal-nfc-card'],
  ['Contact us', '/contact-us'],
];

// Branded 404 (wrong site URL, or a card link that doesn't exist). og.php sends the 404 status.
const NotFound = ({ message = 'The page you were looking for could not be found.' }) => (
  <div className="relative min-h-screen flex flex-col overflow-x-hidden font-['Inter']" style={{ background: 'var(--surface-bg)' }}>
    <MeshBackground fixed className="opacity-50" />
    <PublicNav />

    <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
      <GlassCard premium {...fadeUp(0)} className="w-full max-w-md text-center px-8 py-12 sm:px-10">
        <motion.h1
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="text-7xl sm:text-8xl font-black mb-4 bg-gradient-to-br from-brand-600 to-rose-600 bg-clip-text text-transparent"
        >
          404
        </motion.h1>
        <p className="text-base mb-8" style={{ color: 'var(--surface-text-2)' }}>
          {message}
        </p>
        <Link
          to="/"
          className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl fast-transition text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back Home</span>
        </Link>
        <nav aria-label="Popular pages" className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          {LINKS.map(([label, to]) => (
            <Link key={to} to={to} className="font-semibold text-[#E70C65] hover:underline">{label}</Link>
          ))}
        </nav>
      </GlassCard>
    </main>

    <PublicFooter />
  </div>
);

export default NotFound;
