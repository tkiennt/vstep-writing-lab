'use client';

import React from 'react';
import { SentenceAnalysis } from '@/types/grading';
import { CheckCircle2, AlertCircle, Info, ChevronDown } from 'lucide-react';

interface SentenceBreakdownProps {
  sentences: SentenceAnalysis[];
}

export const SentenceBreakdown: React.FC<SentenceBreakdownProps> = ({ sentences }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900">Phân tích từng câu</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Chi tiết cấu trúc & chất lượng</p>
      </div>

      <div className="grid gap-4">
        {sentences.map((s, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:border-emerald-200 transition-all group shadow-sm">
            <div className="flex items-start gap-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getQualityColor(s.quality)}`}>
                {getQualityIcon(s.quality)}
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-medium leading-relaxed mb-4">“{s.sentence}”</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nhận xét</span>
                    <p className="text-xs text-slate-600 font-bold leading-relaxed">{s.feedbackVi}</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block mb-2">Cấu trúc sử dụng</span>
                    <p className="text-xs text-emerald-900 font-bold leading-relaxed">{s.structureUsed}</p>
                  </div>
                </div>

                {s.improvedVersion && (
                  <div className="mt-4 p-4 bg-white border-2 border-emerald-500/10 rounded-2xl flex items-start gap-3">
                    <span className="text-emerald-600 font-black text-xs shrink-0 mt-1">Sáng tạo hơn:</span>
                    <p className="text-sm text-slate-700 font-black italic">“{s.improvedVersion}”</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getQualityColor(q: string) {
  if (q === 'strong') return 'bg-emerald-100 text-emerald-600';
  if (q === 'weak') return 'bg-red-100 text-red-600';
  return 'bg-amber-100 text-amber-600';
}

function getQualityIcon(q: string) {
  if (q === 'strong') return <CheckCircle2 className="w-5 h-5" />;
  if (q === 'weak') return <AlertCircle className="w-5 h-5" />;
  return <Info className="w-5 h-5" />;
}
