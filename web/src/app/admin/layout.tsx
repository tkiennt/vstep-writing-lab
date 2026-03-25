'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/config/routes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  const currentRole = ((user as any)?.role || 'admin') as Role;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-hidden">

      {/* Global Dynamic Sidebar */}
      <Sidebar role={currentRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Top Header */}
        <Header role={currentRole as 'user' | 'teacher' | 'admin'} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>

      </div>

    </div>
  );
}
