import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Sparkles, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId) ||
        (sectionId === 'services' ? document.getElementById('process') : null) ||
        (sectionId === 'projects' ? document.getElementById('work') : null);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <header className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-5xl pointer-events-auto">
      {/* Floating Capsule Bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full rounded-full transition-all duration-300 border px-3.5 sm:px-5 h-13 sm:h-14 flex items-center justify-between ${
          isScrolled
            ? 'bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-xl border-apple-gray-200/90 dark:border-[#38383A]/90 shadow-[0_12px_36px_rgba(0,0,0,0.09)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.5)]'
            : 'bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-lg border-apple-gray-200/70 dark:border-[#38383A]/70 shadow-[0_6px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.35)]'
        }`}
      >
        {/* Left: Brand Logo & Subtle Divider */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-1.5 group select-none">
            <span className="uppercase tracking-widest text-[14px] sm:text-[15px] font-semibold text-apple-black dark:text-white">
              VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span>
            </span>
          </Link>
          <span className="hidden sm:inline text-apple-gray-300 dark:text-[#38383A] font-light text-[15px] select-none">
            /
          </span>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-medium text-apple-gray-600 dark:text-apple-gray-300">
          <a 
            href="/#services" 
            onClick={(e) => handleSectionClick(e, 'services')}
            className="hover:text-apple-black dark:hover:text-white transition-colors"
          >
            Services
          </a>
          <a 
            href="/#projects" 
            onClick={(e) => handleSectionClick(e, 'projects')}
            className="hover:text-apple-black dark:hover:text-white transition-colors"
          >
            Projects
          </a>
          <Link
            to="/resume"
            className={`flex items-center gap-1.5 hover:text-apple-black dark:hover:text-white transition-colors ${
              location.pathname === '/resume' ? 'text-apple-blue font-semibold' : ''
            }`}
          >
            <span>Resume Builder</span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-apple-blue/10 text-apple-blue">
              Free
            </span>
          </Link>
          <Link
            to="/client-login"
            className={`inline-flex items-center gap-1.5 hover:text-apple-black dark:hover:text-white transition-colors group ${
              location.pathname.startsWith('/client') || location.pathname === '/login' ? 'text-apple-blue font-semibold' : ''
            }`}
          >
            <span>Login</span>
            <LogIn className="h-3.5 w-3.5 text-apple-blue transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.a
            href="/#contact"
            onClick={(e) => handleSectionClick(e, 'contact')}
            whileHover={{ scale: 1.025, y: -0.5 }}
            whileTap={{ scale: 0.975 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-apple-blue text-white text-[12.5px] sm:text-[13px] font-medium hover:bg-[#0077ED] shadow-[0_2px_10px_rgba(0,113,227,0.3)] cursor-pointer select-none"
          >
            <span>Start a Project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </motion.div>

      {/* Floating Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden mt-2 rounded-2xl bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-xl border border-apple-gray-200/90 dark:border-[#38383A]/90 shadow-[0_16px_40px_rgba(0,0,0,0.12)] p-4 space-y-2 overflow-hidden"
          >
            <a
              href="/#services"
              onClick={(e) => handleSectionClick(e, 'services')}
              className="block py-2 px-3 rounded-xl text-[14px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-100/80 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Services
            </a>
            <a
              href="/#projects"
              onClick={(e) => handleSectionClick(e, 'projects')}
              className="block py-2 px-3 rounded-xl text-[14px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-100/80 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              Projects
            </a>
            <Link
              to="/resume"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 px-3 rounded-xl text-[14px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-100/80 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <span>Resume Builder</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-apple-blue/10 text-apple-blue">
                Free
              </span>
            </Link>
            <Link
              to="/client-login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 px-3 rounded-xl text-[14px] font-medium text-apple-gray-700 dark:text-apple-gray-200 hover:bg-apple-gray-100/80 dark:hover:bg-[#2C2C2E] transition-colors"
            >
              <span>Login</span>
              <LogIn className="h-4 w-4 text-apple-blue" />
            </Link>
            <div className="pt-2 border-t border-apple-gray-100 dark:border-[#2C2C2E]">
              <motion.a
                href="/#contact"
                onClick={(e) => handleSectionClick(e, 'contact')}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-apple-blue text-white text-[13.5px] font-medium shadow-xs"
              >
                <span>Start a Project</span>
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};


