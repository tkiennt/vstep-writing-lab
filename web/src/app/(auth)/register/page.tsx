'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ROLE_ROUTES: Record<string, string> = {
  user: '/dashboard', teacher: '/teacher/topics', admin: '/admin/user-management',
};

interface FormData { fullName: string; email: string; password: string; confirmPassword: string; }
interface FormErrors { fullName: string; email: string; password: string; confirmPassword: string; }

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, isAuthenticated, isLoading: authLoading, userDoc } = useAuth();
  const { t } = useTranslation();
  
  React.useEffect(() => {
    if (!authLoading && isAuthenticated && userDoc) {
      router.push(ROLE_ROUTES[userDoc.role] ?? '/dashboard');
    }
  }, [authLoading, isAuthenticated, userDoc, router]);
  
  const [formData, setFormData] = useState<FormData>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setSubmitError('');
  };

  const validateForm = (): boolean => {
    const e: FormErrors = { fullName: '', email: '', password: '', confirmPassword: '' };
    let ok = true;
    if (!formData.fullName.trim()) { e.fullName = t('auth.errors.fullNameRequired'); ok = false; }
    if (!formData.email.trim()) { e.email = t('auth.errors.emailRequired'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { e.email = t('auth.errors.invalidEmail'); ok = false; }
    if (!formData.password) { e.password = t('auth.errors.passwordRequired'); ok = false; }
    else if (formData.password.length < 8) { e.password = t('auth.errors.passwordTooShort'); ok = false; }
    if (!formData.confirmPassword) { e.confirmPassword = t('auth.errors.confirmPasswordRequired'); ok = false; }
    else if (formData.confirmPassword !== formData.password) { e.confirmPassword = t('auth.errors.passwordMismatch'); ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setSubmitError('');
    try {
      await signUpWithEmail(formData.email, formData.password, formData.fullName);
      router.push('/onboarding');
    } catch (err: any) {
      setSubmitError(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase = 'bg-slate-900/60 border text-slate-200 text-sm rounded-xl block w-full p-3.5 transition-colors outline-none focus:ring-2 placeholder:text-slate-600';
  const inputNormal = `${inputBase} border-white/5 focus:ring-emerald-500/30 focus:border-emerald-500/50`;
  const inputError  = `${inputBase} border-red-500/30 focus:ring-red-500/20 focus:border-red-500/50`;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#0f172a]">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-16 w-[32rem] h-[32rem] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-800/70 rounded-3xl shadow-2xl shadow-black/40 border border-white/5 p-10 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">{t('auth.register.title')}</h1>
          <p className="text-slate-500 mt-2 text-sm">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/20 text-red-400 text-sm font-medium text-center">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t('auth.register.fullName')}</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder={t('auth.register.fullNamePlaceholder')}
              className={errors.fullName ? inputError : inputNormal} disabled={isLoading} />
            {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t('auth.register.email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder={t('auth.register.emailPlaceholder')}
              className={errors.email ? inputError : inputNormal} disabled={isLoading} />
            {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t('auth.register.password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder={t('auth.register.passwordPlaceholder')}
              className={errors.password ? inputError : inputNormal} disabled={isLoading} />
            {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">{t('auth.register.confirmPassword')}</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              className={errors.confirmPassword ? inputError : inputNormal} disabled={isLoading} />
            {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('auth.register.submitting')}</>
            ) : t('auth.register.submitBtn')}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          {t('auth.register.hasAccount')}{' '}
          <Link href="/login" className="text-emerald-400 font-semibold hover:underline">{t('auth.register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
