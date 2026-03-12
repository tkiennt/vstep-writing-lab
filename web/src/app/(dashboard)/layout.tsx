'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, PenTool, History, TrendingUp, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Practice', href: '/practice', icon: PenTool },
  { name: 'History', href: '/history', icon: History },
  { name: 'Progress', href: '/progress', icon: TrendingUp },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r bg-white">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <BookOpen className="h-8 w-8 text-vstep-blue" />
            <span className="ml-3 text-lg font-bold text-gray-900">VSTEP Lab</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-vstep-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <item.icon className={cn('mr-3 h-5 w-5', isActive ? 'text-white' : 'text-gray-400')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          {user && (
            <div className="border-t p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-vstep-blue flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navbar - Mobile */}
        <div className="sticky top-0 z-40 flex h-16 items-center border-b bg-white px-4 lg:hidden">
          <button className="text-gray-500 hover:text-gray-700">
            <Menu className="h-6 w-6" />
          </button>
          <div className="ml-4 flex items-center">
            <BookOpen className="h-8 w-8 text-vstep-blue" />
            <span className="ml-3 text-lg font-bold text-gray-900">VSTEP Lab</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
