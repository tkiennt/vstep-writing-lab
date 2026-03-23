'use client';

import React from 'react';
import { ExamPrompt } from '@/types/grading';
import { Star, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface ExamCardProps {
  exam: ExamPrompt;
  onSelect: (exam: ExamPrompt) => void;
}

const TOPIC_ICONS: Record<string, string> = {
  housing:     "🏠",  travel:      "✈️",
  education:   "📚",  workplace:   "💼",
  health:      "🏥",  technology:  "💻",
  environment: "🌿",  society:     "👥",
  shopping:    "🛍️",  community:   "🏘️",
  service:     "⭐",  economy:     "💰",
};

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onSelect }) => {
  const icon = TOPIC_ICONS[exam.topicCategory.toLowerCase()] || "📝";
  
  return (
    <div 
      className="group relative bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
      onClick={() => onSelect(exam)}
    >
      {/* Decorative Gradient Background (Hover) */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Icon and Category */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500 shadow-inner">
            {icon}
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Chủ đề</span>
            <span className="text-sm font-black text-slate-800 capitalize leading-none">{exam.topicCategory}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-3.5 h-3.5 ${i < exam.difficulty ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
            />
          ))}
        </div>
      </div>

      {/* Title / Keyword */}
      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-3 line-clamp-1 group-hover:text-emerald-700 transition-colors capitalize">
        {exam.topicKeyword}
      </h3>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider ">
          <BookOpen className="w-3 h-3" />
          {exam.taskType === 'task1' ? 'Task 1: Thư/Email' : 'Task 2: Bài luận'}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-50 text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">
          <Layers className="w-3 h-3" />
          Mức độ {exam.cefrLevel}
        </div>
      </div>

      {/* Preview Instruction */}
      <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-5 italic mb-8 grow whitespace-pre-line">
        "{exam.taskType.toLowerCase() === 'task1' 
          ? (exam.instruction.split(/[.?!]/)[0] + '.')
          : (exam.instruction.replace(/([•*])/g, '\n$1').trim().slice(0, 200) + (exam.instruction.length > 200 ? '...' : ''))
        }"
      </p>

      {/* Footer / CTA */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Sử dụng: <span className="text-slate-600">{exam.usageCount} lần</span>
        </div>
        <button className="flex items-center gap-2 text-emerald-700 font-black text-sm group-hover:gap-3 transition-all">
          Bắt đầu ngay <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
