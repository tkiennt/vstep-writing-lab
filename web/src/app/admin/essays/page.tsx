'use client';

import React, { useState, useEffect } from 'react';
import { 
  ListChecks, 
  Search, 
  Filter, 
  Calendar,
  Mail,
  ChevronDown,
  Activity, 
  RefreshCw,
  FileText,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminEssayService, AdminEssayDTO } from '@/services/admin/adminEssayService';
import { useGlobal } from '@/components/GlobalProvider';

// ── Essay Detail Modal ───────────────────────
function EssayDetailModal({ 
  isOpen, 
  onClose, 
  submissionId,
  onUpdateScore
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  submissionId: string | null,
  onUpdateScore: (id: string, score: number) => Promise<void>
}) {
  const [essay, setEssay] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [newScore, setNewScore] = useState<number>(0);
  const { addToast } = useGlobal();

  useEffect(() => {
    if (isOpen && submissionId) {
      fetchDetail();
    }
  }, [isOpen, submissionId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await adminEssayService.getById(submissionId!);
      setEssay(data);
      setNewScore(data.overallScore || 0);
    } catch (err) {
      addToast('error', 'Failed to load essay details');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async () => {
    try {
      await onUpdateScore(submissionId!, newScore);
      addToast('success', 'Score updated successfully');
      onClose();
    } catch (err) {
      addToast('error', 'Failed to update score');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
         <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <FileText className="w-5 h-5 text-emerald-500" />
               Essay Submission Detail
               {essay?.status && (
                 <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                   {essay.status}
                 </span>
               )}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
               <X className="w-5 h-5 text-slate-500" />
            </button>
         </div>

         <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                 <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
                 <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Decompiling Submission Data...</p>
              </div>
            ) : essay ? (
              <>
                {/* Meta Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Author</p>
                      <p className="font-bold text-slate-900 dark:text-white truncate">{essay.userName}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Submitted at</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                         {new Date(essay.createdAt).toLocaleString()}
                      </p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Word Count</p>
                      <p className="font-bold text-slate-900 dark:text-white">{essay.wordCount} words</p>
                   </div>
                </div>

                {/* Content */}
                <div className="space-y-3">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-500" />
                      Original Content
                   </h4>
                   <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-serif text-lg">
                      {essay.essayContent || "No content found"}
                   </div>
                </div>

                {/* AI Review */}
                {essay.criteriaScores && (
                  <div className="space-y-4">
                     <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        AI Diagnostics
                     </h4>
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(essay.criteriaScores).map(([key, val]: any) => (
                           <div key={key} className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/10 text-center">
                              <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter mb-1 truncate">{key}</p>
                              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{val}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {/* Adjust Score */}
                <div className="p-6 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                         <Edit3 className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">Adjust Overall Score</h4>
                         <p className="text-xs text-slate-500 dark:text-slate-400">Moderator override for final grading result.</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <input 
                         type="number" 
                         step="0.5"
                         min="0"
                         max="9"
                         value={newScore}
                         onChange={e => setNewScore(parseFloat(e.target.value))}
                         className="w-24 px-4 py-2 bg-white dark:bg-slate-900 border border-amber-500/30 rounded-xl font-black text-center text-xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-900 dark:text-white"
                      />
                      <Button onClick={handleScoreUpdate} className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95">
                         Override Score
                      </Button>
                   </div>
                </div>
              </>
            ) : null}
         </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────
export default function AdminEssaysPage() {
  const { addToast, showModal } = useGlobal();
  const [essays, setEssays] = useState<AdminEssayDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchEssays = async () => {
    setLoading(true);
    try {
      const data = await adminEssayService.getAll();
      setEssays(data);
    } catch (error) {
      addToast('error', 'Failed to synchronize essays');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEssays();
  }, []);

  const handleUpdateScore = async (id: string, score: number) => {
    await adminEssayService.updateScore(id, score);
    setEssays(prev => prev.map(e => e.submissionId === id ? { ...e, overallScore: score } : e));
  };

  const handleDelete = (id: string) => {
    showModal({
      title: 'Delete Submission?',
      description: 'This action is irreversible. The student will lose their grading history for this attempt.',
      confirmText: 'Delete Permanently',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        try {
          await adminEssayService.delete(id);
          setEssays(prev => prev.filter(e => e.submissionId !== id));
          addToast('success', 'Submission purged from registry');
        } catch (err) {
          addToast('error', 'Failed to delete submission');
        }
      }
    });
  };

  const filteredEssays = essays.filter(e => {
    const matchesSearch = (e.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.topicTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen bg-slate-50 dark:bg-slate-950">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
               <ListChecks className="w-5 h-5 text-emerald-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Essay Submissions</h1>
         </div>
         <Button variant="ghost" size="sm" onClick={fetchEssays} className="rounded-xl h-9 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Sync Submissions
         </Button>
      </header>

      {/* Toolbar */}
      <div className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-16 z-10 flex flex-wrap gap-4 items-center justify-between">
         <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative flex-1 group">
               <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search by student or topic title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-900 dark:text-white"
               />
            </div>
            <div className="relative group shrink-0">
               <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
               <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-11 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-slate-700 dark:text-slate-300"
               >
                   <option value="all">Filter: All Status</option>
                   <option value="scored">Graded</option>
                   <option value="completed">Completed</option>
                   <option value="processing">Processing</option>
                   <option value="failed">Failed</option>
               </select>
               <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Table */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
         <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden mb-20">
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <th className="px-8 py-5">Submission</th>
                        <th className="px-8 py-5">Topic</th>
                        <th className="px-8 py-5 text-center">Status</th>
                        <th className="px-8 py-5 text-center">Score</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {filteredEssays.map((essay) => (
                        <tr key={essay.submissionId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-400" />
                                <div>
                                   <p className="font-bold text-slate-900 dark:text-white text-sm">{essay.userName}</p>
                                   <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono">{new Date(essay.createdAt).toLocaleString()}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex flex-col gap-1.5">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs truncate max-w-[250px]" title={essay.topicTitle}>
                                  {essay.taskType === 'task1' && essay.topicTitle?.includes('.')
                                    ? essay.topicTitle.split('.')[0] + '.'
                                    : essay.topicTitle}
                                </span>
                                <span className={`w-max text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md border
                                  ${essay.taskType === 'task1' 
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-500 border-blue-500/20' 
                                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'}`}>
                                  VSTEP {essay.taskType}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border
                                 ${(essay.status as any) === 'scored' || (essay.status as any) === 'graded' || (essay.status as any) === 'completed' || (essay.status as any) === 'PHASE1COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                                    : (essay.status as any) === 'pending' || (essay.status as any) === 'processing'
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse'
                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                {essay.status}
                             </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                              <span className="text-lg font-black text-slate-900 dark:text-white">
                                {(essay.overallScore !== undefined && essay.overallScore !== null) ? essay.overallScore.toFixed(1) : '—'}
                              </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => { setSelectedEssayId(essay.submissionId); setIsDetailOpen(true); }}
                                   className="rounded-xl h-9 w-9 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10"
                                >
                                   <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                   variant="ghost" 
                                   size="icon" 
                                   onClick={() => handleDelete(essay.submissionId)}
                                   className="rounded-xl h-9 w-9 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </Button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
         </div>
      </main>

      <EssayDetailModal 
         isOpen={isDetailOpen}
         onClose={() => setIsDetailOpen(false)}
         submissionId={selectedEssayId}
         onUpdateScore={handleUpdateScore}
      />
    </div>
  );
}
