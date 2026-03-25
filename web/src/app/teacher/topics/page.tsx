'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Edit3, 
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { adminQuestionService, QuestionDTO } from '@/services/admin/adminQuestionService';

const ITEMS_PER_PAGE = 5;

export default function ExamStructureManager() {
  const [topics, setTopics] = useState<QuestionDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const data = await adminQuestionService.getAll();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // Filter & Search logic
  const filtered = useMemo(() => {
    return topics.filter(topic => {
      const matchSearch = searchQuery === '' || 
        topic.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        topic.questionId?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'All' || topic.taskType === typeFilter;
      const matchLevel = levelFilter === 'All' || topic.level === levelFilter;
      return matchSearch && matchType && matchLevel;
    });
  }, [topics, searchQuery, typeFilter, levelFilter]);

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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this topic?')) {
      try {
        await adminQuestionService.delete(id);
        setTopics(topics.filter(t => t.questionId !== id));
      } catch (error) {
        console.error('Failed to delete topic', error);
        alert('Failed to delete topic');
      }
    }
  };

  const visibleTopics = paginatedTopics;

  // Format date safely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background items-center justify-center">
         <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background">
        
        {/* Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 shrink-0">
           <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-500" /> Writing Topics
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
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
              <div className="relative w-full sm:w-96">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search topics by name or ID..." 
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-background text-foreground placeholder:text-muted-foreground"
                 />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 {/* Type Filter */}
                 <div className="relative">
                   <select 
                     value={typeFilter}
                     onChange={(e) => handleTypeChange(e.target.value)}
                     className="appearance-none pl-4 pr-9 py-2 border border-border rounded-xl text-sm font-medium text-foreground bg-background hover:bg-muted outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                   >
                     <option value="All">Type: All</option>
                     <option value="Task 1">Task 1</option>
                     <option value="Task 2">Task 2</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                 </div>
                 {/* Level Filter */}
                 <div className="relative">
                   <select 
                     value={levelFilter}
                     onChange={(e) => handleLevelChange(e.target.value)}
                     className="appearance-none pl-4 pr-9 py-2 border border-border rounded-xl text-sm font-medium text-foreground bg-background hover:bg-muted outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                   >
                     <option value="All">Level: All</option>
                     <option value="B1">B1</option>
                     <option value="B2">B2</option>
                     <option value="C1">C1</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                 </div>
              </div>
           </div>

           {/* Data Table */}
           <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-muted-foreground">
                 <thead className="bg-muted/50 text-muted-foreground font-bold text-[10px] uppercase tracking-widest border-b border-border">
                   <tr>
                     <th className="px-6 py-4">Bài / Topic</th>
                     <th className="px-6 py-4">Task &amp; Level</th>
                     <th className="px-6 py-4 text-center">Status</th>
                     <th className="px-6 py-4">Last Edited</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {visibleTopics.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-medium">
                          No topics found matching your search.
                        </td>
                      </tr>
                    ) : (
                      visibleTopics.map((topic) => (
                        <tr key={topic.questionId} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4">
                             <p className="font-bold text-foreground group-hover:text-emerald-400 transition-colors mb-1">{topic.title}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground font-mono">ID: {topic.questionId}</span>
                                <span className="text-[10px] text-muted-foreground">•</span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{topic.category}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                                   ${topic.taskType === 'task1' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-fuchsia-500/15 text-fuchsia-400'}`}>
                                   {topic.taskType || 'Task'}
                                </span>
                                <span className="text-xs font-bold text-muted-foreground border border-border px-2 py-0.5 rounded uppercase">{topic.level || 'B1'}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-24 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                               ${topic.status === 'published' || topic.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 
                                 topic.status === 'draft' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 
                                 'bg-muted text-muted-foreground border border-border'}`}>
                              {topic.status || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground font-medium text-xs">
                             {formatDate(topic.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1">
                                <Link href={`/writing-editor/${topic.questionId}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10" title="Preview">
                                     <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Link href={`/teacher/topics/create?id=${topic.questionId}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-500/10" title="Edit">
                                     <Edit3 className="w-4 h-4" />
                                  </Button>
                                </Link>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                                  title="Delete"
                                  onClick={() => handleDelete(topic.questionId)}
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
             <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground bg-muted/30">
               <span>
                 Showing <strong className="text-foreground">{((safeCurrentPage - 1) * ITEMS_PER_PAGE) + Math.min(1, filtered.length)}</strong> to{' '}
                 <strong className="text-foreground">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filtered.length)}</strong> of{' '}
                 <strong className="text-foreground">{filtered.length}</strong> entries
               </span>
               <div className="flex gap-1">
                 <Button 
                   variant="outline" size="icon" 
                   className="h-8 w-8 border-border bg-transparent text-muted-foreground hover:bg-muted" 
                   disabled={safeCurrentPage <= 1}
                   onClick={() => setCurrentPage(safeCurrentPage - 1)}
                 >
                   <ChevronLeft className="w-4 h-4" />
                 </Button>
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                   <Button 
                     key={page}
                     variant={page === safeCurrentPage ? 'outline' : 'ghost'} 
                     className={`h-8 w-8 font-bold p-0 ${page === safeCurrentPage ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                     onClick={() => setCurrentPage(page)}
                   >
                     {page}
                   </Button>
                 ))}
                 <Button 
                   variant="outline" size="icon" 
                   className="h-8 w-8 border-border bg-transparent text-muted-foreground hover:bg-muted"
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
