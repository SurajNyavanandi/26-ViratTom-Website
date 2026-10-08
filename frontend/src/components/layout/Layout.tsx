import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Outlet } from 'react-router-dom';
import { WhatsAppWidget } from '../whatsapp/WhatsAppWidget';

export const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-1 bg-white pt-16 sm:pt-20">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Verified WhatsApp Action Button */}
      <WhatsAppWidget />
    </div>
  );
};

