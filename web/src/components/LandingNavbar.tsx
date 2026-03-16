'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { id: 'features', label: 'Core Features', href: '/features' },
  { id: 'how-it-works', label: 'How It Works', href: '/how-it-works' },
  { id: 'target-bands', label: 'Target Bands', href: '/target-bands' },
  { id: 'ai-chat', label: 'AI Chat', href: '/ai-chat' },
  { id: 'pricing', label: 'Pricing', href: '/pricing' },
  { id: 'contact', label: 'Contact', href: '/contact' },
  { id: 'privacy', label: 'Privacy', href: '/privacy' },
];

export default function LandingNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between h-16">
        
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="VSTEP Writing Logo" className="h-10 w-auto" />
        </Link>
        
        {/* Nav Items with Sliding Underline */}
        <div className="hidden lg:flex items-center gap-7 relative">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative py-5 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                  isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="landing-nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-900 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/login" className="hidden sm:block text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors">
            Log in
          </Link>
          <Link href="/register">
            <Button className="bg-gray-900 hover:bg-emerald-600 text-white rounded-full px-6 font-bold shadow-md transition-colors">
              Sign up for free
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}
