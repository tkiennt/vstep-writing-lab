'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ShieldCheck,
  Ban,
  Mail,
  MoreVertical,
  ChevronDown,
  UserPlus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';

const MOCK_USERSLayer = [
  { id: '1', name: 'Nguyen Van A', email: 'vana@vnu.edu.vn', role: 'student', status: 'active', joined: 'Oct 01, 2026' },
  { id: '2', name: 'Tran Thi B', email: 'tranb@gmail.com', role: 'teacher', status: 'active', joined: 'Sep 15, 2026' },
  { id: '3', name: 'Le Quoc C', email: 'lequoc@outlook.com', role: 'student', status: 'banned', joined: 'Oct 20, 2026' },
];

export default function UserManagementExt() {
  const [users, setUsers] = useState(MOCK_USERSLayer);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' });

  const toggleStatus = (id: string, currentStatus: string) => {
    setUsers(users.map(u => {
      if(u.id === id) {
        return {...u, status: currentStatus === 'active' ? 'banned' : 'active'};
      }
      return u;
    }));
  };

  const changeRole = (id: string, newRole: string) => {
    setUsers(users.map(u => {
      if(u.id === id) return {...u, role: newRole};
      return u;
    }));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setUsers([newEntry, ...users]);
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: 'student' });
  };

  return (
    <>
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-vstep-dark" /> Administration: User Control
           </h1>
           <Button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-2 bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm"
           >
              <UserPlus className="w-4 h-4" /> Add New User
           </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8 pb-20">
           
           {/* Data Table */}
           <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[500px]">
             <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-gray-50/80 text-gray-500 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
                 <tr>
                   <th className="px-8 py-5">System Account Request</th>
                   <th className="px-8 py-5">Role Control Dropdown</th>
                   <th className="px-8 py-5 text-center">Status Toggle</th>
                   <th className="px-8 py-5 text-right">Block Account</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {users.map((user) => (
                   <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                     
                     {/* User Info */}
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center shrink-0 border border-emerald-100 text-lg">
                              {user.name.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900 text-base mb-0.5">{user.name}</p>
                              <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400"/> {user.email}</p>
                           </div>
                        </div>
                     </td>

                     {/* Role Dropdown */}
                     <td className="px-8 py-6">
                        <div className="relative inline-block w-40">
                           <select 
                             value={user.role}
                             onChange={(e) => changeRole(user.id, e.target.value)}
                             className={`w-full appearance-none outline-none font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-sm border cursor-pointer
                                ${user.role === 'admin' ? 'bg-purple-50 border-purple-200 text-purple-700' : 
                                  user.role === 'teacher' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                                  'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                           >
                             <option value="student">Student</option>
                             <option value="teacher">Teacher</option>
                             <option value="admin">Admin</option>
                           </select>
                           <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
                        </div>
                     </td>

                     {/* Status Badge */}
                     <td className="px-8 py-6 text-center">
                       {user.status === 'active' ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                           <ShieldCheck className="w-4 h-4" /> Active
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                           <Ban className="w-4 h-4 text-red-500" /> Locked
                         </span>
                       )}
                     </td>

                     {/* Block Action */}
                     <td className="px-8 py-6 text-right">
                        <Button 
                          onClick={() => toggleStatus(user.id, user.status)}
                          variant={user.status === 'active' ? 'outline' : 'default'}
                          className={`rounded-xl font-bold h-10 px-6 transition-all shadow-sm
                             ${user.status === 'active' 
                               ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' 
                               : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                        >
                           <Ban className={`w-4 h-4 mr-2 ${user.status === 'active' ? '' : 'hidden'}`} />
                           <ShieldCheck className={`w-4 h-4 mr-2 ${user.status === 'banned' ? '' : 'hidden'}`} />
                           {user.status === 'active' ? 'Block User' : 'Unblock'}
                        </Button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

        </main>

        {/* Add User Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="e.g. Nguyen Van A"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Email Address</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">System Role</label>
                  <div className="relative">
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="student">Student (Practicer)</option>
                      <option value="teacher">Teacher (Manager)</option>
                      <option value="admin">Administrator</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 shadow-md shadow-emerald-600/20">
                    Create User
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
