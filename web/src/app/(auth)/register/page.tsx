'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, ArrowLeft } from 'lucide-react';
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

  const inputBase = 'bg-muted border text-foreground text-sm rounded-xl block w-full p-3.5 transition-colors outline-none focus:ring-2 placeholder:text-muted-foreground';
  const inputNormal = `${inputBase} border-input focus:ring-primary/20 focus:border-primary`;
  const inputError  = `${inputBase} border-destructive/30 focus:ring-destructive/20 focus:border-destructive/50`;

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-background">
      {/* Decorative patterns */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-16 w-[32rem] h-[32rem] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-card rounded-3xl shadow-xl border border-border p-10 backdrop-blur-sm">
        
        <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          {t('auth.register.signIn')}
        </Link>
        
        <div className="text-center mb-8 mt-4">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{t('auth.register.title')}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {submitError && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
              {submitError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('auth.register.fullName')}</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder={t('auth.register.fullNamePlaceholder')}
              className={errors.fullName ? inputError : inputNormal} disabled={isLoading} />
            {errors.fullName && <p className="text-destructive text-xs mt-1 font-medium">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('auth.register.email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder={t('auth.register.emailPlaceholder')}
              className={errors.email ? inputError : inputNormal} disabled={isLoading} />
            {errors.email && <p className="text-destructive text-xs mt-1 font-medium">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('auth.register.password')}</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              placeholder={t('auth.register.passwordPlaceholder')}
              className={errors.password ? inputError : inputNormal} disabled={isLoading} />
            {errors.password && <p className="text-destructive text-xs mt-1 font-medium">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{t('auth.register.confirmPassword')}</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              className={errors.confirmPassword ? inputError : inputNormal} disabled={isLoading} />
            {errors.confirmPassword && <p className="text-destructive text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-vstep-dark hover:bg-emerald-950 text-white font-bold text-base shadow-lg shadow-vstep-dark/10 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" />{t('auth.register.submitting')}</>
            ) : t('auth.register.submitBtn')}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('auth.register.hasAccount')}{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">{t('auth.register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
}
