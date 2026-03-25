'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck,
  Ban,
  Mail,
  ChevronDown,
  Activity,
  RefreshCw,
  UserCheck,
  Plus,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminUserService, UserDTO, CreateUserRequest } from '@/services/admin/adminUserService';
import { useGlobal } from '@/components/GlobalProvider';

// ── Add User Modal ───────────────────────────
function AddUserModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (req: CreateUserRequest) => Promise<void> }) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
         <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register New Account</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
               <X className="w-5 h-5 text-slate-500" />
            </button>
         </div>
         <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</label>
               <input 
                  required
                  type="text" 
                  value={formData.displayName}
                  onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                  placeholder="Enter full name..."
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Email Address</label>
               <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                  placeholder="student@example.com"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Temporary Password</label>
               <input 
                  required
                  type="password" 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all"
                  placeholder="At least 6 characters"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Assigned Role</label>
               <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold transition-all"
               >
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
               </select>
            </div>
            <div className="pt-4 flex gap-3">
               <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl font-bold h-11">Cancel</Button>
               <Button type="submit" disabled={loading} className="flex-1 rounded-xl font-bold h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                  {loading ? 'Creating...' : 'Create Account'}
               </Button>
            </div>
         </form>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────
export default function UserManagementPage() {
  const { addToast, showModal } = useGlobal();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUserService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      addToast('error', 'Failed to fetch users from system');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (formData: CreateUserRequest) => {
    try {
      // Ensure role is valid for backend
      const role = formData.role === 'user' || formData.role === 'student' ? 'student' : 'admin';
      await adminUserService.create({ ...formData, role });
      addToast('success', `Account created successfully for ${formData.email}`);
      loadUsers();
    } catch (error: any) {
      addToast('error', error.response?.data?.message || 'Failed to create user account');
      throw error;
    }
  };

  const handleToggleStatus = (user: UserDTO) => {
    const isBanned = user.status === 'banned';
    showModal({
      title: isBanned ? 'Unlock Account?' : 'Block Account?',
      description: isBanned 
        ? `Are you sure you want to restore access for ${user.fullName || user.email}?`
        : `This will prevent ${user.fullName || user.email} from logging into the platform.`,
      confirmText: isBanned ? 'Unlock' : 'Block',
      cancelText: 'Cancel',
      type: isBanned ? 'info' : 'danger',
      onConfirm: async () => {
        try {
          await adminUserService.update(user.id, { status: isBanned ? 'active' : 'banned' });
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: isBanned ? 'active' : 'banned' } : u));
          addToast('success', `User account ${isBanned ? 'unlocked' : 'blocked'} successfully`);
        } catch (error) {
          addToast('error', 'Failed to update account status');
        }
      }
    });
  };

  const handleRoleChangeRequest = (user: UserDTO, newRole: string) => {
    if (newRole === user.role) {
      const newPending = { ...pendingRoles };
      delete newPending[user.id];
      setPendingRoles(newPending);
      return;
    }

    showModal({
      title: 'Confirm Role Update?',
      description: `You are modifying system permissions for ${user.fullName || user.email}. The new role will be [${newRole.toUpperCase()}]. Proceed with caution.`,
      confirmText: 'Update Permissions',
      cancelText: 'Cancel',
      type: 'warning',
      onConfirm: async () => {
        try {
          await adminUserService.update(user.id, { role: newRole });
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
          
          const newPending = { ...pendingRoles };
          delete newPending[user.id];
          setPendingRoles(newPending);
          
          addToast('success', `User role updated to ${newRole}`);
        } catch (error) {
          addToast('error', 'Failed to update user role');
        }
      }
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen bg-slate-50 dark:bg-slate-950">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">User Matrix</h1>
         </div>
         <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={loadUsers} className="rounded-xl h-9 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
               <RefreshCw className="w-3.5 h-3.5 mr-2" /> Sync
            </Button>
            <Button 
               onClick={() => setIsAddModalOpen(true)}
               size="sm" 
               className="rounded-xl h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-4 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
               <Plus className="w-4 h-4 mr-2" /> Create User
            </Button>
         </div>
      </header>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-16 z-10 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1 group">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search in account directory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-900 dark:text-white"
               />
            </div>
            <div className="relative group shrink-0">
               <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
               <select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
               >
                  <option value="all">Filter: All Roles</option>
                  <option value="student">Students Only</option>
                  <option value="admin">Administrators</option>
               </select>
               <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
         </div>
         <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            Tracking <span className="text-emerald-500">{filteredUsers.length}</span> Active Entities
         </div>
      </div>

      {/* Main Table */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
         <div className="max-w-7xl mx-auto">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-20 min-h-[400px]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                      <th className="px-8 py-5">Profile Entity</th>
                      <th className="px-8 py-5">System Role</th>
                      <th className="px-8 py-5 text-center">Submissions</th>
                      <th className="px-8 py-5 text-center">Lifecycle Status</th>
                      <th className="px-8 py-5 text-right">Administrative Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                          
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center shrink-0 border border-emerald-500/10 text-lg shadow-sm group-hover:scale-105 transition-transform">
                                   {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                                </div>
                                <div className="flex flex-col">
                                   <p className="font-bold text-slate-900 dark:text-white text-base leading-tight antialiased">{user.fullName || 'Anonymous User'}</p>
                                   <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                      <Mail className="w-3.5 h-3.5 text-slate-400" /> 
                                      {user.email}
                                   </p>
                                </div>
                             </div>
                          </td>

                           <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className="relative inline-block flex-1 min-w-[140px]">
                                   <select 
                                     value={pendingRoles[user.id] || user.role || 'student'}
                                     onChange={(e) => setPendingRoles({ ...pendingRoles, [user.id]: e.target.value })}
                                     className={`w-full appearance-none outline-none font-black text-[10px] uppercase tracking-widest py-2 px-4 rounded-xl shadow-sm border cursor-pointer transition-all
                                        ${(pendingRoles[user.id] || user.role) === 'admin' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 dark:text-indigo-400' : 
                                          'bg-slate-100/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:border-emerald-500/30 dark:text-slate-400'}`}
                                   >
                                     <option value="student">Student</option>
                                     <option value="admin">System Admin</option>
                                   </select>
                                   <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
                                </div>
                                
                                {pendingRoles[user.id] && pendingRoles[user.id] !== user.role && (
                                   <Button 
                                     onClick={() => handleRoleChangeRequest(user, pendingRoles[user.id])}
                                     size="sm"
                                     className="h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider animate-in fade-in slide-in-from-left-2"
                                   >
                                      Confirm
                                   </Button>
                                )}
                              </div>
                           </td>

                          <td className="px-8 py-6 text-center">
                             <div className="inline-flex items-center gap-2 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{user.submissionCount || 0}</span>
                             </div>
                          </td>

                          <td className="px-8 py-6">
                             <div className="flex justify-center">
                                {user.status !== 'banned' ? (
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <UserCheck className="w-3.5 h-3.5" /> Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]">
                                    <Ban className="w-3.5 h-3.5" /> Terminated
                                  </span>
                                )}
                             </div>
                          </td>

                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                               <Button 
                                 onClick={() => handleToggleStatus(user)}
                                 variant="ghost"
                                 className={`rounded-xl font-black text-[10px] uppercase tracking-widest h-9 px-4 transition-all border
                                    ${user.status !== 'banned' 
                                      ? 'border-rose-500/10 text-rose-500/60 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                                      : 'border-emerald-500/10 text-emerald-500/60 hover:bg-emerald-600 hover:text-white hover:border-emerald-600'}`}
                               >
                                 {user.status !== 'banned' ? 'Deactivate' : 'Restore'}
                               </Button>
                             </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-32 text-center">
                           <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-base font-black text-slate-900 dark:text-white">Account Not Found</p>
                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">No matches exist in the current registry view.</p>
                              </div>
                           </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
         </div>
      </main>

      <AddUserModal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)} 
         onAdd={handleAddUser}
      />
    </div>
  );
}
