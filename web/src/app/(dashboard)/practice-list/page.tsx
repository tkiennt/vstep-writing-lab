'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Search, 
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronDown,
  Loader2,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';
import { getExamPrompts } from '@/lib/api';
import { ExamPrompt } from '@/types/grading';

export default function PracticeList() {
  const [prompts, setPrompts] = useState<ExamPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useGlobal();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await getExamPrompts();
        setPrompts(data);
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
        addToast('error', 'Failed to load exam prompts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [addToast]);

  const filteredPrompts = prompts.filter(p => {
    const matchesTab = activeTab === 'All' || p.taskType.toLowerCase() === activeTab.toLowerCase().replace(' ', '');
    const matchesSearch = p.instruction.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.topicCategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedByLevel = {
    'B1': filteredPrompts.filter(p => p.cefrLevel === 'B1'),
    'B2': filteredPrompts.filter(p => p.cefrLevel === 'B2'),
    'C1': filteredPrompts.filter(p => p.cefrLevel === 'C1'),
  };

  const LevelSection = ({ level, items }: { level: string; items: ExamPrompt[] }) => (
    items.length > 0 ? (
      <div className="space-y-6 mb-12">
        <div className="flex items-center gap-4 mb-4">
          <h2 className={`text-2xl font-black px-4 py-1 rounded-xl border-2 ${
            level === 'C1' ? 'border-red-200 text-red-700 bg-red-50' : 
            level === 'B2' ? 'border-amber-200 text-amber-700 bg-amber-50' : 
            'border-emerald-200 text-emerald-700 bg-emerald-50'
          }`}>
            LEVEL {level}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
        <div className="grid gap-4">
          {items.map((prompt) => (
            <div 
              key={prompt.id} 
              className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl border-2 border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider ${
                    prompt.taskType === 'task1' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                  }`}>
                    {prompt.taskType === 'task1' ? 'Task 1: Email/Letter' : 'Task 2: Essay'}
                  </span>
                  
                  {/* Topic Highlighting */}
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm shadow-emerald-200">
                    <BookOpen className="w-3 h-3 inline mr-1 mb-0.5" />
                    {prompt.topicCategory || 'General'}
                  </span>

                  <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-md inline-flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {prompt.taskType === 'task1' ? 20 : 40} min
                  </span>
                </div>
                
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight line-clamp-2">
                  {prompt.instruction.length > 100 
                    ? prompt.instruction.substring(0, 100) + '...' 
                    : prompt.instruction}
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-1">{prompt.topicKeyword}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                <Link href={`/writing-editor/${prompt.id}`} className="w-full">
                  <Button 
                    className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl h-14 shadow-md shadow-emerald-900/10 font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-all"
                  >
                     Start Writing
                     <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Practice Topic Library</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Select a topic based on your target CEFR level.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
           {['All', 'Task 1', 'Task 2'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
                {tab}
             </button>
           ))}
        </div>

        <div className="relative shrink-0 flex-1 xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search instructions or topics..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Crunching exam prompts...</p>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <p className="text-gray-500 font-medium">No practice topics found matching your criteria.</p>
          <Button variant="ghost" className="mt-4 text-emerald-600" onClick={() => {setActiveTab('All'); setSearchTerm('');}}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <LevelSection level="C1" items={groupedByLevel['C1']} />
          <LevelSection level="B2" items={groupedByLevel['B2']} />
          <LevelSection level="B1" items={groupedByLevel['B1']} />
        </>
      )}
    </div>
  );
}
