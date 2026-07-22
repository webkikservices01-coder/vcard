import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import AdminLayout from './components/AdminLayout';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';

// Auth
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

// Dashboard
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import Plans from './pages/Plans';
import Transactions from './pages/Transactions';
import Support from './pages/Support';

// vCard
import AllVcards from './pages/vCard/AllVcards';
import Theme from './pages/vCard/Theme';
import VcardProfile from './pages/vCard/VcardProfile';
import ContactDetails from './pages/vCard/ContactDetails';
import Products from './pages/vCard/Products';
import Portfolio from './pages/vCard/Portfolio';
import Gallery from './pages/vCard/Gallery';
import Testimonials from './pages/vCard/Testimonials';
import QrCode from './pages/vCard/QrCode';
import CustomSections from './pages/vCard/CustomSections';
import ReorderSections from './pages/vCard/ReorderSections';
import AdvancedSettings from './pages/vCard/AdvancedSettings';
import AiPersona from './pages/vCard/AiPersona';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminSupport from './pages/admin/AdminSupport';
import AdminCards from './pages/admin/AdminCards';

// Public
import PublicVcard from './pages/PublicVcard';

// Legal / info pages
import AboutUs from './pages/legal/AboutUs';
import ContactUs from './pages/legal/ContactUs';
import Faqs from './pages/legal/Faqs';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import RefundPolicy from './pages/legal/RefundPolicy';
import CancellationPolicy from './pages/legal/CancellationPolicy';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      <Routes>
        {/* Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public vCard */}
        <Route path="/c/:slug" element={<PublicVcard />} />

        {/* Legal / info pages */}
        <Route path="/about-us"             element={<AboutUs />} />
        <Route path="/contact-us"           element={<ContactUs />} />
        <Route path="/faqs"                 element={<Faqs />} />
        <Route path="/privacy-policy"       element={<PrivacyPolicy />} />
        <Route path="/terms-conditions"     element={<TermsConditions />} />
        <Route path="/refund-policy"        element={<RefundPolicy />} />
        <Route path="/cancellation-policy"  element={<CancellationPolicy />} />

        {/* Quick onboarding (post-login gate until card basics are filled) */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

        {/* User dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="vcard/all"        element={<AllVcards />} />
          <Route path="vcard/theme"      element={<Theme />} />
          <Route path="vcard/profile"    element={<VcardProfile />} />
          <Route path="vcard/contact"    element={<ContactDetails />} />
          <Route path="vcard/products"   element={<Products />} />
          <Route path="vcard/portfolio"  element={<Portfolio />} />
          <Route path="vcard/gallery"    element={<Gallery />} />
          <Route path="vcard/testimonials" element={<Testimonials />} />
          <Route path="vcard/qr"         element={<QrCode />} />
          <Route path="vcard/custom"     element={<CustomSections />} />
          <Route path="vcard/reorder"    element={<ReorderSections />} />
          <Route path="vcard/advanced"   element={<AdvancedSettings />} />
          <Route path="vcard/ai-persona" element={<AiPersona />} />
          <Route path="plans"            element={<Plans />} />
          <Route path="transactions"     element={<Transactions />} />
          <Route path="support"          element={<Support />} />
          <Route path="profile"          element={<UserProfile />} />
        </Route>

        {/* Admin panel */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users"        element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="support"      element={<AdminSupport />} />
          <Route path="cards"        element={<AdminCards />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
