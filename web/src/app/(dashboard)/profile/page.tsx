'use client';

import React from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Target, 
  Bell, 
  Shield,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile & Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account details and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Navigation Sidebar */}
        <div className="lg:col-span-1 border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden h-max">
           <nav className="flex flex-col">
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-vstep-dark bg-emerald-50 border-l-4 border-vstep-dark text-left">
                 <User className="w-5 h-5 text-emerald-600" />
                 Personal Info
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors text-left border-t border-gray-50">
                 <Target className="w-5 h-5 text-gray-400" />
                 Learning Goals
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors text-left border-t border-gray-50">
                 <Lock className="w-5 h-5 text-gray-400" />
                 Security
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-200 transition-colors text-left border-t border-gray-50">
                 <Bell className="w-5 h-5 text-gray-400" />
                 Notifications
              </button>
           </nav>
        </div>

        {/* Right Column: Active Section Form */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* Section 1 */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <User className="w-5 h-5 text-gray-400" /> Personal Information
              </h2>
              
              <div className="flex items-center gap-6 mb-8">
                 <div className="w-20 h-20 bg-vstep-dark text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">
                    N
                 </div>
                 <div>
                    <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-9 text-xs font-semibold mr-3">
                       Change Avatar
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-9 text-xs font-semibold">
                       Remove
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" defaultValue="Nguyen" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" defaultValue="Van A" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50" />
                 </div>
                 <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input type="email" defaultValue="student@vnu.edu.vn" disabled className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Contact support to change your email address.</p>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                 <Button className="bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm font-semibold flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                 </Button>
              </div>
           </div>

           {/* Section 2 */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <Target className="w-5 h-5 text-gray-400" /> Target Band Score
              </h2>
              
              <div className="space-y-6">
                 <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">What is your target VSTEP level?</label>
                    <div className="grid grid-cols-3 gap-4">
                       <label className="cursor-pointer">
                          <input type="radio" name="level" className="peer sr-only" />
                          <div className="rounded-xl border-2 border-gray-200 px-4 py-3 hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all text-center">
                             <span className="block font-bold text-gray-900 peer-checked:text-emerald-700">B1</span>
                             <span className="text-xs text-gray-500">Intermediate</span>
                          </div>
                       </label>
                       <label className="cursor-pointer">
                          <input type="radio" name="level" className="peer sr-only" defaultChecked />
                          <div className="rounded-xl border-2 border-gray-200 px-4 py-3 hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:ring-2 peer-checked:ring-emerald-500/20 transition-all text-center">
                             <span className="block font-bold text-gray-900 peer-checked:text-emerald-700">B2</span>
                             <span className="text-xs text-gray-500">Upper Inter</span>
                          </div>
                       </label>
                       <label className="cursor-pointer">
                          <input type="radio" name="level" className="peer sr-only" />
                          <div className="rounded-xl border-2 border-gray-200 px-4 py-3 hover:bg-gray-50 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 transition-all text-center">
                             <span className="block font-bold text-gray-900 peer-checked:text-emerald-700">C1</span>
                             <span className="text-xs text-gray-500">Advanced</span>
                          </div>
                       </label>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                 <Button className="bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm font-semibold flex items-center gap-2">
                    <Save className="w-4 h-4" /> Save Goals
                 </Button>
              </div>
           </div>

           {/* Danger Zone */}
           <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
                 <Shield className="w-5 h-5 text-red-600" /> Danger Zone
              </h2>
              <p className="text-sm text-red-700 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="outline" className="border-red-200 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl font-semibold">
                 Delete Account
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
