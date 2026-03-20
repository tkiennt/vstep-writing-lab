import React from 'react';
import { BookOpen, Target, Layers } from 'lucide-react';

interface ModeSelectorProps {
  onSelect: (mode: 'exam' | 'practice' | 'guide') => void;
  onCancel: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onCancel }) => {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Chọn chế độ luyện tập</h2>
        <p className="text-slate-500 font-medium text-lg">AI sẽ điều chỉnh cách chấm điểm và phản hồi theo mục tiêu của bạn.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Exam Mode */}
        <button
          onClick={() => onSelect('exam')}
          className="group text-left bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 relative overflow-hidden flex flex-col"
        >
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mb-6 shrink-0">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Thi thử (Exam)</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1">
            Chấm điểm khắt khe theo format VSTEP. Phân tích lỗi sai và gợi ý sửa đổi chi tiết.
          </p>
          <div className="pt-6 border-t border-slate-50 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
            Phù hợp: Đánh giá trình độ
          </div>
        </button>

        {/* Practice Mode */}
        <button
          onClick={() => onSelect('practice')}
          className="group text-left bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-sky-500 hover:shadow-2xl hover:shadow-sky-900/10 transition-all duration-300 relative overflow-hidden flex flex-col"
        >
          <div className="w-14 h-14 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center mb-6 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Luyện tập (Practice)</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1">
            Chấm điểm nhẹ nhàng hơn. Tập trung vào việc gợi ý từ vựng và cấu trúc hay để nâng band.
          </p>
          <div className="pt-6 border-t border-slate-50 text-[10px] font-black text-sky-600 uppercase tracking-widest">
            Phù hợp: Học từ mới & Cấu trúc
          </div>
        </button>

        {/* Guide Mode */}
        <button
          onClick={() => onSelect('guide')}
          className="group text-left bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-900/10 transition-all duration-300 relative overflow-hidden flex flex-col"
        >
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mb-6 shrink-0">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Hướng dẫn (Guide)</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1">
            Không chấm điểm. AI cung cấp dàn ý và gợi ý câu mở đầu để bạn tự tin viết bài.
          </p>
          <div className="pt-6 border-t border-slate-50 text-[10px] font-black text-purple-600 uppercase tracking-widest">
            Phù hợp: Người mới bắt đầu
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
