'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const inputBase = 'bg-slate-50 border text-slate-900 text-sm rounded-xl block w-full p-3.5 pr-11 outline-none focus:ring-2 transition-colors';
const inputNormal = `${inputBase} border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500`;
const inputError  = `${inputBase} border-red-400 focus:ring-red-500/20 focus:border-red-500`;

interface Errors { password: string; confirm: string; }

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [errors, setErrors]       = useState<Errors>({ password: '', confirm: '' });
  const [done, setDone]           = useState(false);

  const validate = (): boolean => {
    const e: Errors = { password: '', confirm: '' };
    let ok = true;
    if (!password)               { e.password = 'Password is required'; ok = false; }
    else if (password.length < 8){ e.password = 'Password must be at least 8 characters'; ok = false; }
    if (!confirm)                { e.confirm = 'Please confirm your password'; ok = false; }
    else if (confirm !== password){ e.confirm = 'Passwords do not match'; ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // TODO: call reset-password API
      setDone(true);
    }
  };

  /* Password strength */
  const strength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-slate-50">
      {/* Blobs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">

        {/* Back */}
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to sign in
        </Link>

        {!done ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-5">
                <KeyRound className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Set new password</h1>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                Choose a strong password. It must be at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                    placeholder="Create a strong password"
                    className={errors.password ? inputError : inputNormal}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-600'}`}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showCf ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }}
                    placeholder="Repeat your password"
                    className={errors.confirm ? inputError : inputNormal}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCf(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
              >
                Reset Password
              </button>
            </form>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Password updated!</h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto mb-6">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-base text-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Go to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
