import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 dark:bg-apple-black/80 backdrop-blur-md border-b border-apple-gray-200 dark:border-[#38383A] shadow-xs'
          : 'bg-white dark:bg-apple-black border-b border-apple-gray-100 dark:border-[#2C2C2E]'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
          <span className="uppercase tracking-widest text-[16px] font-semibold text-apple-black dark:text-white">
            VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-apple-gray-600 dark:text-apple-gray-300">
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
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-apple-blue/10 text-apple-blue">
              Free
            </span>
          </Link>
          <Link
            to="/client-login"
            className={`hover:text-apple-black dark:hover:text-white transition-colors ${
              location.pathname.startsWith('/client') ? 'text-apple-blue font-semibold' : ''
            }`}
          >
            Client Portal
          </Link>
        </nav>

        {/* Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          {location.pathname === '/' && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-apple-gray-500 hover:text-apple-black dark:hover:text-white hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <a
            href="/#contact"
            onClick={(e) => handleSectionClick(e, 'contact')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-apple-blue text-white text-[13px] font-medium hover:bg-apple-blue/90 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Start a Project</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {location.pathname === '/' && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-apple-gray-500 hover:text-apple-black dark:hover:text-white"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-apple-gray-600 dark:text-apple-gray-300 hover:bg-apple-gray-100 dark:hover:bg-[#2C2C2E]"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-apple-gray-200 dark:border-[#38383A] bg-white dark:bg-apple-black px-4 py-5 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <a
            href="/#services"
            onClick={(e) => handleSectionClick(e, 'services')}
            className="block py-2 text-[14px] font-medium text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white"
          >
            Services
          </a>
          <a
            href="/#projects"
            onClick={(e) => handleSectionClick(e, 'projects')}
            className="block py-2 text-[14px] font-medium text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white"
          >
            Projects
          </a>
          <Link
            to="/resume"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between py-2 text-[14px] font-medium text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white"
          >
            <span>Resume Builder</span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-apple-blue/10 text-apple-blue">
              Free
            </span>
          </Link>
          <Link
            to="/client-login"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[14px] font-medium text-apple-gray-600 dark:text-apple-gray-300 hover:text-apple-black dark:hover:text-white"
          >
            Client Portal
          </Link>
          <div className="pt-2">
            <a
              href="/#contact"
              onClick={(e) => handleSectionClick(e, 'contact')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-apple-blue text-white text-[14px] font-medium"
            >
              <span>Start a Project</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
