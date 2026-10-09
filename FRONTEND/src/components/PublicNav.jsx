import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Menu, Phone, X } from 'lucide-react';
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

const iconBtn = {
  borderColor: 'var(--surface-border, rgba(0,0,0,.12))',
  color: 'var(--surface-text)',
  background: 'color-mix(in srgb, var(--surface-1, #fff) 70%, transparent)',
};

// Header of the public pages. Desktop: back button, main links, phone, Contact Us and Sign in.
// Phones: back arrow, logo, Get started and a menu with every link.
const PublicNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Close the menu on navigation.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOpen(false), [pathname]);

  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/'));

  return (
    <header className="relative z-30">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-5"
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <BackButton />
          </div>
          <button type="button" onClick={goBack} aria-label="Go back" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border sm:hidden" style={iconBtn}>
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Logo size={30} />
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={COMPANY.phoneHref}
            className="hidden xl:inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold transition hover:text-crimson-700"
            style={{ color: 'var(--surface-text)' }}
            aria-label={`Call ${COMPANY.phone}`}
          >
            <Phone className="h-4 w-4 text-[#E70C65]" /> {COMPANY.phone}
          </a>
          <Link to="/contact-us" className="btn-ghost hidden whitespace-nowrap text-sm px-4 lg:inline-flex">
            Contact Us
          </Link>
          <Link
            to="/login"
            className="hidden whitespace-nowrap text-sm font-semibold transition hover:text-crimson-700 sm:inline"
            style={{ color: 'var(--surface-text)' }}
          >
            Sign in
          </Link>
          <Link to="/register" className="btn-primary whitespace-nowrap px-3.5 py-2.5 text-sm sm:px-6 sm:py-3.5">
            Get started <ArrowRight className="hidden h-4 w-4 sm:block" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border lg:hidden"
            style={iconBtn}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      {/* Menu for phones and tablets */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            data-site-menu
            className="absolute inset-x-3 top-full z-30 rounded-2xl border p-2 shadow-2xl lg:hidden"
            style={{ borderColor: 'var(--surface-border)', background: 'var(--surface-bg, #fff)' }}
          >
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold"
                style={{ color: pathname === l.to ? '#E70C65' : 'var(--surface-text)' }}
              >
                {l.label} <ArrowRight className="h-4 w-4 opacity-40" />
              </Link>
            ))}
            <div className="mt-1 grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: 'var(--surface-border)' }}>
              <Link to="/contact-us" className="btn-ghost justify-center py-3 text-sm">
                Contact Us
              </Link>
              <a href={COMPANY.phoneHref} className="btn-ghost justify-center gap-1.5 py-3 text-sm">
                <Phone className="h-4 w-4 text-[#E70C65]" /> Call us
              </a>
              <Link to="/login" className="btn-ghost col-span-2 justify-center py-3 text-sm">
                Sign in
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PublicNav;
