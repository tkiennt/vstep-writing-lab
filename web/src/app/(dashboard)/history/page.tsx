'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { History, FileText, ChevronRight, Clock, Loader2, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getSubmissionHistory, retryGrading } from '@/lib/api';
import { SubmissionListItemResponse } from '@/types/grading';
import { useTranslation } from 'react-i18next';

export default function HistoryPage() {
  const { t, i18n } = useTranslation();
  const [submissions, setSubmissions] = useState<SubmissionListItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryError, setRetryError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getSubmissionHistory(50);
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleRetry = async (e: React.MouseEvent, submissionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRetryingId(submissionId);
    setRetryError(null);
    try {
      await retryGrading(submissionId);
      // Navigate to the result page so user can watch progress
      const submission = submissions.find((s) => s.id === submissionId);
      if (submission) {
        window.location.href = `/practice/${submission.questionId}/result?id=${submissionId}`;
      }
    } catch (err) {
      console.error('Retry failed:', err);
      setRetryError('Không thể chấm lại. Vui lòng thử lại sau.');
      setRetryingId(null);
    }
  };

  const isFailed = (status: string) =>
    status === 'failed' || status === 'Failed' || status === 'error' || status === 'Error' || status === 'timeout' || status === 'Timeout';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">{t('history.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 px-4 sm:px-6">
      <div className="pt-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t('history.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{t('history.subtitle')}</p>
      </div>

      {retryError && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-4 py-3 text-red-700 dark:text-red-400 text-sm font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {retryError}
        </div>
      )}

      {submissions.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 p-16 text-center">
          <History className="h-16 w-16 text-slate-200 dark:text-slate-700 mx-auto mb-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('history.empty.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto">{t('history.empty.subtitle')}</p>
          <Link href="/practice-list">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 rounded-xl font-bold shadow-lg shadow-emerald-900/10">
              <FileText className="mr-2 h-4 w-4" />
              {t('history.empty.cta')}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {submissions.map((s) => {
            const failed = isFailed(s.status);

            const cardContent = (
              <div
                className={`bg-white dark:bg-slate-800 p-5 pr-6 rounded-2xl border shadow-sm flex items-center justify-between group transition-all ${
                  failed
                    ? 'border-red-200 dark:border-red-500/30 cursor-default'
                    : 'border-slate-100 dark:border-slate-700/50 hover:shadow-md hover:border-emerald-500/30 cursor-pointer'
                }`}
              >
                {/* Left: icon + info */}
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      s.status === 'scored'
                        ? 'bg-emerald-500 dark:bg-emerald-600 text-white'
                        : failed
                        ? 'bg-red-100 dark:bg-red-500/15 text-red-500'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {s.status === 'scored' ? (
                      <span className="text-lg font-black">{s.overallScore?.toFixed(1) || '0.0'}</span>
                    ) : failed ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5 animate-pulse" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          s.taskType.toLowerCase().includes('task1')
                            ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                            : 'bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400'
                        }`}
                      >
                        {s.taskType.toLowerCase().includes('task1') ? t('practiceList.card.vstepTask1') : t('practiceList.card.vstepTask2')}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(s.createdAt).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                    <h3
                      className={`font-bold text-slate-900 dark:text-slate-100 transition-colors ${
                        !failed ? 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {s.questionTitle || t('history.item.defaultTitle')}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest">
                      {s.wordCount} {t('common.words')} • {s.mode} {t('history.item.mode')}
                    </p>
                  </div>
                </div>

                {/* Right: status badge + action */}
                <div className="flex items-center gap-3">
                  {failed ? (
                    <>
                      <span className="text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-3 py-1 rounded-full border border-red-100 dark:border-red-500/20 uppercase tracking-widest">
                        Lỗi chấm
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRetry(e, s.id)}
                        disabled={retryingId === s.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-sm transition-all active:scale-95"
                      >
                        {retryingId === s.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Chấm lại
                      </button>
                    </>
                  ) : (
                    <>
                      {s.status !== 'scored' && (
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-100 dark:border-amber-500/20 uppercase tracking-widest">
                          {s.status}...
                        </span>
                      )}
                      <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );

            // Failed cards are NOT wrapped in Link to prevent navigation
            if (failed) {
              return <div key={s.id}>{cardContent}</div>;
            }

            return (
              <Link key={s.id} href={`/practice/${s.questionId}/result?id=${s.id}`}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
