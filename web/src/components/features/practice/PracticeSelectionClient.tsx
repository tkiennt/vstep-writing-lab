'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ExamPrompt } from '@/types/grading';
import { ExamCard } from './ExamCard';
import { ExamFilter } from './ExamFilter';
import { LayoutGrid, List } from 'lucide-react';

interface PracticeSelectionClientProps {
  initialPrompts: ExamPrompt[];
}

export const PracticeSelectionClient: React.FC<PracticeSelectionClientProps> = ({ initialPrompts }) => {
  const router = useRouter();
  const [filters, setFilters] = useState({
    taskType: '',
    cefrLevel: '',
    topicCategory: '',
    difficulty: undefined as number | undefined,
    search: '',
  });

  const filteredPrompts = useMemo(() => {
    return initialPrompts.filter(p => {
      if (filters.taskType && p.taskType !== filters.taskType) return false;
      if (filters.cefrLevel && p.cefrLevel !== filters.cefrLevel) return false;
      if (filters.topicCategory && p.topicCategory !== filters.topicCategory) return false;
      if (filters.difficulty !== undefined && p.difficulty !== filters.difficulty) return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return p.topicKeyword.toLowerCase().includes(s) || 
               p.instruction.toLowerCase().includes(s) ||
               p.topicCategory.toLowerCase().includes(s);
      }
      return true;
    });
  }, [initialPrompts, filters]);

  const handleSelect = (exam: ExamPrompt) => {
    router.push(`/practice/${exam.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Chọn bài luyện tập</h1>
          <p className="text-slate-500 mt-2 font-medium">Khám phá kho đề thi VSTEP đa dạng, được cập nhật liên tục.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button className="p-2 rounded-xl bg-slate-50 text-slate-400">
            <List className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-xl bg-vstep-dark text-white shadow-lg shadow-emerald-900/20">
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <ExamFilter filters={filters} setFilters={setFilters} />

      {/* Results Grid */}
      {filteredPrompts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrompts.map((exam) => (
            <div key={exam.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ExamCard exam={exam} onSelect={handleSelect} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-800">Không tìm thấy đề phù hợp</h3>
          <p className="text-slate-400 mt-2 font-medium">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          <button 
            onClick={() => setFilters({ search: '', taskType: '', cefrLevel: '', topicCategory: '', difficulty: undefined })}
            className="mt-8 text-emerald-700 font-black uppercase tracking-widest text-xs hover:underline"
          >
            Thiết lập lại bộ lọc
          </button>
        </div>
      )}

      {/* Pagination Placeholder */}
      {filteredPrompts.length > 0 && (
        <div className="flex items-center justify-center pt-10">
          <p className="text-slate-400 text-sm font-bold">Hiển thị {filteredPrompts.length} đề thi</p>
        </div>
      )}
    </div>
  );
};

// Add Search icon for empty state
import { Search } from 'lucide-react';
