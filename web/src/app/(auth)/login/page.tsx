'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ROLE_ROUTES: Record<string, string> = {
  user: '/dashboard',
  teacher: '/teacher/topics',
  admin: '/admin/user-management',
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      router.push(ROLE_ROUTES[selectedRole] || '/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gray-50 flex-col items-center justify-center relative p-12">
        <Link 
          href="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex flex-col items-center text-center max-w-sm">
          <div className="w-32 h-32 mb-8">
            <img src="/logo.png" alt="VSTEP Writing Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-black text-vstep-dark tracking-tight mb-6">VSTEP Writing</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Unlock your writing potential with AI-driven precision feedback and advanced grammar analysis.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          
          {/* Mobile back link */}
          <Link 
            href="/" 
            className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Sign In</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Admin &amp; Teacher Dashboard</p>
          </div>

          {/* Google Sign In */}
          <button className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Or login with email</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-[0.15em] mb-2">Email Address</label>
              <input 
                type="email" 
                placeholder="username" 
                defaultValue=""
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm font-medium text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-[0.15em] mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                defaultValue=""
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white text-sm font-medium text-gray-800"
              />
            </div>

            {/* Role Selector (Demo) */}
            <div>
              <label className="block text-[10px] font-black text-gray-700 uppercase tracking-[0.15em] mb-2">Login as (Demo)</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'user', label: 'Student' },
                  { id: 'teacher', label: 'Teacher' },
                  { id: 'admin', label: 'Admin' },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-vstep-dark bg-vstep-dark text-white shadow-md shadow-emerald-900/10'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-full py-6 text-sm font-bold transition-all shadow-lg shadow-emerald-900/15 mt-2"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In with Email'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400 font-medium leading-relaxed">
            Teacher &amp; Admin access only. <Link href="/" className="text-vstep-dark font-bold hover:underline">Contact support</Link> for higher permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
