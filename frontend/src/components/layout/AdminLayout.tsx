import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  FolderKanban, 
  Shield, 
  ArrowLeft, 
  Menu, 
  X, 
  Home, 
  LogOut, 
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navItems = [
    {
      to: '/admin',
      label: 'Project Requests',
      shortLabel: 'Requests',
      icon: Users,
      badge: 'Live',
      isActive: location.pathname === '/admin' || location.pathname === '/admin/leads'
    },
    {
      to: '/admin/projects',
      label: 'Active Projects',
      shortLabel: 'Projects',
      icon: FolderKanban,
      badge: '1 Active',
      isActive: location.pathname === '/admin/projects'
    },
    {
      to: '/admin/hub',
      label: 'Command Hub',
      shortLabel: 'Hub',
      icon: Shield,
      badge: null,
      isActive: location.pathname === '/admin/hub'
    }
  ];

  const currentNav = navItems.find(item => item.isActive) || navItems[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F5F5F7] dark:bg-[#000000] text-[#000000] dark:text-[#FFFFFF] antialiased">
      
      {/* ========================================================================= */}
      {/* 📱 MOBILE & TABLET STICKY APPLE HEADER (< 1024px)                        */}
      {/* ========================================================================= */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b border-[#E5E5EA] dark:border-[#38383A] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl">
        <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-2.5 min-w-0">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#E5E5EA]/70 dark:bg-[#2C2C2E] text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white transition-colors shrink-0"
              title="Return to Public Website"
              aria-label="Back to website"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-semibold tracking-wider uppercase text-[#555555] dark:text-[#A1A1A6]">
                VI<span className="text-[#0071E3]">R</span><span className="text-[#0071E3]">A</span>T TO<span className="text-[#0071E3]">M</span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#A1A1A6] shrink-0" />
              <span className="text-[14px] font-semibold text-[#000000] dark:text-white truncate">
                {currentNav.shortLabel}
              </span>
            </div>
          </div>

          {/* Right Action & Menu Toggle */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#E5E5EA]/60 dark:bg-[#2C2C2E] text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white transition-colors"
            >
              <span>Live Site</span>
              <ExternalLink className="h-3 w-3" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-10 w-10 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-[#000000] dark:text-white hover:bg-[#E5E5EA]/60 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Apple-style Segmented Navigation Strip for fast one-tap switching */}
        <div className="px-3 py-2 border-t border-[#E5E5EA] dark:border-[#38383A] bg-[#F5F5F7]/90 dark:bg-[#161618]/90 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex-1 min-h-[38px] flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200 ${
                    item.isActive
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#0071E3] dark:text-[#0071E3] shadow-sm font-semibold'
                      : 'text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{item.shortLabel}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                      item.isActive 
                        ? 'bg-[#0071E3]/10 text-[#0071E3]' 
                        : 'bg-[#E5E5EA] dark:bg-[#38383A] text-[#555555] dark:text-[#A1A1A6]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mobile Slide-down Sheet Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-[#E5E5EA] dark:border-[#38383A] bg-white dark:bg-[#1C1C1E] p-4 sm:p-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A6]">
              Admin Control Center
            </div>
            
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between min-h-[44px] px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      item.isActive
                        ? 'bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 font-semibold'
                        : 'text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        item.isActive ? 'bg-[#0071E3] text-white' : 'bg-[#E5E5EA] dark:bg-[#2C2C2E] text-[#555555] dark:text-[#A1A1A6]'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5E5EA] dark:bg-[#38383A] text-[#555555] dark:text-[#A1A1A6] font-medium">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 mt-2 border-t border-[#E5E5EA] dark:border-[#2C2C2E] space-y-1.5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 min-h-[44px] px-4 py-3 rounded-xl text-[15px] font-medium text-[#555555] dark:text-[#A1A1A6] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]"
              >
                <Home className="h-5 w-5 text-[#0071E3]" />
                <span>Return to Public Website</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 min-h-[44px] px-4 py-3 rounded-xl text-[15px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 🖥️ DESKTOP APPLE SIDEBAR (>= 1024px)                                      */}
      {/* ========================================================================= */}
      <aside className="w-72 shrink-0 border-r border-[#E5E5EA] dark:border-[#38383A] bg-white/70 dark:bg-[#1C1C1E]/70 backdrop-blur-xl p-6 hidden lg:flex lg:flex-col justify-between sticky top-0 h-screen">
        <div className="space-y-6">
          
          {/* Logo & Header */}
          <div>
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-[#E5E5EA] dark:border-[#38383A] text-[13px] font-medium text-[#555555] hover:text-[#000000] dark:text-[#A1A1A6] dark:hover:text-white transition-all shadow-xs hover:scale-[1.02] mb-5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#0071E3] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold tracking-tight text-[#000000] dark:text-white">
                  VI<span className="text-[#0071E3]">R</span><span className="text-[#0071E3]">A</span>T TO<span className="text-[#0071E3]">M</span>
                </h2>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A6]">
                  Admin Workspace
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#A1A1A6]">
              Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 ${
                    item.isActive
                      ? 'bg-[#0071E3] text-white shadow-[0_2px_8px_rgba(0,113,227,0.3)] font-semibold'
                      : 'text-[#555555] dark:text-[#A1A1A6] hover:text-[#000000] dark:hover:text-white hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.isActive 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#E5E5EA] dark:bg-[#38383A] text-[#555555] dark:text-[#A1A1A6]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="pt-6 border-t border-[#E5E5EA] dark:border-[#38383A] space-y-3">
          <div className="p-3 rounded-xl bg-[#F5F5F7] dark:bg-[#2C2C2E]/60 border border-[#E5E5EA] dark:border-[#38383A]">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#000000] dark:text-white">Admin Session</span>
              <span className="h-2 w-2 rounded-full bg-[#34C759]" />
            </div>
            <p className="text-[11px] text-[#A1A1A6] mt-0.5 truncate">
              admin261125@gmail.com
            </p>
          </div>

          <button 
            onClick={handleLogout} 
            className="w-full min-h-[44px] flex items-center justify-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[14px] font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 📄 MAIN VIEW CONTAINER                                                    */}
      {/* ========================================================================= */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
