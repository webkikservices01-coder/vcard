import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  QrCode,
  BarChart3,
  Sparkles,
  MessageCircle,
  Globe,
  ArrowRight,
  Check,
  Star,
  Zap,
  Bot,
  Phone,
  Mail,
  User,
  Lock,
  Eye,
  Package,
  CreditCard,
  Download,
  ExternalLink,
  Copy,
  Rocket,
  Briefcase,
  Home,
  Palette,
  GraduationCap,
  Building2,
  CheckCheck,
  ShieldCheck,
  Cpu,
  Radio,
  Menu,
  X,
} from "lucide-react";
import PublicFooter, { COMPANY } from "../components/PublicFooter";
import ThemeToggle from "../components/ui/ThemeToggle";
import LogoMark from "../components/ui/LogoMark";
import CyberCard3D from "./CyberCard3D";
import { plans as realPlans, FREE_TRIAL } from "../data/plans";
import HOME_SCHEMA from "../data/homeSchema.json";
import MetalCardSection from "../components/MetalCardSection";
import HomeExplainer from "../components/HomeExplainer";
import TryYourCard from "../components/TryYourCard";
import { PRICING_ENABLED } from "../utils/plan";
import { useTheme } from "../context/ThemeContext";
import blobTopDark from "../assets/blobs/top-dark.webp";
import blobTopLight from "../assets/blobs/top-light.webp";
import blobMiddleDark from "../assets/blobs/middle-dark.webp";
import blobMiddleLight from "../assets/blobs/middle-light.webp";
import blobBottomDark from "../assets/blobs/bottom-dark.webp";
import blobBottomLight from "../assets/blobs/bottom-light.webp";

/* -------- Premium AI Cyber-Rose Mesh Background -------- */
// The blobs were radial gradients under filter: blur(120px); moving a blurred layer made phones and
// MacBooks redraw a huge blur every frame (the site hung). The same blobs are now images: Chrome
// rendered each original blurred blob once (src/assets/blobs, 360px of glow around it), so they look
// identical and drifting them costs the GPU almost nothing.
const GLOW = 360; // glow baked around each blob (3 × the old blur)
const BLOBS = {
  dark: { top: blobTopDark, middle: blobMiddleDark, bottom: blobBottomDark },
  light: { top: blobTopLight, middle: blobMiddleLight, bottom: blobBottomLight },
};
const blobImg = (src) => `url(${src}) center / 100% 100% no-repeat`;

function MeshBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-500 ${
      isDark ? "bg-[#07090E]" : "bg-[#faf8f9]"
    }`}>
      <div 
        className={`absolute inset-0 transition-opacity duration-500 ${
          isDark ? "opacity-[0.2]" : "opacity-[0.12]"
        }`}
        style={{
          backgroundImage: `radial-gradient(rgba(231, 12, 101, 0.35) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="mesh-blob mesh-top" />
      <div className="mesh-blob mesh-middle" />
      <div className="mesh-blob mesh-bottom" />

      <style>{`
        .mesh-blob {
          position: absolute;
          pointer-events: none;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .mesh-blob { animation: none !important; }
        }
        .mesh-top {
          width: ${600 + 2 * GLOW}px;
          height: ${600 + 2 * GLOW}px;
          left: ${-100 - GLOW}px;
          top: ${-100 - GLOW}px;
          background: ${blobImg(BLOBS[isDark ? 'dark' : 'light'].top)};
          animation: floatOrbA 16s ease-in-out infinite alternate;
        }
        .mesh-middle {
          width: ${700 + 2 * GLOW}px;
          height: ${700 + 2 * GLOW}px;
          right: ${-150 - GLOW}px;
          top: calc(20% - ${GLOW}px);
          background: ${blobImg(BLOBS[isDark ? 'dark' : 'light'].middle)};
          animation: floatOrbB 20s ease-in-out infinite alternate;
        }
        .mesh-bottom {
          width: ${550 + 2 * GLOW}px;
          height: ${550 + 2 * GLOW}px;
          left: calc(20% - ${GLOW}px);
          bottom: ${-100 - GLOW}px;
          background: ${blobImg(BLOBS[isDark ? 'dark' : 'light'].bottom)};
          animation: floatOrbA 22s ease-in-out infinite alternate-reverse;
        }
        @keyframes floatOrbA {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(60px, -40px) scale(1.08); }
          100% { transform: translate(-30px, 50px) scale(0.96); }
        }
        @keyframes floatOrbB {
          0% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-70px, 50px) scale(1.06); }
          100% { transform: translate(40px, -30px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}

function Logo() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Link to="/" className="group inline-flex items-center gap-2.5 transition-transform duration-300 ease-out hover:scale-105">
      <span className="grid h-9 w-9 place-items-center rounded-xl shadow-lg shadow-[#E70C65]/30 transition-all duration-300 ease-out group-hover:-rotate-6 group-hover:shadow-xl group-hover:shadow-[#E70C65]/50">
        <LogoMark size={36} />
      </span>
      <span className={`text-lg font-semibold tracking-tight transition-colors ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        <span className="text-[#E70C65]">Ai</span>cardly
      </span>
    </Link>
  );
}

