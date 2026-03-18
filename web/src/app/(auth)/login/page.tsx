'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const ROLE_ROUTES: Record<string, string> = {
  user:    '/dashboard',
  teacher: '/teacher/topics',
  admin:   '/admin/user-management',
};

export default function LoginPage() {
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn]   = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [showPw, setShowPw]             = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => router.push(ROLE_ROUTES[selectedRole] || '/dashboard'), 800);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left Panel — Branding ── */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-vstep-dark via-emerald-800 to-teal-700 p-14">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-teal-400/10 rounded-full blur-3xl" />

        {/* Back to Home */}
        <Link
          href="/"
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <img src="/logo.png" alt="VSTEP Writing" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">VSTEP Writing</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            Unlock your writing potential with AI-driven precision feedback and advanced grammar analysis.
          </p>

          {/* Stats row */}
          <div className="mt-10 grid grid-cols-3 gap-6 w-full">
            {[['10k+', 'Students'], ['98%', 'Accuracy'], ['B1→C1', 'Levels']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-white font-extrabold text-xl">{val}</div>
                <div className="text-white/50 text-xs mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <p className="absolute bottom-6 text-white/30 text-xs">
          © 2026 VSTEP Writing Lab
        </p>
      </div>

      {/* ── Right Panel — Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-sm">

          {/* Mobile back */}
          <Link
            href="/"
            className="lg:hidden flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-slate-100 p-8">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
              <p className="text-slate-500 text-sm mt-1">Welcome back — let&apos;s continue your progress.</p>
            </div>

            {/* Google btn */}
            <button className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm mb-6">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-slate-100 flex-1" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">or login with email</span>
              <div className="h-px bg-slate-100 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="you@university.edu.vn"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password" className="text-xs text-emerald-700 font-semibold hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role selector (Demo) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Login as (Demo)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'user', label: 'Student' }, { id: 'teacher', label: 'Teacher' }, { id: 'admin', label: 'Admin' }].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        selectedRole === role.id
                          ? 'border-vstep-dark bg-vstep-dark text-white shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-vstep-dark hover:bg-emerald-900 text-white text-sm font-bold transition-all duration-200 shadow-md shadow-emerald-900/15 hover:shadow-lg hover:shadow-emerald-900/20 hover:-translate-y-0.5 mt-1 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                ) : 'Sign In with Email'}
              </button>
            </form>

          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-700 font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>

    </div>
  );
}
