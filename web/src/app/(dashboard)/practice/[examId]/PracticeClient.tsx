'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamPrompt } from '@/types/grading';
import { useAuth } from '@/hooks/useAuth';
import { gradeEssay, GradeEssayRequest, startSession, updateSession, ExamSession } from '@/lib/api';
import { Save, Loader2, BookOpen, Layers, CheckCircle2, ChevronUp, ChevronDown } from 'lucide-react';

import { ModeSelector } from '@/components/features/practice/ModeSelector';
import { GuidedPanel } from '@/components/features/practice/GuidedPanel';
import { CountdownTimer } from '@/components/features/practice/CountdownTimer';

interface PracticeClientProps {
  exam: ExamPrompt;
}

type PracticeMode = 'selecting' | 'guided' | 'unguided';

export const PracticeClient: React.FC<PracticeClientProps> = ({ exam }) => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mode, setMode] = useState<PracticeMode>('selecting');
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  
  const [essayText, setEssayText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 120 words for task1, 250 for task2
  const minWords = exam.taskType === 'task1' ? 120 : 250;
  
  // word count calculation
  const wordCount = essayText.trim() === '' ? 0 : essayText.trim().split(/\s+/).length;
  // Allow submit if >= 60% of minimum word count
  const canSubmit = wordCount >= (minWords * 0.6) && !isSubmitting;

  // Initialize Session
  React.useEffect(() => {
    if (!user || session) return;

    const initSession = async () => {
      try {
        const s = await startSession({ examId: exam.id, taskType: exam.taskType });
        setSession(s);
        if (s.essayText) {
          setEssayText(s.essayText);
        }
      } catch (err) {
        console.error('Failed to start session:', err);
      }
    };

    initSession();
  }, [user, exam.id, exam.taskType, session]);

  // Track Exits (visibilitychange)
  React.useEffect(() => {
    if (!session) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Ping server that user exited
        updateSession(session.id, { exitCount: 1 });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  // Auto-save Draft
  React.useEffect(() => {
    if (!session || !essayText || isSubmitting) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      try {
        await updateSession(session.id, { essayText });
        setLastSaved(new Date());
      } catch (err) {
        console.error('Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }, 30000); // 30s auto-save

    return () => clearTimeout(timer);
  }, [essayText, session, isSubmitting]);

  const handleSaveDraft = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      await updateSession(session.id, { essayText });
      setLastSaved(new Date());
    } catch (err) {
      alert('Không thể lưu bản nháp. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setSubmitError('Bạn phải đăng nhập để chấm bài!');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');

    const request: GradeEssayRequest = {
      essayId: exam.id,
      taskType: exam.taskType,
      prompt: exam.instruction,
      essayText: essayText,
      wordCount: wordCount,
    };

    try {
      // API call to the .NET backend API /api/Grading/grade
      const result = await gradeEssay(request, user.id) as any;
      
      // Save full result + essayText to sessionStorage to be picked up by the result page
      sessionStorage.setItem('lastGradingResult', JSON.stringify({ ...result, essayText }));
      router.push(`/practice/${exam.id}/result?id=${result.id}`);

    } catch (err: any) {
      console.error('Grading Error:', err);
      setSubmitError(err.message || 'Có lỗi xảy ra khi chấm bài. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const handleCancelSelection = () => {
    router.push('/practice-list');
  };

  if (mode === 'selecting') {
    return <ModeSelector onSelect={setMode} onCancel={handleCancelSelection} />;
  }

  // --- WRITING AREA LAYOUT ---
  
  const initialSeconds = exam.taskType === 'task1' ? 20 * 60 : 40 * 60; // 20 min or 40 min

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full relative">
      
      {/* ── Overlay Modal while submitting ── */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-md flex items-center justify-center rounded-3xl animate-in fade-in">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-md text-center border border-emerald-100">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex flex-col items-center justify-center mb-6 relative">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin absolute" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI đang chấm bài...</h2>
            <p className="text-slate-500 font-medium mt-3 mb-8">Xin đợi trong giây lát, kết quả phân tích chi tiết sẽ có sau 30-60 giây nữa. Vui lòng không rời khỏi trang.</p>
            
            {/* Fake progress bar animation */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full animate-[progress_60s_ease-out_forwards]" />
            </div>
          </div>
        </div>
      )}

      {/* ── Header: Prompt Summary ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6 shrink-0 transition-all duration-300">
        
        {/* Toggle Bar */}
        <div 
          className="flex items-center justify-between p-4 px-6 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Đề bài: {exam.topicCategory}
            </h2>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">{exam.taskType === 'task1' ? 'Task 1: Thư/Email' : 'Task 2: Bài luận'}</span>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-[10px] font-extrabold text-sky-800 uppercase tracking-wider"><Layers className="w-3 h-3 inline mr-1" />Mức độ {exam.cefrLevel}</span>
            </div>
          </div>
          <button className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-700 flex items-center gap-1">
            {isPromptExpanded ? <><ChevronUp className="w-4 h-4" /> Thu gọn</> : <><ChevronDown className="w-4 h-4" /> Mở rộng</>}
          </button>
        </div>

        {/* Expanded Content */}
        {isPromptExpanded && (
          <div className="p-6 pt-2 animate-in slide-in-from-top-2">
            <p className="text-slate-800 font-medium leading-relaxed font-serif text-lg bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {exam.instruction}
            </p>
          </div>
        )}
      </div>

      {/* ── Main Content Columns ── */}
      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* LEFT COLUMN: Editor area */}
        <div className="flex-[2] flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          
          {/* Subheader: Timer & Word Count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-black px-4 py-2 rounded-xl transition-colors ${wordCount >= minWords ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-rose-50 text-rose-700'}`}>
                {wordCount} / {minWords} từ
              </span>
              
              {wordCount < minWords && wordCount > 0 && (
                <span className="text-xs font-bold text-rose-500 bg-white leading-none">
                  (còn thiếu ít nhất {minWords - wordCount} từ)
                </span>
              )}
            </div>
            
            <CountdownTimer initialSeconds={initialSeconds} />
          </div>

          <textarea
            className="flex-1 w-full resize-none outline-none text-slate-800 text-base leading-relaxed placeholder:text-slate-300 font-serif p-2"
            placeholder="Bắt đầu viết bài của bạn tại đây..."
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            disabled={isSubmitting}
          />
          
          {submitError && (
             <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold flex items-center justify-center">
               {submitError}
             </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Đang lưu...' : 'Lưu bản nháp'}
            </button>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-900/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <CheckCircle2 className="w-5 h-5" />
              Nộp bài chấm điểm
            </button>
          </div>
          {lastSaved && (
            <p className="mt-2 text-[10px] text-slate-400 text-right font-medium">
              Bản nháp được lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}
            </p>
          )}
        </div>

        {/* RIGHT COLUMN: Guided Panel (Only if Guided mode is selected) */}
        {mode === 'guided' && (
          <div className="flex-1 hidden lg:flex flex-col min-h-0 bg-slate-50 rounded-3xl border border-slate-100 p-2">
            <GuidedPanel exam={exam} />
          </div>
        )}

      </div>
      
      {/* Global CSS for progress animation in modal */}
      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
