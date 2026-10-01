import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider, Spinner } from './components/ui';
import Layout from './components/Layout';
import Login from './pages/Login';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const UsersPage = lazy(() => import('./pages/Users'));
const UserDetail = lazy(() => import('./pages/UserDetail'));
const Cards = lazy(() => import('./pages/Cards'));
const Payments = lazy(() => import('./pages/Payments'));
const Plans = lazy(() => import('./pages/Plans'));
const Admins = lazy(() => import('./pages/Admins'));
const Audit = lazy(() => import('./pages/Audit'));
const Support = lazy(() => import('./pages/Support'));
const Logs = lazy(() => import('./pages/Logs'));
const Account = lazy(() => import('./pages/Account'));
const Leads = lazy(() => import('./pages/Leads'));

function Guarded({ perm, children }) {
  const { can } = useAuth();
  if (perm && !can(perm)) return <Navigate to="/" replace />;
  return <Suspense fallback={<Spinner />}>{children}</Suspense>;
}

function Shell() {
  const { loading, admin } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner label="Checking your session" />
      </div>
    );
  return (
    <Routes>
      <Route path="/login" element={admin ? <Navigate to="/" replace /> : <Login />} />
      <Route element={admin ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Guarded perm="dashboard.view"><Dashboard /></Guarded>} />
        <Route path="users" element={<Guarded perm="users.view"><UsersPage /></Guarded>} />
        <Route path="users/:id" element={<Guarded perm="users.view"><UserDetail /></Guarded>} />
        <Route path="cards" element={<Guarded perm="cards.view"><Cards /></Guarded>} />
        <Route path="payments" element={<Guarded perm="payments.view"><Payments /></Guarded>} />
        <Route path="plans" element={<Guarded perm="plans.view"><Plans /></Guarded>} />
        <Route path="support" element={<Guarded perm="support.view"><Support /></Guarded>} />
        <Route path="leads" element={<Guarded perm="leads.view"><Leads /></Guarded>} />
        <Route path="admins" element={<Guarded perm="admins.manage"><Admins /></Guarded>} />
        <Route path="audit" element={<Guarded perm="audit.view"><Audit /></Guarded>} />
        <Route path="logs" element={<Guarded perm="logs.view"><Logs /></Guarded>} />
        <Route path="account" element={<Guarded><Account /></Guarded>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <ToastProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
