'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface ExamFilterProps {
  filters: {
    taskType?: string;
    cefrLevel?: string;
    topicCategory?: string;
    difficulty?: number;
    search?: string;
  };
  setFilters: (filters: any) => void;
}

const CATEGORIES = [
  'Housing', 'Travel', 'Education', 'Workplace', 'Health', 
  'Technology', 'Environment', 'Society', 'Shopping', 'Community'
];

export const ExamFilter: React.FC<ExamFilterProps> = ({ filters, setFilters }) => {
  const clearFilters = () => setFilters({ search: '' });

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
      
      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          placeholder="Tìm kiếm chủ đề, từ khóa..."
          className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Task Type */}
        <select
          value={filters.taskType || ''}
          onChange={(e) => setFilters({ ...filters, taskType: e.target.value || undefined })}
          className="bg-slate-50 border-2 border-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 hover:border-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">Tất cả Task</option>
          <option value="task1">Task 1: Letter/Email</option>
          <option value="task2">Task 2: Essay</option>
        </select>

        {/* Level */}
        <select
          value={filters.cefrLevel || ''}
          onChange={(e) => setFilters({ ...filters, cefrLevel: e.target.value || undefined })}
          className="bg-slate-50 border-2 border-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 hover:border-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">Mọi trình độ</option>
          <option value="B1">Trình độ B1</option>
          <option value="B2">Trình độ B2</option>
          <option value="C1">Trình độ C1</option>
        </select>

        {/* Category */}
        <select
          value={filters.topicCategory || ''}
          onChange={(e) => setFilters({ ...filters, topicCategory: e.target.value || undefined })}
          className="bg-slate-50 border-2 border-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 hover:border-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">Tất cả chủ đề</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Difficulty */}
        <select
          value={filters.difficulty || ''}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value ? Number(e.target.value) : undefined })}
          className="bg-slate-50 border-2 border-slate-50 text-slate-700 text-sm font-bold rounded-xl px-4 py-2.5 hover:border-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
        >
          <option value="">Độ khó</option>
          <option value="1">Dễ (★)</option>
          <option value="2">Vừa (★★)</option>
          <option value="3">Khó (★★★)</option>
        </select>

        {/* Clear */}
        {(filters.taskType || filters.cefrLevel || filters.topicCategory || filters.difficulty || filters.search) && (
          <button 
            onClick={clearFilters}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs font-black uppercase tracking-widest transition-colors ml-auto"
          >
            <X className="w-4 h-4" /> Xóa lọc
          </button>
        )}
      </div>
    </div>
  );
};
