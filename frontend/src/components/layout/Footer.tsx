import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Lock, ExternalLink, Mail, LogIn } from 'lucide-react';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleAdminLockClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      navigate('/login');
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 600);
    }
  };

  const googleMapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('ARC Property Solutions Pvt. Ltd., Kakatiya Hills, Guttala Begumpet, Jubilee Hills, Hyderabad, Telangana 500081');

  return (
    <footer className="border-t border-apple-gray-200 bg-apple-gray-100 py-12 sm:py-16 text-apple-gray-600 transition-colors">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Company Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-semibold text-[15px] tracking-tight text-apple-gray-900 mb-2">
                <span className="uppercase tracking-widest text-[15px]">
                  VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span>
                </span>
                <span className="ml-2 text-[12px] font-normal text-apple-gray-400">Technologies</span>
              </h3>
              <p className="text-[13.5px] leading-relaxed text-apple-gray-600 max-w-md">
                We build modern, fast websites and mobile apps that help your business grow and reach more customers online.
              </p>
            </div>

            {/* Corporate Office Address Box */}
            <div className="p-3.5 rounded-xl bg-white border border-apple-gray-200/80 shadow-2xs max-w-lg">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-apple-blue/10 text-apple-blue shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-1 text-[13px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-apple-gray-900 text-[12px] uppercase tracking-wider">
                      Corporate Office
                    </span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-apple-blue hover:underline font-medium"
                      title="View office location on Google Maps"
                    >
                      <span>Directions</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <address className="not-italic leading-relaxed text-apple-gray-700 text-[12.5px]">
                    <span className="font-medium text-apple-gray-900">ARC Property Solutions Pvt. Ltd.</span>, 2nd Floor, Plot no, 24 & 25, Lane, beside Kakatiya Hills, Kakatiya Hills, Guttala_Begumpet, Kamaan, Jubilee Hills, Hyderabad, Telangana 500081
                  </address>
                </div>
              </div>
            </div>

            {/* Social Media & Contact Links */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href="mailto:virattom26@gmail.com"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-apple-gray-200 text-apple-gray-700 hover:text-apple-blue hover:border-apple-blue/40 transition-all text-[12.5px] font-medium shadow-2xs hover:scale-[1.02]"
                title="Send an email to virattom26@gmail.com"
              >
                <Mail className="w-3.5 h-3.5 text-apple-blue" />
                <span>virattom26@gmail.com</span>
              </a>
              <a
                href="https://github.com/SurajNyavanandi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-apple-gray-200 text-apple-gray-700 hover:text-apple-black hover:border-apple-gray-400 transition-all text-[12.5px] font-medium shadow-2xs hover:scale-[1.02]"
                title="Suraj Nyavanandi on GitHub"
              >
                <GithubIcon className="w-3.5 h-3.5 text-apple-black" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/suraj-nyavanandi-305962286"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-apple-gray-200 text-apple-gray-700 hover:text-apple-blue hover:border-apple-blue/40 transition-all text-[12.5px] font-medium shadow-2xs hover:scale-[1.02]"
                title="Suraj Nyavanandi on LinkedIn"
              >
                <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/virat.tom/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-apple-gray-200 text-apple-gray-700 hover:text-[#E4405F] hover:border-[#E4405F]/40 transition-all text-[12.5px] font-medium shadow-2xs hover:scale-[1.02]"
                title="ViratTom on Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-[#E4405F]" />
                <span>Instagram</span>
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h3 className="font-semibold text-[14px] text-apple-gray-900 mb-3.5">Services</h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Web Development
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Mobile App Development
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  SaaS Web Applications
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  E-Commerce Websites
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  UI/UX Design
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="font-semibold text-[14px] text-apple-gray-900 mb-3.5">Resources</h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link
                  to="/resume"
                  className="inline-flex items-center gap-1.5 font-medium text-apple-blue hover:underline"
                >
                  Free ATS Resume Builder
                </Link>
              </li>
              <li>
                <Link to="/client-login" className="inline-flex items-center gap-1.5 hover:text-apple-blue transition-colors">
                  <LogIn className="h-3.5 w-3.5 text-apple-blue" />
                  <span>Login</span>
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Tech Stack
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Operations */}
          <div>
            <h3 className="font-semibold text-[14px] text-apple-gray-900 mb-3.5">Company</h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  About ViratTom
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-apple-blue transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/SurajNyavanandi"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-apple-blue transition-colors"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar with Secret Admin Access */}
        <div className="mt-12 pt-8 border-t border-apple-gray-300/80 text-center text-[13px] text-apple-gray-500 flex items-center justify-center gap-2">
          <button
            onClick={handleAdminLockClick}
            type="button"
            className="p-1 opacity-0 hover:opacity-30 transition-opacity duration-300 cursor-pointer"
            aria-label="Secret Admin Access"
          >
            <Lock className="h-3.5 w-3.5 text-apple-gray-500" />
          </button>
          <div>
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-medium text-apple-gray-800">
              <span className="uppercase tracking-widest text-[13px]">
                VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span>
              </span>{' '}
              Technologies
            </span>
            . All rights reserved. Hyderabad, Telangana, India.
          </div>
        </div>
      </div>
    </footer>
  );
};
