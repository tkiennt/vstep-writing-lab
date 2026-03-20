'use client';

import React from 'react';
import { SentenceAnalysis } from '@/types/grading';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getQualityColor(s.quality)}`}>
                  {getQualityIcon(s.quality)}
                </div>
                {getIssueBadge(s.structureUsed)}
              </div>
              
              <p className="text-slate-800 font-medium leading-relaxed mb-4">“{s.sentence}”</p>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">AI Nhận xét</span>
                <p className="text-xs text-slate-600 font-bold leading-relaxed">{s.feedbackVi}</p>
              </div>

              {s.improvedVersion && s.quality !== 'strong' && (
                <div className="mt-4 p-4 bg-white border-2 border-emerald-500/10 rounded-2xl flex items-start gap-3">
                  <span className="text-emerald-600 font-black text-xs shrink-0 mt-1">Sáng tạo hơn:</span>
                  <p className="text-sm text-slate-700 font-black italic">“{s.improvedVersion}”</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getQualityColor(q: string) {
  if (q === 'strong') return 'bg-emerald-100 text-emerald-600 border-emerald-200';
  if (q === 'weak') return 'bg-rose-50 text-rose-600 border-rose-100';
  return 'bg-amber-50 text-amber-600 border-amber-100';
}

function getQualityIcon(q: string) {
  if (q === 'strong') return <CheckCircle2 className="w-5 h-5" />;
  if (q === 'weak') return <AlertCircle className="w-5 h-5" />;
  return <Info className="w-5 h-5" />;
}

function getIssueBadge(type: string) {
  const styles: Record<string, string> = {
    grammar: 'bg-rose-100 text-rose-700 border-rose-200',
    vocab: 'bg-sky-100 text-sky-700 border-sky-200',
    coherence: 'bg-amber-100 text-amber-700 border-amber-200',
    task: 'bg-purple-100 text-purple-700 border-purple-200',
    none: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  
  const labels: Record<string, string> = {
    grammar: 'Ngữ pháp',
    vocab: 'Từ vựng',
    coherence: 'Mạch lạc',
    task: 'Nhiệm vụ',
    none: 'Tốt',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${styles[type] || styles.none}`}>
      {labels[type] || type}
    </span>
  );
}
