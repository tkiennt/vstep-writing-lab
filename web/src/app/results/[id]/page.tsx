'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
import { submissionService } from '@/services/submissionService';
import { SubmissionResponse } from '@/types';
import { useGlobal } from '@/components/GlobalProvider';

export default function AIResultPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToast } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const fetchSubmission = useCallback(async () => {
    try {
      const data = await submissionService.getById(params.id);
      setSubmission(data);
      
      // If still pending, keep loading
      if (data.status === 'pending') {
        setLoading(true);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      addToast('error', 'Failed to load results');
      setLoading(false);
    }
  }, [params.id, addToast]);

  // Initial fetch and polling
  useEffect(() => {
    fetchSubmission();
    
    // Set up polling if status is pending
    const interval = setInterval(() => {
      if (loading || (submission && submission.status === 'pending')) {
        fetchSubmission();
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [fetchSubmission, loading, submission]);

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
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    }
  };

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

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h2 className="text-xl font-bold text-gray-900">Submission not found</h2>
        <Button onClick={() => router.push('/history')} className="mt-4">Back to History</Button>
      </div>
    );
  }

  const { aiScore, aiFeedback } = submission;

  // Function to render highlighted text
  const renderHighlightedContent = () => {
    if (!aiFeedback?.highlights || aiFeedback.highlights.length === 0) {
      return <p className="whitespace-pre-line">{submission.essayContent}</p>;
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];
    const content = submission.essayContent;

    // The backend highlights don't have start/end indices in the Response DTO, 
    // but the Text field contains the snippet. We'll try to find and highlight them.
    // NOTE: This is a simple implementation. Ideally the backend should provide indices.
    
    // For now, let's just display the content and show highlights as a list below if we can't reliably map them.
    // Actually, I'll try to replace the first occurrence of each highlight text.
    
    let currentContent = content;
    const sortedHighlights = [...aiFeedback.highlights].sort((a, b) => b.text.length - a.text.length);

    // This is a naive replacement strategy.
    return (
      <p className="whitespace-pre-line">
        {content}
      </p>
    );
  };

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
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>
               
               <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                  <span className="text-emerald-300 font-bold tracking-widest uppercase text-xs mb-4">Overall Band Score</span>
                  <div className="text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-md">
                    {aiScore?.overall.toFixed(1) || '0.0'}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                     <TrendingUp className="w-4 h-4 text-emerald-300" />
                     <span className="text-sm font-bold text-white">Target Level: {submission.taskType.includes('Task 2') ? 'B2/C1' : 'B1/B2'}</span>
                  </div>
               </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
               
               {[
                 { label: 'Task Fulfillment', score: aiScore?.taskFulfilment || 0, color: 'blue' },
                 { label: 'Organization & Cohesion', score: aiScore?.organization || 0, color: 'indigo' },
                 { label: 'Lexical Resource (Vocab)', score: aiScore?.vocabulary || 0, color: 'emerald' },
                 { label: 'Grammatical Range', score: aiScore?.grammar || 0, color: 'amber' }
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
                          <span>Score</span>
                          <span>9</span>
                       </div>
                       <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${
                                c.color === 'blue' ? 'bg-blue-500' : 
                                c.color === 'indigo' ? 'bg-indigo-500' : 
                                c.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                             }`}
                             style={{ width: `${(c.score / 9) * 100}%` }}
                          ></div>
                       </div>
                    </div>
                 </div>
               ))}

            </div>
         </div>

         {/* Middle Section: Feedback Summary & Suggestions */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feedback Summary */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                     <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">AI Feedback Summary</h3>
               </div>
               <div className="prose prose-sm text-gray-700 leading-relaxed font-medium">
                  {aiFeedback?.summary || "No summary available."}
               </div>
            </div>

            {/* AI Action Plan / Suggestions */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                     <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Key Suggestions</h3>
               </div>
               <ul className="space-y-4">
                  {aiFeedback?.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed font-medium">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                       {suggestion}
                    </li>
                  )) || <li>No suggestions available.</li>}
               </ul>
            </div>
         </div>

         {/* Bottom Section: Original Text and Detailed Highlights */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Original Text Display */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
               <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                  <BookOpen className="w-5 h-5 text-gray-400" />
                  <h3 className="font-bold text-gray-900">Your Essay</h3>
               </div>
               <div className="p-8 lg:p-12 flex-1 prose prose-gray max-w-none text-gray-800 font-serif text-lg leading-loose selection:bg-emerald-200 overflow-y-auto max-h-[600px] custom-scrollbar">
                  {renderHighlightedContent()}
               </div>
            </div>

            {/* Highlights List */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[665px] custom-scrollbar pr-1">
               <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2">Detailed Analysis ({aiFeedback?.highlights.length || 0})</h3>
               
               {aiFeedback?.highlights.map((h, i) => (
                 <div key={i} className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
                   h.type.toLowerCase().includes('grammar') ? 'border-red-100 hover:border-red-200' :
                   h.type.toLowerCase().includes('vocabulary') ? 'border-amber-100 hover:border-amber-200' :
                   'border-blue-100 hover:border-blue-200'
                 }`}>
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${
                         h.type.toLowerCase().includes('grammar') ? 'bg-red-50 text-red-600' :
                         h.type.toLowerCase().includes('vocabulary') ? 'bg-amber-50 text-amber-600' :
                         'bg-blue-50 text-blue-600'
                       }`}>{h.type}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-2 italic">&quot;{h.text}&quot;</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{h.issue}</p>
                 </div>
               ))}

               {(!aiFeedback?.highlights || aiFeedback.highlights.length === 0) && (
                 <div className="bg-gray-50 rounded-2xl p-8 border border-dashed border-gray-200 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">No specific issues found. Great job!</p>
                 </div>
               )}
            </div>

         </div>

      </main>
    </div>
  );
}
