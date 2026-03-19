'use client';

import React, { useMemo } from 'react';
import { Annotation } from '@/types/grading';

interface AnnotatedEssayProps {
  text: string;
  annotations: Annotation[];
}

export const AnnotatedEssay: React.FC<AnnotatedEssayProps> = ({ text, annotations }) => {
  const chunks = useMemo(() => {
    const sorted = [...annotations].sort((a, b) => a.startIndex - b.startIndex);
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((anno, i) => {
      // Add plain text before annotation
      if (anno.startIndex > lastIndex) {
        result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex, anno.startIndex)}</span>);
      }

      // Add highlighted text
      const highlightClass = getHighlightClass(anno.severity, anno.type);
      result.push(
        <span 
          key={`anno-${i}`} 
          className={`relative group cursor-help border-b-2 transition-colors ${highlightClass}`}
          title={anno.message}
        >
          {text.slice(anno.startIndex, anno.endIndex)}
          
          {/* Tooltip */}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black uppercase tracking-widest text-[10px] text-slate-400">{anno.type}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getSeverityBadge(anno.severity)}`}>
                {anno.severity}
              </span>
            </div>
            <p className="font-medium leading-relaxed mb-3">{anno.message}</p>
            {anno.suggestion && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-slate-500 font-bold block mb-1">Gợi ý sửa:</span>
                <span className="text-emerald-400 font-black text-sm">“{anno.suggestion}”</span>
              </div>
            )}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
          </span>
        </span>
      );

      lastIndex = anno.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);
    }

    return result;
  }, [text, annotations]);

  return (
    <div className="bg-white rounded-[2.5rem] p-10 sm:p-14 border border-slate-100 shadow-sm leading-[2.5] text-slate-700 text-lg font-medium whitespace-pre-wrap">
       {chunks}
    </div>
  );
};

function getHighlightClass(severity: string, type: string) {
  if (severity === 'good') return 'border-emerald-400 bg-emerald-50/30 hover:bg-emerald-100/50';
  if (type === 'off_topic') return 'border-red-400 bg-red-50/30 hover:bg-red-100/50 decoration-wavy';
  if (severity === 'error') return 'border-red-500 bg-red-50/50 hover:bg-red-100/70 shadow-[inset_0_-2px_0_rgba(239,68,68,0.2)]';
  if (severity === 'warning') return 'border-amber-400 bg-amber-50/30 hover:bg-amber-100/50';
  return 'border-sky-400 bg-sky-50/30 hover:bg-sky-100/50';
}

function getSeverityBadge(severity: string) {
  if (severity === 'error') return 'bg-red-500 text-white';
  if (severity === 'warning') return 'bg-amber-400 text-slate-900';
  if (severity === 'good') return 'bg-emerald-500 text-white';
  return 'bg-slate-700 text-white';
}
