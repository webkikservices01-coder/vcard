import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import MeshBackground from '../../components/ui/MeshBackground';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { COMPANY } from '../../components/PublicFooter';
import axios from 'axios';
import { toE164 } from '../../utils/phone';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

const API = import.meta.env.VITE_API_URL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactUs = () => {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Please enter a valid email address.';
    if (form.phone.trim() && !toE164(form.phone)) next.phone = 'Please enter a valid phone number, e.g. 98123 45678.';
    if (form.message.trim().length < 5) next.message = 'Please write a short message.';
    return next;
  };

  // Saved as a lead (admin panel → Leads, source "contact") and emailed to the team. If that
  // fails, the visitor's own email app opens with the message filled in.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    setSending(true);
    try {
      await axios.post(`${API}/api/ai/platform-lead`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: toE164(form.phone) || '',
        need: form.subject.trim() || 'Contact form',
        message: form.message.trim(),
        source: 'contact',
      });
    } catch {
      const body = `Name: ${form.name}
Email: ${form.email}
Phone: ${form.phone}

${form.message}`;
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(form.subject || 'Contact from Aicardly')}&body=${encodeURIComponent(body)}`;
    } finally {
      setSending(false);
    }
    setSent(true);
    setForm(EMPTY);
  };

  const err = (k) => errors[k] && <p id={`contact-${k}-error`} className="mt-1 text-xs text-red-500">{errors[k]}</p>;
  const aria = (k) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `contact-${k}-error` : undefined });

  const waLink = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Hi! I have a question about Aicardly.')}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(COMPANY.addressLines.join(' '))}&output=embed`;

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: 'var(--surface-bg)' }}>
      <MeshBackground fixed className="opacity-60" />
      <PublicNav />

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-8 pb-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="badge-glass text-crimson-700">
            <span className="h-1.5 w-1.5 rounded-full bg-magenta-500" />
            Contact
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance" style={{ color: 'var(--surface-text)' }}>
            Let's talk
          </h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--surface-text-2)' }}>
            Questions about plans, billing, or the AI features? We usually reply within a business day.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-3">
            <GlassCard premium className="p-6 sm:p-8">
              {sent ? (
                <div className="py-12 text-center">
                  <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500" />
                  <p role="status" className="mt-3 font-semibold" style={{ color: 'var(--surface-text)' }}>Thanks! Your message has been sent.</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--surface-text-2)' }}>
                    We usually reply within a business day. For anything urgent, call or WhatsApp {COMPANY.phone}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Full name *</label>
                      <input id="contact-name" required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} placeholder="Your name" className="input-premium" {...aria('name')} />
                      {err('name')}
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Email address *</label>
                      <input id="contact-email" required type="email" maxLength={120} autoComplete="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className="input-premium" {...aria('email')} />
                      {err('email')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Phone number</label>
                      <input id="contact-phone" type="tel" inputMode="tel" maxLength={16} autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="input-premium" {...aria('phone')} />
                      {err('phone')}
                    </div>
                    <div>
                      <label htmlFor="contact-subject" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Subject</label>
                      <input id="contact-subject" maxLength={150} value={form.subject} onChange={set('subject')} placeholder="What's this about?" className="input-premium" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Message *</label>
                    <textarea id="contact-message" required rows={5} maxLength={1000} value={form.message} onChange={set('message')} placeholder="Tell us how we can help..." className="input-premium resize-none" {...aria('message')} />
                    {err('message')}
                  </div>
                  <Button type="submit" variant="primary" loading={sending} rightIcon={<Send className="h-4 w-4" />}>
                    Send Message
                  </Button>
                </form>
              )}
            </GlassCard>
          </motion.div>

          {/* Contact Details */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="lg:col-span-2 space-y-4">
            <GlassCard className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                  <Phone className="h-4 w-4 text-crimson-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Support Number</p>
                  <a href={COMPANY.phoneHref} className="text-sm font-semibold hover:text-crimson-700 transition" style={{ color: 'var(--surface-text)' }}>{COMPANY.phone}</a>
                </div>
              </div>

              <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                  <MessageCircle className="h-4 w-4 text-crimson-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>WhatsApp</p>
                  <span className="text-sm font-semibold group-hover:text-crimson-700 transition" style={{ color: 'var(--surface-text)' }}>{COMPANY.phone}</span>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                  <Mail className="h-4 w-4 text-crimson-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Email Address</p>
                  <a href={`mailto:${COMPANY.email}`} className="text-sm font-semibold hover:text-crimson-700 transition" style={{ color: 'var(--surface-text)' }}>{COMPANY.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                  <MapPin className="h-4 w-4 text-crimson-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Office Address</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--surface-text)' }}>
                    {COMPANY.addressLines[0]}<br />{COMPANY.addressLines[1]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--background-image-gradient-crimson-soft)' }}>
                  <Clock className="h-4 w-4 text-crimson-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--surface-text-2)' }}>Business Hours</p>
                  <p className="text-sm" style={{ color: 'var(--surface-text)' }}>Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden p-0">
              <iframe
                title="Office location"
                src={mapSrc}
                width="100%"
                height="220"
                style={{ border: 0, filter: 'grayscale(0.15)' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default ContactUs;
