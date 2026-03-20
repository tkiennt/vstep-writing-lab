'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  BookOpen, 
  Database,
  Users,
  Cpu,
  LogOut,
  Settings
} from 'lucide-react';
import { Role } from '@/config/routes';

import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  // 1. Define menu items with allowed roles
  const MENU_ITEMS = [
    // User routes
    { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['user'] },
    { title: 'Exam System', path: '/practice-list', icon: PenTool, roles: ['guest', 'user'] },
    { title: 'My Results', path: '/results/list', icon: FileText, roles: ['user'] },
    { title: 'Resources', path: '/resources', icon: Database, roles: ['user'] },
    
    // Teacher routes
    { title: 'Topics Management', path: '/teacher/topics', icon: BookOpen, roles: ['teacher'] },
    { title: 'Resources', path: '/teacher/resources', icon: Database, roles: ['teacher'] },
    { title: 'System Prompts', path: '/teacher/system-prompt', icon: Settings, roles: ['teacher'] },
    
    // Admin routes
    { title: 'Topics Management', path: '/admin/topics', icon: BookOpen, roles: ['admin'] },
    { title: 'Resources', path: '/admin/resources', icon: Database, roles: ['admin'] },
    { title: 'System Prompts', path: '/admin/system-prompt', icon: Settings, roles: ['admin'] },
    { title: 'User Management', path: '/admin/user-management', icon: Users, roles: ['admin'] },
    { title: 'AI Import Engine', path: '/admin/ai-import', icon: Cpu, roles: ['admin'] },
  ];

  // 2. Filter logic based on current role
  const filteredMenuItems = MENU_ITEMS.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 border-b border-gray-100">
        <Link href="/" className="flex items-center mb-2">
          <img src="/logo.png" alt="VSTEP Writing Logo" className="h-10 w-auto" />
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{role}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="mb-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Main Menu
        </div>
        {filteredMenuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-sm">{item.title}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
}
