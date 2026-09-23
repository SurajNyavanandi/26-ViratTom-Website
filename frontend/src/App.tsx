import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Loader2 } from 'lucide-react';

// Lazy-loaded page components for optimal bundle splitting
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Resume = lazy(() => import('./pages/Resume').then(m => ({ default: m.Resume })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const ClientLogin = lazy(() => import('./pages/ClientLogin').then(m => ({ default: m.ClientLogin })));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProjects = lazy(() => import('./pages/AdminProjects').then(m => ({ default: m.AdminProjects })));

const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-apple-gray-500">
    <Loader2 className="h-8 w-8 animate-spin text-apple-blue" />
    <span className="text-[13px] font-medium tracking-wide">Loading...</span>
  </div>
);

export const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resume" element={<Resume />} />
        </Route>

        {/* Authentication & Client Portals */}
        <Route path="/login" element={<Login />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/dashboard" element={<ClientDashboard />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
