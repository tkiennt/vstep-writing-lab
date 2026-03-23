'use client';

import React, { useState, useEffect } from 'react';
import { GradingResultDoc } from '@/types/grading';
import { mapRawToGradingResultDoc } from '@/lib/mapping';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { AnnotatedEssay } from './AnnotatedEssay';
import { Loader2, Zap, FileText, CheckCheck, RefreshCw, AlertCircle, BrainCircuit, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { getSubmissionById } from '@/lib/api';

interface ResultClientProps {
  essayId: string;
}

export function ResultClient({ essayId }: ResultClientProps) {
  const { t } = useTranslation();
  const [result, setResult] = useState<GradingResultDoc | null>(null);
  const [status, setStatus] = useState<'pending' | 'ready' | 'error'>('pending');

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchResult = async () => {
      try {
        const cached = sessionStorage.getItem('lastGradingResult');
        if (cached) {
          const raw = JSON.parse(cached);
          if (raw.id === essayId || raw.submissionId === essayId) {
            const mapped = mapRawToGradingResultDoc(raw, essayId);
            setResult(mapped);
            setStatus('ready');
            return;
          }
        }

        const data = await getSubmissionById(essayId);
        if (data) {
          if (data.status === 'pending') {
            setStatus('pending');
            timer = setTimeout(fetchResult, 3000);
            return;
          }
          const mapped = mapRawToGradingResultDoc(data, essayId);
          setResult(mapped);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error("Result loading error", err);
        setStatus('error');
      }
    };

    fetchResult();
    return () => clearTimeout(timer);
  }, [essayId]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-10">
          <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <BrainCircuit className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('common.loading')}</h2>
        <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">
          {t('practiceList.loading')}
        </p>
      </div>
    );
  }

  if (status === 'error' || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[2rem] shadow-sm border border-slate-100">
           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-slate-900">{t('common.error')}</h3>
           <p className="text-slate-500 mt-2">{t('practiceList.empty.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
             <div>
              <h2 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">{result.questionTitle || t('nav.myResults')}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{result.taskType === 'task1' ? t('practiceList.card.vstepTask1') : t('practiceList.card.vstepTask2')}</span>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">ID: {essayId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/practice-list'}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-emerald-900/10 active:scale-95"
          >
            {t('result.cta.back')}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <ScoreSummaryCard score={result.score} cefrLevel={result.cefrLevel} />
            
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> {t('feedback.detail')}
                </h3>
              </div>
              
              <div className="p-10 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group">
                <AnnotatedEssay 
                  text={result.essayText} 
                  annotations={result.annotations} 
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-bold text-slate-400 border border-slate-100 dark:border-slate-700 uppercase tracking-wider">
                      {result.wordCount} {t('common.words')}
                   </div>
                </div>
              </div>
              <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 font-medium italic flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> * {t('common.loading')}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI Summary */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-600" /> {t('result.aiSummary.title')}
                </h3>
                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 font-medium leading-[1.8] text-sm italic whitespace-pre-wrap">
                  "{result.summary}"
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform" />
            </section>

            {/* Visual Roadmap */}
            {result.roadmap && (
              <section className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> {t('result.roadmap.title')}
                    </h3>
                    <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-emerald-500/20">
                      {t('result.roadmap.target')} {result.roadmap.targetCefr}
                    </div>
                  </div>

                  <div className="space-y-4 relative">
                    {/* Visual line */}
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/50 via-slate-700 dark:via-slate-800 to-transparent" />
                    
                    {result.roadmap.weekly_plan.slice(0, 4).map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 border-2 border-slate-700 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition-colors shadow-sm">
                           <span className="text-xs font-black text-emerald-400">{t('result.roadmap.week').charAt(0)}{step.week}</span>
                        </div>
                        <div className="flex-1 pb-4">
                           <div className="bg-white/5 hover:bg-white/[0.08] p-5 rounded-2xl border border-white/5 transition-all">
                              <h4 className="text-xs font-black text-white/90 mb-1.5 uppercase tracking-tight">{step.goal}</h4>
                              <p className="text-[11px] text-white/50 leading-relaxed font-medium">{step.focus}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                   <button 
                    onClick={() => window.location.href = '/practice-list'}
                    className="w-full py-4 bg-emerald-500 rounded-2xl font-black text-sm mt-6 hover:bg-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20 text-white"
                  >
                    {t('result.cta.new')}
                  </button>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
