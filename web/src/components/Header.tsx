'use client';

import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTheme } from '@/components/ThemeProvider';

export function Header({ role }: { role: 'user' | 'teacher' | 'admin' }) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  
  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
          <input 
            type="text" 
            placeholder={t('nav.search')}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Language switcher */}
        <LanguageSwitcher />

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full w-9 h-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </Button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <div className="group relative">
          <button className="flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">
              {user?.name || 'User'}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-black/10 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                {role}
              </span>
            </div>
            <div className="p-2">
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors">
                <UserIcon className="w-4 h-4" /> {t('nav.myProfile')}
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> {t('nav.accountSettings')}
              </Link>
            </div>
            <div className="p-2 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => logout()} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-500 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
