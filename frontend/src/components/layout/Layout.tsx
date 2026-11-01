import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';
import { WhatsAppWidget } from '../whatsapp/WhatsAppWidget';
import { StippledBackground } from '../common/StippledBackground';
import { AmbientWatermark } from '../common/AmbientWatermark';
import { safeFetchJson } from '@/lib/utils';

export const Layout = () => {
  useEffect(() => {
    safeFetchJson('/api/track-visit', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative bg-white dark:bg-black">
      <StippledBackground />
      <AmbientWatermark />
      <Header />
      <main className="flex-1 relative z-10 pt-16 sm:pt-20">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Verified WhatsApp Action Button */}
      <WhatsAppWidget />
    </div>
  );
};
