'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PenTool, FileText, BookOpen, Database,
  Users, Cpu, LogOut, Settings
} from 'lucide-react';
import { Role } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const MENU_ITEMS = [
    // User routes
    { titleKey: 'nav.dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user'] },
    { titleKey: 'nav.examSystem', path: '/practice-list', icon: PenTool, roles: ['guest', 'user'] },
    { titleKey: 'nav.myResults', path: '/results/list', icon: FileText, roles: ['user'] },
    { titleKey: 'nav.resources', path: '/resources', icon: Database, roles: ['user'] },
    
    // Teacher routes
    { titleKey: 'nav.topicsManagement', path: '/teacher/topics', icon: BookOpen, roles: ['teacher'] },
    { titleKey: 'nav.resources', path: '/teacher/resources', icon: Database, roles: ['teacher'] },
    { titleKey: 'nav.systemPrompts', path: '/teacher/system-prompt', icon: Settings, roles: ['teacher'] },
    
    // Admin routes
    { titleKey: 'nav.topicsManagement', path: '/admin/topics', icon: BookOpen, roles: ['admin'] },
    { titleKey: 'nav.resources', path: '/admin/resources', icon: Database, roles: ['admin'] },
    { titleKey: 'nav.systemPrompts', path: '/admin/system-prompt', icon: Settings, roles: ['admin'] },
    { titleKey: 'nav.userManagement', path: '/admin/user-management', icon: Users, roles: ['admin'] },
    { titleKey: 'nav.aiImportEngine', path: '/admin/ai-import', icon: Cpu, roles: ['admin'] },
  ];

  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#020617] border-r border-slate-700/40 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/40">
        <Link href="/" className="flex items-center mb-2">
          <img src="/logo.png" alt="VSTEP Writing Logo" className="h-10 w-auto" />
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{role}</span>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-0.5">
        <div className="mb-3 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          {t('nav.mainMenu')}
        </div>
        {filteredMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive 
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <item.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-sm">{t(item.titleKey)}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700/40">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:bg-red-950/50 hover:text-red-400 transition-all duration-150"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">{t('nav.logOut')}</span>
        </button>
      </div>
    </aside>
  );
}
