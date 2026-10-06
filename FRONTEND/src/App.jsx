import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { PRICING_ENABLED } from './utils/plan';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
import { ADMIN_URL } from './utils/adminUrl';
import ScrollToTop from './components/ScrollToTop';
import Seo from './components/Seo';
const PlatformChatWidget = lazy(() => import('./components/platformChat/PlatformChatWidget'));

// Auth
const LandingPage = lazy(() => import('./pages/LandingPage'));
const MetalNfcCard = lazy(() => import('./pages/MetalNfcCard'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Impersonate = lazy(() => import('./pages/Impersonate'));
const WeddingShowcase = lazy(() => import('./pages/wedding/WeddingShowcase'));
const WeddingTemplatePage = lazy(() => import('./pages/wedding/WeddingTemplatePage'));
const InvitePage = lazy(() => import('./pages/wedding/InvitePage'));
const WeddingPreviewFrame = lazy(() => import('./pages/wedding/WeddingPreviewFrame'));
const WeddingDashboard = lazy(() => import('./pages/WeddingDashboard'));
const ImpersonationBanner = lazy(() => import('./components/ImpersonationBanner'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Dashboard
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Plans = lazy(() => import('./pages/Plans'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Support = lazy(() => import('./pages/Support'));
const GetCard = lazy(() => import('./pages/GetCard'));

// vCard
const AllVcards = lazy(() => import('./pages/vCard/AllVcards'));
const Theme = lazy(() => import('./pages/vCard/Theme'));
const VcardProfile = lazy(() => import('./pages/vCard/VcardProfile'));
const ContactDetails = lazy(() => import('./pages/vCard/ContactDetails'));
const Products = lazy(() => import('./pages/vCard/Products'));
const Portfolio = lazy(() => import('./pages/vCard/Portfolio'));
const Gallery = lazy(() => import('./pages/vCard/Gallery'));
const Highlights = lazy(() => import('./pages/vCard/Highlights'));
const Enquiries = lazy(() => import('./pages/vCard/Enquiries'));
const Testimonials = lazy(() => import('./pages/vCard/Testimonials'));
const QrCode = lazy(() => import('./pages/vCard/QrCode'));
const CustomSections = lazy(() => import('./pages/vCard/CustomSections'));
const ReorderSections = lazy(() => import('./pages/vCard/ReorderSections'));
const AdvancedSettings = lazy(() => import('./pages/vCard/AdvancedSettings'));
const AiPersona = lazy(() => import('./pages/vCard/AiPersona'));
const AiInsights = lazy(() => import('./pages/vCard/AiInsights'));


// Public
const PublicVcard = lazy(() => import('./pages/PublicVcard'));

// Legal / info pages
const AboutUs = lazy(() => import('./pages/legal/AboutUs'));
const ContactUs = lazy(() => import('./pages/legal/ContactUs'));
const Faqs = lazy(() => import('./pages/legal/Faqs'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/legal/TermsConditions'));
const RefundPolicy = lazy(() => import('./pages/legal/RefundPolicy'));
const CancellationPolicy = lazy(() => import('./pages/legal/CancellationPolicy'));
const DataProcessingAddendum = lazy(() => import('./pages/legal/DataProcessingAddendum'));
const AiDataPrivacy = lazy(() => import('./pages/legal/AiDataPrivacy'));

// Cardy's chat bubble is mounted a moment after the page has loaded, so its code doesn't
// compete with the page itself for the first paint.
function DeferredChatWidget() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer;
    const go = () => { timer = setTimeout(() => setReady(true), 1500); };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('load', go);
    };
  }, []);
  return ready ? (
    <Suspense fallback={null}>
      <PlatformChatWidget />
    </Suspense>
  ) : null;
}

function GoToAdmin() {
  useEffect(() => {
    window.location.replace(ADMIN_URL);
  }, []);
  return null;
}

// Each page loads as its own chunk; this shows while one is fetched.
const PageLoader = () => (
  <div className="grid min-h-[50vh] place-items-center" aria-busy="true" aria-label="Loading">
    <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#E70C65]/25 border-t-[#E70C65]" />
  </div>
);
const page = (el) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

// Fetch the chunks people usually open next once the first page is idle, so clicks feel instant.
const PREFETCH = [
  () => import('./pages/Login'),
  () => import('./pages/Register'),
  () => import('./components/DashboardLayout'),
  () => import('./pages/Dashboard'),
  () => import('./pages/Onboarding'),
  () => import('./pages/PublicVcard'),
];
// Signed-in owners also get the card templates + Template Studio (the heaviest dashboard page)
// ahead of time; visitors of the homepage don't download them.
const SITE_PAGES = ['/', '/login', '/register', '/forgot-password', '/features', '/pricing', '/metal-nfc-card', '/about-us', '/contact-us', '/faqs'];
const PREFETCH_OWNER = [() => import('./webcard/WebCard'), () => import('./pages/vCard/Theme')];

// Everything inside the router. The browser wraps it in <BrowserRouter> (App below); the build's
// homepage prerender (scripts/prerender.mjs) wraps it in a StaticRouter.
// Only while an admin uses "Sign in as user" (no extra download for anyone else).
const hasImpersonation = () => {
  try {
    return typeof window !== 'undefined' && !!localStorage.getItem('aicardly_impersonating');
  } catch {
    return false;
  }
};

export function AppRoutes() {
  // Re-render on navigation, so the admin banner appears right after "Sign in as user".
  useLocation();
  useEffect(() => {
    // Wake the serverless backend (and its DB connection) before the user logs in.
    fetch(`${import.meta.env.VITE_API_URL}/api/ping`).catch(() => {});
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
    let signedIn = false;
    try {
      signedIn = !!localStorage.getItem('token');
    } catch {
      /* storage blocked */
    }
    // Only on the site's own pages: someone opening a card (often on a phone) shouldn't download
    // the dashboard in the background while the card is still loading.
    const path = window.location.pathname;
    const sitePage = SITE_PAGES.includes(path) || /^\/(dashboard|onboarding|admin)(\/|$)/.test(path);
    if (!sitePage) return;
    // Wait for the visitor's first touch/scroll/key before prefetching, so the first view on a phone
    // only downloads what it shows.
    const EVENTS = ['pointerdown', 'pointermove', 'touchstart', 'keydown', 'scroll', 'wheel'];
    const start = () => {
      EVENTS.forEach((e) => window.removeEventListener(e, start));
      idle(() => [...PREFETCH, ...(signedIn ? PREFETCH_OWNER : [])].forEach((load) => load().catch(() => {})));
    };
    EVENTS.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, start));
  }, []);

  return (
    <>
      <ScrollToTop />
      <Seo />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      <DeferredChatWidget />
      {hasImpersonation() ? (
        <Suspense fallback={null}>
          <ImpersonationBanner />
        </Suspense>
      ) : null}
      <Routes>
        {/* Auth */}
        <Route path="/" element={page(<LandingPage />)} />
        <Route path="/login" element={page(<Login />)} />
        <Route path="/register" element={page(<Register />)} />
        <Route path="/forgot-password" element={page(<ForgotPassword />)} />
        <Route path="/reset-password" element={page(<ForgotPassword />)} />
        <Route path="/verify-email" element={page(<VerifyEmail />)} />
        <Route path="/impersonate" element={page(<Impersonate />)} />
        {/* Wedding invitations */}
        <Route path="/wedding" element={page(<WeddingShowcase />)} />
        <Route path="/wedding/:slug" element={page(<WeddingTemplatePage />)} />
        <Route path="/wedding-preview" element={page(<WeddingPreviewFrame />)} />
        <Route path="/invite/:link" element={page(<InvitePage />)} />

        <Route path="/metal-nfc-card" element={page(<MetalNfcCard />)} />
        <Route path="/features" element={page(<FeaturesPage />)} />
        <Route path="/pricing" element={page(<PricingPage />)} />

        {/* Public vCard */}
        {/* Cards live at /<username>; the older /c/<username> links keep working. */}
        <Route path="/c/:slug" element={page(<PublicVcard />)} />
        <Route path="/:slug" element={page(<PublicVcard />)} />

        {/* Legal / info pages */}
        <Route path="/about-us"             element={page(<AboutUs />)} />
        <Route path="/contact-us"           element={page(<ContactUs />)} />
        <Route path="/faqs"                 element={page(<Faqs />)} />
        <Route path="/privacy-policy"       element={page(<PrivacyPolicy />)} />
        <Route path="/terms-conditions"     element={page(<TermsConditions />)} />
        <Route path="/refund-policy"        element={page(<RefundPolicy />)} />
        <Route path="/cancellation-policy"  element={page(<CancellationPolicy />)} />
        <Route path="/data-processing-addendum" element={page(<DataProcessingAddendum />)} />
        <Route path="/ai-data-privacy"      element={page(<AiDataPrivacy />)} />

        {/* Quick onboarding (post-login gate until card basics are filled) */}
        <Route path="/onboarding" element={<ProtectedRoute>{page(<Onboarding />)}</ProtectedRoute>} />

        {/* User dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute>{page(<DashboardLayout />)}</ProtectedRoute>}>
          <Route index element={page(<Dashboard />)} />
          <Route path="vcard/all"        element={page(<AllVcards />)} />
          <Route path="vcard/theme"      element={page(<Theme />)} />
          <Route path="vcard/profile"    element={page(<VcardProfile />)} />
          <Route path="vcard/contact"    element={page(<ContactDetails />)} />
          <Route path="vcard/services"   element={page(<Products key="service" kind="service" />)} />
          <Route path="vcard/products"   element={page(<Products key="product" kind="product" />)} />
          <Route path="vcard/portfolio"  element={page(<Portfolio />)} />
          <Route path="vcard/gallery"    element={page(<Gallery />)} />
          <Route path="vcard/highlights" element={page(<Highlights />)} />
          <Route path="vcard/enquiries"  element={page(<Enquiries />)} />
          <Route path="vcard/testimonials" element={page(<Testimonials />)} />
          <Route path="vcard/qr"         element={page(<QrCode />)} />
          <Route path="vcard/custom"     element={page(<CustomSections />)} />
          <Route path="vcard/reorder"    element={page(<ReorderSections />)} />
          <Route path="vcard/advanced"   element={page(<AdvancedSettings />)} />
          <Route path="vcard/ai-persona" element={page(<AiPersona />)} />
          <Route path="vcard/ai-insights" element={page(<AiInsights />)} />
          {/* Pricing is switched off: plans/transactions pages redirect to the dashboard. */}
          <Route path="plans"            element={PRICING_ENABLED ? page(<Plans />) : <Navigate to="/dashboard" replace />} />
          <Route path="transactions"     element={PRICING_ENABLED ? page(<Transactions />) : <Navigate to="/dashboard" replace />} />
          <Route path="support"          element={page(<Support />)} />
          <Route path="wedding"          element={page(<WeddingDashboard />)} />
          <Route path="get-card"         element={page(<GetCard />)} />
          <Route path="profile"          element={page(<UserProfile />)} />
        </Route>

        {/* The admin panel moved to its own app (ADMIN/, served by the backend); old links go there. */}
        <Route path="/admin/*" element={<GoToAdmin />} />

        <Route path="*" element={page(<NotFound />)} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
