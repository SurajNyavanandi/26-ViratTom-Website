import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, LogOut, Globe, Menu, X, Shield } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'kanusuraj15@gmail.com').trim().toLowerCase();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview & Leads', path: '/admin', icon: LayoutDashboard },
    { label: 'Client Projects', path: '/admin/projects', icon: FolderKanban },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-apple-gray-100 dark:bg-apple-black text-apple-black dark:text-white">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white dark:bg-[#1C1C1E] border-b border-apple-gray-200 dark:border-[#38383A] sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-apple-blue" />
          <span className="font-semibold text-[15px]">ViratTom Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E]"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-full md:w-64 bg-white dark:bg-[#1C1C1E] border-r border-apple-gray-200 dark:border-[#38383A] flex flex-col shrink-0 ${
          mobileMenuOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="p-6 hidden md:flex items-center gap-2.5 border-b border-apple-gray-100 dark:border-[#2C2C2E]">
          <div className="h-9 w-9 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center font-bold text-sm">
            VT
          </div>
          <div className="overflow-hidden">
            <h2 className="font-semibold text-[14px]">ViratTom Console</h2>
            <p className="text-[11px] text-apple-gray-400 truncate" title={adminEmail}>{adminEmail}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-[14px] font-medium transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-apple-blue text-white shadow-xs'
                    : 'text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] hover:text-apple-black dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-apple-gray-100 dark:border-[#2C2C2E] space-y-1.5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] text-apple-gray-500 hover:text-apple-black dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-colors min-h-[44px]"
          >
            <Globe className="h-4 w-4 shrink-0" />
            <span>Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13.5px] text-apple-red hover:bg-apple-red/10 transition-colors cursor-pointer min-h-[44px]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-60px)] md:min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
