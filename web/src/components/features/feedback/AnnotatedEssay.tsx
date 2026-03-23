'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Annotation } from '@/types/grading';
import { CheckCircle2, AlertTriangle, Info, Star, Lightbulb, AlertCircle } from 'lucide-react';

interface AnnotatedEssayProps {
  text: string;
  annotations: Annotation[];
}

export const AnnotatedEssay: React.FC<AnnotatedEssayProps> = ({ text, annotations }) => {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [activeEnd, setActiveEnd] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number, y: number } | null>(null);

  const chunks = useMemo(() => {
    // ... logic remains same, but we add onClick ...
    // (I'll rewrite the loop part to include onClick)
    const result: React.ReactNode[] = [];
    const sortedPoints = Array.from(new Set([0, text.length, ...annotations.flatMap(a => [a.startIndex, a.endIndex])])).sort((a,b)=>a-b);
    
    for (let i = 0; i < sortedPoints.length - 1; i++) {
       const start = sortedPoints[i];
       const end = sortedPoints[i + 1];
       const chunkText = text.slice(start, end);
       if (!chunkText) continue;
       const applicable = annotations.filter(a => a.startIndex <= start && a.endIndex >= end);
       if (applicable.length === 0) {
         result.push(<span key={start} className="whitespace-pre-wrap">{chunkText}</span>);
         continue;
       }
       const sortedApplicable = [...applicable].sort((a, b) => {
         const priority: Record<string, number> = { error: 4, warning: 3, info: 2, good: 1 };
         return (priority[b.severity] || 0) - (priority[a.severity] || 0);
       });
       const { severity, type } = sortedApplicable[0];
       const highlightClass = getHighlightClass(severity, type);

       result.push(
         <span 
           key={start} 
           className={`relative inline cursor-help transition-all duration-300 ${highlightClass} border-b-2 rounded-sm px-0.5 -mx-0.5`}
           onMouseEnter={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             setActiveId(start);
             setActiveEnd(end);
             setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 15 });
           }}
           onMouseLeave={() => setActiveId(null)}
           onClick={() => {
             setSelectedId(start);
             setSelectedEnd(end);
           }}
         >
           {chunkText}
         </span>
       );
    }
    return result;
  }, [text, annotations]);

  return (
    <div className="relative">
      <div className="leading-[2.5] text-slate-700 dark:text-slate-300 text-lg font-medium">
        {chunks}
      </div>

      {/* Hover Tooltip */}
      <AnimatePresence>
        {activeId !== null && activeEnd !== null && tooltipPos && !selectedId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            style={{ 
              position: 'fixed', 
              top: tooltipPos.y, 
              left: tooltipPos.x,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
            className="z-[9999] pointer-events-none"
          >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-emerald-950/20 border border-slate-100 dark:border-slate-800 min-w-[320px] max-w-[420px]">
              <div className="space-y-6">
                {annotations
                  .filter((a) => a.startIndex <= activeId && a.endIndex >= activeEnd)
                  .map((a, i) => {
                    const Icon = getIcon(a.severity, a.type);
                    return (
                      <div key={i} className="relative">
                        {i > 0 && <div className="border-t border-slate-100 dark:border-slate-800 my-5 pt-5" />}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                             <Icon className={`w-4 h-4 ${a.severity === 'good' ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                {t(`feedback.types.${a.type}`, { defaultValue: a.type })}
                             </span>
                          </div>
                        </div>
                        <div className="text-[13px] leading-relaxed font-bold text-slate-800 dark:text-slate-100 line-clamp-3">
                          {a.message}
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-slate-900/95 rotate-45 border-r border-b border-slate-100 dark:border-slate-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal on Click */}
      <AnimatePresence>
        {selectedId !== null && selectedEnd !== null && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 sm:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSelectedId(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">{t('feedback.detail')}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{t('feedback.selected')}</p>
                </div>
                <button 
                  onClick={() => setSelectedId(null)}
                  className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-slate-400 rotate-180" /> {/* Simulating a close/back icon swap if needed, but let's use Lucide X later */}
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-10">
                 {annotations
                  .filter((a) => a.startIndex <= selectedId && a.endIndex >= selectedEnd)
                  .map((a, i) => {
                    const Icon = getIcon(a.severity, a.type);
                    return (
                      <div key={i} className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${a.severity === 'good' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                                 <Icon className="w-6 h-6" />
                              </div>
                              <div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">{t(`feedback.types.${a.type}`, { defaultValue: a.type })}</span>
                                 <span className={`text-xs font-extrabold uppercase ${getSeverityBadge(a.severity)} px-2 py-0.5 rounded`}>
                                    {a.severity === 'good' ? t('feedback.strength') : (a.severity === 'error' ? t('feedback.error') : t('feedback.warning'))}
                                 </span>
                              </div>
                           </div>
                        </div>

                        <div className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed bg-slate-50 dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 whitespace-pre-wrap">
                          {a.message}
                        </div>

                        {a.suggestion && (
                          <div className="p-8 bg-emerald-50 dark:bg-emerald-500/5 rounded-[2rem] border border-emerald-100/50 dark:border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-4">
                              <Lightbulb className="w-5 h-5 text-emerald-500" />
                              <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">{t('feedback.aiUpgrade')}</span>
                            </div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-[1.8] italic whitespace-pre-wrap">
                               “{a.suggestion}”
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                 <button 
                  onClick={() => setSelectedId(null)}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:opacity-90 transition-opacity"
                 >
                   {t('feedback.understand')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getIcon(severity: string, type: string) {
  if (severity === 'good') return Star;
  if (severity === 'error') return AlertTriangle;
  if (type === 'sentence') return CheckCircle2;
  return Info;
}

function getHighlightClass(severity: string, type: string) {
  if (severity === 'good') return 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/10 hover:bg-emerald-100/60 dark:hover:bg-emerald-500/20 decoration-emerald-200';
  if (type === 'off_topic') return 'border-red-400 dark:border-red-500/50 bg-red-50/30 dark:bg-red-500/10 hover:bg-red-100/50 dark:hover:bg-red-500/20 decoration-wavy';
  if (severity === 'error') return 'border-red-200 dark:border-red-500/30 bg-red-50/40 dark:bg-red-500/10 hover:bg-red-100/60 dark:hover:bg-red-500/20';
  if (severity === 'warning') return 'border-amber-200 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/10 hover:bg-amber-100/60 dark:hover:bg-amber-500/20';
  return 'border-sky-200 dark:border-sky-500/30 bg-sky-50/30 dark:bg-sky-500/10 hover:bg-sky-100/50 dark:hover:bg-sky-500/20';
}

function getSeverityBadge(severity: string) {
  if (severity === 'error') return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20';
  if (severity === 'warning') return 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20';
  if (severity === 'good') return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20';
  return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700';
}
