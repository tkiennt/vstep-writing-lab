'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Search, 
  ArrowRight,
  Loader2,
  Trophy,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';
import { questionService } from '@/services/questionService';
import { ExamPrompt } from '@/types';

export default function ExamList() {
  const [prompts, setPrompts] = useState<ExamPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useGlobal();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await questionService.getExamPrompts();
        setPrompts(data);
      } catch (err) {
        console.error('Failed to fetch exam prompts:', err);
        addToast('error', 'Failed to load exam prompts.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [addToast]);

  const filteredPrompts = prompts.filter(p => {
    const matchesTab = activeTab === 'All' || 
                       (activeTab === 'Task 1' && p.taskType.toLowerCase() === 'task1') ||
                       (activeTab === 'Task 2' && p.taskType.toLowerCase() === 'task2');
    
    const matchesSearch = p.instruction.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.topicCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.topicKeyword.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedByLevel = {
    'B1': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'B1'),
    'B2': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'B2'),
    'C1': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'C1'),
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
            VSTEP {level}
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
        </div>
        <div className="grid gap-6">
          {items.map((p) => (
            <div 
              key={p.id} 
              className="group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl border-2 border-transparent bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-100 transition-all duration-300 relative overflow-hidden"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    p.taskType.toLowerCase() === 'task1' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                  }`}>
                    {p.taskType === 'task1' ? 'VSTEP Task 1' : 'VSTEP Task 2'}
                  </span>
                  
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white shadow-sm shadow-emerald-200">
                    <Sparkles className="w-3 h-3 inline mr-1 mb-0.5" />
                    {p.topicCategory}
                  </span>

                  <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2.5 py-1 rounded-md inline-flex items-center">
                    <Target className="w-3.5 h-3.5 mr-1" /> {p.essayType || 'Standard'}
                  </span>
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 leading-tight group-hover:text-emerald-700 transition-colors">
                  {p.topicKeyword || 'General Topic'}
                </h3>
                
                <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed mb-4">{p.instruction}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                   <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      {p.taskType === 'task1' ? '20 Minutes' : '40 Minutes'}
                   </div>
                   <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                   <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Difficulty: {p.difficulty}/3
                   </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end md:w-56 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                <Link href={`/practice/${p.id}`} className="w-full">
                  <Button 
                    className="w-full bg-vstep-dark hover:bg-emerald-950 text-white rounded-2xl h-16 shadow-lg shadow-emerald-900/10 font-black text-lg flex items-center justify-center gap-3 transition-all transform active:scale-95"
                  >
                     START EXAM
                     <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Dynamic Header */}
      <div className="relative bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-xl overflow-hidden group">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" /> Official Exam Portals
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-4">
             VSTEP Writing <span className="text-emerald-600">Exam System</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium leading-relaxed">
            Standardized IELTS-equivalent writing tests for B1, B2, and C1 levels. Real instructions, real pressure, real feedback.
          </p>
        </div>
        
        <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block opacity-20 group-hover:opacity-40 transition-opacity">
           <Trophy className="w-48 h-48 text-emerald-600" />
        </div>
        
        {/* Animated Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-[80px] -ml-32 -mb-32"></div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-6 bg-white p-6 rounded-[32px] border border-gray-100 shadow-lg sticky top-6 z-30">
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
           {['All', 'Task 1', 'Task 2'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-sm font-black rounded-xl whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-emerald-700 shadow-md transform scale-[1.02]' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
             >
                {tab}
             </button>
           ))}
        </div>

        <div className="relative shrink-0 flex-1 xl:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by topic, keyword or instruction..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all" 
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[40px] border border-gray-100 shadow-sm">
          <div className="relative">
             <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-8 h-8 text-emerald-600 animate-pulse" />
             </div>
          </div>
          <p className="text-gray-500 font-black mt-8 text-lg uppercase tracking-widest animate-pulse">Initializing Exam Data...</p>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[40px] border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No Exams Found</h3>
          <p className="text-gray-500 font-medium max-w-sm mx-auto mb-8">We couldn't find any exam prompts matching your current search or filters.</p>
          <Button 
            className="rounded-xl px-8 font-black bg-emerald-600 hover:bg-emerald-700" 
            onClick={() => {setActiveTab('All'); setSearchTerm('');}}
          >
            RESET ALL FILTERS
          </Button>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <LevelSection level="C1" items={groupedByLevel['C1']} />
          <LevelSection level="B2" items={groupedByLevel['B2']} />
          <LevelSection level="B1" items={groupedByLevel['B1']} />
        </div>
      )}
    </div>
  );
}
