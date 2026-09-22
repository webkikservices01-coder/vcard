import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import MeshBackground from '../../components/ui/MeshBackground';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import { COMPANY } from '../../components/PublicFooter';

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' };

const ContactUs = () => {
  const [form, setForm] = useState(EMPTY);
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // No dedicated public "contact us" backend endpoint exists yet — send via the
    // visitor's own email client, pre-filled, so the message reaches us reliably.
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`;
    const mailto = `mailto:${COMPANY.email}?subject=${encodeURIComponent(form.subject || 'Contact from Webcard.ai')}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  const waLink = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent('Hi! I have a question about Webcard.ai.')}`;
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
                  <p className="mt-3 font-semibold" style={{ color: 'var(--surface-text)' }}>Opening your email app…</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--surface-text-2)' }}>
                    If nothing opened, email us directly at <a href={`mailto:${COMPANY.email}`} className="text-crimson-700 hover:underline">{COMPANY.email}</a>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Full Name</label>
                      <input required value={form.name} onChange={set('name')} placeholder="Your name" className="input-premium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Email Address</label>
                      <input required type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" className="input-premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Phone Number</label>
                      <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className="input-premium" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Subject</label>
                      <input value={form.subject} onChange={set('subject')} placeholder="What's this about?" className="input-premium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--surface-text)' }}>Message</label>
                    <textarea required rows={5} value={form.message} onChange={set('message')} placeholder="Tell us how we can help..." className="input-premium resize-none" />
                  </div>
                  <Button type="submit" variant="primary" rightIcon={<Send className="h-4 w-4" />}>
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
