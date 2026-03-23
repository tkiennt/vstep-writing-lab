import React, { useState } from 'react';
import { BookOpen, Target, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ModeSelectorProps {
  onSelect: (mode: 'exam' | 'practice' | 'guide') => void;
  onCancel: () => void;
}

type ModeType = 'exam' | 'practice' | 'guide';

const MODES: Record<ModeType, { title: string; desc: string; color: string; icon: React.ReactNode; sub: string }> = {
  exam: {
    title: 'Thi thử (Exam)',
    desc: 'Chấm điểm khắt khe theo format VSTEP. Phân tích lỗi sai và gợi ý sửa đổi chi tiết.',
    color: 'emerald',
    icon: <Target className="w-7 h-7" />,
    sub: 'Phù hợp: Đánh giá trình độ'
  },
  practice: {
    title: 'Luyện tập (Practice)',
    desc: 'Chấm điểm nhẹ nhàng hơn. Tập trung vào việc gợi ý từ vựng và cấu trúc hay để nâng band.',
    color: 'sky',
    icon: <BookOpen className="w-7 h-7" />,
    sub: 'Phù hợp: Học từ mới & Cấu trúc'
  },
  guide: {
    title: 'Hướng dẫn (Guide)',
    desc: 'Không chấm điểm. AI cung cấp dàn ý và gợi ý câu mở đầu để bạn tự tin viết bài.',
    color: 'purple',
    icon: <Layers className="w-7 h-7" />,
    sub: 'Phù hợp: Người mới bắt đầu'
  }
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect, onCancel }) => {
  const [selected, setSelected] = useState<ModeType | null>(null);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Chọn chế độ luyện tập</h2>
        <p className="text-slate-500 font-medium text-lg">AI sẽ điều chỉnh cách chấm điểm và phản hồi theo mục tiêu của bạn.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {(Object.keys(MODES) as ModeType[]).map((modeKey) => {
          const mode = MODES[modeKey];
          const isSelected = selected === modeKey;
          
          return (
            <button
              key={modeKey}
              onClick={() => setSelected(modeKey)}
              className={`group text-left bg-white p-8 rounded-[2.5rem] border-2 transition-all duration-300 relative overflow-hidden flex flex-col h-full ${
                isSelected 
                  ? `border-${mode.color}-500 shadow-2xl shadow-${mode.color}-900/10 scale-[1.02]` 
                  : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              {isSelected && (
                <div className={`absolute top-6 right-6 text-${mode.color}-500 animate-in zoom-in`}>
                  <CheckCircle2 className="w-6 h-6 fill-white" />
                </div>
              )}
              
              <div className={`w-14 h-14 bg-${mode.color}-100 text-${mode.color}-700 rounded-2xl flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 transition-transform`}>
                {mode.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">{mode.title}</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 flex-1">
                {mode.desc}
              </p>
              <div className={`pt-6 border-t border-slate-50 text-[10px] font-black text-${mode.color}-600 uppercase tracking-widest`}>
                {mode.sub}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-top-4 mb-12">
            <button
                onClick={() => onSelect(selected)}
                className="group relative px-16 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-4 overflow-hidden"
            >
                Bắt đầu làm bài
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-slate-400 mt-4 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                Chế độ đã chọn: <span className={`text-${MODES[selected].color}-600 font-black`}>{MODES[selected].title}</span>
            </p>
        </div>
      )}

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