function TypewriterText({ text, speed = 45, delay = 700 }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    let interval;
    const startTimeout = setTimeout(() => {
      let index = 0;
      interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTypingComplete(true);
          clearInterval(interval);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [text, speed, delay]);

  return (
    <div className={`relative mt-6 max-w-lg overflow-hidden rounded-2xl p-4 shadow-lg backdrop-blur-xl transition-all duration-500 border ${
      isDark 
        ? "border-white/[0.08] bg-white/[0.03] hover:border-[#E70C65]/30" 
        : "border-pink-100 bg-white/90 shadow-pink-100/50 hover:border-[#E70C65]/40"
    }`}>
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-[#E70C65]/20 blur-xl" />
      <p className={`relative z-10 text-base leading-relaxed sm:text-lg ${
        isDark ? "text-slate-200" : "text-slate-700 font-medium"
      }`}>
        {/* The full text is laid out invisibly so the box has its final height from the first
            paint; the typed text sits on top. Without this the box grows while typing and pushes
            the video below it down (layout shift). */}
        <span className="invisible" aria-hidden="true">{text}</span>
        <span className="absolute inset-0">
          <span className="sr-only">{text}</span>
          <span aria-hidden="true">{displayedText}</span>
          {!isTypingComplete && (
            <span aria-hidden="true" className="inline-block ml-1 h-4 w-[2px] bg-[#E70C65] shadow-[0_0_8px_#E70C65] animate-pulse align-middle" />
          )}
        </span>
      </p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6b9d]">{eyebrow}</p>
      <h2 className={`mt-3 text-4xl font-semibold tracking-tight sm:text-5xl ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        {title}
      </h2>
      {subtitle && <p className={`mt-4 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{subtitle}</p>}
    </div>
  );
}

const features = [
  { icon: Smartphone, title: "Digital Business Card", desc: "Share your identity with a tap. No app required — works on any device, instantly." },
  { icon: Bot, title: "AI Persona & Chat Widget", desc: "A configurable AI assistant on your card that greets visitors and answers for you, 24/7." },
  { icon: QrCode, title: "Smart QR Codes", desc: "Generate elegant QR codes that route straight to your card. Print, share, scan." },
  { icon: BarChart3, title: "Visit Analytics", desc: "Track profile views, link taps, and engagement with a refined, executive dashboard." },
  { icon: MessageCircle, title: "WhatsApp Quick Connect", desc: "Let visitors reach you on WhatsApp in one tap, straight from your card." },
  { icon: Globe, title: "Custom Public Link", desc: "Your own aicardly.com/yourname link — polished, memorable, and ready to share anywhere." },
];

const PLAN_ICONS = {
  "digital-id": Zap,
  "smart-ai-card": Bot,
  "ai-agent-pro": Phone,
};

// Example ways people use their card. These are illustrations, not customer reviews: no names,
// ratings or results. Swap in real stories (with the person's consent, photo and company) when
// you have them.
const useCases = [
  { role: "Founders", text: "Replace paper cards with one link. People scan the QR at a meeting and the whole profile, website and portfolio is right there." },
  { role: "Real estate consultants", text: "The card's AI assistant answers basic questions about listings while you are with another client, and saves the enquiry for you." },
  { role: "Designers & creatives", text: "Pick a theme that matches your brand and show your best work in the gallery and portfolio sections." },
  { role: "Coaches & trainers", text: "WhatsApp quick connect lets followers message you in one tap to ask about sessions." },
  { role: "Doctors & clinics", text: "Patients scan the QR at the front desk to get directions, timings and the clinic's contact details." },
  { role: "Sales teams", text: "Share your card after every meeting and see how many people viewed it and which links they tapped." },
  { role: "Event professionals", text: "One short link, aicardly.com/yourname, instead of a cluttered bio-link page." },
  { role: "Agencies", text: "Show your services with links to your website, and let the AI book meetings with new leads." },
];

// Product facts only (no unproven usage numbers or ratings).
const stats = [
  { value: "10", label: "Card Themes" },
  { value: "24/7", label: "AI Assistant On Your Card" },
  { value: "₹99", label: "Plans From / Month" },
];

const audience = [
  { label: "Founders", icon: Rocket },
  { label: "Consultants", icon: Briefcase },
  { label: "Real Estate", icon: Home },
  { label: "Creators", icon: Palette },
  { label: "Coaches", icon: GraduationCap },
  { label: "Agencies", icon: Building2 },
];

const steps = [
  { icon: Sparkles, title: "Sign Up In Seconds", desc: "Create your account with your name, email and phone — no app to install, no credit card. The first 24 hours are free." },
  { icon: Smartphone, title: "Design Your Card", desc: "Set your title, add a photo, pick a theme, and switch on your AI persona to greet visitors." },
  { icon: QrCode, title: "Share It Anywhere", desc: "Download your QR code or share your aicardly.com/yourname link — your card opens instantly on any device." },
  { icon: BarChart3, title: "Track & Grow", desc: "See card views, manage products & testimonials, and keep an eye on your plan from one dashboard." },
];

/* -------- Enhanced Interactive Mockups -------- */
function SignupMock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${
          isDark ? "bg-[#E70C65]/20 text-[#ff6b9d]" : "bg-pink-100 text-[#9F1C44]"
        }`}>
          Step 1: Instant Start
        </span>
        <h4 className={`mt-3 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
          Create Your Account
        </h4>
        <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          First Impressions Start In 30 Seconds.
        </p>
        
        <div className="mt-4 space-y-2.5">
          <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium ${
            isDark ? "border-white/10 bg-white/[0.05] text-slate-200" : "border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}>
            <User className="h-3.5 w-3.5 text-[#E70C65]" /> Shubham Khurana
          </div>
          <div className={`flex items-center gap-2.5 rounded-xl border border-[#E70C65]/50 px-3.5 py-2 text-xs font-medium ring-1 ring-[#E70C65]/50 shadow-[0_0_12px_rgba(231,12,101,0.15)] ${
            isDark ? "bg-[#E70C65]/[0.1] text-slate-200" : "bg-pink-50 text-slate-800"
          }`}>
            <Mail className="h-3.5 w-3.5 text-[#E70C65]" /> shubham@company.com
          </div>
          <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium ${
            isDark ? "border-white/10 bg-white/[0.05] text-slate-200" : "border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}>
            <Phone className="h-3.5 w-3.5 text-[#E70C65]" /> +91 98765 43210
          </div>
          <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2 text-xs font-medium ${
            isDark ? "border-white/10 bg-white/[0.05] text-slate-200" : "border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}>
            <Lock className="h-3.5 w-3.5 text-[#E70C65]" /> ••••••••••
          </div>
        </div>
      </div>

      <div>
        <button className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#E70C65]/40 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer">
          <span>Continue</span> <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <p className={`mt-2 text-center text-[10px] ${isDark ? "text-slate-400" : "text-slate-500 font-medium"}`}>
          No credit card required. 24-hour free trial.
        </p>
      </div>
    </div>
  );
}

function DesignMock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedTheme, setSelectedTheme] = useState(3);
  const themeGradients = [
    "linear-gradient(135deg,#2c3e50,#000000)",
    "linear-gradient(135deg,#4f46e5,#0f172a)",
    "linear-gradient(135deg,#059669,#022c22)",
    "linear-gradient(135deg,#E70C65,#9F1C44)",
  ];

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b9d]">Interactive Theme</span>
          <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Click To Switch</span>
        </div>

        <div 
          className="mt-3.5 rounded-2xl p-4 text-white shadow-2xl transition-all duration-700 ease-out border border-white/20 hover:scale-[1.02]" 
          style={{ 
            background: themeGradients[selectedTheme],
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
          }}
        >
          <div className="flex items-center gap-3">
            <img 
              src="/profile.png" 
              alt="Shubham Khurana" 
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/40 shadow-inner"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <p className="text-sm font-bold leading-none">SHUBHAM KHURANA</p>
              <p className="mt-1 text-[11px] text-white/80">Founder & CEO</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg bg-black/30 px-2.5 py-1.5 text-[10px] backdrop-blur-md border border-white/10">
            <span className="flex items-center gap-1.5"><Bot className="h-3 w-3 text-pink-300" /> AI Persona Ready</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
          </div>
        </div>

        <p className={`mt-4 text-[11px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
          Select Preset Theme
        </p>
        <div className="mt-2.5 flex gap-3">
          {themeGradients.map((bg, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedTheme(i)}
              aria-label={`Card colour ${i + 1}`}
              aria-pressed={selectedTheme === i}
              className={`h-7 w-7 rounded-full transition-all duration-300 cursor-pointer ${
                selectedTheme === i ? "ring-2 ring-[#ff6b9d] scale-110 shadow-lg shadow-[#E70C65]/50" : "ring-1 ring-white/20 opacity-70 hover:opacity-100"
              }`}
              style={{ background: bg }}
            />
          ))}
        </div>
      </div>

      <button className="w-full rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#E70C65]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
        Save & Apply Theme
      </button>
    </div>
  );
}

function ShareMock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col justify-between items-center text-center p-1">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b9d]">Instant QR & URL</span>
        <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Share with a tap or camera scan</p>

        <div className="relative mx-auto mt-3.5 grid h-28 w-28 place-items-center rounded-2xl border border-white/25 bg-white p-2 shadow-xl overflow-hidden">
          <QrCode className="h-20 w-20 text-slate-900" />
          <div className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E70C65] to-transparent shadow-[0_0_10px_#E70C65] animate-bounce" />
        </div>

        <button 
          onClick={handleCopy}
          type="button"
          className={`mt-3.5 flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-medium transition-all active:scale-95 shadow-md cursor-pointer ${
            isDark 
              ? "border-white/15 bg-white/[0.06] text-slate-200 hover:border-[#E70C65]/60 hover:bg-white/[0.12]" 
              : "border-pink-200 bg-white text-slate-700 hover:border-[#E70C65]"
          }`}
        >
          <Globe className="h-3.5 w-3.5 text-[#E70C65]" />
          <span>aicardly.com/shubham</span>
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-[#ff6b9d]" />}
        </button>
      </div>

      <div className="w-full flex flex-col gap-2">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#E70C65]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">
          <Download className="h-3.5 w-3.5" /> Download Smart QR
        </button>
        <button className={`inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition-all cursor-pointer ${
          isDark ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}>
          <ExternalLink className="h-3.5 w-3.5" /> Open Public Card
        </button>
      </div>
    </div>
  );
}

