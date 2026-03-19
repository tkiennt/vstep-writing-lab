'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ExamPrompt, DraftState, OutlineStep } from '@/types/grading';
import { useAuth } from '@/hooks/useAuth';
import { Timer, Save, Send, ChevronRight, Lightbulb, Pause, Play, AlertCircle } from 'lucide-react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WritingClientProps {
  exam: ExamPrompt;
}

export function WritingClient({ exam }: WritingClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [essayText, setEssayText] = useState('');
  const [mode, setMode] = useState<'free' | 'guided'>('free');
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [outline, setOutline] = useState<OutlineStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoadingOutline, setIsLoadingOutline] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Timer
  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  // Load Draft
  useEffect(() => {
    if (!user) return;
    const loadDraft = async () => {
      const draftRef = doc(db, `users/${user.id}/drafts`, exam.id);
      const snap = await getDoc(draftRef);
      if (snap.exists()) {
        const data = snap.data() as DraftState;
        setEssayText(data.essayText);
        setSeconds(data.elapsedSeconds || 0);
        setMode(data.mode || 'free');
      }
    };
    loadDraft();
  }, [user, exam.id]);

  // Auto-save
  useEffect(() => {
    if (!user || !essayText) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        const draftRef = doc(db, `users/${user.id}/drafts`, exam.id);
        await setDoc(draftRef, {
          examId: exam.id,
          taskType: exam.taskType,
          essayText,
          wordCount: countWords(essayText),
          mode,
          elapsedSeconds: seconds,
          isPaused,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.error('Auto-save error:', e);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [essayText, seconds, isPaused, mode, user, exam]);

  // Guided Mode: Fetch Outline
  const toggleGuided = async () => {
    const nextMode = mode === 'free' ? 'guided' : 'free';
    setMode(nextMode);
    if (nextMode === 'guided' && outline.length === 0) {
      setIsLoadingOutline(true);
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v2/ExamPrompts/${exam.id}/outline`);
        if (resp.ok) {
          const data = await resp.json();
          setOutline(data);
        }
      } catch (e) {
        console.error('Outline error:', e);
      } finally {
        setIsLoadingOutline(false);
      }
    }
  };

  const countWords = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;
  const wordCount = countWords(essayText);
  const minWords = exam.taskType === 'task1' ? 120 : 250;

  const handleSubmit = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v2/Grading/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userUid: user.id,
          promptId: exam.id,
          content: essayText,
          taskType: exam.taskType
        })
      });

      if (response.ok) {
        router.push(`/practice/${exam.id}/result`);
      } else {
        const err = await response.text();
        console.error('Grading request failed:', err);
        alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại.');
      }
    } catch (e) {
      console.error('Submit error:', e);
      alert('Không nhận được phản hồi từ máy chủ.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="font-black text-slate-900 leading-none">{exam.topicKeyword}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {exam.taskType === 'task1' ? 'Task 1: Email/Letter' : 'Task 2: Essay'} • Level {exam.cefrLevel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
            <Timer className={`w-4 h-4 ${isPaused ? 'text-slate-400' : 'text-emerald-600 animate-pulse'}`} />
            <span className="font-mono font-bold text-slate-700">{formatTime(seconds)}</span>
            <button onClick={() => setIsPaused(!isPaused)} className="ml-2 hover:text-emerald-700 transition-colors">
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="text-[10px] font-black uppercase tracking-widest">{isSaving ? 'Đang lưu...' : 'Đã lưu'}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={wordCount < minWords}
            className="px-6 py-2.5 bg-[#064e3b] text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-900/20 hover:bg-emerald-900 disabled:opacity-50 flex items-center gap-2"
          >
            Nộp bài <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side: Instruction & Writing */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Đề bài</h3>
            <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{exam.instruction}</p>
          </div>

          <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/5 transition-all">
            <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setMode('free')}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg transition-all ${mode === 'free' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
                >
                  Tự do
                </button>
                <button 
                  onClick={toggleGuided}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 ${mode === 'guided' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}
                >
                  <Lightbulb className="w-3 h-3" /> Gợi ý
                </button>
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${wordCount >= minWords ? 'text-emerald-600' : 'text-slate-400'}`}>
                {wordCount} / {minWords} từ
              </div>
            </div>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Bắt đầu viết bài của bạn tại đây..."
              className="flex-1 p-8 outline-none resize-none text-slate-800 font-medium leading-[2] text-lg placeholder:text-slate-300"
              disabled={isPaused}
            />
          </div>
        </div>

        {/* Right Side: Guided Panel (Lazy load) */}
        {mode === 'guided' && (
          <div className="w-96 bg-white border-l border-slate-100 flex flex-col animate-in slide-in-from-right-full duration-500">
            <div className="p-8 border-b border-slate-100">
              <h3 className="flex items-center gap-3 text-xl font-black text-slate-900">
                <Lightbulb className="w-6 h-6 text-emerald-600" />
                Dàn ý gợi ý
              </h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Dựa trên AI Flash</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoadingOutline ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                outline.map((step, i) => (
                  <div 
                    key={i} 
                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentStep === i ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'
                    }`}
                    onClick={() => setCurrentStep(i)}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Bước {i + 1}</span>
                       {currentStep === i && <ChevronRight className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <h4 className="font-black text-slate-800 leading-tight">{step.title}</h4>
                    {currentStep === i && (
                      <p className="mt-3 text-sm text-slate-500 leading-relaxed animate-in fade-in duration-300 italic font-medium">
                        "{step.hint}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <div className="flex items-start gap-3 p-4 bg-emerald-900 text-white rounded-2xl">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium leading-relaxed">
                  Gợi ý này giúp bạn định hình cấu trúc bài viết. Đừng quên mở rộng ý để đạt điểm cao nhé!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Loader2 } from 'lucide-react';
