import React from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
<<<<<<< HEAD

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
=======
import { CustomerChatLauncher } from './chat/CustomerChatLauncher';
import { CustomerChatWidget } from './chat/CustomerChatWidget';

export const Layout: React.FC = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-[linear-gradient(180deg,#070b15_0%,#101727_12%,#f5f7fb_28%,#ffffff_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,#dc143c22_0%,transparent_42%),radial-gradient(circle_at_25%_18%,#0066cc20_0%,transparent_36%)]" />
      <Header />
      <main className="relative flex-1">
        <Outlet />
      </main>
      <CustomerChatLauncher />
      <CustomerChatWidget />
>>>>>>> main
      <Footer />
    </div>
  );
};
