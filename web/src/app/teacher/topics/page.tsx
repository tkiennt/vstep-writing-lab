'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ALL_TOPICS = [
  { id: 'T001', title: 'Advantages of Studying Abroad', type: 'Task 2', level: 'B2', status: 'published', lastEdited: 'Oct 25, 2026' },
  { id: 'T002', title: 'Formal Email to Hotel Manager', type: 'Task 1', level: 'B1', status: 'draft', lastEdited: 'Oct 26, 2026' },
  { id: 'T003', title: 'Impact of AI on Modern Jobs', type: 'Task 2', level: 'C1', status: 'published', lastEdited: 'Oct 20, 2026' },
  { id: 'T004', title: 'Informal Letter to a Friend', type: 'Task 1', level: 'B1', status: 'published', lastEdited: 'Sep 15, 2026' },
  { id: 'T005', title: 'Urbanization Problems and Solutions', type: 'Task 2', level: 'B2', status: 'archived', lastEdited: 'Aug 10, 2026' },
  { id: 'T006', title: 'Climate Change Effects on Agriculture', type: 'Task 2', level: 'C1', status: 'published', lastEdited: 'Jul 05, 2026' },
  { id: 'T007', title: 'Complaint Letter About Noisy Neighbors', type: 'Task 1', level: 'B1', status: 'draft', lastEdited: 'Jun 18, 2026' },
  { id: 'T008', title: 'Benefits of Remote Work', type: 'Task 2', level: 'B2', status: 'published', lastEdited: 'May 22, 2026' },
  { id: 'T009', title: 'Email Requesting a Refund', type: 'Task 1', level: 'B2', status: 'published', lastEdited: 'Apr 14, 2026' },
  { id: 'T010', title: 'Social Media Impact on Youth', type: 'Task 2', level: 'C1', status: 'published', lastEdited: 'Mar 30, 2026' },
  { id: 'T011', title: 'Letter of Application for a Job', type: 'Task 1', level: 'B2', status: 'draft', lastEdited: 'Mar 10, 2026' },
  { id: 'T012', title: 'Online Learning vs Traditional Learning', type: 'Task 2', level: 'B2', status: 'published', lastEdited: 'Feb 28, 2026' },
];

const ITEMS_PER_PAGE = 5;

