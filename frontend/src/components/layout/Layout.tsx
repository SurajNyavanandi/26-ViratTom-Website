import React, { useRef } from 'react';
import { Header } from './Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { ChatWidget } from '../chat/ChatWidget';

export const Layout = () => {
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

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1 bg-white dark:bg-apple-black">
        <Outlet />
      </main>
      <footer className="border-t border-apple-gray-200 dark:border-[#38383A] bg-apple-gray-100 dark:bg-[#1C1C1E] py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-[14px] mb-4"><span className="uppercase tracking-widest text-apple-gray-500 dark:text-apple-gray-400 text-[14px]">VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span></span></h3>
              <p className="text-[14px] text-apple-gray-500 dark:text-apple-gray-400">Premium Website & Mobile Development.</p>
            </div>
            <div>
              <h3 className="font-semibold text-[14px] mb-4">Services</h3>
              <ul className="space-y-2 text-[14px] text-apple-gray-500 dark:text-apple-gray-400">
                <li>Web Development</li>
                <li>App Development</li>
                <li>UI/UX Design</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[14px] mb-4">Resources</h3>
              <ul className="space-y-2 text-[14px] text-apple-gray-500 dark:text-apple-gray-400">
                <li>Resume Generator</li>
                <li>Blog</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[14px] mb-4">Legal</h3>
              <ul className="space-y-2 text-[14px] text-apple-gray-500 dark:text-apple-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-apple-gray-300 dark:border-[#38383A] text-center text-[14px] text-apple-gray-500 flex items-center justify-center gap-1.5">
            <button
              onClick={handleAdminLockClick}
              type="button"
              className="p-1 opacity-0 hover:opacity-25 transition-opacity duration-300 cursor-pointer"
              aria-label="Secret Admin Access"
            >
              <Lock className="h-3 w-3 text-apple-gray-500" />
            </button>
            <div>&copy; {new Date().getFullYear()} <span className="uppercase tracking-widest text-apple-gray-500 dark:text-apple-gray-400 text-[14px]">VI<span className="font-bold text-apple-blue">R</span><span className="font-bold text-apple-blue">A</span>T TO<span className="font-bold text-apple-blue">M</span></span>. All rights reserved.</div>
          </div>
        </div>
      </footer>

      {/* Floating Dynamic AI Assistant */}
      <ChatWidget />
    </div>
  );
};

