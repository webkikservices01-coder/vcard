import { useEffect, useRef, useState } from "react";
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
import { useTheme } from "../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Link to="/" className="group inline-flex items-center gap-3 transition-transform duration-300 hover:scale-105">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30 transition-all duration-300 group-hover:-rotate-6">
        <span className="text-lg font-black">P</span>
      </span>
      <span className={`text-xl font-bold tracking-tight transition-colors ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        Webcard<span className="text-[#E70C65]">.ai</span>
      </span>
    </Link>
  );
}

export function PublicFooter() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const footerRef = useRef(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -20px 0px" }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className={`relative overflow-hidden border-t backdrop-blur-2xl transition-colors duration-500 pb-12 ${
        isDark 
          ? "border-white/10 bg-[#07090E] text-slate-100" 
          : "border-pink-100/80 bg-white text-slate-900"
      }`}
    >
      {/* Top Animated Laser Signal Line */}
      <div className={`relative h-[2px] w-full overflow-hidden ${isDark ? "bg-white/10" : "bg-pink-100"}`}>
        <div className="signal-line" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_1.3fr] items-start">
          
          {/* Brand Column */}
          <div 
            style={{ transitionDelay: isFooterVisible ? "0ms" : "0ms" }}
            className={`pt-6 sm:pt-8 transform transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isFooterVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <FooterLogo />
            <p className={`mt-4 max-w-sm text-sm sm:text-base leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-600 font-medium"
            }`}>
              The AI-powered digital business card platform — built and operated by{" "}
              <a 
                href="https://webkik.co.in/" 
                target="_blank" 
                rel="noreferrer" 
                className={`font-semibold underline hover:text-[#E70C65] transition-colors ${isDark ? "text-white" : "text-slate-900"}`}
              >
                {COMPANY.name}
              </a>.
            </p>

            {/* Social Links */}
            <div className="mt-5 flex items-center gap-3.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`group relative flex h-10 w-10 items-center justify-center rounded-xl border shadow-md backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#E70C65]/60 hover:text-white ${
                    isDark 
                      ? "border-white/10 bg-white/[0.04] text-slate-300" 
                      : "border-pink-200/80 bg-white text-slate-700 shadow-pink-100/50"
                  }`}
                >
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <Icon className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div 
            style={{ transitionDelay: isFooterVisible ? "150ms" : "0ms" }}
            className={`pt-2 transform transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isFooterVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b9d]">
              Quick links
            </p>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className={`group inline-flex items-center text-xs sm:text-sm transition-all duration-300 hover:translate-x-1 ${
                      isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-[#9F1C44] font-medium"
                    }`}
                  >
                    <span className="mr-2 h-1 w-1 rounded-full bg-[#E70C65] opacity-0 transition-all duration-300 group-hover:opacity-100" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Details + Map Column */}
          <div 
            style={{ transitionDelay: isFooterVisible ? "300ms" : "0ms" }}
            className={`transform transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isFooterVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b9d]">
              Company details
            </p>
            <a 
              href="https://webkik.co.in/" 
              target="_blank" 
              rel="noreferrer"
              className={`mb-2 text-base font-semibold block hover:text-[#E70C65] transition-colors ${isDark ? "text-white" : "text-slate-900"}`}
            >
              {COMPANY.name}
            </a>

            <ul className={`space-y-2.5 text-xs sm:text-sm ${isDark ? "text-slate-300" : "text-slate-600 font-medium"}`}>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#E70C65]" />
                <span className="leading-relaxed">
                  {COMPANY.addressLines[0]} {COMPANY.addressLines[1]}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-[#E70C65]" />
                <a href={COMPANY.phoneHref} className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-[#9F1C44]"}`}>
                  {COMPANY.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-[#E70C65]" />
                <a href={`mailto:${COMPANY.email}`} className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-[#9F1C44]"}`}>
                  {COMPANY.email}
                </a>
              </li>
            </ul>

            <p className={`mt-2.5 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              GSTIN: <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{COMPANY.gstin}</span>
            </p>

            {/* Embedded Compact Map Card */}
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="map-beam-wrapper group relative mt-4 block shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`relative overflow-hidden rounded-xl border backdrop-blur-xl ${
                isDark ? "bg-slate-950/90 border-white/10" : "bg-white border-pink-200/80 shadow-sm"
              }`}>
                <div className="relative h-28 w-full overflow-hidden">
                  <iframe
                    title="Webkik Services location"
                    src={MAPS_EMBED_SRC}
                    className={`h-full w-full transition-all duration-300 ${
                      isDark ? "grayscale-[40%] invert-[85%] hue-rotate-[180deg]" : "grayscale-[10%]"
                    }`}
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="directions-tag absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Navigation className="h-2.5 w-2.5 text-[#ff6b9d]" /> Get directions
                  </div>
                </div>

                <div className={`flex items-center justify-between border-t px-3 py-2 text-xs font-semibold ${
                  isDark ? "border-white/10 bg-white/[0.04] text-white" : "border-pink-100 bg-pink-50/50 text-slate-800"
                }`}>
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#E70C65]" /> Tagore Garden, Delhi
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-[#E70C65]" />
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className={`mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row ${
          isDark ? "border-white/10 text-slate-400" : "border-pink-100 text-slate-500"
        }`}>
          <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <p className="font-semibold text-[#E70C65] z-10">
            Webcard.ai is a platform by{" "}
            <a href="https://webkik.co.in/" target="_blank" rel="noreferrer" className="underline hover:text-slate-900 dark:hover:text-white transition-colors">
              {COMPANY.name}
            </a>
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-md transition-transform duration-300 hover:-translate-y-1 active:scale-95 cursor-pointer z-10"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Compact & Centered Background Watermark Text (Optimized Size & Balanced Opacity) ── */}
      <div 
        className="pointer-events-none absolute bottom-2 left-0 right-0 w-full flex justify-center items-center overflow-hidden z-0 select-none"
      >
        <span 
          className="text-[6vw] sm:text-[4.5vw] font-black tracking-widest uppercase text-center whitespace-nowrap"
          style={{
            color: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(231, 12, 101, 0.07)"
          }}
        >
          WEBKIK SERVICES
        </span>
      </div>

      <style>{`
        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .map-beam-wrapper {
          position: relative;
          border-radius: 14px;
          padding: 1.5px;
          overflow: hidden;
        }
        .map-beam-wrapper::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, #E70C65 20%, #6366f1 40%, transparent 60%);
          animation: borderSpin 6s linear infinite;
        }

        .signal-line {
          position: absolute;
          inset: 0 auto 0 0;
          width: 33%;
          background: linear-gradient(90deg, transparent, #E70C65, #6366f1, transparent);
          animation: signalMove 5s linear infinite;
        }
        @keyframes signalMove {
          0% { left: -33%; }
          100% { left: 100%; }
        }
      `}</style>
    </footer>
  );
}

export default PublicFooter;