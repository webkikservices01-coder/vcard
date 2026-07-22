import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import PublicFooter from "../components/PublicFooter";
import { plans as realPlans } from "../data/plans";

/* -------- small inline UI helpers -------- */
function MeshBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="mesh-blob mesh-a" />
      <div className="mesh-blob mesh-b" />
      <div className="mesh-blob mesh-c" />
      <style>{`
        .mesh-blob{position:absolute;border-radius:9999px;filter:blur(90px);opacity:.55}
        .mesh-a{width:640px;height:640px;left:-180px;top:-160px;background:radial-gradient(circle,#ffb3cf,transparent 60%);animation:mA 20s ease-in-out infinite}
        .mesh-b{width:720px;height:720px;right:-220px;top:80px;background:radial-gradient(circle,#ffd4e2,transparent 60%);animation:mB 24s ease-in-out infinite}
        .mesh-c{width:520px;height:520px;left:35%;bottom:-240px;background:radial-gradient(circle,#f9c9dc,transparent 60%);animation:mA 28s ease-in-out infinite reverse}
        @keyframes mA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(40px,-30px) scale(1.08)}}
        @keyframes mB{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-50px,20px) scale(1.05)}}
      `}</style>
    </div>
  );
}

function Logo() {
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

function FadeIn({ children, delay = 0, className = "" }) {
  return (
    <div className={`fade-in ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
      <style>{`
        .fade-in{opacity:0;transform:translateY(12px);animation:fadeIn .7s ease-out forwards}
        @keyframes fadeIn{to{opacity:1;transform:none}}
      `}</style>
    </div>
  );
}

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9F1C44]">{eyebrow}</p>
      <h2 className="mt-3 text-4xl font-semibold tracking-tight text-[#3b0a1e] sm:text-5xl">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-[#6a4757]">{subtitle}</p>}
    </div>
  );
}

/* -------- data -------- */
const features = [
  { icon: Smartphone, title: "Digital Business Card", desc: "Share your identity with a tap. No app required — works on any device, instantly." },
  { icon: Bot, title: "AI Persona & Chat Widget", desc: "A configurable AI assistant on your card that greets visitors and answers for you, 24/7." },
  { icon: QrCode, title: "Smart QR Codes", desc: "Generate elegant QR codes that route straight to your card. Print, share, scan." },
  { icon: BarChart3, title: "Visit Analytics", desc: "Track profile views, link taps, and engagement with a refined, executive dashboard." },
  { icon: MessageCircle, title: "WhatsApp Quick Connect", desc: "Let visitors reach you on WhatsApp in one tap, straight from your card." },
  { icon: Globe, title: "Custom Public Link", desc: "Your own /c/yourname link — polished, memorable, and ready to share anywhere." },
];

const PLAN_ICONS = {
  "digital-id": Zap,
  "smart-ai-card": Bot,
  "ai-agent-pro": Phone,
};

const testimonials = [
  { name: "Aarav Sharma", role: "Founder, Studio Nine", quote: "Webcard.ai replaced the paper cards I kept forgetting at home. Clients scan the QR and my whole profile is right there." },
  { name: "Meera Iyer", role: "Real Estate Consultant", quote: "The AI chat widget answers basic questions for leads even when I am with another client. It genuinely saves me calls." },
  { name: "Rohan Verma", role: "Freelance Designer", quote: "The themes feel premium — it is the first digital card I have used that actually looks the way I wanted my brand to feel." },
];

const stats = [
  { value: "10k+", label: "Cards created" },
  { value: "50k+", label: "Profile views" },
  { value: "4.8★", label: "Avg. rating" },
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
  { icon: Sparkles, title: "Sign up in seconds", desc: "Create your free account with your name, email and phone — no app to install, no credit card." },
  { icon: Smartphone, title: "Design your card", desc: "Set your title, add a photo, pick a theme, and switch on your AI persona to greet visitors." },
  { icon: QrCode, title: "Share it anywhere", desc: "Download your QR code or share your mycardlink.site URL — your card opens instantly on any device." },
  { icon: BarChart3, title: "Track & grow", desc: "See card views, manage products & testimonials, and keep an eye on your plan from one dashboard." },
];

/* -------- animated "how it works" demo (phone mockup, mirrors the real product screens) -------- */
function SignupMock() {
  return (
    <div className="flex h-full flex-col">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fbdce6] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#9F1C44]">
        Begin your journey
      </span>
      <h4 className="mt-3 text-lg font-semibold text-[#3b0a1e]">Create your account</h4>
      <p className="text-xs text-[#6a4757]">First impressions start here.</p>
      <div className="mt-5 space-y-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-2.5 text-sm text-[#6a4757]">
          <User className="h-4 w-4 text-[#E70C65]" /> Ava Lindgren
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-2.5 text-sm text-[#6a4757]">
          <Mail className="h-4 w-4 text-[#E70C65]" /> you@company.com
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-2.5 text-sm text-[#6a4757]">
          <Phone className="h-4 w-4 text-[#E70C65]" /> +91 98765 43210
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-2.5 text-sm text-[#6a4757]">
          <Lock className="h-4 w-4 text-[#E70C65]" /> Min. 6 characters
        </div>
      </div>
      <button className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#E70C65]/30">
        Create account <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-center text-[11px] text-[#6a4757]/70">
        Have an account? <span className="font-semibold text-[#9F1C44]">Sign in</span>
      </p>
    </div>
  );
}

function DesignMock() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9F1C44]">Card Theme</p>
      <p className="text-[11px] text-[#6a4757]">Pick a preset or design your own look</p>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-2.5 text-xs text-[#6a4757]">
        <Globe className="h-3.5 w-3.5 shrink-0 text-[#E70C65]" /> mycardlink.site/yourname
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] p-5 text-white shadow-lg shadow-[#E70C65]/30">
        <div className="h-11 w-11 rounded-full bg-white/25" />
        <p className="mt-3 text-sm font-semibold">Shubham Khurana</p>
        <p className="text-xs text-white/80">Founder – Webkik</p>
      </div>

      <p className="mt-5 text-[11px] font-semibold uppercase tracking-widest text-[#9F1C44]">Themes</p>
      <div className="mt-2 flex gap-2">
        {[
          "linear-gradient(135deg,#4b4b4b,#111827)",
          "linear-gradient(135deg,#475569,#0f172a)",
          "linear-gradient(135deg,#1e293b,#020617)",
          "linear-gradient(135deg,#E70C65,#9F1C44)",
        ].map((bg, i) => (
          <span key={i} className={`h-8 w-8 rounded-full ring-2 ${i === 3 ? "ring-[#3b0a1e]" : "ring-white"}`} style={{ background: bg }} />
        ))}
      </div>

      <button className="mt-auto rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-3 text-sm font-medium text-white shadow-lg shadow-[#E70C65]/30">
        Save Theme
      </button>
    </div>
  );
}

function ShareMock() {
  return (
    <div className="flex h-full flex-col items-center text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9F1C44]">QR Code</p>
      <p className="text-[11px] text-[#6a4757]">Share your vCard with a scannable QR code</p>

      <div className="mt-5 grid h-32 w-32 place-items-center rounded-2xl border border-[#E70C65]/20 bg-white shadow-inner">
        <QrCode className="h-20 w-20 text-[#3b0a1e]" />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[#E70C65]/20 bg-white px-4 py-2 text-[11px] text-[#6a4757]">
        <Globe className="h-3.5 w-3.5 shrink-0 text-[#E70C65]" /> mycardlink.site/c/yourname
        <Copy className="h-3 w-3 shrink-0 text-[#9F1C44]" />
      </div>

      <div className="mt-5 flex w-full flex-col gap-2">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-[#E70C65]/30">
          <Download className="h-3.5 w-3.5" /> Download QR Code
        </button>
        <button className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#E70C65]/20 bg-white px-4 py-2.5 text-xs font-medium text-[#3b0a1e]">
          <ExternalLink className="h-3.5 w-3.5" /> View Card
        </button>
      </div>
    </div>
  );
}

function TrackMock() {
  const dashboardStats = [
    { icon: Eye, label: "Card Views", value: "248" },
    { icon: Package, label: "Products", value: "12" },
    { icon: Star, label: "Testimonials", value: "8" },
    { icon: CreditCard, label: "Cards Used", value: "1 / 3" },
  ];
  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#9F1C44]">Dashboard</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {dashboardStats.map((s) => (
          <div key={s.label} className="rounded-xl border border-[#E70C65]/15 bg-white px-3 py-3">
            <s.icon className="h-4 w-4 text-[#E70C65]" />
            <p className="mt-2 text-lg font-semibold text-[#3b0a1e]">{s.value}</p>
            <p className="text-[11px] text-[#6a4757]">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-[#E70C65]/15 bg-white px-4 py-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-[#3b0a1e]">Active Plan</span>
          <span className="text-[#9F1C44]">210 / 365 days</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-[#E70C65]/10">
          <div className="h-1.5 w-[58%] rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44]" />
        </div>
      </div>
    </div>
  );
}

const STEP_MOCKS = [SignupMock, DesignMock, ShareMock, TrackMock];

function StepsDemo() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const ActiveMock = STEP_MOCKS[activeStep];

  return (
    <div className="mt-16 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      {/* Step list */}
      <div className="space-y-5">
        {steps.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setActiveStep(i)}
            className={`group relative flex w-full items-start gap-5 overflow-hidden rounded-3xl border p-8 text-left backdrop-blur transition-all duration-300 ${
              activeStep === i
                ? "border-[#E70C65]/50 bg-white shadow-xl shadow-[#E70C65]/15"
                : "border-[#E70C65]/15 bg-white/60 hover:border-[#E70C65]/30 hover:bg-white/80"
            }`}
          >
            <div
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition ${
                activeStep === i
                  ? "bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/40"
                  : "bg-[#fbdce6] text-[#9F1C44]"
              }`}
            >
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9F1C44]">Step {i + 1}</span>
              <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-[#6a4757]">{s.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Animated device preview */}
      <div className="relative mx-auto w-full max-w-sm lg:sticky lg:top-24">
        <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-[#E70C65]/20 via-[#ffd4e2]/40 to-transparent blur-2xl" />
        <div className="relative overflow-hidden rounded-[2.5rem] border border-[#E70C65]/20 bg-white/90 p-3 shadow-2xl shadow-[#E70C65]/15 backdrop-blur">
          <div className="relative h-[480px] w-full overflow-hidden rounded-[1.75rem] bg-gradient-to-b from-[#fff5f8] to-white p-6">
            <div key={activeStep} className="demo-fade h-full">
              <ActiveMock />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show step ${i + 1}`}
              onClick={() => setActiveStep(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeStep === i ? "w-8 bg-gradient-to-r from-[#E70C65] to-[#9F1C44]" : "w-1.5 bg-[#E70C65]/25"
              }`}
            />
          ))}
        </div>
      </div>

      <style>{`
        .demo-fade{animation:demoFade .5s ease-out}
        @keyframes demoFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion: reduce){.demo-fade{animation:none}}
      `}</style>
    </div>
  );
}

