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
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';

const mockPracticeList = [
  { id: 'T001', title: 'Advantages of Studying Abroad', type: 'Task 2', level: 'B2', isCompleted: true, progress: 100, score: '6.5', timeLimit: 40, topic: 'Education' },
  { id: 'T002', title: 'Formal Email to Hotel Manager', type: 'Task 1', level: 'B1', isCompleted: false, progress: 45, score: null, timeLimit: 20, topic: 'Service' },
  { id: 'T003', title: 'Impact of AI on Modern Jobs', type: 'Task 2', level: 'C1', isCompleted: false, progress: 0, score: null, timeLimit: 40, topic: 'Technology' },
  { id: 'T004', title: 'Informal Letter to a Friend', type: 'Task 1', level: 'B1', isCompleted: true, progress: 100, score: '5.5', timeLimit: 20, topic: 'Life' },
  { id: 'T005', title: 'Full Mock Test: VSTEP 2026', type: 'Mock', level: 'B2-C1', isLocked: true, progress: 0, timeLimit: 60, topic: 'Mixed' },
];

export default function PracticeList() {
  const [activeTab, setActiveTab] = useState('All');
  const { addToast, showModal } = useGlobal();

  const handleGuestClick = () => {
    // In a real app we check role. Mocking guest auth check:
    showModal({
      title: 'Sign in required',
      description: 'You need an account to practice this topic and save your progress. Create a free account now!',
      confirmText: 'Go to Login',
      cancelText: 'Cancel',
      type: 'info',
      onConfirm: () => {
        window.location.href = '/login';
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Practice Topic Library</h1>
          <p className="text-gray-500 mt-2 text-sm sm:text-base">Select a topic to begin practicing under timed exam conditions.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-10">
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
           {['All', 'Task 1', 'Task 2', 'Full Mock'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
             >
                {tab}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
           {/* Filters */}
           <div className="relative shrink-0">
             <select className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer w-full">
               <option value="all">Level: All</option>
               <option value="b1">B1 (Intermediate)</option>
               <option value="b2">B2 (Upper Inter)</option>
               <option value="c1">C1 (Advanced)</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           <div className="relative shrink-0">
             <select className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer w-full">
               <option value="all">Topic: All</option>
               <option value="edu">Education</option>
               <option value="tech">Technology</option>
               <option value="env">Environment</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           <div className="relative shrink-0 hidden sm:block">
             <select className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer w-full">
               <option value="newest">Sort: Newest First</option>
               <option value="popular">Most Popular</option>
               <option value="score">Highest Score</option>
             </select>
             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>
           
           <div className="relative shrink-0 flex-1 sm:w-64 max-w-sm">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="Search..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium" />
           </div>
        </div>
      </div>

      {/* Topic Cards */}
      <div className="grid gap-4">
         {mockPracticeList.filter(t => activeTab === 'All' || t.type.includes(activeTab) || (activeTab === 'Full Mock' && t.type === 'Mock')).map((topic) => (
            <div 
              key={topic.id} 
              className={`group flex flex-col md:flex-row gap-6 p-6 md:p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden
                 ${topic.isLocked 
                     ? 'border-gray-100 bg-gray-50 opacity-80' 
                     : 'border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-emerald-100'
                 }
              `}
            >
               {/* Progress Bar background if started but not finished */}
               {topic.progress > 0 && !topic.isCompleted && (
                  <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all ease-out" style={{ width: `${topic.progress}%` }}></div>
               )}

               <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                     <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider
                        ${topic.type === 'Task 1' ? 'bg-indigo-50 text-indigo-700' : 
                          topic.type === 'Task 2' ? 'bg-fuchsia-50 text-fuchsia-700' : 
                          'bg-amber-100 text-amber-800'}`}>
                        {topic.type}
                     </span>
                     <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border
                        ${topic.level.includes('C1') ? 'border-red-200 text-red-700 bg-red-50' : 
                          topic.level.includes('B2') ? 'border-amber-200 text-amber-700 bg-amber-50' : 
                          'border-blue-200 text-blue-700 bg-blue-50'}
                     `}>
                        Level {topic.level}
                     </span>
                     <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2.5 py-1 rounded-md inline-flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {topic.timeLimit} min
                     </span>
                     <span className="text-xs text-gray-500 font-semibold border border-gray-200 px-2.5 py-1 rounded-md">
                        {topic.topic}
                     </span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">{topic.title}</h3>
                  
                  {/* Status Badges for Users */}
                  <div className="flex items-center gap-3 mt-4">
                     {topic.isCompleted ? (
                        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                           <CheckCircle2 className="w-4 h-4" /> Completed • Score: {topic.score}
                        </div>
                     ) : topic.progress > 0 ? (
                        <div className="flex items-center gap-2 w-full max-w-xs">
                           <span className="text-xs font-bold text-emerald-600 shrink-0">In Progress</span>
                           <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${topic.progress}%` }}></div>
                           </div>
                           <span className="text-xs font-bold text-gray-400 shrink-0">{topic.progress}%</span>
                        </div>
                     ) : (
                        <span className="text-sm font-medium text-gray-400">Not started yet</span>
                     )}
                  </div>
               </div>

               <div className="flex items-center justify-between md:justify-end md:w-48 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  {topic.isLocked ? (
                     <div className="flex flex-col items-center justify-center w-full text-gray-400 bg-gray-100/50 rounded-2xl h-full py-4 px-2">
                        <Lock className="w-5 h-5 mb-2 text-gray-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-center">Premium<br/>Unlock</span>
                     </div>
                  ) : topic.isCompleted ? (
                     <div className="flex flex-col items-center justify-center w-full gap-2 text-center h-full">
                        <div className="mb-2">
                           <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Highest Score</span>
                           <span className="text-3xl font-black text-gray-900">{topic.score}</span>
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold h-9 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                           View Feedback
                        </Button>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center w-full h-full">
                        <Link href={`/writing-editor/${topic.id}`} className="w-full">
                          <Button 
                            className="w-full bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl h-14 shadow-md shadow-emerald-900/10 font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-all"
                          >
                             {topic.progress > 0 ? 'Resume' : 'Start'}
                             <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
