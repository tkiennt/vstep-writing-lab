'use client';

import React from 'react';
import { GradingResult } from '@/types/grading';
import { Award, Target, BookOpen, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScoreSummaryCardProps {
  score: GradingResult['score'];
  cefrLevel: string;
}

function getVstepTier(cefr: string): string {
  if (cefr.includes('C1')) return 'Bậc 5';
  if (cefr.includes('B2')) return 'Bậc 4';
  if (cefr.includes('B1')) return 'Bậc 3';
  return 'Dưới B1';
}

export const ScoreSummaryCard: React.FC<ScoreSummaryCardProps> = ({ score, cefrLevel }) => {
  const { t } = useTranslation();
  
  const items = [
    { label: t('result.scoreCard.criteria.taskFulfilment'), val: score.taskFulfilment, icon: Target, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { label: t('result.scoreCard.criteria.organization'), val: score.organization, icon: BookOpen, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: t('result.scoreCard.criteria.vocabulary'), val: score.vocabulary, icon: BrainCircuit, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { label: t('result.scoreCard.criteria.grammar'), val: score.grammar, icon: Award, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map((item) => (
        <div key={item.label} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-all">
          <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
            <item.icon className="w-7 h-7" />
          </div>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{item.val}</span>
            <span className="text-slate-300 dark:text-slate-700 font-bold text-sm">/10</span>
          </div>
        </div>
      ))}
      
      {/* Overall Score Banner */}
      <div className="lg:col-span-4 bg-gradient-to-r from-[#064e3b] to-emerald-800 dark:from-emerald-900 dark:to-emerald-950 rounded-[2.5rem] p-8 mt-4 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-emerald-950/10 border border-white/10">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl font-black text-white shadow-2xl border border-white/20">
            {score.overall}
          </div>
          <div className="text-left">
            <h3 className="text-2xl font-black text-white leading-tight">{t('result.scoreCard.overall')}</h3>
            <p className="text-emerald-100/60 font-medium mt-1">
              {t('progress.stats.trendComparison', { defaultValue: 'Est. level:' })} <span className="text-white font-black">{getVstepTier(cefrLevel)} ({cefrLevel})</span>
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/10 text-center">
            <div className="text-white font-black text-xl leading-none">A2-C1</div>
            <div className="text-emerald-200 text-[9px] font-black uppercase tracking-widest mt-1">Thang điểm VSTEP</div>
          </div>
          <div className="bg-white px-8 py-3 rounded-2xl text-[#064e3b] font-black text-sm hover:bg-emerald-50 cursor-pointer transition-colors shadow-lg">
            Xem Roadmap bản thân
          </div>
        </div>
      </div>
    </div>
  );
};
