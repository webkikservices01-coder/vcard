import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Logo from './ui/Logo';

const links = [
  { label: 'About', to: '/about-us' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Contact', to: '/contact-us' },
];

const PublicNav = () => (
  <header className="relative z-20">
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
    >
      <Logo size={32} />
      <div className="hidden items-center gap-8 md:flex">
        {links.map(l => (
          <Link key={l.to} to={l.to} className="text-sm font-medium hover:text-crimson-700 transition" style={{ color: 'var(--surface-text-2)' }}>
            {l.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Link to="/login" className="btn-ghost hidden text-sm sm:inline-flex">Sign in</Link>
        <Link to="/register" className="btn-primary px-4 py-2.5 text-sm sm:px-6 sm:py-3.5">
          Get started <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.nav>
  </header>
);

export default PublicNav;
