import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Home } from './pages/Home';
import { Resume } from './pages/Resume';
import { Login } from './pages/Login';
import { ClientLogin } from './pages/ClientLogin';
import { ClientDashboard } from './pages/ClientDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProjects } from './pages/AdminProjects';

export const App: React.FC = () => {
  return (
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
  );
};

export default App;
