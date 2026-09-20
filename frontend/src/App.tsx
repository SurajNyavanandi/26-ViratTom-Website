import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ClientLayout } from './components/layout/ClientLayout';
import { Home } from './pages/Home';
import { Resume } from './pages/Resume';
import { Login } from './pages/Login';
import { ClientLogin } from './pages/ClientLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProjects, AdminHub } from './pages/AdminProjects';
import { ClientDashboard } from './pages/ClientDashboard';

function GlobalShortcuts() {
  const navigate = useNavigate();
  
  useEffect(() => {
    let lastKeyWas2 = false;
    let timeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.code === 'Digit2') {
          lastKeyWas2 = true;
          clearTimeout(timeout);
          timeout = setTimeout(() => { lastKeyWas2 = false; }, 1000);
        } else if (e.code === 'Digit6' && lastKeyWas2) {
          lastKeyWas2 = false;
          navigate('/login');
        } else {
          lastKeyWas2 = false;
        }
      } else {
        lastKeyWas2 = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalShortcuts />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="client-login" element={<ClientLogin />} />
        </Route>
        
        {/* Dedicated Resume Tool (Isolated) */}
        <Route path="/resume" element={<Resume />} />

        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Client Portal */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index element={<ClientDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="leads" element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="hub" element={<AdminHub />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}


