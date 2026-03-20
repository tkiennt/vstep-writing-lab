'use client';

import React, { useState, useEffect } from 'react';
import { GradingResultDoc } from '@/types/grading';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ScoreSummaryCard } from './ScoreSummaryCard';
import { AnnotatedEssay } from './AnnotatedEssay';
import { SentenceBreakdown } from './SentenceBreakdown';
import { Loader2, Zap, FileText, CheckCheck, RefreshCw, AlertCircle, BrainCircuit } from 'lucide-react';

interface ResultClientProps {
  essayId: string;
}

export function ResultClient({ essayId }: ResultClientProps) {
  const [result, setResult] = useState<GradingResultDoc | null>(null);
  const [status, setStatus] = useState<'pending' | 'ready' | 'error'>('pending');

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('lastGradingResult');
      if (cached) {
        const raw = JSON.parse(cached);
        // Map backend FullAnalysisResponse -> GradingResultDoc
        
        let essayText = raw.essayText || '';
        if (typeof window !== 'undefined') {
             // In PracticeClient, we didn't save essayText to the response, but it might be there. We'll fallback if missing.
             // Actually, the new API doesn't return essayText. We could save it in sessionStorage too.
        }

        const finalAnnotations: any[] = [];
        
        // 1. Map inline highlights
        (raw.inlineHighlights || []).forEach((h: any) => {
          let st = essayText.indexOf(h.quote);
          if (st >= 0) {
            finalAnnotations.push({
              startIndex: st,
              endIndex: st + h.quote.length,
              type: h.type === 'strength' ? 'strength' : (h.category || 'grammar'),
              message: h.issueVi || h.issue || 'Lỗi',
              suggestion: h.fix || null,
              severity: h.type === 'strength' ? 'good' : 'error'
            });
          }
        });

        // 2. Map sentence-level feedback
        (raw.sentenceFeedback || []).forEach((s: any) => {
          let st = essayText.indexOf(s.sentence);
          if (st >= 0) {
            finalAnnotations.push({
              startIndex: st,
              endIndex: st + s.sentence.length,
              type: 'sentence',
              message: s.explanation,
              suggestion: s.suggestion || null,
              severity: s.isGood ? 'good' : 'warning',
              isSentence: true
            });
          }
        });

        // 3. Map additional inline improvements
        (raw.inlineSentenceImprovement || []).forEach((s: any) => {
          let st = essayText.indexOf(s.original);
          if (st >= 0) {
            finalAnnotations.push({
              startIndex: st,
              endIndex: st + s.original.length,
              type: 'sentence',
              message: s.reason,
              suggestion: s.improved || null,
              severity: 'warning',
              isSentence: true
            });
          }
        });

        const mapped: GradingResultDoc = {
          id: raw.id || essayId,
          userUid: raw.studentId || '',
          promptId: raw.examId || '',
          essayText: essayText,
          wordCount: raw.wordCount || 0,
          cefrLevel: raw.cefrLevel || 'B1',
          createdAt: raw.gradedAt || new Date(),
          gradedAt: raw.gradedAt || new Date(),
          totalScore: raw.totalScore || 0,
          taskType: raw.taskType || 'task1',
          isRelevant: raw.relevance?.isRelevant ?? true,
          score: {
            taskFulfilment: raw.taskFulfilment?.score || 0,
            organization: raw.organization?.score || 0,
            vocabulary: raw.vocabulary?.score || 0,
            grammar: raw.grammar?.score || 0,
            overall: raw.totalScore || 0
          },
          summary: "Chấm điểm hoàn tất bởi chuyên gia AI",
          suggestions: raw.improvementsVi || [],
          annotations: finalAnnotations,
          sentenceAnalysis: [],
          taskRelevance: {
            isRelevant: raw.relevance?.isRelevant ?? true,
            relevanceScore: raw.relevance?.relevanceScore || 0,
            verdictVi: raw.relevance?.verdictVi || '',
            missingPointsVi: raw.relevance?.missingPointsVi || [],
            offTopicSentencesEn: raw.relevance?.offTopicSentences || []
          },
          sentenceFeedback: raw.sentenceFeedback || [],
          improvementTracking: raw.improvementTracking,
          guideMode: raw.guideMode,
          inlineSentenceImprovement: raw.inlineSentenceImprovement || [],
          suggestedStructures: (raw.recommended_structures || []).map((s: any) => ({
            structure: s.structure_name,
            example: s.example,
            usageTip: s.why_use_it_vi
          })),
          roadmap: raw.roadmap ? {
            currentCefr: raw.roadmap.current_level,
            targetCefr: raw.roadmap.target_level,
            estimatedWeeks: raw.roadmap.estimated_weeks,
            weekly_plan: raw.roadmap.weekly_plan
          } : undefined,
          mode: raw.mode as any,
        };

        setResult(mapped);
        setStatus('ready');
      } else {
        // Fallback to Firestore listener if sessionStorage is empty
        const unsub = onSnapshot(doc(db, 'grading_results', essayId), (snap) => {
          if (snap.exists()) {
            setResult(snap.data() as GradingResultDoc);
            setStatus('ready');
          }
        }, (err) => {
          console.error('Firestore listen error:', err);
          setStatus('error');
        });
        return () => unsub();
      }
    } catch (err) {
      console.error("Result mapping error", err);
      setStatus('error');
    }
  }, [essayId]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-10">
          <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <BrainCircuit className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI đang chấm bài của bạn...</h2>
        <p className="text-slate-500 mt-4 max-w-sm font-medium leading-relaxed">
          Quá trình này thường mất khoảng 10-30 giây. Chúng mình đang phân tích ngữ pháp, từ vựng và cấu trúc bài viết của bạn.
        </p>

        <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-lg">
          {[['grammar', 'Ngữ pháp'], ['vocab', 'Từ vựng'], ['cohesion', 'Mạch lạc']].map(([k, l]) => (
            <div key={k} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                <CheckCheck className="w-6 h-6 text-slate-200" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error' || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-bold">Lỗi khi tải kết quả. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      
      {/* Result Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#064e3b] rounded-xl flex items-center justify-center text-white">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 tracking-tight">Kết quả luyện tập</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {essayId.slice(0, 8)}</p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition-colors uppercase tracking-widest"
          >
            Xuất báo cáo (PDF)
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-10 space-y-12">
        
        {/* Scores - Hidden in Guide Mode */}
        {result.mode !== 'guide' ? (
          <ScoreSummaryCard score={result.score} cefrLevel={result.cefrLevel} />
        ) : (
          <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-950/20">
            <h3 className="text-3xl font-black mb-4">Chế độ Hướng dẫn (Guide Mode)</h3>
            <p className="text-emerald-100 font-medium text-lg leading-relaxed max-w-2xl">
              Chúng mình đã phân tích bài viết của bạn. Hãy xem gợi ý bên dưới để hoàn thiện bài viết nhé!
            </p>
          </div>
        )}

        {/* Relevance Alert if score low */}
        {!result.taskRelevance.isRelevant && (
          <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] flex items-start gap-6 animate-in zoom-in-95 duration-500">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-[1.5rem] flex items-center justify-center shrink-0">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-red-900 mb-2">Cảnh báo lạc đề ({result.taskRelevance.relevanceScore}/10)</h3>
              <p className="text-red-800/70 font-bold text-sm leading-relaxed mb-4">{result.taskRelevance.verdictVi}</p>
              <div className="flex flex-wrap gap-2">
                {result.taskRelevance.missingPointsVi.map((p, i) => (
                  <span key={i} className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-red-700 border border-red-200 uppercase tracking-wider">Thiếu: {p}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content: Essay & Breakdown */}
          <div className="lg:col-span-2 space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-8">
                <FileText className="w-7 h-7 text-emerald-600" />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Bài viết đã chấm</h3>
              </div>
              <AnnotatedEssay text={result.essayText} annotations={result.annotations} />
            </section>
          </div>

          {/* Sidebar: Suggestions & Roadmap */}
          <div className="space-y-10">
            
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-600" /> Cần cải thiện
              </h3>
              <div className="space-y-4">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-bold text-slate-700 leading-relaxed group hover:bg-white hover:border-emerald-200 transition-all">
                    <span className="text-emerald-300 font-black text-lg leading-none">{i+1}</span>
                    <p>{s}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#064e3b] rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-950/20">
              <h3 className="text-xl font-black mb-4">Lộ trình học tập</h3>
              <p className="text-emerald-100/60 font-medium text-sm leading-relaxed mb-8">
                Dựa trên kết quả này, AI gợi ý bạn chuyển sang cấp độ <span className="text-white font-black">
                  {result.cefrLevel === 'B1' ? 'Bậc 4 (B2)' : (result.cefrLevel === 'B2' ? 'Bậc 5 (C1)' : 'C2')}
                </span>.
              </p>
              
              <div className="space-y-6">
                {result.improvementTracking && (
                  <div className="space-y-6">
                    {result.improvementTracking.improved.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Đã tiến bộ</div>
                        {result.improvementTracking.improved.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-1.5 h-auto bg-emerald-400 rounded-full" />
                            <div className="font-black text-sm">{item}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic 8-Week Roadmap */}
                {(result as any).roadmap?.weekly_plan && (
                   <div className="mt-8 space-y-4">
                     <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">Kế hoạch 8 tuần</div>
                     <div className="space-y-3">
                       {(result as any).roadmap.weekly_plan.slice(0, 4).map((step: any, i: number) => (
                         <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                           <div className="flex items-center justify-between mb-2">
                             <span className="text-[9px] font-black uppercase text-emerald-400 tracking-tighter">Tuần {step.week}</span>
                             <span className="text-[9px] font-bold text-emerald-100/40">{step.goal}</span>
                           </div>
                           <p className="text-xs font-bold text-white leading-relaxed">{step.focus}</p>
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                {!result.improvementTracking && !(result as any).roadmap && (
                  <div className="text-emerald-100/40 text-sm font-medium italic">
                    Hãy tiếp tục luyện tập để AI theo dõi sự tiến bộ của bạn nhé!
                  </div>
                )}
              </div>

              <button className="w-full py-4 bg-emerald-500 rounded-2xl font-black text-sm mt-10 hover:bg-emerald-400 transition-colors shadow-lg">
                Bắt đầu Bài kế tiếp
              </button>
            </section>

          </div>
        </div>

      </main>
    </div>
  );
}
