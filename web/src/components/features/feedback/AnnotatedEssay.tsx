'use client';

import React, { useMemo } from 'react';
import { Annotation } from '@/types/grading';
import { CheckCircle2, AlertTriangle, Info, Star, Lightbulb } from 'lucide-react';

interface AnnotatedEssayProps {
  text: string;
  annotations: Annotation[];
}

export const AnnotatedEssay: React.FC<AnnotatedEssayProps> = ({ text, annotations }) => {
  const chunks = useMemo(() => {
    // 1. Collect all boundary points
    const points = new Set<number>([0, text.length]);
    annotations.forEach(a => {
      points.add(a.startIndex);
      points.add(a.endIndex);
    });
    const sortedPoints = Array.from(points).sort((a, b) => a - b);

    // 2. Map gaps between points to their applicable annotations
    const result: React.ReactNode[] = [];
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const start = sortedPoints[i];
      const end = sortedPoints[i + 1];
      const chunkText = text.slice(start, end);
      if (!chunkText) continue;

      const applicable = annotations.filter(a => a.startIndex <= start && a.endIndex >= end);

      if (applicable.length === 0) {
        result.push(<span key={start}>{chunkText}</span>);
        continue;
      }

      // Sort by severity (error > warning > info > good)
      const sortedApplicable = [...applicable].sort((a, b) => {
        const priority: Record<string, number> = { error: 4, warning: 3, info: 2, good: 1 };
        return (priority[b.severity] || 0) - (priority[a.severity] || 0);
      });

      const mostSevere = sortedApplicable[0];
      const highlightClass = getHighlightClass(mostSevere.severity, mostSevere.type);
      const hasSentence = applicable.some((a: any) => a.isSentence);

      result.push(
        <span 
          key={start} 
          className={`relative group cursor-help transition-all duration-300 ${highlightClass} 
            ${hasSentence ? 'border-b-2' : 'border-b-[3px] border-dashed'} rounded-sm px-0.5 -mx-0.5`}
        >
          {chunkText}
          
          {/* Tooltip for all applicable annotations */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-80 p-0 bg-slate-900 border border-white/10 text-white text-xs rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 animate-in fade-in slide-in-from-bottom-2 overflow-hidden shadow-emerald-950/20">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {sortedApplicable.map((anno, idx) => {
                const Icon = getIcon(anno.severity, anno.type);
                return (
                  <div key={idx} className={`p-5 ${idx > 0 ? 'border-t border-white/5' : ''} ${anno.severity === 'good' ? 'bg-emerald-500/5' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${anno.severity === 'good' ? 'text-emerald-400' : 'text-slate-400'}`} />
                        <span className="font-black uppercase tracking-widest text-[9px] text-slate-400">
                          {anno.type === 'sentence' ? 'Nhận xét câu' : anno.type}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${getSeverityBadge(anno.severity)}`}>
                        {anno.severity === 'good' ? 'Tốt' : (anno.severity === 'error' ? 'Lỗi' : 'Gợi ý')}
                      </span>
                    </div>
                    <p className="font-medium leading-relaxed text-[13px] text-slate-200 mb-2">{anno.message}</p>
                    {anno.suggestion && (
                      <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                          <Lightbulb className="w-3 h-3 text-emerald-400" />
                          <span className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Gợi ý nâng cấp</span>
                        </div>
                        <span className="text-white font-bold text-sm leading-relaxed block italic">“{anno.suggestion}”</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </span>
        </span>
      );
    }

    return result;
  }, [text, annotations]);

  return (
    <div className="bg-white rounded-[2.5rem] p-10 sm:p-14 border border-slate-100 shadow-sm leading-[3] text-slate-700 text-lg font-medium whitespace-pre-wrap">
       {chunks}
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
  if (severity === 'good') return 'border-emerald-400/50 bg-emerald-50/40 hover:bg-emerald-100/60 decoration-emerald-200';
  if (type === 'off_topic') return 'border-red-400 bg-red-50/30 hover:bg-red-100/50 decoration-wavy';
  if (severity === 'error') return 'border-red-500/60 bg-red-50/60 hover:bg-red-100 shadow-[inset_0_-1px_0_rgba(239,68,68,0.1)]';
  if (severity === 'warning') return 'border-amber-400/60 bg-amber-50/40 hover:bg-amber-100 shadow-[inset_0_-1px_0_rgba(245,158,11,0.1)]';
  return 'border-sky-400/50 bg-sky-50/30 hover:bg-sky-100/50';
}

function getSeverityBadge(severity: string) {
  if (severity === 'error') return 'bg-red-500/20 text-red-500 border border-red-500/20';
  if (severity === 'warning') return 'bg-amber-500/20 text-amber-600 border border-amber-500/20';
  if (severity === 'good') return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
  return 'bg-slate-700 text-white';
}
