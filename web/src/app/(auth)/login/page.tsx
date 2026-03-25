'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ROLE_ROUTES: Record<string, string> = {
  user:    '/dashboard',
  teacher: '/teacher/topics',
  admin:   '/admin/user-management',
};

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, isAuthenticated, isLoading, userDoc } = useAuth();
  const { t } = useTranslation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && userDoc) {
      const destination = ROLE_ROUTES[userDoc.role] ?? '/dashboard';
      router.push(destination);
    }
  }, [isLoading, isAuthenticated, userDoc, router]);

  const [showPw, setShowPw]             = useState(false);
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('auth.errors.invalidEmail'));
      return;
    }
    setIsLoggingIn(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setError(err.message || t('auth.errors.invalidEmail'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* Left Panel — Branding (Responsive hide on mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center overflow-hidden bg-vstep-dark p-14">
        {/* Abstract decorative elements */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-[28rem] h-[28rem] bg-emerald-400/10 rounded-full blur-3xl" />

        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('auth.login.backHome')}
        </Link>

        <div className="relative z-10 flex flex-col items-center text-center max-w-xs">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl">
            <img src="/logo.png" alt="VSTEP Writing" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">VSTEP Writing</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            {t('auth.login.subtitle')}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 w-full">
            {[['10k+', 'Students'], ['98%', 'Accuracy'], ['B1→C1', 'Levels']].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <div className="text-white font-extrabold text-xl">{val}</div>
                <div className="text-white/50 text-xs mt-0.5">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-6 text-white/30 text-xs">© 2026 VSTEP Writing Lab</p>
      </div>

      {/* Right Panel — Interactive Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">

          <Link href="/" className="lg:hidden flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t('auth.login.backHome')}
          </Link>

          <div className="bg-card rounded-3xl shadow-xl border border-border p-8 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">{t('auth.login.title')}</h2>
              <p className="text-muted-foreground text-sm mt-1">{t('auth.login.subtitle')}</p>
            </div>

            {/* Google Social Login */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3 bg-muted border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent hover:border-accent-foreground/10 transition-all shadow-sm mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('auth.login.googleBtn')}
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px bg-border flex-1" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{t('auth.login.orEmail')}</span>
              <div className="h-px bg-border flex-1" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('auth.login.emailLabel')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-muted text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                   <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('auth.login.passwordLabel')}</label>
                   <Link href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">{t('auth.login.forgotPassword')}</Link>
                </div>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.login.passwordPlaceholder')}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-input bg-muted text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoggingIn}
                className="w-full py-3.5 rounded-xl bg-vstep-dark hover:bg-emerald-950 text-white text-sm font-bold transition-all duration-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-vstep-dark/10">
                {isLoggingIn ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('auth.login.submitting')}</>
                ) : t('auth.login.submitBtn')}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">{t('auth.login.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
