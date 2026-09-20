import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LogOut, ArrowLeft, Home } from 'lucide-react';

export const ClientLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('client_token')) {
      navigate('/client-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('client_token');
    navigate('/client-login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-apple-black text-apple-black dark:text-white">
      <header className="sticky top-0 z-50 w-full border-b border-apple-gray-200/80 dark:border-[#38383A]/80 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-apple-gray-100 dark:bg-[#2C2C2E] text-[13px] font-medium text-apple-gray-600 hover:text-black dark:text-apple-gray-300 dark:hover:text-white transition-colors"
              title="Return to Public Website"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
            <div className="h-4 w-px bg-apple-gray-300 dark:bg-[#38383A]" />
            <Link to="/client" className="text-[17px] sm:text-[20px] font-bold tracking-tight">
              Client Portal
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout} 
              className="text-[13px] sm:text-[14px] font-medium text-apple-gray-500 hover:text-apple-red dark:text-apple-gray-400 dark:hover:text-apple-red flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-apple-red/10 transition-colors"
            >
              <LogOut className="h-4 w-4" /> 
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};
