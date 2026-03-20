import React from 'react';
import { BookOpen, Target } from 'lucide-react';

interface ModeSelectorProps {
  onSelect: (mode: 'guided' | 'unguided') => void;
  onCancel: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Bạn muốn làm bài theo chế độ nào?</h2>
        <p className="text-slate-500 mt-3 font-medium text-base">Chọn chế độ phù hợp với mục tiêu luyện tập của bạn.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Guided Mode */}
        <button
          onClick={() => onSelect('guided')}
          className="group text-left bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Có hướng dẫn</h3>
            <p className="text-emerald-700 text-sm font-bold uppercase tracking-wider mb-6">Dành cho: Luyện tập</p>
            
            <ul className="space-y-3 text-slate-600 font-medium mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Cấu trúc bài viết</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Key points nhắc nhở</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Từ vựng gợi ý & Cấu trúc</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Countdown timer</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Đếm từ</li>
            </ul>
          </div>
        </button>

        {/* Unguided Mode */}
        <button
          onClick={() => onSelect('unguided')}
          className="group text-left bg-white p-8 rounded-3xl border-2 border-slate-100 hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-900/10 transition-all duration-300 relative overflow-hidden flex flex-col h-full"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Không có hướng dẫn</h3>
            <p className="text-sky-700 text-sm font-bold uppercase tracking-wider mb-6">Dành cho: Thi thử thật</p>
            
            <ul className="space-y-3 text-slate-600 font-medium mb-8 flex-1">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" />Điều kiện thi thật</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" />Không có gợi ý</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Countdown timer</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-slate-300" />Đếm từ</li>
            </ul>
          </div>
        </button>
      </div>

      <div className="text-center">
        <button 
          onClick={onCancel}
          className="text-slate-500 font-bold hover:text-slate-800 transition-colors uppercase tracking-widest text-sm"
        >
          ← Xem lại đề
        </button>
      </div>
    </div>
  );
};
