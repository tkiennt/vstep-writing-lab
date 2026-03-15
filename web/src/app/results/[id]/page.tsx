'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Share2,
  Download,
  Award,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AIResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const handleExportPDF = () => {
    setExportStatus('loading');
    setTimeout(() => {
      setExportStatus('done');
      setTimeout(() => setExportStatus('idle'), 2000);
    }, 1500);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } catch {
      // Fallback
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

  // Fake AI Loading State for 3 seconds to demonstrate the UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50/50">
        <div className="w-24 h-24 mb-8 bg-white rounded-full p-4 shadow-xl shadow-emerald-900/5 relative flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
           <Award className="w-10 h-10 text-emerald-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-3">AI is evaluating your essay</h2>
        <p className="text-gray-500 font-medium max-w-sm text-center">
           Analyzing lexical resources, grammatical range, coherence, and task achievement...
        </p>
        <div className="mt-8 flex gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
           <div className="w-2 h-2 rounded-full bg-emerald-500/70 animate-bounce" style={{ animationDelay: '150ms' }}></div>
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
         <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                  <h1 className="text-sm font-bold text-gray-900 hidden sm:block">Detailed Feedback Report</h1>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button 
                 variant="outline" 
                 onClick={handleExportPDF}
                 disabled={exportStatus === 'loading'}
                 className="h-9 px-4 rounded-xl text-xs font-bold border-gray-200 text-gray-600 hidden sm:flex items-center gap-2"
               >
                  {exportStatus === 'loading' ? (
                    <><div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div> Exporting...</>
                  ) : exportStatus === 'done' ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-600" /> Downloaded!</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" /> Export PDF</>
                  )}
               </Button>
               <Button 
                 onClick={handleShare}
                 className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all ${
                   shareStatus === 'copied' 
                     ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                     : 'bg-vstep-dark hover:bg-emerald-900 text-white'
                 }`}
               >
                  {shareStatus === 'copied' ? (
                    <><Check className="w-3.5 h-3.5" /> Link Copied!</>
                  ) : (
                    <><Share2 className="w-3.5 h-3.5" /> Share Result</>
                  )}
               </Button>
            </div>
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
         
         {/* Top Section: Overall Score & Criteria */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Massive Band Score Card */}
            <div className="lg:col-span-1 bg-gradient-to-br from-emerald-900 to-vstep-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
               {/* Decorative circles */}
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>
               
               <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                  <span className="text-emerald-300 font-bold tracking-widest uppercase text-xs mb-4">Overall Band Score</span>
                  <div className="text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-md">7.5</div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                     <TrendingUp className="w-4 h-4 text-emerald-300" />
                     <span className="text-sm font-bold text-white">+0.5 from last test</span>
                  </div>
               </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
               
               {[
                 { label: 'Task Fulfillment', score: '7.5', target: 'C1', color: 'blue' },
                 { label: 'Organization & Cohesion', score: '8.0', target: 'C1', color: 'indigo' },
                 { label: 'Lexical Resource (Vocab)', score: '7.0', target: 'B2', color: 'emerald' },
                 { label: 'Grammatical Range', score: '7.5', target: 'C1', color: 'amber' }
               ].map((c, i) => (
                 <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                       <span className="text-sm font-bold text-gray-900 max-w-[120px] leading-tight mt-1">{c.label}</span>
                       <span className={`text-2xl font-black ${
                          c.color === 'blue' ? 'text-blue-600' : 
                          c.color === 'indigo' ? 'text-indigo-600' : 
                          c.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
                       }`}>{c.score}</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                       <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
                          <span>0</span>
                          <span>{c.target} Equivalent</span>
                          <span>10</span>
                       </div>
                       <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${
                                c.color === 'blue' ? 'bg-blue-500' : 
                                c.color === 'indigo' ? 'bg-indigo-500' : 
                                c.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                             }`}
                             style={{ width: `${(parseFloat(c.score) / 10) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>
               ))}

            </div>
         </div>

         {/* Middle Section: Written Feedback Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                     <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Key Strengths</h3>
               </div>
               <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                     Excellent use of introductory hooks and clear thesis statement structuring.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                     Logical flow of ideas smoothly connected by cohesive devices (Furthermore, However).
                  </li>
               </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                     <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Areas to Improve</h3>
               </div>
               <ul className="space-y-4">
                  <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                     Occasional subject-verb agreement errors in complex sentences.
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                     Vocabulary is somewhat repetitive regarding the word "important".
                  </li>
               </ul>
            </div>

            {/* AI Action Plan */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden group hover:bg-indigo-50 transition-colors cursor-pointer">
               <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                     <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">AI Suggestions</h3>
               </div>
               <p className="text-sm text-gray-700 leading-relaxed font-medium mb-6 relative z-10">
                  Try substituting generic words with C1 level synonyms (e.g., crucial, imperative, indispensable). Review relative clauses.
               </p>
               <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent text-indigo-700 font-bold relative z-10 group/btn">
                  View Study Plan <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
               </Button>
            </div>

         </div>

         {/* Bottom Section: Original Text with Highlights */}
         <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
               <BookOpen className="w-5 h-5 text-gray-400" />
               <h3 className="font-bold text-gray-900">Your Essay Analysis</h3>
            </div>
            <div className="p-8 lg:p-12 prose prose-gray max-w-none text-gray-800 font-serif text-lg leading-loose selection:bg-emerald-200">
               <p>
                  In the modern world, an <span className="bg-blue-100 text-blue-900 font-medium px-1.5 rounded cursor-help border-b-2 border-blue-400" title="Good Collocation (+0.5 Lexical)">increasing number</span> of students choose to go abroad for their higher education. While there are certainly some drawbacks to this trend, I believe that the benefits are far more <span className="bg-amber-100 text-amber-900 font-medium px-1.5 rounded cursor-help border-b-2 border-amber-400" title="Repetitive word. Suggestion: 'substantial' or 'significant'">important</span>.
               </p>
               <p>
                  First of all, studying in a foreign country <span className="text-emerald-700 font-bold underline decoration-wavy decoration-emerald-400" title="Excellent C1 Vocabulary">broadens one's horizons</span>. Students are exposed to different cultures and ways of thinking, which helps them become more open-minded. <span className="bg-red-100 text-red-900 font-medium px-1.5 rounded cursor-help border-b-2 border-red-500" title="Grammar Error: Subject-Verb mismatch. Should be 'Furthermore, experiencing'...">Furthermore, experience</span> a new educational system can provide access to world-class facilities and expert professors that might not be available in their home country.
               </p>
            </div>
         </div>

      </main>
    </div>
  );
}
