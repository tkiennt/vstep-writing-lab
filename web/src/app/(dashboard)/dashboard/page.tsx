'use client';

import React, { useState } from 'react';
import { 
  FileEdit, 
  TrendingUp, 
  Flame, 
  ChevronDown, 
  ChevronUp,
  LineChart as LineChartIcon,
  Award,
  MoreVertical,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Simple mockup of a Line Chart since we don't have Recharts installed to keep it fast
const MockLineChart = () => (
  <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8 pt-4">
     {/* Grid lines */}
     <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4 opacity-10">
        <div className="w-full h-px bg-gray-900"></div>
        <div className="w-full h-px bg-gray-900"></div>
        <div className="w-full h-px bg-gray-900"></div>
        <div className="w-full h-px bg-gray-900"></div>
     </div>
     
     {/* Y-axis labels */}
     <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-gray-400 pb-8 pt-4 w-6">
        <span>8.0</span>
        <span>7.0</span>
        <span>6.0</span>
        <span>5.0</span>
     </div>

     {/* Data Points / Line Mock */}
     <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
        <path d="M 40 180 Q 200 160 350 120 T 600 80 T 900 60" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
     </svg>

     {/* X-axis labels & Points */}
     {[
       { date: 'Oct 01', score: 5.5, top: '180px' },
       { date: 'Oct 05', score: 6.0, top: '150px' },
       { date: 'Oct 12', score: 6.5, top: '120px' },
       { date: 'Oct 18', score: 6.5, top: '110px' },
       { date: 'Oct 25', score: 7.0, top: '80px' },
     ].map((point, i) => (
       <div key={i} className="relative z-10 flex flex-col items-center group h-full justify-end">
          <div className="w-0.5 h-full bg-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8"></div>
          <div className="w-4 h-4 bg-white border-4 border-emerald-500 rounded-full shadow-md z-10 absolute hover:scale-125 transition-transform cursor-pointer" style={{ top: point.top }}>
             {/* Tooltip */}
             <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                {point.score} Band
             </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-2">{point.date}</span>
       </div>
     ))}
  </div>
);

const MOCK_HISTORY = [
  { id: '1', title: 'Advantages of Studying Abroad', type: 'Task 2', score: 6.5, date: 'Oct 25, 2026', timeSpent: '38m',
    details: { taskFulfilment: 7.0, coherence: 6.5, lexical: 6.0, grammar: 5.5, words: 285 }
  },
  { id: '2', title: 'Email to Hotel Manager', type: 'Task 1', score: 6.5, date: 'Oct 18, 2026', timeSpent: '18m',
    details: { taskFulfilment: 7.0, coherence: 7.0, lexical: 6.0, grammar: 6.0, words: 160 }
  },
  { id: '3', title: 'Impact of AI on Education', type: 'Task 2', score: 6.0, date: 'Oct 12, 2026', timeSpent: '42m',
    details: { taskFulfilment: 6.0, coherence: 6.5, lexical: 6.0, grammar: 5.0, words: 255 }
  },
];

export default function StudentDashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    if (expandedRow === id) setExpandedRow(null);
    else setExpandedRow(id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back, Nguyen</h1>
        <p className="text-gray-500 mt-1">Here is a summary of your writing practice progress.</p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-emerald-200 transition-colors">
            <div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Essays Submitted</p>
               <span className="text-4xl font-black text-gray-900">24</span>
            </div>
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <FileText className="w-6 h-6 text-emerald-600" />
            </div>
         </div>
         
         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
            <div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Average Band Score</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">6.2</span>
                  <span className="text-sm font-bold text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> +0.5</span>
               </div>
            </div>
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Award className="w-6 h-6 text-blue-600" />
            </div>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-colors">
            <div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Current Streak</p>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-gray-900">5</span>
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Days</span>
               </div>
            </div>
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
               <Flame className="w-6 h-6 text-orange-500 shrink-0" />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Line Chart */}
         <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-gray-400" /> Progress Trend
               </h2>
               <select className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-50 border-none rounded-lg py-2 px-3 outline-none cursor-pointer">
                  <option>LAST 30 DAYS</option>
                  <option>ALL TIME</option>
               </select>
            </div>
            <div className="flex-1 bg-gray-50/50 rounded-2xl border border-gray-100/50 flex items-end">
               <MockLineChart />
            </div>
         </div>

         {/* CTA / Quick Acccess */}
         <div className="bg-vstep-dark rounded-3xl shadow-xl p-8 text-white relative flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 space-y-4">
               <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <FileEdit className="w-6 h-6 text-emerald-300" />
               </div>
               <div>
                  <h3 className="text-xl font-bold mb-2">Ready for the next challenge?</h3>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">It's time to keep your 5-day streak alive. We recommend tackling a Task 1 Letter today.</p>
               </div>
            </div>
            <Link href="/practice-list" className="relative z-10 w-full mt-8">
               <Button className="w-full bg-white text-vstep-dark hover:bg-gray-100 font-bold rounded-xl h-12 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  Start Practice
               </Button>
            </Link>
            
            {/* Background design */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[80px] opacity-30 -translate-y-1/2 translate-x-1/2"></div>
         </div>
      </div>

      {/* Expandable History Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900">Recent Practice History</h2>
            <Link href="/practice-list" className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 flex items-center gap-1">
               View All <ArrowRight className="w-4 h-4" />
            </Link>
         </div>

         <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
               <thead className="bg-white text-gray-400 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
                  <tr>
                     <th className="px-6 py-4">Topic / Prompt</th>
                     <th className="px-6 py-4">Date</th>
                     <th className="px-6 py-4 text-center">Score</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {MOCK_HISTORY.map((item) => (
                     <React.Fragment key={item.id}>
                        {/* Main Row */}
                        <tr 
                          onClick={() => toggleRow(item.id)}
                          className={`cursor-pointer transition-colors group ${expandedRow === item.id ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}`}
                        >
                           <td className="px-6 py-4">
                              <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">{item.title}</p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                 ${item.type === 'Task 1' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>
                                 {item.type}
                              </span>
                           </td>
                           <td className="px-6 py-4 font-medium text-gray-500">{item.date}</td>
                           <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-vstep-dark text-white font-black shadow-sm">
                                 {item.score.toFixed(1)}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-right">
                              <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors inline-flex items-center gap-2">
                                 {expandedRow === item.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                              </button>
                           </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {expandedRow === item.id && (
                           <tr className="bg-emerald-50/30 border-t-0">
                              <td colSpan={4} className="px-6 py-6 border-b border-gray-100">
                                 <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Task</span>
                                       <span className="font-bold text-gray-900">{item.details.taskFulfilment.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Coherence</span>
                                       <span className="font-bold text-gray-900">{item.details.coherence.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Lexical</span>
                                       <span className="font-bold text-gray-900">{item.details.lexical.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Grammar</span>
                                       <span className="font-bold text-gray-900">{item.details.grammar.toFixed(1)}</span>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center col-span-2 lg:col-span-1 border-dashed">
                                       <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold h-9 rounded-lg text-xs" onClick={() => window.location.href=`/results/${item.id}`}>
                                          Full Report
                                       </Button>
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
      
    </div>
  );
}
