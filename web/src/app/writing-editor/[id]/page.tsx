'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronLeft,
  Timer,
  Sparkles,
  Loader2,
  Languages,
  Clock,
  Target,
  Trophy,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { questionService } from '@/services/questionService';
import { submissionService } from '@/services/submissionService';
import { Question, ExamPrompt, SentenceTemplate } from '@/types';

export default function WritingEditor({ params }: { params: { id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'practice';
  const { showModal, addToast } = useGlobal();

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [essayContent, setEssayContent] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data based on mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (mode === 'exam') {
          const examPrompt = await questionService.getExamPromptById(params.id);
          // Normalize ExamPrompt to common structure
          setData({
            id: examPrompt.id,
            title: examPrompt.topicKeyword || 'Official Exam Task',
            instructions: examPrompt.instruction,
            level: examPrompt.cefrLevel,
            taskType: examPrompt.taskType === 'task1' ? 'Task 1: Email/Letter' : 'Task 2: Essay',
            duration: examPrompt.taskType === 'task1' ? 20 : 40,
            minWords: examPrompt.taskType === 'task1' ? 120 : 250,
            category: examPrompt.topicCategory,
            difficulty: examPrompt.difficulty
          });
          setTimeLeft((examPrompt.taskType === 'task1' ? 20 : 40) * 60);
        } else {
          const question = await questionService.getById(params.id);
          setData({
            id: question.questionId,
            title: question.title,
            instructions: question.instructions,
            level: question.level,
            taskType: question.taskType,
            duration: question.task?.duration || 40,
            minWords: question.task?.minWords || 250,
            sentenceTemplates: question.sentenceTemplates,
            category: question.category,
            difficulty: 2 // default
          });
          if (question.task) {
            setTimeLeft(question.task.duration * 60);
          }
        }
      } catch (error) {
        console.error('Error fetching writing data:', error);
        addToast('error', 'Failed to load writing task');
        router.push('/practice-list');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id, mode, router, addToast]);

  // Timer logic
  useEffect(() => {
    if (loading || isSubmitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isSubmitting]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const wordCount = essayContent.trim() === '' ? 0 : essayContent.trim().split(/\s+/).length;
  const minWords = data?.minWords || 250;
  const isSufficient = wordCount >= minWords * 0.5;
  const progress = Math.min((wordCount / minWords) * 100, 100);
  const isLowTime = timeLeft < 300; 

  const handleSubmit = async () => {
    if (wordCount < minWords * 0.5) {
      addToast('error', `Your essay is too short (${wordCount} words). Please write at least ${Math.round(minWords * 0.5)} words before submitting.`);
      return;
    }

    showModal({
      title: mode === 'exam' ? 'Submit Official Exam?' : 'Submit for AI Grading?',
      description: 'Your essay will be evaluated by our AI based on official VSTEP rubrics. This takes 10-20 seconds.',
      confirmText: 'Yes, Submit',
      cancelText: 'Keep Writing',
      type: 'info',
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          const result = await submissionService.submit({
            questionId: params.id,
            mode: mode === 'exam' ? 'exam' : 'practice',
            essayContent: essayContent
          });
          
          addToast('success', 'Essay submitted successfully!');
          router.push(`/results/${result.submissionId}`);
        } catch (err) {
          console.error('Submission error:', err);
          addToast('error', 'Failed to submit essay. Please try again.');
          setIsSubmitting(false);
        }
      }
    });
  };

  const handleLeave = () => {
    if (essayContent.length > 50) {
      showModal({
         title: 'Discard draft?',
         description: 'You have unsaved changes. Are you sure you want to leave this page?',
         confirmText: 'Leave',
         cancelText: 'Stay',
         type: 'danger',
         onConfirm: () => router.push('/practice-list')
      });
    } else {
      router.push('/practice-list');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <Loader2 className="h-16 w-16 animate-spin text-emerald-600 dark:text-emerald-400" />
             <Target className="absolute inset-0 m-auto h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          </div>
          <p className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-sm">Preparing Environment...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Dynamic Header */}
      <header className={`h-16 flex items-center justify-between px-6 shrink-0 relative z-20 shadow-lg transition-colors duration-500 ${mode === 'exam' ? 'bg-vstep-dark' : 'bg-emerald-900'} text-white`}>
         <div className="flex items-center gap-4">
            <button onClick={handleLeave} className="p-2 hover:bg-white/10 rounded-full transition-colors">
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">VSTEP {data.level}</span>
                  {mode === 'exam' && <span className="px-1.5 py-0.5 bg-red-500 text-[8px] font-black rounded uppercase">LIVE EXAM</span>}
               </div>
               <h1 className="text-sm font-bold truncate max-w-[400px]">{data.title}</h1>
            </div>
         </div>

         <div className="flex items-center gap-8">
            <div className={`flex items-center gap-3 px-5 py-2 rounded-2xl border transition-all ${isLowTime ? 'bg-red-500/20 border-red-500 animate-pulse' : 'bg-white/10 border-white/10'}`}>
               <Timer className={`w-5 h-5 ${isLowTime ? 'text-red-400' : 'text-emerald-400'}`} />
               <span className="font-mono text-2xl font-black tabular-nums tracking-tight">
                  {formatTime(timeLeft)}
               </span>
            </div>
            
            <Button 
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="bg-emerald-500 hover:bg-emerald-600 text-vstep-dark h-11 px-8 rounded-xl font-black transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 active:scale-95"
            >
               {isSubmitting ? (
                 <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> GRADING...</>
               ) : (
                 mode === 'exam' ? 'FINISH EXAM' : 'SUBMIT & GRADE'
               )}
            </Button>
         </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
         
         {/* Left Side: Context Panel */}
         <div className="w-[35%] bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700/50 flex flex-col">
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
               
               {/* Metadata Card */}
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                     <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Task Type</span>
                     <span className="text-xs font-bold text-slate-900 dark:text-slate-200">{data.taskType}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                     <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase block mb-1">Difficulty</span>
                     <div className="flex gap-1">
                        {[1,2,3].map(i => (
                           <Trophy key={i} className={`w-3 h-3 ${i <= data.difficulty ? 'text-amber-500' : 'text-slate-200 dark:text-slate-600'}`} />
                        ))}
                     </div>
                  </div>
               </div>

               {/* Instruction Box */}
               <div className="p-6 md:p-8 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl border-2 border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <div className="w-8 h-8 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <BookOpen className="w-4 h-4" />
                     </div>
                     <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Writing Task</h3>
                  </div>
                  <div className="prose prose-sm prose-gray max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-lg italic bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-white dark:border-slate-700 whitespace-pre-line shadow-sm">
                       {data.instructions}
                    </p>
                  </div>
               </div>

               {/* Sentence Templates (Practice Mode Only) */}
               {mode !== 'exam' && data.sentenceTemplates && data.sentenceTemplates.length > 0 && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-emerald-600" />
                          <h4 className="font-bold text-gray-900">AI Guided Transitions</h4>
                       </div>
                    </div>
                    {data.sentenceTemplates.map((part: any, idx: number) => (
                       <details key={idx} className="group bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
                         <summary className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center justify-between list-none">
                            <span className="capitalize">{part.part}</span>
                            <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
                         </summary>
                         <div className="p-4 pt-0 space-y-2">
                            {part.templates.map((template: string, tIdx: number) => (
                              <button 
                                key={tIdx}
                                onClick={() => setEssayContent(prev => prev + ' ' + template)}
                                className="w-full text-left p-3 text-xs text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400 rounded-xl border border-transparent hover:border-emerald-100 dark:hover:border-emerald-500/20 transition-all font-medium"
                              >
                                 {template}
                              </button>
                            ))}
                         </div>
                       </details>
                    ))}
                 </div>
               )}
               
               {mode === 'exam' && (
                  <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center space-y-3">
                     <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                        <Clock className="w-6 h-6 animate-pulse" />
                     </div>
                     <h4 className="font-black text-red-900 text-sm">EXAM SECURITY LOCK</h4>
                     <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                        AI assistance and hints are disabled for this official exam. Focus on your own original writing and grammar control.
                     </p>
                  </div>
               )}
            </div>
         </div>

         {/* Right Side: High-Performance Editor */}
         <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
            {/* Editor Toolbar */}
            <div className="h-14 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-8 shrink-0 relative z-10">
               <div className="flex items-center gap-10">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Live Metrics</span>
                     <div className="flex items-baseline gap-2">
                        <span className={`text-base font-black ${wordCount < minWords ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                           {wordCount} <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Words</span>
                        </span>
                        <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">/ {minWords} MIN</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className="w-48 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-700 rounded-full ${wordCount >= minWords ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 w-10">{Math.round(progress)}%</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                  <div className="h-8 w-px bg-slate-100 dark:bg-slate-800 mx-2"></div>
                  <Button variant="ghost" size="sm" className="text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl h-9">
                     <Languages className="w-4 h-4 mr-2" /> Spell Check
                  </Button>
               </div>
            </div>

            {/* Premium Drafting Canvas */}
            <div className="flex-1 relative group">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/0 group-focus-within:bg-emerald-500/100 transition-all duration-300"></div>
               <textarea 
                  className="absolute inset-0 w-full h-full p-12 md:p-20 resize-none outline-none font-serif text-2xl leading-[1.8] text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-200 dark:placeholder-slate-700 custom-scrollbar selection:bg-emerald-100 dark:selection:bg-emerald-900/40 selection:text-emerald-900 dark:selection:text-emerald-300"
                  placeholder="The countdown has started. Begin drafting your response here..."
                  value={essayContent}
                  onChange={(e) => setEssayContent(e.target.value)}
                  spellCheck={false}
                  autoFocus
               />
               
               {/* Contextual watermark */}
               <div className="absolute bottom-8 right-12 opacity-[0.03] pointer-events-none select-none">
                  <span className="text-8xl font-black italic tracking-tighter uppercase">{mode === 'exam' ? 'OFFICIAL' : 'PRACTICE'}</span>
               </div>
            </div>
         </div>
      </div>
    
    </div>
  );
}
