import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Invalid credentials. Please verify your details.');
      }
    } catch (err) {
      setError('Connection error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-apple-gray-100 dark:bg-apple-black text-apple-black dark:text-apple-white antialiased">
      
      {/* Top Bar with Apple Back navigation */}
      <header className="w-full max-w-360 mx-auto px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-apple-gray-200 dark:border-[#38383A] text-[14px] font-medium text-apple-gray-500 dark:text-apple-gray-400 hover:text-apple-black dark:hover:text-white transition-all shadow-xs hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[13px] text-apple-gray-400">
          <ShieldCheck className="h-4 w-4 text-apple-green" />
          <span className="hidden sm:inline font-medium">Admin Access</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-105 bg-white dark:bg-[#1C1C1E] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-apple-gray-200 dark:border-[#38383A] shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all">
          
          {/* Header Icon & Typography */}
          <div className="text-center mb-8">
            <div className="h-14 w-14 rounded-2xl bg-apple-blue/10 text-apple-blue flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-[26px] sm:text-[32px] font-bold tracking-tight text-apple-black dark:text-white leading-tight">
              Admin Sign In
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[14px] font-medium text-apple-black dark:text-white mb-2">
                Email / Username
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin261125@gmail.com"
                  className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 text-[16px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[14px] font-medium text-apple-black dark:text-white">
                  Password
                </label>
              </div>
              <div className="relative">
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-12 rounded-xl border border-apple-gray-300 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#2C2C2E] px-4 py-3 text-[16px] text-apple-black dark:text-white placeholder:text-apple-gray-400 focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-apple-red/10 border border-apple-red/20 flex items-start gap-2.5 text-apple-red text-[13px] animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 rounded-xl bg-apple-blue text-white font-medium text-[15px] hover:bg-[#0077ED] active:scale-[0.98] hover:-translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(0,113,227,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full max-w-360 mx-auto px-4 py-6 text-center text-[12px] text-apple-gray-400">
        &copy; {new Date().getFullYear()} ViratTom. All rights reserved.
      </footer>
    </div>
  );
};