'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamPrompt } from '@/types/grading';
import { useAuth } from '@/hooks/useAuth';
import { gradeEssay, GradeEssayRequest, startSession, updateSession, ExamSession } from '@/lib/api';
import { Save, Loader2, BookOpen, Layers, CheckCircle2, ChevronUp, ChevronDown, X, AlertTriangle, AlertCircle, LogOut, Sparkles, ArrowRight, Clock, Target } from 'lucide-react';

import { ModeSelector } from '@/components/features/practice/ModeSelector';
import { GuidedPanel } from '@/components/features/practice/GuidedPanel';
import { CountdownTimer } from '@/components/features/practice/CountdownTimer';
import { getProgressSummary, getGradingHistory } from '@/lib/firestore';
import { UserHistoryType } from '@/types/grading';

interface PracticeClientProps {
  exam: ExamPrompt;
}

type PracticeMode = 'selecting' | 'exam' | 'practice' | 'guide';

export const PracticeClient: React.FC<PracticeClientProps> = ({ exam }) => {
  const router = useRouter();
  const { user, userDoc } = useAuth();

  const [mode, setMode] = useState<PracticeMode>('selecting');
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);

  const [essayText, setEssayText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Modals
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState<{ mode: PracticeMode } | null>(null);

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

    // Fetch real history for the AI
    let userHistory: UserHistoryType = {
      weaknesses: [],
      pastScores: [],
      level: userDoc?.currentLevel || "B1"
    };

    try {
      const [summary, history] = await Promise.all([
        getProgressSummary(user.id),
        getGradingHistory(user.id, 5)
      ]);

      if (summary && summary.weakestCriterion) {
        userHistory.weaknesses = [summary.weakestCriterion];
      }
      if (history && history.length > 0) {
        userHistory.pastScores = history.map(h => h.totalScore);
      }
    } catch (err) {
      console.warn('Failed to fetch user history for AI context, proceeding with empty history', err);
    }

    const request: GradeEssayRequest = {
      essayId: exam.id,
      taskType: exam.taskType,
      prompt: exam.instruction,
      essayText: essayText,
      wordCount: wordCount,
      mode: (mode === 'selecting' ? 'practice' : mode) as any,
      userHistory: userHistory
    };

    try {
      // API call to the .NET backend API /api/Grading/grade
      const result = await gradeEssay(request, user.id);

      // Save full result + essayText to sessionStorage
      sessionStorage.setItem('lastGradingResult', JSON.stringify({ ...result, essayText }));

      if (mode === 'guide') {
        // Special handling for guide mode if needed, for now just go to result
      }

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

  const handleStartPractice = (selectedMode: PracticeMode) => {
    setShowStartConfirm({ mode: selectedMode });
  };

  const confirmStart = () => {
    if (showStartConfirm) {
      setMode(showStartConfirm.mode);
      setShowStartConfirm(null);
    }
  };

  const handleExitPractice = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    router.push('/practice-list');
  };

  if (mode === 'selecting') {
    return (
      <>
        <ModeSelector onSelect={handleStartPractice} onCancel={handleCancelSelection} />
        {showStartConfirm && (
          <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] max-w-md w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 relative">

              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

              <div className="p-10 pt-12 text-center relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-[2rem] flex items-center justify-center mb-8 mx-auto shadow-xl shadow-emerald-500/30 rotate-3">
                  <Sparkles className="w-12 h-12" />
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Sẵn sàng chưa?</h3>
                <p className="text-slate-500 font-medium leading-relaxed px-4">
                  Bạn chuẩn bị bắt đầu bài viết với chế độ <br />
                  <span className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-slate-100 rounded-full text-slate-900 font-black text-sm uppercase tracking-widest shadow-inner">
                    {showStartConfirm.mode === 'exam' ? <Target className="w-4 h-4 text-emerald-600" /> : showStartConfirm.mode === 'practice' ? <BookOpen className="w-4 h-4 text-sky-600" /> : <Layers className="w-4 h-4 text-purple-600" />}
                    {showStartConfirm.mode === 'exam' ? 'Thi thử' : showStartConfirm.mode === 'practice' ? 'Luyện tập' : 'Hướng dẫn'}
                  </span>
                </p>

                <div className="mt-12 space-y-4">
                  <button
                    onClick={confirmStart}
                    className="w-full group relative px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    Bắt đầu ngay
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowStartConfirm(null)}
                    className="w-full py-4 rounded-2xl text-slate-400 font-black text-sm hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
                  >
                    Đợi chút, chưa sẵn sàng
                  </button>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="bg-slate-50/80 py-6 px-10 border-t border-slate-100 flex items-center justify-center gap-10">
                <div className="flex items-center gap-3 text-[11px] font-black text-slate-700 uppercase tracking-widest">
                  <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-900/5">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <span>{exam.taskType === 'task1' ? '20' : '40'} Phút</span>
                </div>
                
                <div className="w-px h-8 bg-slate-200" />
                
                <div className="flex items-center gap-3 text-[11px] font-black text-slate-700 uppercase tracking-widest">
                  <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 shadow-sm shadow-rose-900/5">
                    <Target className="w-4.5 h-4.5" />
                  </div>
                  <span>{exam.taskType === 'task1' ? '120' : '250'} Từ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- WRITING AREA LAYOUT ---

  const initialSeconds = exam.taskType === 'task1' ? 20 * 60 : 40 * 60; // 20 min or 40 min

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full relative">

      {/* ── Overlay Modal while submitting ── */}
      {isSubmitting && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-[2.5rem] animate-in fade-in duration-500">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center animate-pulse" />
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin absolute inset-0 m-auto" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              AI đang chấm bài...
            </h2>
            <p className="text-emerald-600/60 font-black text-[10px] uppercase tracking-[0.3em]">
              Đang phân tích kết quả
            </p>
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-700 flex items-center gap-1"
            >
              {isPromptExpanded ? <><ChevronUp className="w-4 h-4" /> Thu gọn</> : <><ChevronDown className="w-4 h-4" /> Mở rộng</>}
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isPromptExpanded && (
          <div className="p-6 pt-2 animate-in slide-in-from-top-2">
            <p className="text-slate-800 font-medium leading-relaxed font-serif text-lg bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
              {exam.instruction.replace(/([•*])/g, '\n$1').trim()}
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

            <div className="flex items-center gap-6">
              <CountdownTimer initialSeconds={initialSeconds} />
              <div className="w-px h-6 bg-slate-200" />
              <button
                onClick={handleExitPractice}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border border-rose-100/50 shadow-sm whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5" />
                Thoát bài làm
              </button>
            </div>
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

        {/* RIGHT COLUMN: Guided Panel (Only if Guide mode is selected) */}
        {mode === 'guide' && (
          <div className="flex-1 hidden lg:flex flex-col min-h-0 bg-slate-50 rounded-3xl border border-slate-100 p-2">
            <GuidedPanel exam={exam} />
          </div>
        )}

      </div>

      {/* ── Start Confirmation Modal ── */}
      {showStartConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-sm w-full p-8 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Xác nhận bắt đầu</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              Bạn đã sẵn sàng bắt đầu bài làm với chế độ <span className="text-slate-900 font-bold capitalize">{showStartConfirm.mode}</span> chưa?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowStartConfirm(null)}
                className="px-6 py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmStart}
                className="px-6 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 transition-all"
              >
                Vào làm ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Exit Confirmation Modal ── */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-white rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] max-w-md w-full overflow-hidden border border-white/20 animate-in zoom-in-95 duration-500 relative">
            
            {/* Background Decorative Gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            
            <div className="p-12 text-center relative z-10">
              <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto rotate-6 shadow-xl shadow-rose-900/5 border border-rose-100/50">
                <AlertCircle className="w-12 h-12" />
              </div>

              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Bạn chắc chứ?</h3>
              <p className="text-slate-500 font-bold leading-relaxed mb-10 px-4">
                Dữ liệu chưa lưu có thể bị mất vĩnh viễn.<br/>
                <span className="text-rose-500/60 font-black uppercase tracking-[0.2em] text-[10px] mt-4 block">Hãy cẩn thận!</span>
              </p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={confirmExit}
                  className="w-full group py-5 rounded-[2rem] bg-rose-600 text-white font-black text-lg hover:bg-rose-700 shadow-xl shadow-rose-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /> 
                  Xác nhận thoát
                </button>

                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="w-full py-4 rounded-2xl text-slate-400 font-black text-sm hover:text-slate-700 hover:bg-slate-50 transition-all uppercase tracking-widest"
                >
                  Quay lại làm bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
