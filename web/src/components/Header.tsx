import React from 'react';
import { Bell, Search, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header({ role }: { role: 'user' | 'teacher' | 'admin' }) {
  const { user, logout } = useAuth();
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      
      {/* Left side mobile space or additional breadcrumbs */}
      <div className="flex items-center gap-4 flex-1">
         {/* Search Bar - Optional */}
         <div className="hidden md:flex relative w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
           <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
           />
         </div>
      </div>

      {/* Right side Profile & Actions */}
      <div className="flex items-center gap-3">
         <Button variant="ghost" size="icon" className="relative text-gray-500 hover:bg-gray-100 rounded-full w-9 h-9">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
         </Button>

         <div className="h-6 w-px bg-gray-200 mx-1"></div>

         <div className="group relative">
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
               <div className="w-8 h-8 rounded-full bg-vstep-dark text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {initials}
               </div>
               <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {user?.name || 'User'}
               </span>
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden">
               <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs font-medium text-gray-500 truncate mt-0.5">{user?.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                     {role}
                  </span>
               </div>
               <div className="p-2">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">
                     <UserIcon className="w-4 h-4" /> My Profile
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">
                     <Settings className="w-4 h-4" /> Account Settings
                  </Link>
               </div>
               <div className="p-2 border-t border-gray-50">
                  <button onClick={() => logout()} className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                     <LogOut className="w-4 h-4" /> Sign Out
                  </button>
               </div>
            </div>
         </div>
      </div>
    </header>
  );
}
