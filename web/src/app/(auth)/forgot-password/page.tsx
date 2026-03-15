import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8 relative">
          <Link href="/login" className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-50">
             <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset password</h2>
          <p className="text-gray-500 mt-2 text-sm max-w-[240px] mx-auto">Enter your email address to receive a password reset link.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input 
              type="email" 
              placeholder="you@university.edu.vn" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50"
            />
          </div>

          <Button className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl py-6 text-base font-semibold transition-all shadow-md shadow-emerald-900/10 mt-6">
            Send Reset Link
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Remember it?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
