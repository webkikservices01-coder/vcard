import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import Logo from './ui/Logo';
import BackButton from './BackButton';
import { COMPANY } from './PublicFooter';

const links = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Metal NFC Card', to: '/metal-nfc-card' },
  { label: 'About', to: '/about-us' },
  { label: 'FAQs', to: '/faqs' },
];

// Header of the public pages: back button, main links, a one-tap phone number and Contact Us.
const PublicNav = () => {
  const { pathname } = useLocation();
  return (
    <header className="relative z-20">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="hidden sm:inline-flex" />
          <Logo size={32} />
        </div>
        <div className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition hover:text-crimson-700 ${pathname === l.to ? 'text-[#E70C65]' : ''}`}
              style={pathname === l.to ? undefined : { color: 'var(--surface-text-2)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={COMPANY.phoneHref}
            className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold transition hover:text-crimson-700"
            style={{ color: 'var(--surface-text)' }}
            aria-label={`Call ${COMPANY.phone}`}
          >
            <Phone className="h-4 w-4 text-[#E70C65]" /> {COMPANY.phone}
          </a>
          <Link to="/contact-us" className="btn-ghost text-sm px-3 sm:px-4">
            Contact Us
          </Link>
          <Link to="/register" className="btn-primary px-4 py-2.5 text-sm sm:px-6 sm:py-3.5">
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.nav>
    </header>
  );
};

export default PublicNav;