export function LandingPage() {
  const heroVideoRef = useRef(null);

  useEffect(() => {
    const video = heroVideoRef.current;
    if (!video) return;

    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fff9fb] text-[#3b0a1e]">
      <MeshBackground />

      {/* Nav */}
      <header className="relative z-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Logo />
          <div className="hidden items-center gap-8 text-sm text-[#6a4757] md:flex">
            <a href="#features" className="hover:text-[#9F1C44]">Features</a>
            <a href="#pricing" className="hover:text-[#9F1C44]">Pricing</a>
            <a href="#stories" className="hover:text-[#9F1C44]">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm text-[#6a4757] hover:text-[#9F1C44] sm:inline">Sign in</Link>
            <Link to="/register" className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[#E70C65]/30 transition hover:-translate-y-0.5 hover:shadow-lg">
              Get started <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-10 lg:px-10 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left Hero Content */}
          <FadeIn className="flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E70C65]/20 bg-white/70 px-3 py-1 text-xs font-medium text-[#9F1C44] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> The AI-powered digital card platform
              </span>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
                Your network,
                <br />
                <span className="bg-gradient-to-r from-[#E70C65] to-[#9F1C44] bg-clip-text text-transparent">elevated.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-[#6a4757]">
                Design a breathtaking digital business card, share it with a single link or QR, and let an AI assistant handle the follow-ups. Built for professionals who care about first impressions.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#E70C65]/30 transition hover:-translate-y-0.5">
                  Build your card <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </Link>
                <a href="#features" className="rounded-full border border-[#E70C65]/20 bg-white/70 px-5 py-3 text-sm text-[#3b0a1e] backdrop-blur hover:border-[#E70C65]/50">
                  Explore features
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["#9F1C44", "#E70C65", "#b3154b", "#cf0555"].map((c) => (
                    <span key={c} className="h-8 w-8 rounded-full ring-2 ring-[#fff9fb]" style={{ background: c }} />
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-[#E70C65] text-[#E70C65]" />
                    ))}
                  </div>
                  <p className="text-xs text-[#6a4757]">Loved by early professionals</p>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Hero Video with Audio Controls enabled */}
          <FadeIn delay={0.15} className="flex h-full items-center">
            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#E70C65]/20 via-[#ffd4e2]/40 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-[#E70C65]/20 bg-white/80 p-2.5 shadow-2xl shadow-[#E70C65]/10 backdrop-blur">
                <video
                  ref={heroVideoRef}
                  src="/1.mp4"
                  loop
                  playsInline
                  controls
                  className="h-[396px] sm:h-[440px] w-full rounded-2xl object-cover shadow-inner"
                />
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Audience */}
        <div className="mt-16">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[#9F1C44]">Built for</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {audience.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="group inline-flex items-center gap-2 rounded-full border border-[#E70C65]/20 bg-white/70 px-4 py-2 text-sm font-medium text-[#3b0a1e] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E70C65]/50 hover:bg-white hover:shadow-lg hover:shadow-[#E70C65]/10"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 border-y border-[#E70C65]/15 bg-white/60 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-semibold text-[#3b0a1e] sm:text-4xl">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-[#9F1C44]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionHeading eyebrow="Features" title="Everything to make a lasting impression." subtitle="Thoughtful details, refined visuals, and AI where it actually helps." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group relative overflow-hidden rounded-2xl border border-[#E70C65]/15 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:border-[#E70C65]/40 hover:shadow-xl hover:shadow-[#E70C65]/10">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#E70C65]/10 to-transparent opacity-0 transition group-hover:opacity-100" />
              <div className="relative">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-lg shadow-[#E70C65]/30">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[#6a4757]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionHeading eyebrow="Pricing" title="Simple plans that grow with you." subtitle="Start free, upgrade when your first impressions need superpowers." />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {realPlans.map((p) => {
            const Icon = PLAN_ICONS[p.id] || Zap;
            const highlight = p.popular;
            const bullets = [
              `${p.features.vCards} vCard${p.features.vCards > 1 ? "s" : ""}`,
              `${p.features.themes}+ premium themes`,
              p.features.aiChatWidget ? "AI chat widget" : "QR code + analytics",
              p.features.aiVoiceAgent ? "AI voice & WhatsApp agent" : p.features.hideBranding ? "Hide branding" : "Standard branding",
              `${p.features.support} support`,
            ];
            return (
              <div key={p.id} className={`relative overflow-hidden rounded-3xl border p-7 backdrop-blur transition hover:-translate-y-1 ${highlight ? "border-transparent bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white shadow-2xl shadow-[#E70C65]/40" : "border-[#E70C65]/15 bg-white/70 hover:shadow-xl hover:shadow-[#E70C65]/10"}`}>
                {highlight && (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" /> Most popular
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${highlight ? "bg-white/20" : "bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-white"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                </div>
                <div className="mt-6 flex items-end gap-1">
                  <span className="text-4xl font-semibold">₹{p.price.monthly}</span>
                  <span className={`pb-1 text-sm ${highlight ? "text-white/80" : "text-[#6a4757]"}`}>/ month</span>
                </div>
                <p className={`mt-2 text-sm ${highlight ? "text-white/85" : "text-[#6a4757]"}`}>{p.tagline}</p>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {bullets.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check className={`h-4 w-4 ${highlight ? "text-white" : "text-[#E70C65]"}`} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-medium transition ${highlight ? "bg-white text-[#9F1C44] hover:bg-white/90" : "bg-gradient-to-r from-[#E70C65] to-[#9F1C44] text-white hover:-translate-y-0.5"}`}>
                  Choose {p.name} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="stories" className="relative mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <SectionHeading eyebrow="Stories" title="Loved by professionals who care." />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-2xl border border-[#E70C65]/15 bg-white/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl hover:shadow-[#E70C65]/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-[#E70C65] text-[#E70C65]" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#3b0a1e]">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#E70C65] to-[#9F1C44] text-xs font-semibold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-[#6a4757]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 pb-24 lg:px-10">
        <SectionHeading eyebrow="How it works" title="Your card, live in four simple steps." subtitle="From sign-up to sharing — no design skills, no app installs, no waiting." />
        <StepsDemo />
        <div className="mt-14 flex justify-center">
          <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#E70C65] to-[#9F1C44] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#E70C65]/30 transition hover:-translate-y-0.5">
            Build your free card <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default LandingPage;