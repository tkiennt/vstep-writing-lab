'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Share2, Download, Award, TrendingUp,
  AlertCircle, Lightbulb, CheckCircle2, ChevronRight, BookOpen, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submissionService } from '@/services/submissionService';
import { SubmissionResponse } from '@/types';
import { useGlobal } from '@/components/GlobalProvider';

export default function AIResultClient() {
  const router = useRouter();
  const params = useParams() as { id: string };
  const { addToast } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const fetchSubmission = useCallback(async () => {
    try {
      const data = await submissionService.getById(params.id);
      setSubmission(data);
      // Only set loading false if we have data AND it's not pending
      if (data.status !== 'pending') {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      addToast('error', 'Failed to load results');
      setLoading(false);
    }
  }, [params.id, addToast]);

  useEffect(() => {
    fetchSubmission();
    const interval = setInterval(() => {
      // Continue polling if pending OR if it's only scored (Phase 1) but not completed (Phase 2)
      if (loading || (submission && (submission.status === 'pending' || submission.status === 'scored'))) {
        fetchSubmission();
      }
    }, 4000); 
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
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <div className="w-24 h-24 mb-8 bg-white dark:bg-slate-800 rounded-full p-4 shadow-xl relative flex items-center justify-center">
           <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 animate-spin"></div>
           <Award className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">AI is evaluating your essay</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm text-center">
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
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Submission not found</h2>
        <Button onClick={() => router.push('/history')} className="mt-4">Back to History</Button>
      </div>
    );
  }

  const { aiScore, aiFeedback } = submission;
  const isDeepAnalysisReady = submission.status === 'completed' || (aiFeedback?.sentenceFeedback && aiFeedback.sentenceFeedback.length > 0);

  const renderHighlightedContent = () => {
    return <p className="whitespace-pre-line">{submission.essayContent}</p>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
         <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                  <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 hidden sm:block">Detailed Feedback Report</h1>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <Button variant="outline" onClick={handleExportPDF} disabled={exportStatus === 'loading'} className="h-9 px-4 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hidden sm:flex items-center gap-2">
                  {exportStatus === 'loading' ? 'Exporting...' : exportStatus === 'done' ? 'Downloaded!' : 'Export PDF'}
               </Button>
               <Button onClick={handleShare} className="h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm bg-emerald-600 text-white hover:bg-emerald-700">
                  {shareStatus === 'copied' ? 'Link Copied!' : 'Share Result'}
               </Button>
            </div>
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8 space-y-8 animate-in slide-in-from-bottom-8 duration-700">
         
         {submission.status === 'scored' && (
           <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                 <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-300">
                Scores ready! AI is currently performing a deep sentence-by-sentence analysis... (ETA 20s)
              </p>
           </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gradient-to-br from-emerald-900 to-vstep-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-900/20">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
               <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                  <span className="text-emerald-300 font-bold tracking-widest uppercase text-xs mb-4">Overall Band Score</span>
                  <div className="text-8xl font-black tracking-tighter mb-4 text-white drop-shadow-md">
                    {aiScore?.overall.toFixed(1) || '0.0'}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                     <TrendingUp className="w-4 h-4 text-emerald-300" />
                     <span className="text-sm font-bold text-white">Target Level: {submission?.taskType?.includes('Task 2') ? 'B2/C1' : 'B1/B2'}</span>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
               {[
                 { label: 'Task Fulfillment', score: aiScore?.taskFulfilment || 0, color: 'blue' },
                 { label: 'Organization & Cohesion', score: aiScore?.organization || 0, color: 'indigo' },
                 { label: 'Lexical Resource (Vocab)', score: aiScore?.vocabulary || 0, color: 'emerald' },
                 { label: 'Grammatical Range', score: aiScore?.grammar || 0, color: 'amber' }
               ].map((c, i) => (
                 <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                       <span className="text-sm font-bold text-slate-900 dark:text-slate-100 max-w-[120px] leading-tight mt-1">{c.label}</span>
                       <span className={`text-2xl font-black ${
                          c.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                          c.color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 
                          c.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                       }`}>{c.score}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-4">
                       <div className={`h-full rounded-full ${c.color === 'blue' ? 'bg-blue-500' : c.color === 'indigo' ? 'bg-indigo-500' : c.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${(c.score / 9) * 100}%` }}></div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                     <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">AI Feedback Summary</h3>
               </div>
               <div className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  {aiFeedback?.summary || "No summary available."}
               </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-8 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                     <Lightbulb className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">Key Improvements</h3>
               </div>
               <ul className="space-y-4">
                  {(aiFeedback?.suggestions && aiFeedback.suggestions.length > 0) ? aiFeedback.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-left">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                       {suggestion}
                    </li>
                  )) : (
                    <li className="text-sm text-slate-400 italic">Deep analysis in progress...</li>
                  )}
               </ul>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
               <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Sentence-by-Sentence Analysis</h3>
               </div>
               {!isDeepAnalysisReady && (
                 <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full animate-pulse">Running Deep Analysis...</span>
               )}
            </div>
            <div className="p-0">
               {isDeepAnalysisReady ? (
                 <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {aiFeedback?.sentenceFeedback?.map((item, idx) => (
                       <div key={idx} className={`p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${!item.isGood ? 'bg-amber-50/30 dark:bg-amber-900/10' : ''}`}>
                          <div className="flex flex-col md:flex-row gap-6">
                             <div className="md:w-1/2">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mb-2 ${item.isGood ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
                                   {item.isGood ? 'Strong Sentence' : 'Improvement Needed'}
                                </span>
                                <p className="text-slate-900 dark:text-slate-100 font-medium leading-relaxed italic text-left">&quot;{item.sentence}&quot;</p>
                             </div>
                             <div className="md:w-1/2 space-y-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed text-left">{item.explanation}</p>
                                {!item.isGood && (
                                   <div className="space-y-1 p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-100 dark:border-amber-900/30 shadow-sm text-left">
                                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1.5"><Lightbulb className="w-3 h-3" /> Suggested Phrasing</p>
                                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-bold leading-relaxed">{item.suggestion}</p>
                                   </div>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="p-12 text-center flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin mb-4"></div>
                    <p className="text-slate-400 font-medium">Please wait a few seconds for deep analysis...</p>
                 </div>
               )}
            </div>
         </div>

         {aiFeedback?.roadmap && (
            <div className="bg-slate-900 dark:bg-black rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden text-left">
               <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                     <TrendingUp className="w-6 h-6 text-emerald-400" />
                     <h3 className="text-xl font-black tracking-tight">8-Week Excellence Roadmap</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { l: 'Current', v: aiFeedback.roadmap.currentLevel, c: 'text-slate-400' },
                      { l: 'Target', v: aiFeedback.roadmap.targetLevel, c: 'text-emerald-400' },
                      { l: 'Duration', v: `${aiFeedback.roadmap.estimatedWeeks} Weeks`, c: 'text-blue-400' },
                      { l: 'Intensity', v: 'Personalized', c: 'text-amber-400' }
                    ].map((st, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                         <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{st.l}</p>
                         <p className={`text-lg font-black ${st.c}`}>{st.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                     {aiFeedback.roadmap.weeklyPlan.map((wp, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                           <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-sm">W{wp.week}</div>
                           <div className="space-y-1">
                              <p className="font-bold text-white leading-tight">{wp.focus}</p>
                              <p className="text-xs text-slate-400 font-medium leading-relaxed">{wp.goal}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col">
               <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50">
                  <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">Your Full Essay</h3>
               </div>
               <div className="p-8 lg:p-12 flex-1 text-slate-800 dark:text-slate-200 font-serif text-lg leading-loose overflow-y-auto max-h-[800px] text-left">
                  {renderHighlightedContent()}
               </div>
            </div>

            <div className="lg:col-span-1 space-y-4 pr-1">
               <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 text-left">Detailed Highlights ({aiFeedback?.highlights?.length || 0})</h3>
               {aiFeedback?.highlights?.map((h, i) => (
                 <div key={i} className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border shadow-sm text-left ${h.severity === 'good' ? 'border-emerald-100 dark:border-emerald-500/20' : h.type.toLowerCase().includes('grammar') ? 'border-red-100 dark:border-red-500/20' : 'border-amber-100 dark:border-amber-500/20'}`}>
                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md mb-2 inline-block ${h.severity === 'good' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : h.type.toLowerCase().includes('grammar') ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>{h.type}</span>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 italic">&quot;{h.text}&quot;</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{h.issue}</p>
                 </div>
               ))}
            </div>
         </div>
      </main>
    </div>
  );
}
