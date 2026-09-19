import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useSpring } from "framer-motion";
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
} from "lucide-react";
import PublicFooter from "../components/PublicFooter";
import ThemeToggle from "../components/ui/ThemeToggle";
import CyberCard3D from "./CyberCard3D";
import { plans as realPlans } from "../data/plans";
import { useTheme } from "../context/ThemeContext";

/* -------- Premium AI Cyber-Rose Mesh Background -------- */
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
          border-radius: 9999px;
          filter: blur(120px);
          pointer-events: none;
        }
        .mesh-top {
          width: 600px;
          height: 600px;
          left: -100px;
          top: -100px;
          background: ${isDark 
            ? 'radial-gradient(circle, rgba(231, 12, 101, 0.32) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 182, 204, 0.45) 0%, rgba(231, 12, 101, 0.15) 50%, transparent 70%)'};
          animation: floatOrbA 16s ease-in-out infinite alternate;
        }
        .mesh-middle {
          width: 700px;
          height: 700px;
          right: -150px;
          top: 20%;
          background: ${isDark
            ? 'radial-gradient(circle, rgba(159, 28, 68, 0.35) 0%, rgba(231, 12, 101, 0.22) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 204, 219, 0.45) 0%, rgba(231, 12, 101, 0.12) 50%, transparent 70%)'};
          animation: floatOrbB 20s ease-in-out infinite alternate;
        }
        .mesh-bottom {
          width: 550px;
          height: 550px;
          left: 20%;
          bottom: -100px;
          background: ${isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.28) 0%, rgba(231, 12, 101, 0.2) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 192, 203, 0.4) 0%, transparent 70%)'};
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
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30 transition-all duration-300 ease-out group-hover:-rotate-6 group-hover:shadow-xl group-hover:shadow-[#E70C65]/50">
        <span className="text-base font-black">P</span>
      </span>
      <span className={`text-lg font-semibold tracking-tight transition-colors ${
        isDark ? "text-white" : "text-slate-900"
      }`}>
        Webcard<span className="text-[#E70C65]">.ai</span>
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
    let timeout;
    const startTimeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsTypingComplete(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);

    return () => {
      clearTimeout(startTimeout);
      clearTimeout(timeout);
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
        <span>{displayedText}</span>
        {!isTypingComplete && (
          <span className="inline-block ml-1 h-4 w-[2px] bg-[#E70C65] shadow-[0_0_8px_#E70C65] animate-pulse align-middle" />
        )}
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
  { icon: Smartphone, title: "Digital Business Card", desc: "Share Your Identity With A Tap. No App Required — Works On Any Device, Instantly." },
  { icon: Bot, title: "AI Persona & Chat Widget", desc: "A Configurable AI Assistant On Your Card That Greets Visitors And Answers For You, 24/7." },
  { icon: QrCode, title: "Smart QR Codes", desc: "Generate Elegant QR Codes That Route Straight To Your Card. Print, Share, Scan." },
  { icon: BarChart3, title: "Visit Analytics", desc: "Track Profile Views, Link Taps, And Engagement With A Refined, Executive Dashboard." },
  { icon: MessageCircle, title: "WhatsApp Quick Connect", desc: "Let Visitors Reach You On WhatsApp In One Tap, Straight From Your Card." },
  { icon: Globe, title: "Custom Public Link", desc: "Your Own /C/Yourname Link — Polished, Memorable, And Ready To Share Anywhere." },
];

const PLAN_ICONS = {
  "digital-id": Zap,
  "smart-ai-card": Bot,
  "ai-agent-pro": Phone,
};

const testimonials = [
  { name: "Aarav Sharma", role: "Founder, Studio Nine", quote: "Webcard.ai Replaced The Paper Cards I Kept Forgetting At Home. Clients Scan The QR And My Whole Profile Is Right There." },
  { name: "Meera Iyer", role: "Real Estate Consultant", quote: "The AI Chat Widget Answers Basic Questions For Leads Even When I Am With Another Client. It Genunely Saves Me Calls." },
  { name: "Rohan Verma", role: "Freelance Designer", quote: "The Themes Feel Premium — It Is The First Digital Card I Have Used That Actually Looks The Way I Wanted My Brand To Feel." },
  { name: "Ananya Deshmukh", role: "Creative Director, Aura Studio", quote: "Clients Are Blown Away By The Live Interaction. My Lead Conversions Jumped 40% In Just Two Weeks." },
  { name: "Vikram Malhotra", role: "Managing Partner, Zenith Capital", quote: "Sharing My Portfolio During High-Stake Networking Dinners Has Never Looked This Crisp And Professional." },
  { name: "Pooja Hegde", role: "Fitness & Wellness Coach", quote: "The WhatsApp Quick Connect Feature Made It Effortless For My Instagram Followers To Book 1-On-1 Sessions Directly." },
  { name: "Karan Singhania", role: "Tech Lead, DevGrid", quote: "Lightning-Fast Loading Speeds And Responsive Theme Physics. Easily The Best Tech-Forward Digital Card Platform." },
  { name: "Neha Chawla", role: "Brand Strategist", quote: "Having My AI Assistant Explain My Past Case Studies To Potential Partners 24/7 Feels Like Having An Unfair Advantage." },
  { name: "Dr. Sameer Joshi", role: "Dental Surgeon", quote: "Patients Easily Scan My QR Code At Conferences To Get Directions, Timings, And Book Consultations Instantly." },
  { name: "Rhea Kapoor", role: "Event Architect", quote: "The Custom Vanity Link Is Clean And Memorable. It Completely Eliminated The Clutter Of Traditional Bio Link Tools." },
  { name: "Arjun Reddy", role: "Commercial Realtor", quote: "Prospective Buyers View Property Brochures And Schedule Site Visits Right From My Smart Card." },
  { name: "Tanya Sen", role: "Growth Marketer", quote: "The Dashboard Analytics Show Me Exactly Which Campaigns And Events Drove The Highest Card Views." },
  { name: "Kabir Mehta", role: "Angel Investor", quote: "Founders Love Scanning It At Demo Days. Clean, Sleek, And Leaves A Memorable High-End Impression." },
];

const stats = [
  { value: "10k+", label: "Cards Created" },
  { value: "50k+", label: "Profile Views" },
  { value: "4.8★", label: "Avg. Rating" },
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
  { icon: Sparkles, title: "Sign Up In Seconds", desc: "Create Your Free Account With Your Name, Email And Phone — No App To Install, No Credit Card." },
  { icon: Smartphone, title: "Design Your Card", desc: "Set Your Title, Add A Photo, Pick A Theme, And Switch On Your AI Persona To Greet Visitors." },
  { icon: QrCode, title: "Share It Anywhere", desc: "Download Your QR Code Or Share Your Mycardlink.Site URL — Your Card Opens Instantly On Any Device." },
  { icon: BarChart3, title: "Track & Grow", desc: "See Card Views, Manage Products & Testimonials, And Keep An Eye On Your Plan From One Dashboard." },
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
          No Credit Card Required. Free Tier Forever.
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
        <p className={`text-[11px] mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Share With A Tap Or Camera Scan</p>

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
          <span>mycardlink.site/shubham</span>
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
    { icon: Star, label: "Review Rating", value: "4.9★" },
    { icon: CreditCard, label: "Active Plan", value: "Pro AI" },
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
        AI Automatically Optimizes Follow-Up Responses Based On View Stats.
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

        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show Step ${i + 1}`}
              onClick={() => setActiveStep(i)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                activeStep === i 
                  ? "w-8 bg-gradient-to-r from-[#E70C65] to-[#9F1C44] shadow-[0_0_8px_#E70C65]" 
                  : isDark ? "w-1.5 bg-white/20 hover:bg-white/40" : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
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

export function LandingPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const heroVideoRef = useRef(null);
  const heroSectionRef = useRef(null);
  const card3DSectionRef = useRef(null);
  const audienceSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const featuresGridRef = useRef(null);
  const pricingGridRef = useRef(null);
  const howItWorksSectionRef = useRef(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const video = heroVideoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
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
              className={`hidden items-center gap-1 rounded-full transition-all duration-500 ease-out md:flex ${
                isScrolled
                  ? "border border-transparent bg-transparent p-0"
                  : isDark
                    ? "border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md"
                    : "border border-pink-100 bg-white/80 p-1 shadow-sm backdrop-blur-md"
              }`}
            >
              <a
                href="#nfc-card"
                className={`nav-link-glow anim-nav-features rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Executive Card
              </a>
              <a
                href="#features"
                className={`nav-link-glow anim-nav-features rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Features
              </a>
              <a
                href="#pricing"
                className={`nav-link-glow anim-nav-pricing rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Pricing
              </a>
              <a
                href="#stories"
                className={`nav-link-glow anim-nav-stories rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 ease-in-out active:scale-95 ${
                  isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                }`}
              >
                Stories
              </a>
            </div>

            {/* Right Side: Theme Toggle + Auth CTAs */}
            <div className="flex items-center gap-3 sm:gap-4">
              
              <div className="scale-90 sm:scale-100">
                <ThemeToggle />
              </div>

              <div className="anim-signin-btn">
                <Link
                  to="/login"
                  className={`nav-link-glow hidden text-sm font-semibold transition-colors duration-200 sm:inline pb-1 ${
                    isDark ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-[#9F1C44]"
                  }`}
                >
                  Sign In
                </Link>
              </div>

              <div className="anim-getstarted-btn">
                <Link
                  to="/register"
                  className="group relative inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#E70C65]/50 active:translate-y-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </nav>
        </div>
      </header>

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
                <Sparkles className="h-3.5 w-3.5 text-[#E70C65]" /> The AI-Powered Digital Card Platform
              </span>
              <h1 className={`mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                Your Network,
                <br />
                <span className="bg-gradient-to-r from-[#E70C65] via-[#ff6b9d] to-[#9F1C44] bg-clip-text text-transparent">
                  Elevated.
                </span>
              </h1>

              <TypewriterText 
                text="Design A Breathtaking Digital Business Card, Share It With A Single Link Or QR, And Let An AI Assistant Handle The Follow-Ups. Built For Professionals Who Care About First Impressions." 
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
                <div className="flex -space-x-2">
                  {["#9F1C44", "#E70C65", "#b3154b", "#cf0555"].map((c) => (
                    <span key={c} className={`h-8 w-8 rounded-full ring-2 shadow-sm ${isDark ? 'ring-slate-900' : 'ring-white'}`} style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#E70C65] text-[#E70C65]" />
                    ))}
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600 font-medium'}`}>Loved By Early Professionals</p>
                </div>
              </div>
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
                  <div className="absolute right-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-1 shadow-lg backdrop-blur-md">
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
                    src="/1.mp4"
                    loop
                    autoPlay
                    playsInline
                    muted
                    controls
                    className="h-[396px] sm:h-[440px] w-full rounded-[20px] object-cover shadow-inner transition-transform duration-700 ease-out group-hover:scale-[1.008]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            title="Next-Gen 3D Holographic Identity." 
            subtitle="Rotate and interact with your custom contactless executive card. One tap transfers your full persona."
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
                  Embedded EMV Chip & Instant NFC Beam
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Tap Against Any Modern iPhone Or Android Smartphone To Trigger Your Digital Portfolio, Contact File, And AI Chat Assistant Instantly — Zero Companion App Required.
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
                  Designed For High-Stake Networking Dinners, Founder Pitches, And Conferences. Every Card Comes Encrypted With Your Vanity Routing Link And Dynamic Contact Sync.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all hover:shadow-2xl hover:shadow-[#E70C65]/50 active:scale-95 cursor-pointer"
                >
                  <span>Claim Your Custom Card</span>
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
        className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-3/4 max-w-3xl rounded-full bg-gradient-to-tr from-[#E70C65]/20 via-[#6366f1]/15 to-transparent blur-[120px] opacity-75" />

        <SectionHeading eyebrow="Features" title="Everything To Make A Lasting Impression." subtitle="Thoughtful Details, Refined Visuals, And AI Where It Actually Helps." />

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

      {/* ── 6. Pricing Section ──────────────────────────────── */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/20 via-[#6366f1]/15 to-[#9F1C44]/20 blur-[140px] opacity-80" />

        <SectionHeading eyebrow="Pricing" title="Simple Plans That Grow With You." subtitle="Start Free, Upgrade When Your First Impressions Need Superpowers." />

        <div 
          ref={pricingGridRef} 
          className="relative z-10 mt-16 grid gap-8 lg:grid-cols-3 lg:items-center"
        >
          {realPlans.map((p, idx) => {
            const Icon = PLAN_ICONS[p.id] || Zap;
            const highlight = p.popular;
            const bullets = [
              `${p.features.vCards} vCard${p.features.vCards > 1 ? "s" : ""}`,
              `${p.features.themes}+ Premium Themes`,
              p.features.aiChatWidget ? "AI Chat Widget" : "QR Code + Analytics",
              p.features.aiVoiceAgent ? "AI Voice & WhatsApp Agent" : p.features.hideBranding ? "Hide Branding" : "Standard Branding",
              `${p.features.support} Support`,
            ];

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
                        <span className="pb-1.5 text-sm font-medium text-white/80">/ Month</span>
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
                      <span className={`pb-1.5 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>/ Month</span>
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
      </section>

      {/* ── 7. Stories Section ──────────────────────────────── */}
      <section id="stories" className="relative py-24 overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/15 via-[#6366f1]/15 to-[#9F1C44]/15 blur-[120px] opacity-75" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading eyebrow="Stories" title="Loved By Professionals Who Care." subtitle="Real Stories From Founders, Consultants, And Leaders Elevating Their Brand." />
        </div>

        <div className="relative mt-16 w-full overflow-hidden">
          <div className={`pointer-events-none absolute left-0 top-0 bottom-0 z-20 w-24 sm:w-44 ${
            isDark ? "bg-gradient-to-r from-[#07090E] via-[#07090E]/80 to-transparent" : "bg-gradient-to-r from-[#faf8f9] via-[#faf8f9]/80 to-transparent"
          }`} />
          <div className={`pointer-events-none absolute right-0 top-0 bottom-0 z-20 w-24 sm:w-44 ${
            isDark ? "bg-gradient-to-l from-[#07090E] via-[#07090E]/80 to-transparent" : "bg-gradient-to-l from-[#faf8f9] via-[#faf8f9]/80 to-transparent"
          }`} />

          <div className="marquee-track gap-6 py-4">
            {[...testimonials, ...testimonials].map((t, idx) => (
              <div 
                key={`${t.name}-${idx}`} 
                className={`group relative flex w-[320px] sm:w-[380px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border p-7 shadow-xl backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[#E70C65]/60 hover:shadow-[0_20px_45px_rgba(231,12,101,0.2)] ${
                  isDark 
                    ? "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]" 
                    : "border-pink-100 bg-white shadow-pink-100/40 hover:bg-pink-50/40"
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#E70C65]/20 blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-[#E70C65] text-[#E70C65] drop-shadow-[0_0_6px_rgba(231,12,101,0.6)]" />
                    ))}
                  </div>

                  <p className={`mt-5 text-sm leading-relaxed ${isDark ? "text-slate-200" : "text-slate-700 font-medium"}`}>
                    "{t.quote}"
                  </p>
                </div>

                <div className={`mt-7 flex items-center gap-3.5 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-xs font-bold text-white shadow-md shadow-[#E70C65]/30 transition-transform duration-300 group-hover:scale-105">
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className={`text-sm font-bold transition-colors duration-200 ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}>
                      {t.name}
                    </p>
                    <p className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {t.role}
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
        className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-10 overflow-hidden"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-3/4 max-w-4xl rounded-full bg-gradient-to-r from-[#E70C65]/15 via-[#6366f1]/15 to-[#9F1C44]/15 blur-[130px] opacity-70" />

        <SectionHeading eyebrow="How It Works" title="Your Card, Live In Four Simple Steps." subtitle="From Sign-Up To Sharing — No Design Skills, No App Installs, No Waiting." />
        
        <StepsDemo isVisible={isHowItWorksVisible} />

        <div className="mt-16 flex justify-center">
          <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#E70C65]/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#E70C65]/50 active:scale-95 cursor-pointer">
            <span>Build Your Free Card</span> <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default LandingPage;