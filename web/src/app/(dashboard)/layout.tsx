'use client';

import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/config/routes';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userDoc, user } = useAuth();

  // Role từ userDoc (sync từ backend), fallback 'user'
  const currentRole = (userDoc?.role || (user as { role?: string })?.role || 'user') as Role;

  return (
    <div className="flex h-screen bg-gray-50/50 w-full overflow-hidden">
      <Sidebar role={currentRole} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
