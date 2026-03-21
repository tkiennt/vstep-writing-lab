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
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder={t('nav.search')}
            className="w-full pl-9 pr-4 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">

        {/* Language switcher */}
        <LanguageSwitcher />

        <div className="h-5 w-px bg-border mx-1"></div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted border border-border hover:bg-accent hover:border-foreground/10 transition-all text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <div className="h-5 w-px bg-border mx-1"></div>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full w-9 h-9">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-card"></span>
        </Button>

        <div className="h-5 w-px bg-border mx-1"></div>

        <div className="group relative">
          <button className="flex items-center gap-2.5 hover:bg-muted p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-border">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:block">
              {user?.name || 'User'}
            </span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl shadow-2xl shadow-black/20 border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
            <div className="p-4 border-b border-border">
              <p className="text-sm font-bold text-foreground">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500">
                {role}
              </span>
            </div>
            <div className="p-2">
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
                <UserIcon className="w-4 h-4" /> {t('nav.myProfile')}
              </Link>
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
                <Settings className="w-4 h-4" /> {t('nav.accountSettings')}
              </Link>
            </div>
            <div className="p-2 border-t border-border">
              <button onClick={() => logout()} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors">
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
