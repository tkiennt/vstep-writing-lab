'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const inputNormal = 'bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl block w-full p-3.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors';
const inputError  = 'bg-slate-50 border border-red-400 text-slate-900 text-sm rounded-xl block w-full p-3.5 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors';

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [sent, setSent]     = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    // TODO: call forgot-password API
    setSent(true);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">

        {/* Back link */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sign in
        </Link>

        {!sent ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <Mail className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot password?</h1>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                No worries. Enter your university email and we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@university.edu.vn"
                  className={error ? inputError : inputNormal}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Check your inbox</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
              We sent a reset link to <span className="font-semibold text-slate-700">{email}</span>. It expires in 15 minutes.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="mt-6 text-sm text-emerald-700 font-semibold hover:underline"
            >
              Didn&apos;t receive it? Resend
            </button>
          </div>
        )}

        <p className="mt-7 text-center text-sm text-slate-600">
          Remember it?{' '}
          <Link href="/login" className="text-emerald-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