function TrackMock() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [views, setViews] = useState(248);

  useEffect(() => {
    const id = setInterval(() => {
      setViews((v) => v + 1);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const dashboardStats = [
    { icon: Eye, label: "Live Card Views", value: views },
    { icon: Package, label: "AI Queries Handled", value: "84" },
    { icon: Star, label: "Link Taps", value: "126" },
    { icon: CreditCard, label: "Active Plan", value: "AI Agent Pro" },
  ];

  return (
    <div className="flex h-full flex-col justify-between p-1">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#ff6b9d]">Executive Analytics</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</span>
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          {dashboardStats.map((s) => (
            <div key={s.label} className={`rounded-xl border p-2.5 backdrop-blur-md transition-transform hover:scale-105 ${
              isDark ? "border-white/10 bg-white/[0.05]" : "border-pink-100 bg-white shadow-sm"
            }`}>
              <s.icon className="h-3.5 w-3.5 text-[#E70C65]" />
              <p className={`mt-1.5 text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{s.value}</p>
              <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={`mt-3.5 rounded-xl border p-2.5 ${isDark ? "border-white/10 bg-white/[0.05]" : "border-pink-100 bg-white shadow-sm"}`}>
          <div className="flex items-center justify-between text-[10px]">
            <span className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>Annual Plan Health</span>
            <span className="text-[#ff6b9d] font-bold">285 / 365 Days Left</span>
          </div>
          <div className={`mt-1.5 h-1.5 w-full rounded-full ${isDark ? "bg-white/10" : "bg-slate-100"}`}>
            <div className="h-1.5 w-[78%] rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] shadow-[0_0_8px_#E70C65]" />
          </div>
        </div>
      </div>

      <p className={`text-center text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
        AI automatically optimizes follow-up responses based on view stats.
      </p>
    </div>
  );
}

const STEP_MOCKS = [SignupMock, DesignMock, ShareMock, TrackMock];

/* -------- How It Works Component (Manual Left, Auto-sliding Right) -------- */
function StepsDemo({ isVisible }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [activeStep, setActiveStep] = useState(0);

  // Right side mockup will slide automatically every 6 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const ActiveMock = STEP_MOCKS[activeStep];

  return (
    <div className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div className={`space-y-4 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-14"
      }`}>
        {steps.map((s, i) => {
          const isActive = activeStep === i;
          return (
            <div
              key={s.title}
              onClick={() => setActiveStep(i)}
              className={`group relative flex w-full items-start gap-5 overflow-hidden rounded-3xl border p-6 sm:p-7 text-left backdrop-blur-xl transition-all duration-500 ease-out cursor-pointer ${
                isActive
                  ? isDark
                    ? "border-[#E70C65]/60 bg-white/[0.08] shadow-[0_15px_40px_rgba(231,12,101,0.2)] scale-[1.01]"
                    : "border-[#E70C65]/60 bg-white shadow-[0_15px_35px_rgba(231,12,101,0.12)] scale-[1.01]"
                  : isDark
                    ? "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]"
                    : "border-pink-100/70 bg-white/70 hover:border-pink-200 hover:bg-white"
              }`}
            >
              <div
                className={`grid h-13 w-13 shrink-0 place-items-center rounded-2xl transition-all duration-500 ${
                  isActive
                    ? "bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/40 rotate-3 scale-110"
                    : isDark
                      ? "bg-white/[0.06] text-[#ff6b9d] group-hover:scale-105"
                      : "bg-pink-50 text-[#E70C65] group-hover:scale-105"
                }`}
              >
                <s.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <span className={`text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-300 ${
                  isActive ? "text-[#E70C65]" : isDark ? "text-slate-400" : "text-slate-500"
                }`}>
                  Step {i + 1}
                </span>
                <h3 className={`mt-1 text-xl font-bold transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {s.title}
                </h3>
                <p className={`mt-1.5 text-sm leading-relaxed ${
                  isDark ? "text-slate-300" : "text-slate-600 font-medium"
                }`}>
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div 
        className={`relative mx-auto w-full max-w-sm lg:sticky lg:top-24 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-20 scale-95"
        }`}
      >
        <div className={`pointer-events-none absolute -inset-6 rounded-[3rem] blur-3xl opacity-85 animate-pulse ${
          isDark 
            ? "bg-gradient-to-br from-[#E70C65]/35 via-[#6366f1]/25 to-pink-500/20" 
            : "bg-gradient-to-br from-pink-300/40 via-purple-200/30 to-rose-200/30"
        }`} />

        <div className="video-beam-wrapper shadow-[0_25px_60px_rgba(0,0,0,0.15)]">
          <div className={`relative h-[480px] w-full overflow-hidden rounded-[26px] border p-5 backdrop-blur-2xl ${
            isDark ? "bg-slate-950/90 border-white/15" : "bg-white/95 border-pink-100 shadow-2xl"
          }`}>
            <div className={`mx-auto mb-4 flex h-4 w-28 items-center justify-center rounded-full shadow-inner border ${
              isDark ? "bg-black/70 border-white/10" : "bg-slate-100 border-slate-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full mr-2 ${isDark ? "bg-slate-700" : "bg-slate-300"}`} />
              <span className="h-2 w-2 rounded-full bg-[#E70C65] animate-ping" />
            </div>

            <div key={activeStep} className="step-slide-right-left h-[400px]">
              <ActiveMock />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center">
          {steps.map((_, i) => (
            // 44px tap area around a small dot, so it is easy to hit with a finger.
            <button
              key={i}
              type="button"
              aria-label={`Show Step ${i + 1}`}
              onClick={() => setActiveStep(i)}
              className="grid h-11 min-w-11 place-items-center px-1 cursor-pointer"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  activeStep === i
                    ? "w-8 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] shadow-[0_0_8px_#E70C65]"
                    : isDark ? "w-1.5 bg-white/20" : "w-1.5 bg-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes stepSlideRightToLeft {
          0% {
            opacity: 0;
            transform: translateX(50px) scale(0.95);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            filter: blur(0);
          }
        }
        .step-slide-right-left {
          animation: stepSlideRightToLeft 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

// In-page links (#stories, #pricing, #nfc-card). Sections further up render late
// (content-visibility, images), which moves the target after a plain jump, so keep
// re-aligning until the target stops moving.
function jumpToSection(id) {
  let last = null;
  let steady = 0;
  let tries = 0;
  const step = () => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start" });
    const top = Math.round(el.getBoundingClientRect().top);
    steady = top === last ? steady + 1 : 0;
    last = top;
    if (steady < 2 && ++tries < 20) setTimeout(step, 120);
  };
  step();
  try {
    window.history.replaceState(null, "", `#${id}`);
  } catch {
    /* ignore */
  }
}
const sectionLink = (id, after) => (e) => {
  e.preventDefault();
  after?.();
  jumpToSection(id);
};

export function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Arriving on /#pricing, /#stories … from another page or Cardy's links.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!/^[a-z0-9-]+$/i.test(id)) return;
    const t = setTimeout(() => jumpToSection(id), 300);
    return () => clearTimeout(t);
  }, []);

  const heroVideoRef = useRef(null);
  const heroSectionRef = useRef(null);
  const card3DSectionRef = useRef(null);
  const audienceSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const featuresGridRef = useRef(null);
  const pricingGridRef = useRef(null);
  const howItWorksSectionRef = useRef(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isCard3DVisible, setIsCard3DVisible] = useState(false);
  const [isAudienceVisible, setIsAudienceVisible] = useState(false);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [isPricingVisible, setIsPricingVisible] = useState(false);
  const [isHowItWorksVisible, setIsHowItWorksVisible] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sections far from the screen pause their looping animations (3D card spin, scan laser,
  // spinning borders) until the visitor scrolls near them, so phones don't animate what nobody
  // sees. Nothing looks different: they start again before coming into view.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("anim-offscreen", !e.isIntersecting)),
      { rootMargin: "300px 0px" }
    );
    const sections = document.querySelectorAll("main section, body > div section");
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // The poster shows straight away; the video itself is fetched only after the page has loaded,
  // so it doesn't compete with the page's own code and fonts on a phone connection.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;
    const start = () => {
      video.src = "/aicardly-demo.mp4";
      video.muted = true;
      video.play().catch(() => {});
    };
    let timer;
    const onLoad = () => { timer = setTimeout(start, 0); };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );

    const card3DObserver = new IntersectionObserver(
      ([entry]) => setIsCard3DVisible(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    const audienceObserver = new IntersectionObserver(
      ([entry]) => setIsAudienceVisible(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );

    const statsObserver = new IntersectionObserver(
      ([entry]) => setIsStatsVisible(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px 0px -50px 0px" }
    );

    const featuresObserver = new IntersectionObserver(
      ([entry]) => setIsFeaturesVisible(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px 0px -80px 0px" }
    );

    const pricingObserver = new IntersectionObserver(
      ([entry]) => setIsPricingVisible(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -60px 0px" }
    );

    const howItWorksObserver = new IntersectionObserver(
      ([entry]) => setIsHowItWorksVisible(entry.isIntersecting),
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );

    if (heroSectionRef.current) heroObserver.observe(heroSectionRef.current);
    if (card3DSectionRef.current) card3DObserver.observe(card3DSectionRef.current);
    if (audienceSectionRef.current) audienceObserver.observe(audienceSectionRef.current);
    if (statsSectionRef.current) statsObserver.observe(statsSectionRef.current);
    if (featuresGridRef.current) featuresObserver.observe(featuresGridRef.current);
    if (pricingGridRef.current) pricingObserver.observe(pricingGridRef.current);
    if (howItWorksSectionRef.current) howItWorksObserver.observe(howItWorksSectionRef.current);

    return () => {
      heroObserver.disconnect();
      card3DObserver.disconnect();
      audienceObserver.disconnect();
      statsObserver.disconnect();
      featuresObserver.disconnect();
      pricingObserver.disconnect();
      howItWorksObserver.disconnect();
    };
  }, []);

  return (
    <div className={`relative min-h-screen overflow-x-hidden transition-colors duration-500 ${
      isDark ? "text-slate-100 selection:bg-[#E70C65] selection:text-white" : "text-slate-900 selection:bg-[#E70C65] selection:text-white"
    }`}>
      <MeshBackground />

      <style>{`
        @keyframes smoothItemReveal {
          0% { opacity: 0; transform: translateY(-12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes borderSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes infiniteMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .anim-logo-p { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.05s both; }
        .anim-logo-text { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.15s both; }
        .anim-nav-features { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.25s both; }
        .anim-nav-pricing { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.35s both; }
        .anim-nav-stories { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.45s both; }
        .anim-signin-btn { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.55s both; }
        .anim-getstarted-btn { animation: smoothItemReveal 0.45s cubic-bezier(0.2, 0.9, 0.3, 1) 0.65s both; }

        .nav-link-glow {
          position: relative;
        }
        .nav-link-glow::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 50%;
          width: 0%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #E70C65 50%, #ff6b9d 100%);
          box-shadow: 0 0 10px #E70C65, 0 0 18px #ff6b9d;
          transform: translateX(-50%);
          transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
          opacity: 0;
          border-radius: 9999px;
        }
        .nav-link-glow:hover::after {
          width: 65%;
          opacity: 1;
        }

        .video-beam-wrapper {
          position: relative;
          border-radius: 28px;
          padding: 1.5px;
          overflow: hidden;
        }
        .video-beam-wrapper::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, #E70C65 20%, #6366f1 40%, transparent 60%);
          animation: borderSpin 6s linear infinite;
        }

        .popular-beam-wrapper {
          position: relative;
          border-radius: 26px;
          padding: 1.5px;
          overflow: hidden;
        }
        .popular-beam-wrapper::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(transparent, #ffffff 15%, #E70C65 35%, #9F1C44 60%, transparent 80%);
          animation: borderSpin 5s linear infinite;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: infiniteMarquee 42s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top Scroll Laser Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#6366f1] origin-left z-[9999] shadow-[0_0_14px_rgba(231,12,101,0.9),0_0_25px_rgba(99,102,241,0.6)]"
        style={{ scaleX }}
      />

      {/* Morphing Navbar in Dual Theme */}
      <header className="sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <nav
            className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isScrolled
                ? isDark
                  ? "mt-2 rounded-full border border-white/15 bg-slate-950/80 px-6 py-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                  : "mt-2 rounded-full border border-pink-100/90 bg-white/90 px-6 py-2.5 shadow-[0_12px_30px_rgba(231,12,101,0.08)] backdrop-blur-xl"
                : "mt-0 rounded-3xl border border-transparent bg-transparent px-2 py-4"
            }`}
          >
            <Logo />

            {/* Navigation Links */}
            <div
              className={`hidden items-center gap-1 rounded-full transition-all duration-500 ease-out lg:flex ${
                isScrolled
                  ? "border border-transparent bg-transparent p-0"
                  : isDark
                    ? "border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
                    : "border border-pink-100 bg-white/80 p-1 shadow-sm backdrop-blur-md"
              }`}
            >
              <Link
                to="/metal-nfc-card"
                className={`nav-link-glow anim-nav-features rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Metal NFC Card
              </Link>
              <Link
                to="/features"
                className={`nav-link-glow anim-nav-features rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className={`nav-link-glow anim-nav-pricing rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Pricing
              </Link>
              <a
                href="#stories"
                onClick={sectionLink("stories")}
                className={`nav-link-glow anim-nav-stories rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Use Cases
              </a>
              <Link
                to="/contact-us"
                className={`nav-link-glow rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Right Side: Theme Toggle + Auth CTAs */}
            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href={COMPANY.phoneHref}
                aria-label={`Call ${COMPANY.phone}`}
                className={`hidden sm:inline-flex items-center gap-1.5 rounded-full text-sm font-semibold transition-colors ${
                  isDark ? "text-slate-200 hover:text-white" : "text-slate-800 hover:text-[#9F1C44]"
                }`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#E70C65]/10 text-[#E70C65]">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="hidden xl:inline">{COMPANY.phone}</span>
              </a>
              
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <div className="anim-signin-btn">
                <Link
                  to="/login"
                  className={`nav-link-glow hidden whitespace-nowrap text-sm font-semibold transition-colors duration-200 sm:inline pb-1 ${
                    isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                  }`}
                >
                  Sign In
                </Link>
              </div>

              <div className="anim-getstarted-btn">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E70C65]/50 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="hidden sm:block h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className={`grid h-10 w-10 place-items-center rounded-full border lg:hidden ${
                  isDark ? "border-white/15 bg-white/[0.06] text-white" : "border-pink-100 bg-white text-slate-800"
                }`}
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </nav>

          {/* Menu for phones */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                data-site-menu
                className={`mt-2 rounded-2xl border p-2 shadow-2xl lg:hidden ${
                  isDark ? "border-white/10 bg-slate-950/95 text-white" : "border-pink-100 bg-white text-slate-900"
                }`}
              >
                {[
                  ["Metal NFC Card", "/metal-nfc-card"],
                  ["Features", "/features"],
                  ["Pricing", "/pricing"],
                  ["About", "/about-us"],
                  ["FAQs", "/faqs"],
                ].map(([label, to]) => (
                  <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold">
                    {label} <ArrowRight className="h-4 w-4 opacity-40" />
                  </Link>
                ))}
                <a href="#stories" onClick={sectionLink("stories", () => setMenuOpen(false))} className="flex items-center justify-between rounded-xl px-4 py-3.5 text-[15px] font-semibold">
                  Use Cases <ArrowRight className="h-4 w-4 opacity-40" />
                </a>
                <div className={`mt-1 grid grid-cols-2 gap-2 border-t pt-3 ${isDark ? "border-white/10" : "border-pink-100"}`}>
                  <Link to="/contact-us" className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/15" : "border-slate-200"}`}>
                    Contact Us
                  </Link>
                  <a href={COMPANY.phoneHref} className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-3 text-sm font-semibold ${isDark ? "border-white/15" : "border-slate-200"}`}>
                    <Phone className="h-4 w-4 text-[#E70C65]" /> Call us
                  </a>
                  <Link to="/login" className={`rounded-xl border py-3 text-center text-sm font-semibold ${isDark ? "border-white/15" : "border-slate-200"}`}>
                    Sign In
                  </Link>
                  <div className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold ${isDark ? "border-white/15" : "border-slate-200"}`}>
                    Theme <ThemeToggle />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <main>
      {/* ── 1. Hero Section (Dedicated Live Video Demo) ────── */}
      <section 
        ref={heroSectionRef} 
        className="relative mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pt-12"
      >
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="relative flex flex-col justify-between">
            <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rounded-full bg-gradient-to-tr from-[#E70C65]/25 to-[#6366f1]/20 blur-3xl" />

            <div className="relative z-10">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur ${
                isDark 
                  ? "border-white/10 bg-white/[0.05] text-[#ff6b9d]" 
                  : "border-[#E70C65]/20 bg-pink-50 text-[#9F1C44]"
              }`}>
                <Sparkles className="h-3.5 w-3.5 text-[#E70C65]" /> AI digital business card &amp; metal NFC cards
              </span>
              <h1 className={`mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                <span className="bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] bg-clip-text text-transparent">
                  AI Digital Business Card
                </span>{" "}
                for Modern Professionals
              </h1>
              <p className={`mt-3 text-xl font-semibold tracking-tight sm:text-2xl ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}>
                Your Network, Elevated.
              </p>

              <TypewriterText 
                text="Create a stunning AI digital business card and share it instantly with a QR code, an NFC tap, or one custom link. Your AI assistant greets visitors, answers questions, and handles follow-ups 24/7. Built for professionals who care about first impressions." 
                speed={45}
                delay={700}
              />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-5 py-3 text-sm font-medium text-white shadow-xl shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#E70C65]/50"
                >
                  <span>Build Your Card</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <a
                  href="#nfc-card"
                  onClick={sectionLink("nfc-card")}
                  className={`rounded-full border px-5 py-3 text-sm font-medium backdrop-blur transition-all duration-300 ease-out ${
                    isDark 
                      ? "border-white/15 bg-white/[0.04] text-white hover:border-white/30 hover:bg-white/[0.08]" 
                      : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-[#E70C65]/40 hover:bg-pink-50/50"
                  }`}
                >
                  View 3D NFC Card
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}`}>Made in India · No app needed · 24-hour free trial</p>
              </div>
              <p className={`mt-6 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                A product by{' '}
                <a
                  href="https://webkik.co.in/"
                  target="_blank"
                  rel="noreferrer"
                  className={`font-semibold underline-offset-4 hover:underline ${isDark ? 'text-white' : 'text-slate-900'}`}
                >
                  Webkik Services
                </a>
              </p>
            </div>
          </div>

          <div className="flex h-full items-center">
            <div 
              className={`group relative mx-auto w-full max-w-md lg:max-w-none transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isHeroVisible 
                  ? "opacity-100 translate-x-0 scale-100" 
                  : "opacity-0 translate-x-20 scale-95"
              }`}
            >
              <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-gradient-to-tr from-[#E70C65]/30 via-[#6366f1]/25 to-pink-500/20 blur-3xl opacity-75 transition-opacity duration-500 group-hover:opacity-100 group-hover:blur-2xl" />

              <div className="video-beam-wrapper shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500 ease-out group-hover:scale-[1.02] group-hover:shadow-[0_25px_60px_rgba(231,12,101,0.25)]">
                <div className="relative overflow-hidden rounded-[26px] bg-[#0c101a] p-2 backdrop-blur-xl">
                  <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 shadow-lg backdrop-blur-md">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E70C65] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E70C65]"></span>
                    </span>
                    <span className="text-[11px] font-medium tracking-wide text-slate-200">
                      Live Demo Video
                    </span>
                  </div>

                  <video
                    ref={heroVideoRef}
                    poster="/aicardly-demo.webp"
                    preload="none"
                    loop
                    playsInline
                    muted
                    controls
                    aria-label="Aicardly AI business card demo video"
                    className="mx-auto block aspect-square w-full max-w-[480px] rounded-[20px] object-cover shadow-inner transition-transform duration-700 ease-out group-hover:scale-[1.008]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1b. What it is / how it works / where / benefits ── */}
      <HomeExplainer />

      {/* ── 1c. Try it free: live preview card ── */}
      <TryYourCard />

      {/* ── 2. NEW DEDICATED 3D EXECUTIVE NFC SHOWCASE SECTION ── */}
      <section 
        id="nfc-card"
        ref={card3DSectionRef}
        className={`relative z-10 border-y py-24 overflow-hidden backdrop-blur-md transition-colors duration-500 ${
          isDark ? "border-white/10 bg-gradient-to-b from-slate-950/40 via-purple-950/10 to-transparent" : "border-pink-100 bg-gradient-to-b from-pink-50/50 via-white to-transparent"
        }`}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/20 via-[#6366f1]/15 to-[#9F1C44]/20 blur-[140px] opacity-75" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading 
            eyebrow="Hardware Meets Intelligence" 
            title="Next-gen 3D metal NFC business card." 
            subtitle="Rotate and interact with your custom 3D metal NFC business card. One tap shares your digital business card, contact details, and AI assistant with any phone, with no app needed."
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            
            <div 
              className={`transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCard3DVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 -translate-x-16 scale-95"
              }`}
            >
              <div className="video-beam-wrapper shadow-[0_25px_60px_rgba(231,12,101,0.25)]">
                <div className={`relative rounded-[26px] p-2 backdrop-blur-2xl ${
                  isDark ? "bg-[#090d16]" : "bg-white/95"
                }`}>
                  <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 shadow-lg backdrop-blur-md">
                    <Radio className="h-3.5 w-3.5 text-[#ff6b9d] animate-pulse" />
                    <span className="text-[11px] font-bold tracking-wide text-white">
                      Interactive 3D Simulation
                    </span>
                  </div>

                  <CyberCard3D 
                    name="SHUBHAM KHURANA"
                    designation="Founder & CEO"
                    slug="shubham"
                    photoUrl="/profile.png"
                    isDark={isDark} 
                  />
                </div>
              </div>
            </div>

            <div 
              className={`space-y-6 transform transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isCard3DVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
              }`}
            >
              <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all hover:border-[#E70C65]/40 ${
                isDark ? "border-white/10 bg-white/[0.03]" : "border-pink-100 bg-white shadow-pink-100/40"
              }`}>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/35">
                  <Cpu className="h-6 w-6" />
                </div>
                <h3 className={`mt-5 text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  NFC chip, tap to open
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Tap the card on a modern iPhone or Android phone and your Aicardly card opens in the browser, with your contact details and AI assistant. No app needed.
                </p>
              </div>

              <div className={`rounded-3xl border p-6 sm:p-8 backdrop-blur-xl shadow-lg transition-all hover:border-[#E70C65]/40 ${
                isDark ? "border-white/10 bg-white/[0.03]" : "border-pink-100 bg-white shadow-pink-100/40"
              }`}>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/35">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className={`mt-5 text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Obsidian Metal & Frosted Satin Craftsmanship
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Stainless steel engraved with your name and logo, for meetings, pitches and conferences. The card opens your aicardly.com/yourname link, so updates to your details show up without reprinting.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/metal-nfc-card"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all hover:shadow-2xl hover:shadow-[#E70C65]/50 active:scale-95 cursor-pointer"
                >
                  <span>Order Your Metal NFC Card</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. Animated BUILT FOR Section ──────────────────── */}
      <section ref={audienceSectionRef} className="relative mt-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-3/4 max-w-2xl rounded-full bg-gradient-to-r from-[#E70C65]/20 via-[#6366f1]/20 to-[#9F1C44]/20 blur-3xl opacity-75" />
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#ff6b9d]">
          Built For
        </p>

        <div className="relative z-10 mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 px-6">
          {audience.map(({ label, icon: Icon }, idx) => (
            <span
              key={label}
              style={{
                transitionDelay: isAudienceVisible ? `${idx * 80}ms` : '0ms',
              }}
              className={`group inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-medium shadow-md backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1 hover:border-[#E70C65]/60 hover:shadow-xl hover:shadow-[#E70C65]/25 active:scale-95 ${
                isDark 
                  ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]" 
                  : "border-pink-100 bg-white text-slate-800 shadow-pink-100/40 hover:bg-pink-50/50"
              } ${
                isAudienceVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-90"
              }`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-md shadow-[#E70C65]/30 transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-6">
                <Icon className="h-3.5 w-3.5" />
              </span>
              <span className={`font-semibold tracking-wide transition-colors duration-200 ${
                isDark ? "text-slate-100 group-hover:text-white" : "text-slate-800 group-hover:text-[#9F1C44]"
              }`}>
                {label}
              </span>
            </span>
          ))}
        </div>
      </section>

      {/* ── 4. Stats Section ────────────────────────────────── */}
      <section 
        ref={statsSectionRef}
        className={`relative z-10 border-y mt-20 backdrop-blur-md overflow-hidden ${
          isDark ? "border-white/10 bg-white/[0.02]" : "border-pink-100 bg-white/70"
        }`}
      >
        <div className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 h-32 w-80 rounded-full bg-[#E70C65]/15 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 text-center">
            {stats.map((s, idx) => (
              <div 
                key={s.label}
                style={{
                  transitionDelay: isStatsVisible ? `${idx * 150}ms` : '0ms',
                }}
                className={`transform rounded-2xl border p-6 shadow-lg backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-[#E70C65]/40 ${
                  isDark 
                    ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]" 
                    : "border-pink-100 bg-white shadow-pink-100/40 hover:bg-pink-50/50"
                } ${
                  isStatsVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-16"
                }`}
              >
                <p className={`text-3xl font-extrabold tracking-tight sm:text-5xl ${
                  isDark 
                    ? "bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent" 
                    : "text-slate-900"
                }`}>
                  {s.value}
                </p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#ff6b9d]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Features Section ─────────────────────────────── */}
      <section 
        id="features" 
        className="cv-auto relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-3/4 max-w-3xl rounded-full bg-gradient-to-tr from-[#E70C65]/20 via-[#6366f1]/15 to-transparent blur-[120px] opacity-75" />

        <SectionHeading eyebrow="Features" title="Everything to make a lasting impression." subtitle="Thoughtful details, refined visuals, and AI where it actually helps." />

        <div 
          ref={featuresGridRef} 
          className="relative z-10 mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((f, idx) => (
            <div 
              key={f.title} 
              style={{
                transitionDelay: isFeaturesVisible ? `${idx * 160}ms` : '0ms',
              }}
              className={`group relative overflow-hidden rounded-3xl border p-7 backdrop-blur-xl shadow-lg transition-all duration-[850ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-[#E70C65]/60 hover:shadow-[0_20px_45px_rgba(231,12,101,0.18)] ${
                isDark 
                  ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]" 
                  : "border-pink-100 bg-white shadow-pink-100/40 hover:bg-pink-50/40"
              } ${
                isFeaturesVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-14 scale-95"
              }`}
            >
              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-[#E70C65]/30 to-indigo-500/20 blur-2xl opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
              
              <div className="relative z-10">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/35 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[#E70C65]/60">
                  <f.icon className="h-6 w-6" />
                </div>

                <h3 className={`mt-5 text-xl font-bold tracking-tight transition-colors duration-200 ${
                  isDark ? "text-white group-hover:text-white" : "text-slate-900 group-hover:text-[#9F1C44]"
                }`}>
                  {f.title}
                </h3>
                <p className={`mt-2.5 text-sm leading-relaxed transition-colors duration-200 ${
                  isDark ? "text-slate-300 group-hover:text-slate-200" : "text-slate-600 group-hover:text-slate-700"
                }`}>
                  {f.desc}
                </p>
              </div>

              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#E70C65]/0 to-transparent transition-all duration-500 group-hover:via-[#E70C65]/70" />
            </div>
          ))}
        </div>
      </section>

      {/* ── 5b. Metal NFC Card Section ─────────────────────── */}
      <MetalCardSection />

      {/* ── 6. Pricing Section ──────────────────────────────── */}
      {PRICING_ENABLED && (
      <section id="pricing" className="cv-auto scroll-mt-20 relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/20 via-[#6366f1]/15 to-[#9F1C44]/20 blur-[140px] opacity-80" />

        <SectionHeading eyebrow="Pricing" title="Simple Plans That Grow With You." subtitle="Try it free for 24 hours, then pick the plan that fits." />

        <div 
          ref={pricingGridRef} 
          className="relative z-10 mt-16 grid gap-8 lg:grid-cols-3 lg:items-center"
        >
          {realPlans.map((p, idx) => {
            const Icon = PLAN_ICONS[p.id] || Zap;
            const highlight = p.popular;
            const bullets = p.highlights;

            return (
              <div
                key={p.id}
                style={{
                  transitionDelay: isPricingVisible ? `${idx * 150}ms` : '0ms',
                }}
                className={`transform transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isPricingVisible
                    ? "opacity-100 scale-100 translate-y-0"
                    : "opacity-0 scale-[0.82] translate-y-12"
                }`}
              >
                {highlight ? (
                  <div className="popular-beam-wrapper shadow-[0_20px_50px_rgba(231,12,101,0.35)] transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_30px_70px_rgba(231,12,101,0.55)]">
                    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#E70C65] to-[#9F1C44] p-8 text-white">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md">
                            <Icon className="h-6 w-6 text-white" />
                          </span>
                          <h3 className="text-2xl font-bold tracking-tight text-white">{p.name}</h3>
                        </div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-md">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse text-yellow-300" /> Popular
                        </div>
                      </div>

                      <div className="mt-8 flex items-end gap-1.5">
                        <span className="text-5xl font-black tracking-tight text-white">₹{p.price.monthly}</span>
                        <span className="pb-1.5 text-sm font-medium text-white/80">/ Month + GST</span>
                      </div>
                      <p className="mt-2 text-sm text-white/90">{p.tagline}</p>

                      <div className="my-7 h-[1px] w-full bg-white/20" />

                      <ul className="space-y-3.5 text-sm font-medium">
                        {bullets.map((feat) => (
                          <li key={feat} className="flex items-center gap-3 text-white">
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-white/25 shadow-sm">
                              <Check className="h-3.5 w-3.5 text-white" />
                            </span>
                            {feat}
                          </li>
                        ))}
                      </ul>

                      <Link 
                        to="/register" 
                        className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-[#9F1C44] shadow-xl shadow-black/20 transition-all duration-300 ease-out hover:bg-slate-100 hover:shadow-2xl active:scale-95 cursor-pointer"
                      >
                        <span>Choose {p.name}</span>
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className={`group relative overflow-hidden rounded-[26px] border p-8 backdrop-blur-xl shadow-lg transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#E70C65]/50 hover:shadow-[0_20px_50px_rgba(231,12,101,0.18)] ${
                    isDark 
                      ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]" 
                      : "border-pink-100 bg-white shadow-pink-100/40 hover:bg-pink-50/40"
                  }`}>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-[#E70C65]/20 to-transparent blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="flex items-center gap-3">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-md shadow-[#E70C65]/30 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </span>
                      <h3 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                    </div>

                    <div className="mt-8 flex items-end gap-1.5">
                      <span className={`text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>₹{p.price.monthly}</span>
                      <span className={`pb-1.5 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>/ Month + GST</span>
                    </div>
                    <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{p.tagline}</p>

                    <div className={`my-7 h-[1px] w-full ${isDark ? "bg-white/10" : "bg-slate-100"}`} />

                    <ul className="space-y-3.5 text-sm font-medium">
                      {bullets.map((feat) => (
                        <li key={feat} className={`flex items-center gap-3 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                          <span className={`grid h-5 w-5 place-items-center rounded-full ${
                            isDark ? "bg-white/[0.08] text-[#ff6b9d]" : "bg-pink-100 text-[#E70C65]"
                          }`}>
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <Link 
                      to="/register" 
                      className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-[#E70C65]/50 active:scale-95 cursor-pointer"
                    >
                      <span>Choose {p.name}</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className={`relative z-10 mx-auto mt-10 max-w-3xl text-center text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          <span className="font-bold">Free trial: </span>{FREE_TRIAL.summary}
        </p>
      </section>
      )}

      {/* ── 7. Use Cases Section ──────────────────────────────── */}
      <section id="stories" className="cv-auto scroll-mt-20 relative py-24 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/15 via-[#6366f1]/15 to-[#9F1C44]/15 blur-[120px] opacity-75" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading eyebrow="Use Cases" title="How professionals use Aicardly." subtitle="Example ways founders, consultants and creators use their card." />
        </div>

        <div className="relative mt-16 w-full overflow-hidden">
          <div className={`pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-24 sm:w-44 ${
            isDark ? "bg-gradient-to-r from-[#07090E] via-[#07090E]/80 to-transparent" : "bg-gradient-to-r from-[#faf8f9] via-[#faf8f9]/80 to-transparent"
          }`} />
          <div className={`pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-24 sm:w-44 ${
            isDark ? "bg-gradient-to-l from-[#07090E] via-[#07090E]/80 to-transparent" : "bg-gradient-to-l from-[#faf8f9] via-[#faf8f9]/80 to-transparent"
          }`} />

          <div className="marquee-track gap-6 py-4">
            {[...useCases, ...useCases].map((t, idx) => (
              <div 
                key={`${t.role}-${idx}`} 
                className={`group relative flex w-[320px] sm:w-[380px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border p-7 shadow-xl backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#E70C65]/60 hover:shadow-[0_20px_45px_rgba(231,12,101,0.2)] ${
                  isDark 
                    ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]" 
                    : "border-pink-100 bg-white shadow-pink-100/40 hover:bg-pink-50/40"
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E70C65]/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700 font-medium"}`}>
                    {t.text}
                  </p>
                </div>

                <div className={`mt-7 flex items-center gap-3.5 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-xs font-bold text-white shadow-md shadow-[#E70C65]/30 transition-transform duration-300 group-hover:scale-105">
                    {t.role.split(" ").filter((n) => /^[A-Za-z]/.test(n)).map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors duration-200 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {t.role}
                    </p>
                    <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Example use case
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. How It Works Section ─────────────────────────── */}
      <section 
        id="how-it-works" 
        ref={howItWorksSectionRef}
        className="cv-auto relative mx-auto max-w-7xl px-6 pb-24 lg:px-10 overflow-hidden"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/15 via-[#6366f1]/15 to-[#9F1C44]/15 blur-[130px] opacity-70" />

        <SectionHeading eyebrow="How It Works" title="Your card, live in four simple steps." subtitle="From sign-up to sharing — no design skills, no app installs, no waiting." />
        
        <StepsDemo isVisible={isHowItWorksVisible} />

        <div className="mt-16 flex justify-center">
          <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#E70C65]/50 active:scale-95 cursor-pointer">
            <span>Build Your Free Card</span> <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* ── 9. FAQ Section (same Q&A as the FAQPage schema: src/data/homeSchema.json) ── */}
      <section id="faq" className="cv-auto relative mx-auto max-w-3xl px-6 pb-24 lg:px-10">
        <SectionHeading eyebrow="FAQ" title="Questions, Answered." subtitle="Everything people ask before making their first Aicardly." />
        <div className="mt-12 space-y-3">
          {HOME_SCHEMA.faqs.map((f) => (
            <details
              key={f.q}
              className={`group rounded-2xl border px-5 py-4 transition-colors ${
                isDark ? "border-white/10 bg-white/[0.03] open:bg-white/[0.06]" : "border-slate-200 bg-white open:shadow-md"
              }`}
            >
              <summary className={`flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                <h3 className="text-base font-semibold">{f.q}</h3>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#E70C65]/10 text-[#E70C65] transition-transform duration-300 group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{f.a}</p>
            </details>
          ))}
        </div>
        <p className={`mt-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          More questions? See all <Link to="/faqs" className={`font-semibold hover:underline ${isDark ? "text-[#ff6b9d]" : "text-[#C00A55]"}`}>FAQs</Link>.
        </p>
      </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export default LandingPage;