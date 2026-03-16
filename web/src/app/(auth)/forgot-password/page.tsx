'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/services/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found') {
        // Don't reveal whether the email exists — show success anyway
        setSent(true);
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">

        <div className="text-center mb-8 relative">
          <Link
            href="/login"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
            {sent
              ? <CheckCircle className="h-6 w-6 text-emerald-600" />
              : <BookOpen className="h-6 w-6 text-emerald-600" />
            }
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {sent ? 'Check your inbox' : 'Reset password'}
          </h2>
          <p className="text-gray-500 mt-2 text-sm max-w-[240px] mx-auto">
            {sent
              ? `We sent a reset link to ${email}. It may take a minute to arrive.`
              : 'Enter your email address to receive a password reset link.'
            }
          </p>
        </div>

        {!sent && (
          <>
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="you@university.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl py-6 text-base font-semibold transition-all shadow-md shadow-emerald-900/10 mt-6 disabled:opacity-60"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </>
        )}

        {sent && (
          <Link
            href="/login"
            className="block w-full text-center mt-4 py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-vstep-dark font-semibold rounded-xl transition-colors text-sm"
          >
            Back to Sign In
          </Link>
        )}

        {!sent && (
          <p className="mt-8 text-center text-sm text-gray-600">
            Remember it?{' '}
            <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
