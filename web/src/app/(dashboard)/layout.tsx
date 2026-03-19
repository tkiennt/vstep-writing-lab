// Server Component — only Sidebar inside is a client component
import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50/50 w-full overflow-hidden">
      
      {/* Sidebar is a 'use client' component — only it hydrates */}
      <Sidebar role="user" />

      {/* Main Content Area — streams as server component */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
