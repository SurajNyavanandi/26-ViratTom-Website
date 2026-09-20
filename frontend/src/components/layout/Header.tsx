import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X } from 'lucide-react';

export const Header = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        return 'dark';
      }
    }
    return 'light';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-apple-gray-200/50 bg-white/70 backdrop-blur-md dark:border-[#38383A]/50 dark:bg-[#000000]/70">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8">
        <Link to="/" className="text-[20px] font-semibold tracking-tight">
          <span className="uppercase tracking-widest text-apple-gray-500 dark:text-apple-gray-400 text-[14px]">VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span></span>
        </Link>

        <nav className="hidden items-center space-x-8 md:flex">
          <button onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })} className="text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Projects</button>
          <button onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })} className="text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Services</button>
          <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Pricing</button>
          <Link to="/resume" className="text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Resume</Link>
          <button onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })} className="text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Contact</button>
        </nav>

        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/client-login" className="hidden md:flex items-center space-x-1 text-[14px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">
            <span>Login</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-apple-gray-500 hover:text-black dark:hover:text-white transition-colors">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-apple-gray-200/50 dark:border-[#38383A]/50 bg-white dark:bg-[#000000]">
          <nav className="flex flex-col p-4 space-y-4">
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Projects</button>
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Services</button>
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Pricing</button>
            <Link onClick={() => setMobileMenuOpen(false)} to="/resume" className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Resume</Link>
            <button onClick={() => { setMobileMenuOpen(false); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Contact</button>
            <Link onClick={() => setMobileMenuOpen(false)} to="/client-login" className="text-left text-[16px] text-apple-gray-500 transition-colors hover:text-black dark:text-apple-gray-400 dark:hover:text-white">Login</Link>
          </nav>
        </div>
      )}
    </header>
  );
};

