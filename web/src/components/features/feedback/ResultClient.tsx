'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GradingResultDoc } from '@/types/grading';
import { mapRawToGradingResultDoc } from '@/lib/mapping';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { AnnotatedEssay } from './AnnotatedEssay';
import { Zap, FileText, RefreshCw, AlertCircle, BrainCircuit, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as signalR from '@microsoft/signalr';
import { auth } from '@/lib/firebase';
import { getSubmissionById } from '@/lib/api';
import { submissionService } from '@/services/submissionService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5260';

interface ResultClientProps {
  essayId: string;
  examId?: string;
}

export function ResultClient({ essayId, examId }: ResultClientProps) {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language === 'en';
  const [result, setResult] = useState<GradingResultDoc | null>(null);
  const [status, setStatus] = useState<'pending' | 'scoring_ready' | 'ready' | 'error'>('pending');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    let pollingTimer: NodeJS.Timeout;
    let isMounted = true;

    // ── 1. Try to load immediately from cache or API ──────────────────────
    const tryLoadResult = async () => {
      try {
        // Skip pending cache entries
        const cached = sessionStorage.getItem('lastGradingResult');
        if (cached) {
          const raw = JSON.parse(cached);
          if ((raw.id === essayId || raw.submissionId === essayId) &&
              raw.status !== 'pending' && raw.status !== 'Pending') {
            const mapped = mapRawToGradingResultDoc(raw, essayId);
            if (isMounted) { setResult(mapped); setStatus('ready'); }
            return true;
          }
        }

        const data = await getSubmissionById(essayId);
        if (!data) { if (isMounted) setStatus('error'); return false; }

        if (data.status === 'error' || data.status === 'failed' || data.status === 'Failed') {
          if (isMounted) {
            setStatus('error');
            if (examId) window.location.href = `/practice/${examId}?error=grading_failed`;
          }
          return true; // stop polling
        }

        if (data.status === 'pending' || data.status === 'Pending') {
          return false; // still waiting
        }

        const mapped = mapRawToGradingResultDoc(data, essayId);
        
        if (data.status === 'Phase1Completed') {
          if (isMounted) { setResult(mapped); setStatus('scoring_ready'); }
          return false; // still waiting for Phase 2
        }

        if (isMounted) { setResult(mapped); setStatus('ready'); }
        return true;
      } catch {
        return false;
      }
    };

    // ── 2. Set up SignalR for real-time push ──────────────────────────────
    const setupSignalR = async () => {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE}/hubs/grading?access_token=${token}`, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      connection.on('GradingScoresReady', async (payload: { resultId: string }) => {
        if (payload.resultId !== essayId || !isMounted) return;
        console.log('[SignalR] GradingScoresReady for', payload.resultId);
        // Load the partial result to display scores immediately
        await tryLoadResult();
      });

      connection.on('GradingCompleted', async (payload: { resultId: string }) => {
        if (payload.resultId !== essayId || !isMounted) return;
        console.log('[SignalR] GradingCompleted for', payload.resultId);
        const done = await tryLoadResult();
        if (!done && isMounted) {
          // Fallback: poll once more after a short delay
          pollingTimer = setTimeout(tryLoadResult, 2000);
        }
      });

      connection.on('GradingFailed', (payload: { resultId: string }) => {
        if (payload.resultId !== essayId || !isMounted) return;
        console.warn('[SignalR] GradingFailed for', payload.resultId);
        if (isMounted) {
          setStatus('error');
          if (examId) window.location.href = `/practice/${examId}?error=grading_failed`;
        }
      });

      try {
        await connection.start();
        connectionRef.current = connection;
        console.log('[SignalR] Connected, waiting for grading result...');
      } catch (err) {
        console.warn('[SignalR] Connection failed, falling back to polling', err);
        startPolling();
      }
    };

    // ── 3. Polling fallback (used if SignalR fails to connect) ────────────
    const startPolling = () => {
      const poll = async () => {
        const done = await tryLoadResult();
        if (!done && isMounted) {
          pollingTimer = setTimeout(poll, 4000);
        }
      };
      poll();
    };

    // ── Main init: first check if already done, then set up SignalR ───────
    (async () => {
      const alreadyDone = await tryLoadResult();
      if (alreadyDone) return;

      // Not ready yet — connect SignalR and also do one poll in 4s as safety net
      await setupSignalR();
      pollingTimer = setTimeout(async () => {
        if (!isMounted || status === 'ready') return;
        const done = await tryLoadResult();
        if (!done) startPolling();
      }, 4000);
    })();

    return () => {
      isMounted = false;
      clearTimeout(pollingTimer);
      connectionRef.current?.stop();
    };
  }, [essayId]);

  // ── 4. Handle JIT Translation when language switches ──────────────────
  useEffect(() => {
    const handleTranslation = async () => {
      if (i18n.language === 'vi' && result && !result.summaryVi && !isTranslating) {
        setIsTranslating(true);
        setTranslationError(null);
        try {
          const updatedRaw = await submissionService.translate(essayId, 'vi');
          const mapped = mapRawToGradingResultDoc(updatedRaw, essayId);
          setResult(mapped);
          // Update cache
          sessionStorage.setItem('lastGradingResult', JSON.stringify(updatedRaw));
        } catch (err: any) {
          console.error('Translation failed:', err);
          setTranslationError(t('common.error'));
        } finally {
          setIsTranslating(false);
        }
      }
    };

    handleTranslation();
  }, [i18n.language, result, essayId]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        {/* Spinner with brain icon */}
        <div className="relative mb-10">
          <div className="w-28 h-28 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BrainCircuit className="w-9 h-9 text-emerald-600 animate-pulse" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('common.loading')}</h2>
        <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">
          AI đang chấm bài của bạn. Quá trình này có thể mất 30–60 giây.
          <br />
          <span className="text-slate-400 text-sm">Bạn có thể rời khỏi trang — kết quả vẫn được lưu lại.</span>
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <button
            onClick={() => window.location.href = '/practice-list'}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-900/10 transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            Về trang chủ
          </button>
          <button
            onClick={() => window.location.href = '/history'}
            className="px-8 py-3 bg-white text-slate-600 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 shadow-sm transition-all active:scale-95 uppercase tracking-widest text-sm"
          >
            Xem lịch sử
          </button>
        </div>
      </div>
    );
  }


  const handleRetry = async () => {
    try {
      if (!essayId) return;
      setIsRetrying(true);
      await submissionService.retry(essayId);
      setStatus('pending');
      // The pending screen will show and SignalR/polling will wait for the new result
    } catch (err: any) {
      console.error('Retry failed:', err);
      alert('Không thể thử chấm lại. Vui lòng tải lại trang.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (status === 'error' || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center p-10 bg-white rounded-3xl shadow-sm border border-slate-200 max-w-sm w-full">
           <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-5" />
           <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Trục trặc AI</h3>
           <p className="text-slate-500 mt-2 mb-8 leading-relaxed text-sm">
             {result?.summaryVi || result?.summaryEn || "Hệ thống AI đang quá tải hoặc phản hồi không mong muốn. Mong bạn thông cảm!"}
           </p>

           <button
             onClick={handleRetry}
             disabled={isRetrying}
             className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-2xl transition-all disabled:opacity-50 active:scale-[0.98]"
           >
             <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
             {isRetrying ? "Đang gửi yêu cầu..." : "Thử chấm lại"}
           </button>

           <button
             onClick={() => window.location.href = '/practice'}
             className="w-full mt-3 px-6 py-3.5 bg-transparent text-slate-500 font-medium rounded-2xl transition-all hover:bg-slate-50 text-sm"
           >
             Quay lại danh sách bài tập
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
              <Zap className="w-6 h-6 fill-current" />
            </div>
             <div>
              <h2 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">{result.questionTitle || t('nav.myResults')}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{result.taskType === 'task1' ? t('practiceList.card.vstepTask1') : t('practiceList.card.vstepTask2')}</span>
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">ID: {essayId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/practice-list'}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-emerald-900/10 active:scale-95"
          >
            {t('result.cta.back')}
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <ScoreSummaryCard score={result.score} cefrLevel={result.cefrLevel} />
            
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> {t('feedback.detail')}
                </h3>
                {(isTranslating || status === 'scoring_ready') && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 animate-pulse bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                    <RefreshCw className="w-3 h-3 animate-spin" /> {status === 'scoring_ready' ? 'Đang phân tích chi tiết...' : t('common.loading') + '...'}
                  </div>
                )}
              </div>
              
              <div className={`p-10 bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group transition-opacity duration-500 ${(isTranslating || status === 'scoring_ready') ? 'opacity-40' : 'opacity-100'}`}>
                <AnnotatedEssay 
                  text={result.essayText} 
                  annotations={result.annotations || []} 
                />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full text-[9px] font-bold text-slate-400 border border-slate-100 dark:border-slate-700 uppercase tracking-wider">
                      {result.wordCount} {t('common.words')}
                   </div>
                </div>
                
                {(isTranslating || status === 'scoring_ready') && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                      <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest text-center">
                        {status === 'scoring_ready' ? 'Đang phân tích và sửa lỗi chi tiết...' : t('common.loading') + '...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              {(isTranslating || status === 'scoring_ready') && (
                <p className="mt-6 text-[11px] text-slate-400 dark:text-slate-500 font-medium italic flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" /> * Hệ thống đang tải thêm dữ liệu...
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* AI Summary */}
            <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-emerald-600" /> {t('result.aiSummary.title')}
                </h3>
                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-500/20 text-slate-700 dark:text-slate-300 font-medium leading-[1.8] text-sm italic whitespace-pre-wrap">
                  &quot;{isEn ? result.summaryEn : result.summaryVi}&quot;
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-50 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform" />
            </section>

            {/* Visual Roadmap */}
            {result.roadmap && (
              <section className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-emerald-400" /> {t('result.roadmap.title')}
                    </h3>
                    <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-emerald-500/20">
                      {t('result.roadmap.target')} {result.roadmap.targetCefr}
                    </div>
                  </div>

                  <div className="space-y-4 relative">
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-500/50 via-slate-700 dark:via-slate-800 to-transparent" />
                    
                    {result.roadmap.weekly_plan.slice(0, 4).map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="relative z-10 w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-900 border-2 border-slate-700 dark:border-slate-800 flex items-center justify-center shrink-0 group-hover:border-emerald-500 transition-colors shadow-sm">
                           <span className="text-xs font-black text-emerald-400">{t('result.roadmap.week').charAt(0)}{step.week}</span>
                        </div>
                        <div className="flex-1 pb-4">
                           <div className="bg-white/5 hover:bg-white/[0.08] p-5 rounded-2xl border border-white/5 transition-all">
                              <h4 className="text-xs font-black text-white/90 mb-1.5 uppercase tracking-tight">{step.goal}</h4>
                              <p className="text-[11px] text-white/50 leading-relaxed font-medium">{step.focus}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>

                   <button 
                    onClick={() => window.location.href = '/practice-list'}
                    className="w-full py-4 bg-emerald-500 rounded-2xl font-black text-sm mt-6 hover:bg-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20 text-white"
                  >
                    {t('result.cta.new')}
                  </button>
                </div>
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
