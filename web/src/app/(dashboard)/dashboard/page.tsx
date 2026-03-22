'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileEdit, TrendingUp, Flame, ChevronDown, ChevronUp,
  LineChart as LineChartIcon, Award, ArrowRight, FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useTranslation } from 'react-i18next';
import { getProgress, getSubmissionHistory } from '@/lib/api';
import { ProgressResponse, SubmissionListItemResponse } from '@/types/grading';

// Native formatter for Vietnamese locale
const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

// Simple mockup of a Line Chart since we don't have Recharts installed to keep it fast
const MockLineChart = ({ history }: { history: ProgressResponse['scoreHistory'] }) => {
  // Take last 7 points or pad if empty
  const points = history.length > 0 
    ? [...history].reverse().slice(-7) 
    : [
        { date: 'N/A', score: 0, submissionId: '', taskType: '' },
        { date: 'N/A', score: 0, submissionId: '', taskType: '' },
        { date: 'N/A', score: 0, submissionId: '', taskType: '' }
      ];

  const maxScore = Math.max(...points.map(p => p.score), 10);
  
  return (
    <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8 pt-4">
       {/* Grid lines */}
       <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4 opacity-10">
          {[0, 1, 2, 3, 4].map(i => <div key={i} className="w-full h-px bg-gray-900"></div>)}
       </div>
       
       {/* Y-axis labels */}
       <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-gray-400 pb-8 pt-4 w-6">
          <span>9.0</span>
          <span>7.0</span>
          <span>5.0</span>
          <span>3.0</span>
          <span>1.0</span>
       </div>

       {/* Data Points */}
       {points.map((point, i) => {
         const heightPercent = (point.score / 10) * 100;
         return (
           <div key={i} className="relative z-10 flex flex-col items-center group h-full justify-end flex-1">
              <div className="w-0.5 h-full bg-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-8"></div>
              <div 
                className="w-4 h-4 bg-white border-4 border-emerald-500 rounded-full shadow-md z-10 absolute hover:scale-125 transition-transform cursor-pointer" 
                style={{ bottom: `${heightPercent}%`, marginBottom: '24px' }}
              >
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                    {point.score.toFixed(1)} Band
                 </div>
              </div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400 mt-2 truncate w-full text-center">
                {point.date.split('-').slice(1).join('/')}
              </span>
           </div>
         );
       })}
    </div>
  );
};

export default function StudentDashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [history, setHistory] = useState<SubmissionListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progData, histData] = await Promise.all([
          getProgress(),
          getSubmissionHistory(5)
        ]);
        setProgress(progData);
        setHistory(histData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading your progress...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      
      <div className="space-y-5 max-w-7xl mx-auto px-6 sm:px-8 pb-12 pt-5">
        
        {/* Welcome */}
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{t('dashboard.welcome', { name: firstName })}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t('dashboard.overview')}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-200 shadow-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.totalEssays')}</p>
              <span className="text-4xl font-black text-slate-900 dark:text-white">{progress?.totalEssays ?? 0}</span>
            </div>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-all duration-200 shadow-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.avgBand')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{progress?.weightedOverallScore?.toFixed(1) ?? '0.0'}</span>
                {progress && progress.scoreHistory.length > 1 && (
                  <span className="text-sm font-bold text-emerald-500 dark:text-emerald-400 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-0.5"/> 
                    {progress.scoreHistory[0].score >= progress.scoreHistory[1].score ? '+' : ''}
                    {(progress.scoreHistory[0].score - progress.scoreHistory[1].score).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between group hover:border-orange-500/30 transition-all duration-200 shadow-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.streak')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{progress?.streak ?? 0}</span>
                <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('dashboard.stats.days')}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Chart + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" /> {t('dashboard.chart.title')}
              </h2>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                7 bài gần nhất
              </div>
            </div>
            <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/30 flex items-end">
              <MockLineChart history={progress?.scoreHistory ?? []} />
            </div>
          </div>

          {/* CTA Banner */}
          <div className="bg-emerald-50 dark:bg-vstep-dark rounded-2xl shadow-sm dark:shadow-xl p-5 text-slate-900 dark:text-white relative flex flex-col justify-between overflow-hidden border border-emerald-200 dark:border-transparent">
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-white/10 rounded-xl flex items-center justify-center border border-emerald-200 dark:border-white/20">
                <FileEdit className="w-5 h-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">{t('dashboard.cta.title')}</h3>
                <p className="text-slate-600 dark:text-emerald-100/70 text-sm leading-relaxed">{t('dashboard.cta.subtitle')}</p>
              </div>
            </div>
            <Link href="/practice-list" className="relative z-10 w-full mt-5">
              <Button className="w-full bg-emerald-600 dark:bg-white text-white dark:text-vstep-dark hover:bg-emerald-700 dark:hover:bg-slate-100 font-bold rounded-xl h-11">
                {t('dashboard.cta.button')}
              </Button>
            </Link>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400 dark:bg-emerald-500 rounded-full blur-[80px] opacity-10 dark:opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          </div>
        </div>

        {/* Expandable History Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('dashboard.history.title')}</h2>
            <Link href="/history" className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
              {t('dashboard.history.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-6 py-3">{t('dashboard.history.topic')}</th>
                  <th className="px-6 py-3">{t('dashboard.history.date')}</th>
                  <th className="px-6 py-3 text-center">{t('dashboard.history.score')}</th>
                  <th className="px-6 py-3 text-right">{t('dashboard.history.details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium italic">
                      Bạn chưa có bài viết nào. Hãy bắt đầu luyện tập ngay nhé!
                    </td>
                  </tr>
                ) : history.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr onClick={() => toggleRow(item.id)} className={`cursor-pointer transition-colors group ${expandedRow === item.id ? 'bg-slate-100 dark:bg-slate-700/30' : 'hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-1">{item.questionTitle || "Đề bài tự do"}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                          ${item.taskType === 'task1' ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' : 'bg-fuchsia-100 dark:bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400'}`}>
                          {item.taskType === 'task1' ? 'Task 1: Letter' : 'Task 2: Essay'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {item.status === 'scored' ? (
                          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-600 dark:bg-vstep-dark text-white font-black text-sm">
                            {item.overallScore?.toFixed(1) ?? 'N/A'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">{item.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center">
                          {expandedRow === item.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                        </button>
                      </td>
                    </tr>

                    {expandedRow === item.id && (
                      <tr className="bg-slate-50 dark:bg-slate-900/60">
                        <td colSpan={4} className="px-6 py-6 border-b border-slate-200 dark:border-slate-700/50">
                           <div className="flex items-center justify-center">
                              <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold uppercase tracking-widest text-[10px] px-8 h-10 rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href=`/practice/${item.questionId}/result?id=${item.id}`;
                                }}
                              >
                                {t('dashboard.history.fullReport')} <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
