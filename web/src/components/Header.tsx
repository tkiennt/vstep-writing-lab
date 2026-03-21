'use client';

import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header({ role }: { role: 'user' | 'teacher' | 'admin' }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-700/50 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder={t('nav.search')}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Language switcher */}
        <LanguageSwitcher />

        <div className="h-5 w-px bg-slate-700 mx-1"></div>

        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 rounded-full w-9 h-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-slate-900"></span>
        </Button>

        <div className="h-5 w-px bg-slate-700 mx-1"></div>

        <div className="group relative">
          <button className="flex items-center gap-2.5 hover:bg-slate-800/60 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-slate-300 hidden sm:block">
              {user?.name || 'User'}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl shadow-black/50 border border-slate-700/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-700/50">
              <p className="text-sm font-bold text-slate-100">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                {role}
              </span>
            </div>
            <div className="p-2">
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 rounded-lg transition-colors">
                <UserIcon className="w-4 h-4" /> {t('nav.myProfile')}
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> {t('nav.accountSettings')}
              </Link>
            </div>
            <div className="p-2 border-t border-slate-700/50">
              <button onClick={() => logout()} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-400/80 hover:bg-red-950/50 hover:text-red-400 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
