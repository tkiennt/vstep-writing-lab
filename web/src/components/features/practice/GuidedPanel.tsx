'use client';

import React, { useState } from 'react';
import { ExamPrompt } from '@/types/grading';
import { CheckSquare, ListChecks, Lightbulb, BookA } from 'lucide-react';

interface GuidedPanelProps {
  exam: ExamPrompt;
}

const TASK1_CHECKLIST = [
  'Lời chào (Greeting)',
  'Đoạn mở đầu (Opening)',
  'Giải quyết ý 1 (Bullet 1)',
  'Giải quyết ý 2 (Bullet 2)',
  'Giải quyết ý 3 (Bullet 3)',
  'Đoạn kết (Closing)',
  'Lời kết (Sign-off)'
];

const TASK2_CHECKLIST = [
  'Mở bài (Introduction & Thesis)',
  'Thân bài 1 (Body Paragraph 1)',
  'Thân bài 2 (Body Paragraph 2)',
  'Thân bài 3 / Phản biện (Tùy chọn)',
  'Kết luận (Conclusion)'
];

const GUIDED_PHRASES = {
  task1: {
    formalPhrases: [
      "I am writing to complain about...",
      "I would be grateful if you could...",
      "I look forward to hearing from you.",
      "I am requesting that you...",
      "Should this matter remain unresolved...",
    ],
    usefulStructures: [
      "Passive: The issue has not been resolved despite...",
      "Conditional: Should you fail to..., I will...",
      "Present perfect: I have contacted your office twice...",
    ]
  },
  task2: {
    formalPhrases: [
      "It is widely believed that...",
      "There are compelling arguments on both sides...",
      "In conclusion, I firmly believe that...",
      "From my perspective,...",
      "While it is true that..., nevertheless...",
    ],
    usefulStructures: [
      "Concession: Although X, it is important to note that Y",
      "Cause-effect: This has led to / This results in...",
      "Example: For instance, / To illustrate,...",
    ]
  }
};

export const GuidedPanel: React.FC<GuidedPanelProps> = ({ exam }) => {
  const isTask1 = exam.taskType === 'task1';
  const checklist = isTask1 ? TASK1_CHECKLIST : TASK2_CHECKLIST;
  const staticData = isTask1 ? GUIDED_PHRASES.task1 : GUIDED_PHRASES.task2;
  
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());

  const toggleCheck = (idx: number) => {
    const next = new Set(checkedIds);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCheckedIds(next);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2 pb-8">
      
      {/* 1. Structure Checklist */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <ListChecks className="w-4 h-4 text-emerald-600" />
          Hướng dẫn cấu trúc
        </h3>
        <div className="space-y-2.5">
          {checklist.map((item, idx) => (
            <label key={idx} className="flex items-start gap-3 cursor-pointer group">
              <div 
                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors mt-0.5 ${
                  checkedIds.has(idx) 
                    ? 'bg-emerald-500 border-emerald-500' 
                    : 'bg-slate-50 border-slate-300 group-hover:border-emerald-400'
                }`}
              >
                {checkedIds.has(idx) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className={`text-sm font-medium transition-colors ${checkedIds.has(idx) ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {item}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. Key Points */}
      {exam.keyPoints && exam.keyPoints.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Key points cần đề cập
          </h3>
          <ul className="space-y-3">
            {exam.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Vocab & Structures */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
          <BookA className="w-4 h-4 text-sky-500" />
          Gợi ý từ vựng & cấu trúc
        </h3>
        
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">Formal Phrases:</h4>
            <ul className="space-y-2">
              {staticData.formalPhrases.map((phrase, idx) => (
                <li key={idx} className="text-sm text-slate-600 font-medium italic">"{phrase}"</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">Useful Structures:</h4>
            <ul className="space-y-2">
              {staticData.usefulStructures.map((struct, idx) => (
                <li key={idx} className="text-sm text-slate-600 font-medium">{struct}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
};
