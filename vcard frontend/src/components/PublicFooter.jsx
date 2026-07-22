import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  ArrowUp,
  Sparkles,
  Navigation,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaFacebookF } from "react-icons/fa";

export const COMPANY = {
  name: "Webkik Services",
  addressLines: [
    "WZ-52, 2nd Floor, Above Shubham Band,",
    "Tagore Garden, Delhi – 110027",
  ],
  phone: "+91-9868698698",
  phoneHref: "tel:+919868698698",
  whatsapp: "919868698698",
  email: "webkikservices01@gmail.com",
  gstin: "07CXYPK0037Q2ZN",
  gst: "07CXYPK0037Q2ZN",
};

const FULL_ADDRESS = `${COMPANY.name}, ${COMPANY.addressLines.join(" ")}`;
const MAPS_EMBED_SRC = `https://www.google.com/maps?q=${encodeURIComponent(FULL_ADDRESS)}&output=embed`;
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(FULL_ADDRESS)}`;

const quickLinks = [
  { label: "About Us", to: "/about-us" },
  { label: "Contact Us", to: "/contact-us" },
  { label: "FAQs", to: "/faqs" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms-conditions" },
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Cancellation Policy", to: "/cancellation-policy" },
];

const socials = [
  { icon: FaInstagram, href: "https://www.instagram.com/webkik_services/", label: "Instagram" },
  { icon: FaLinkedinIn, href: "https://www.linkedin.com/company/webkik-services", label: "LinkedIn" },
  { icon: FaFacebookF, href: "https://www.facebook.com/webkikservices/", label: "Facebook" },
];

function FooterLogo() {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30 transition-transform group-hover:-rotate-6">
        <span className="text-base font-black">P</span>
      </span>
      <span className="text-lg font-semibold tracking-tight text-[#3b0a1e]">
        Webcard<span className="text-[#E70C65]">.ai</span>
      </span>
    </Link>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-[#E70C65]/15 bg-white/60 backdrop-blur">
      <div className="relative h-px w-full overflow-hidden bg-[#E70C65]/15">
        <div className="signal-line" />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="footer-blob footer-blob-a" />
        <div className="footer-blob footer-blob-b" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.8fr_1.3fr]">
          {/* Brand column */}
          <div className="fade-in">
            <FooterLogo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#6a4757]">
              The AI-powered digital business card platform — built and operated by{" "}
              <span className="font-semibold text-[#3b0a1e]">{COMPANY.name}</span>.
            </p>

            <div className="mt-7 flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="social-btn group relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E70C65]/20 bg-white/70 text-[#9F1C44] transition-all duration-300 hover:-translate-y-1"
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Icon className="relative h-4 w-4 transition-colors duration-300 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links column */}
          <div className="fade-in" style={{ animationDelay: "0.08s" }}>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#9F1C44]">
              Quick links
            </p>
            <ul className="space-y-3">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center text-sm text-[#6a4757] transition-colors duration-300 hover:text-[#9F1C44]"
                  >
                    <span className="relative">
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#9F1C44] transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company details + map column */}
          <div className="fade-in" style={{ animationDelay: "0.16s" }}>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#9F1C44]">
              Company details
            </p>
            <p className="mb-4 text-base font-semibold text-[#3b0a1e]">{COMPANY.name}</p>

            <ul className="space-y-3 text-sm text-[#6a4757]">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" />
                <span>
                  {COMPANY.addressLines[0]}
                  <br />
                  {COMPANY.addressLines[1]}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[#E70C65]" />
                <a href={COMPANY.phoneHref} className="hover:text-[#9F1C44] transition-colors">
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[#E70C65]" />
                <a href={`mailto:${COMPANY.email}`} className="hover:text-[#9F1C44] transition-colors">
                  {COMPANY.email}
                </a>
              </li>
            </ul>

            <p className="mt-3 text-xs text-[#6a4757]/70">GSTIN: {COMPANY.gstin}</p>

            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="group relative mt-6 block overflow-hidden rounded-2xl border border-[#E70C65]/15"
            >
              <div className="relative h-40 w-full">
                <iframe
                  title="Webkik Services location"
                  src={MAPS_EMBED_SRC}
                  className="h-full w-full grayscale-[30%] transition-all duration-500 group-hover:grayscale-0"
                  style={{ border: 0, filter: "hue-rotate(-8deg) saturate(1.3)" }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(231,12,101,0.22), rgba(159,28,68,0.10))",
                  }}
                />

                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
                  <span className="relative flex h-6 w-6 items-center justify-center">
                    <span className="map-pulse absolute inline-flex h-full w-full rounded-full bg-[#E70C65]/60" />
                    <span className="relative flex h-3 w-3 rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] shadow-lg shadow-[#E70C65]/50" />
                  </span>
                </div>

                <div className="directions-tag absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-[#1a0812]/85 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <Navigation className="h-3 w-3" /> Get directions
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#fff5f8] px-4 py-3 text-xs font-semibold text-[#3b0a1e]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#E70C65]" /> Visit us in Tagore Garden, Delhi
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[#E70C65]/15 pt-8 sm:flex-row">
          <p className="text-sm text-[#6a4757]">
            © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>

          <p className="shimmer-text bg-gradient-to-r from-[#E70C65] via-[#9F1C44] to-[#E70C65] bg-clip-text text-sm font-semibold text-transparent">
            Webcard.ai is a digital card platform by {COMPANY.name}
          </p>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="back-to-top flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30 transition-transform duration-300 hover:-translate-y-1"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      <style>{`
        .fade-in{opacity:0;transform:translateY(16px);animation:footerFadeIn .7s ease-out forwards}
        @keyframes footerFadeIn{to{opacity:1;transform:none}}

        .signal-line{position:absolute;inset:0 auto 0 0;width:33%;background:linear-gradient(90deg,transparent,#E70C65,#9F1C44,transparent);animation:signalMove 6s linear infinite}
        @keyframes signalMove{0%{left:-33%}100%{left:100%}}

        .footer-blob{position:absolute;border-radius:9999px;filter:blur(90px);opacity:.35}
        .footer-blob-a{width:420px;height:420px;left:-140px;top:0;background:radial-gradient(circle,#ffb3cf,transparent 60%);animation:footerBlobA 16s ease-in-out infinite}
        .footer-blob-b{width:460px;height:460px;right:-160px;bottom:-120px;background:radial-gradient(circle,#ffd4e2,transparent 60%);animation:footerBlobB 18s ease-in-out infinite}
        @keyframes footerBlobA{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-20px)}}
        @keyframes footerBlobB{0%,100%{transform:translate(0,0)}50%{transform:translate(-24px,16px)}}

        .map-pulse{animation:mapPulse 1.8s ease-out infinite}
        @keyframes mapPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.4);opacity:0}}

        .shimmer-text{background-size:200% auto;animation:shimmer 4s linear infinite}
        @keyframes shimmer{to{background-position:200% center}}

        @media (prefers-reduced-motion: reduce){
          .fade-in,.signal-line,.footer-blob,.map-pulse,.shimmer-text{animation:none;opacity:1;transform:none}
        }
      `}</style>
    </footer>
  );
}

export default PublicFooter;