export default function ExamStructureManager() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search logic
  const filtered = useMemo(() => {
    return ALL_TOPICS.filter(topic => {
      const matchSearch = searchQuery === '' || 
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || topic.type === typeFilter;
      const matchLevel = levelFilter === 'All' || topic.level === levelFilter;
      return matchSearch && matchType && matchLevel;
    });
  }, [searchQuery, typeFilter, levelFilter]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTopics = filtered.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE, 
    safeCurrentPage * ITEMS_PER_PAGE
  );

  // When filters change, reset to page 1
  const handleSearchChange = (val: string) => { setSearchQuery(val); setCurrentPage(1); };
  const handleTypeChange = (val: string) => { setTypeFilter(val); setCurrentPage(1); };
  const handleLevelChange = (val: string) => { setLevelFilter(val); setCurrentPage(1); };

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const handleDelete = (id: string) => {
    setDeletedIds([...deletedIds, id]);
  };

  const visibleTopics = paginatedTopics.filter(t => !deletedIds.includes(t.id));

  return (
    <>
      <div className="flex flex-col h-full">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" /> Topic & Exam Manager
           </h1>
           <Link href="/teacher/topics/create">
              <Button className="flex items-center gap-2 bg-vstep-dark hover:bg-emerald-900 text-white rounded-xl shadow-sm">
                 <Plus className="w-4 h-4" /> Create New Topic
              </Button>
           </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-6 pb-20">
           
           {/* Toolbar */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <div className="relative w-full sm:w-96">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search topics by name or ID..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-gray-50/50 hover:bg-white"
                 />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 {/* Type Filter */}
                 <div className="relative">
                   <select 
                     value={typeFilter}
                     onChange={(e) => handleTypeChange(e.target.value)}
                     className="appearance-none pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                   >
                     <option value="All">Type: All</option>
                     <option value="Task 1">Task 1</option>
                     <option value="Task 2">Task 2</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                 </div>
                 {/* Level Filter */}
                 <div className="relative">
                   <select 
                     value={levelFilter}
                     onChange={(e) => handleLevelChange(e.target.value)}
                     className="appearance-none pl-4 pr-9 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                   >
                     <option value="All">Level: All</option>
                     <option value="B1">B1</option>
                     <option value="B2">B2</option>
                     <option value="C1">C1</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                 </div>
              </div>
           </div>

           {/* Data Table */}
           <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-gray-600">
                 <thead className="bg-gray-50/80 text-gray-500 font-bold text-[10px] uppercase tracking-widest border-b border-gray-100">
                   <tr>
                     <th className="px-6 py-4">Topic Details</th>
                     <th className="px-6 py-4">Type & Level</th>
                     <th className="px-6 py-4 text-center">Status</th>
                     <th className="px-6 py-4">Last Edited</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {visibleTopics.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                         No topics found matching your search.
                       </td>
                     </tr>
                   ) : (
                     visibleTopics.map((topic) => (
                       <tr key={topic.id} className="hover:bg-gray-50/50 transition-colors group">
                         <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">{topic.title}</p>
                            <span className="text-xs text-gray-400 font-mono">ID: {topic.id}</span>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                  ${topic.type === 'Task 1' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>
                                  {topic.type}
                               </span>
                               <span className="text-xs font-bold text-gray-500 border border-gray-200 px-2 py-0.5 rounded uppercase">{topic.level}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                           <span className={`inline-flex items-center justify-center w-24 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                              ${topic.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                topic.status === 'draft' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                                'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                             {topic.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 text-gray-500 font-medium text-xs">
                            {topic.lastEdited}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                               <Link href={`/writing-editor/${topic.id}`}>
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Preview">
                                    <Eye className="w-4 h-4" />
                                 </Button>
                               </Link>
                               <Link href="/teacher/topics/create">
                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" title="Edit">
                                    <Edit3 className="w-4 h-4" />
                                 </Button>
                               </Link>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                 title="Delete"
                                 onClick={() => handleDelete(topic.id)}
                               >
                                  <Trash2 className="w-4 h-4" />
                               </Button>
                            </div>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
             
             {/* Pagination Footer */}
             <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-gray-50/50">
               <span>
                 Showing <strong className="text-gray-900">{((safeCurrentPage - 1) * ITEMS_PER_PAGE) + 1}</strong> to{' '}
                 <strong className="text-gray-900">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of{' '}
                 <strong className="text-gray-900">{filtered.length}</strong> entries
               </span>
               <div className="flex gap-1">
                 <Button 
                   variant="outline" size="icon" 
                   className="h-8 w-8 border-gray-200" 
                   disabled={safeCurrentPage <= 1}
                   onClick={() => setCurrentPage(safeCurrentPage - 1)}
                 >
                   <ChevronLeft className="w-4 h-4" />
                 </Button>
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <Button 
                     key={page}
                     variant={page === safeCurrentPage ? 'outline' : 'ghost'} 
                     className={`h-8 w-8 font-bold p-0 ${page === safeCurrentPage ? 'border-emerald-50 bg-emerald-50 text-emerald-700' : 'text-gray-500'}`}
                     onClick={() => setCurrentPage(page)}
                   >
                     {page}
                   </Button>
                 ))}
                 <Button 
                   variant="outline" size="icon" 
                   className="h-8 w-8 border-gray-200"
                   disabled={safeCurrentPage >= totalPages}
                   onClick={() => setCurrentPage(safeCurrentPage + 1)}
                 >
                   <ChevronRight className="w-4 h-4" />
                 </Button>
               </div>
             </div>
           </div>

        </main>
      </div>
    </>
  );
}
