'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormData { fullName: string; email: string; password: string; confirmPassword: string; }
interface FormErrors { fullName: string; email: string; password: string; confirmPassword: string; }

const inputBase = 'bg-slate-50 border text-slate-900 text-sm rounded-xl block w-full p-3.5 transition-colors outline-none focus:ring-2';
const inputNormal = `${inputBase} border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500`;
const inputError  = `${inputBase} border-red-400 focus:ring-red-500/20 focus:border-red-500`;

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Client-side redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);
  
  const [formData, setFormData] = useState<FormData>({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [errors, setErrors] = useState<FormErrors>({ 
    fullName: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

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
    
    if (!formData.fullName.trim()) { 
      e.fullName = 'Full name is required'; ok = false; 
    }
    
    if (!formData.email.trim()) { 
      e.email = 'Email is required'; ok = false; 
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { 
      e.email = 'Vui lòng sử dụng email hợp lệ'; ok = false; 
    }
    
    if (!formData.password) { 
      e.password = 'Password is required'; ok = false; 
    } else if (formData.password.length < 8) { 
      e.password = 'Password must be at least 8 characters'; ok = false; 
    }

    if (!formData.confirmPassword) {
      e.confirmPassword = 'Please confirm your password'; ok = false;
    } else if (formData.confirmPassword !== formData.password) {
      e.confirmPassword = 'Passwords do not match'; ok = false;
    }
    
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
      console.error('Registration error:', err);
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#f8fafc]">
      
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-16 w-[32rem] h-[32rem] bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h1>
          <p className="text-slate-500 mt-2 text-sm">Start your journey to VSTEP mastery today.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              type="text" name="fullName" value={formData.fullName}
              onChange={handleChange} placeholder="Nguyen Van A"
              className={errors.fullName ? inputError : inputNormal}
              disabled={isLoading}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="you@university.edu.vn"
              className={errors.email ? inputError : inputNormal}
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <input
              type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="Create a strong password"
              className={errors.password ? inputError : inputNormal}
              disabled={isLoading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
            <input
              type="password" name="confirmPassword" value={formData.confirmPassword}
              onChange={handleChange} placeholder="Confirm your password"
              className={errors.confirmPassword ? inputError : inputNormal}
              disabled={isLoading}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* CTA Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating account...
              </>
            ) : (
              'Get Started'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-7 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
