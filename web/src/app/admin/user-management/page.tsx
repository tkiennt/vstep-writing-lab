'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShieldCheck,
  Ban,
  Mail,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminUserService, UserDTO } from '@/services/admin/adminUserService';

export default function UserManagementExt() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    try {
      // API call
      await adminUserService.update(id, { status: newStatus });
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update user status');
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    try {
      // API call
      await adminUserService.update(id, { role: newRole });
      // Update local state
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Failed to update role', error);
      alert('Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" /> Administration: User Control
           </h1>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8 pb-20">
           
           {/* Data Table */}
           <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
             <table className="w-full text-left text-sm text-muted-foreground">
               <thead className="bg-muted/50 text-muted-foreground font-black text-[10px] uppercase tracking-widest border-b border-border">
                 <tr>
                   <th className="px-8 py-5">System Account</th>
                   <th className="px-8 py-5">Role Control Dropdown</th>
                   <th className="px-8 py-5 text-center">Status Toggle</th>
                   <th className="px-8 py-5 text-right">Block Account</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {users.map((user) => (
                   <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                     
                     {/* User Info */}
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-500/20 text-lg">
                              {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                           </div>
                           <div>
                              <p className="font-bold text-foreground text-base mb-0.5">{user.fullName || 'Unknown User'}</p>
                              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-muted-foreground/50"/> {user.email}</p>
                           </div>
                        </div>
                     </td>

                     {/* Role Dropdown */}
                     <td className="px-8 py-6">
                        <div className="relative inline-block w-40">
                           <select 
                             value={user.role || 'user'}
                             onChange={(e) => changeRole(user.id, e.target.value)}
                             className={`w-full appearance-none outline-none font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm border cursor-pointer
                                ${user.role === 'admin' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 
                                  user.role === 'teacher' ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 
                                  'bg-background border-border text-foreground hover:bg-muted'}`}
                           >
                             <option value="user">Student</option>
                             <option value="teacher">Teacher</option>
                             <option value="admin">Admin</option>
                           </select>
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                        </div>
                     </td>

                     {/* Status Badge */}
                     <td className="px-8 py-6 text-center">
                       {user.status !== 'banned' ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                           <ShieldCheck className="w-4 h-4" /> Active
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30">
                           <Ban className="w-4 h-4 text-red-400" /> Locked
                         </span>
                       )}
                     </td>

                     {/* Block Action */}
                     <td className="px-8 py-6 text-right">
                        <Button 
                          onClick={() => toggleStatus(user.id, user.status || 'active')}
                          variant={user.status !== 'banned' ? 'outline' : 'default'}
                          className={`rounded-xl font-bold h-10 px-6 transition-all shadow-sm
                             ${user.status !== 'banned' 
                               ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300' 
                               : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                        >
                           <Ban className={`w-4 h-4 mr-2 ${user.status !== 'banned' ? '' : 'hidden'}`} />
                           <ShieldCheck className={`w-4 h-4 mr-2 ${user.status === 'banned' ? '' : 'hidden'}`} />
                           {user.status !== 'banned' ? 'Block User' : 'Unblock'}
                        </Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {users.length === 0 && (
               <div className="p-8 text-center text-muted-foreground w-full font-medium">No users found.</div>
             )}
           </div>

        </main>
      </div>
    </>
  );
}
