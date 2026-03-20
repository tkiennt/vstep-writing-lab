import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LandingLayout from './(landing)/layout';

export default function RootPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-32 lg:pb-32 overflow-hidden px-6">
        <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top,#d1fae5_0%,#f9fafb_50%)] -z-10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" /> Powered by Gemini AI
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tighter leading-[1.1] mb-6">
            Master VSTEP Writing.<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
              Graded in Seconds.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop waiting days for teacher feedback. Experience real exam simulation and get hyper-detailed AI analysis on vocabulary, grammar, and coherence instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/practice-list">
              <Button className="w-full sm:w-auto bg-vstep-dark hover:bg-emerald-900 text-white rounded-full px-10 h-16 text-lg font-bold shadow-xl shadow-vstep-dark/20 flex items-center gap-2 group transition-all hover:scale-105">
                Bắt đầu làm bài miễn phí <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" className="w-full sm:w-auto rounded-full px-10 h-16 text-lg font-bold border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
                Khám phá tính năng
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-24 bg-emerald-50 text-center px-6">
        <h2 className="text-3xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight">Ready to boost your band score?</h2>
        <p className="text-gray-500 mb-10 max-w-xl mx-auto text-lg">Join thousands of students who have upgraded their VSTEP writing skills with our AI platform.</p>
        <Link href="/practice-list">
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-12 h-16 text-lg font-bold shadow-xl shadow-emerald-600/20">
            Start Practicing Now
          </Button>
        </Link>
      </section>
    </LandingLayout>
  );
}
