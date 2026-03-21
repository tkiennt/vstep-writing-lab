'use client';

import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useAuthStore } from '@/store/useAuthStore';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { userDoc } = useAuthStore();
  const rawRole = userDoc?.role ?? 'user';
  const role: 'user' | 'teacher' | 'admin' =
    rawRole === 'admin' ? 'admin' :
    rawRole === 'teacher' ? 'teacher' :
    'user';

  return (
    <div className="flex h-screen bg-background w-full overflow-hidden">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header role={role} />
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
