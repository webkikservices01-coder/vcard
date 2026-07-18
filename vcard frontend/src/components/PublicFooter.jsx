import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, ArrowUpRight } from 'lucide-react';
import Logo from './ui/Logo';

export const COMPANY = {
  name: 'Webkik Services',
  gst: '07CXYPK0037Q2ZN',
  addressLines: ['WZ-52, 2nd Floor, Above Shubham Band,', 'Tagore Garden, Delhi – 110027'],
  phone: '+91-9868698698',
  phoneHref: 'tel:+919868698698',
  whatsapp: '919868698698',
  email: 'webkikservices01@gmail.com',
};

const quickLinks = [
  { name: 'About Us', href: '/about-us' },
  { name: 'Contact Us', href: '/contact-us' },
  { name: 'FAQs', href: '/faqs' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms & Conditions', href: '/terms-conditions' },
  { name: 'Refund Policy', href: '/refund-policy' },
  { name: 'Cancellation Policy', href: '/cancellation-policy' },
];

const contactRows = [
  { icon: Phone, label: 'Phone', value: COMPANY.phone, href: COMPANY.phoneHref },
  { icon: Mail, label: 'Email', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
];

const colVariants = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } }),
};

const PublicFooter = () => (
  <motion.footer
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.6 }}
    className="relative z-10 overflow-hidden border-t backdrop-blur-md"
    style={{ borderColor: 'var(--surface-border)', background: 'color-mix(in srgb, var(--surface-1) 40%, transparent)' }}
  >
    {/* Animated top hairline shimmer */}
    <motion.div
      className="absolute top-0 left-0 right-0 h-px shimmer-border"
      animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
    />
    {/* Ambient glow, purely decorative */}
    <motion.div
      className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full blur-3xl"
      style={{ background: 'radial-gradient(circle, var(--mesh-a), transparent 70%)' }}
      animate={{ opacity: [0.12, 0.22, 0.12] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    />

    <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4">
        {/* Brand */}
        <motion.div custom={0} variants={colVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className="space-y-3 text-center sm:text-left">
          <div className="flex justify-center sm:justify-start">
            <Logo />
          </div>
          <p className="mx-auto max-w-xs text-sm leading-relaxed sm:mx-0" style={{ color: 'var(--surface-text-2)' }}>
            The AI-powered digital business card platform — built and operated by {COMPANY.name}.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div custom={1} variants={colVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }} className="text-center sm:text-left">
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--surface-text)' }}>Quick Links</h4>
          <ul className="space-y-2.5">
            {quickLinks.map(l => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="group inline-flex items-center gap-1 text-sm transition-colors hover:text-crimson-700"
                  style={{ color: 'var(--surface-text-2)' }}
                >
                  <span className="fast-transition group-hover:translate-x-0.5">{l.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Company details */}
        <motion.div
          custom={2} variants={colVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}
          className="sm:col-span-2 lg:col-span-2 text-center sm:text-left"
        >
          <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--surface-text)' }}>Company Details</h4>
          <div className="space-y-3 text-sm" style={{ color: 'var(--surface-text-2)' }}>
            <p className="font-semibold" style={{ color: 'var(--surface-text)' }}>{COMPANY.name}</p>

            <div className="flex items-start justify-center gap-2.5 sm:justify-start">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-left">{COMPANY.addressLines[0]}<br />{COMPANY.addressLines[1]}</p>
            </div>

            {contactRows.map(row => (
              <div key={row.label} className="flex items-center justify-center gap-2.5 sm:justify-start">
                <row.icon className="h-4 w-4 shrink-0" />
                <a
                  href={row.href}
                  className="group inline-flex items-center gap-1 break-all hover:text-crimson-700 fast-transition"
                >
                  {row.value}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </a>
              </div>
            ))}

            <p className="pt-1 text-xs" style={{ color: 'var(--surface-text-2)', opacity: 0.8 }}>GSTIN: {COMPANY.gst}</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-8 flex flex-col items-center gap-2 border-t pt-6 text-center sm:mt-10 sm:flex-row sm:justify-between sm:gap-3 sm:pt-6 sm:text-left"
        style={{ borderColor: 'var(--surface-border)' }}
      >
        <p className="text-xs sm:text-sm" style={{ color: 'var(--surface-text-2)' }}>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        <p className="text-xs" style={{ color: 'var(--surface-text-2)', opacity: 0.7 }}>Webcard.ai is a digital card platform by {COMPANY.name}</p>
      </motion.div>
    </div>
  </motion.footer>
);

export default PublicFooter;
