'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PenTool, FileText, BookOpen, Database,
  Users, Cpu, LogOut, Settings, BarChart3, ShieldAlert, ListChecks, History
} from 'lucide-react';
import { Role } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEY } from '@/i18n/config';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const MENU_ITEMS = [
    // User routes
    { titleKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user'] },
    { titleKey: 'nav.examSystem', path: '/practice-list', icon: PenTool, roles: ['guest', 'user'] },
    { titleKey: 'nav.myResults', path: '/history', icon: FileText, roles: ['user'] },
    { titleKey: 'nav.resources', path: '/resources', icon: Database, roles: ['user'] },
    
    // Teacher routes
    { titleKey: 'nav.topicsManagement', path: '/teacher/topics', icon: BookOpen, roles: ['teacher'] },
    { titleKey: 'nav.resources', path: '/teacher/resources', icon: Database, roles: ['teacher'] },
    { titleKey: 'nav.systemPrompts', path: '/teacher/system-prompt', icon: Settings, roles: ['teacher'] },
    
    // Admin routes
    { titleKey: 'nav.dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { titleKey: 'nav.userManagement', path: '/admin/user-management', icon: Users, roles: ['admin'] },
    { titleKey: 'nav.essaysManagement', path: '/admin/essays', icon: ListChecks, roles: ['admin'] },
    { titleKey: 'nav.topicsManagement', path: '/admin/topics', icon: BookOpen, roles: ['admin'] },
    { titleKey: 'nav.aiMonitoring', path: '/admin/ai-monitoring', icon: ShieldAlert, roles: ['admin'] },
    { titleKey: 'nav.reports', path: '/admin/reports', icon: BarChart3, roles: ['admin'] },
    { titleKey: 'nav.settings', path: '/admin/settings', icon: Settings, roles: ['admin'] },
    { titleKey: 'nav.logs', path: '/admin/logs', icon: History, roles: ['admin'] },
    { titleKey: 'nav.aiImportEngine', path: '/admin/ai-import', icon: Cpu, roles: ['admin'] },
  ];

  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-700/40 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-700/40">
        <Link href="/" className="flex items-center mb-2">
          <img src="/logo.png" alt="VSTEP Writing Logo" className="h-10 w-auto" />
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{role}</span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        <div className="mb-3 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest min-h-[1rem]">
          {mounted ? t('nav.mainMenu') : ''}
        </div>
        {filteredMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span className="text-sm">{mounted ? t(item.titleKey) : ''}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700/40">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{mounted ? t('nav.logOut') : ''}</span>
        </button>
      </div>
    </aside>
  );
}
