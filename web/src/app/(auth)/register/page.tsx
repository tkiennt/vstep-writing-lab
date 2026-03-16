import Link from 'next/link';
import { BookOpen, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h2>
          <p className="text-gray-500 mt-2 text-sm">Start your journey to VSTEP mastery today.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              placeholder="Nguyen Van A" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email bounds</label>
            <input 
              type="email" 
              placeholder="you@university.edu.vn" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="Create a strong password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors bg-gray-50/50"
            />
          </div>

          <Button className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl py-6 text-base font-semibold transition-all shadow-md shadow-emerald-900/10 mt-6">
            Get Started
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
