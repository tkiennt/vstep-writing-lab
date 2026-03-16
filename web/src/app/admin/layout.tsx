'use client';

import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/config/routes';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  // Use user's role if available, otherwise default to 'admin' for demo purposes
  const currentRole = ((user as any)?.role || 'admin') as Role;

  return (
    <div className="flex h-screen bg-gray-50/50 w-full overflow-hidden">
      
      {/* Global Dynamic Sidebar */}
      <Sidebar role={currentRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
