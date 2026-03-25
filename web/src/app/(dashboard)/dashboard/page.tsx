'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileEdit, TrendingUp, Flame, ChevronDown, ChevronUp,
  LineChart as LineChartIcon, Award, ArrowRight, FileText,
  Loader2, BookMarked, Bell, MessageSquare, Target,
  Zap, BarChart3, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useTranslation } from 'react-i18next';
import { getProgress, getSubmissionHistory } from '@/lib/api';
import { ProgressResponse, SubmissionListItemResponse } from '@/types/grading';

// Native formatter for Vietnamese locale
const formatDate = (dateStr: string, lang: string = 'vi') => {
  try {
    return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-US', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const MockLineChart = ({ history }: { history: ProgressResponse['scoreHistory'] }) => {
  const { t } = useTranslation();
  const points = [...history]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10); // Show more points for full-width
  
  const chartPoints = points.length >= 2 ? points : [
    { date: '2024-03-20', score: 2 },
    { date: '2024-03-21', score: 4 },
    { date: '2024-03-22', score: 3 },
    { date: '2024-03-23', score: 6 },
    { date: '2024-03-24', score: 5 },
  ].map(p => ({ ...p, id: '', taskType: '', score: Number(p.score) }));

  const maxScore = 10;
  const width = 1200;
  const height = 250;
  const paddingX = 60;
  const paddingY = 30;
  
  const getX = (i: number) => paddingX + (i * (width - 2 * paddingX) / (chartPoints.length - 1 || 1));
  const getY = (score: number) => height - paddingY - (score / maxScore) * (height - 2 * paddingY);
  
  const pathData = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.score)}`).join(' ');

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" /> {t('dashboard.chart.title')}
        </h3>
        <div className="flex gap-2 text-[10px] font-bold text-slate-400">
           <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">{t('dashboard.chart.last7')}</span>
        </div>
      </div>
      <div className="relative h-64 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#10b981" />
               <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map(s => (
            <line key={s} x1={paddingX} y1={getY(s)} x2={width-paddingX} y2={getY(s)} stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" strokeDasharray="5,5" />
          ))}

          {/* Area under line */}
          <path d={`${pathData} L ${getX(chartPoints.length-1)} ${height-paddingY} L ${getX(0)} ${height-paddingY} Z`} fill="url(#chartGradient)" />

          {/* Line */}
          <path d={pathData} fill="none" stroke="url(#lineStroke)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg" />

          {/* Points */}
          {chartPoints.map((p, i) => (
            <g key={i} className="group/point">
              <circle cx={getX(i)} cy={getY(p.score)} r="6" className="fill-white stroke-emerald-500 stroke-[3]" />
              <rect x={getX(i)-20} y={getY(p.score)-40} width="40" height="25" rx="6" className="fill-slate-900 opacity-0 group-hover/point:opacity-100 transition-opacity" />
              <text x={getX(i)} y={getY(p.score)-23} textAnchor="middle" className="fill-white text-[12px] font-bold opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none">{p.score.toFixed(1)}</text>
            </g>
          ))}
        </svg>
        {/* X-Axis Dates */}
        <div className="flex justify-between px-[60px] mt-2 text-[10px] font-bold text-slate-400">
           {chartPoints.map((p, i) => <span key={i}>{p.date.split('-').slice(1).join('/')}</span>)}
        </div>
      </div>
    </div>
  );
};

const SkillBreakdown = ({ skills }: { skills: Record<string, number> }) => {
  const { t } = useTranslation();
  const skillNames = ['taskFulfilment', 'organization', 'vocabulary', 'grammar'];
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Skill Breakdown</h3>
       </div>
       <div className="space-y-5">
          {skillNames.map(skill => (
            <div key={skill}>
               <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t(`dashboard.chart.skills.${skill}`)}</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{(skills[skill] || 0).toFixed(1)}</span>
               </div>
               <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${skills[skill] >= 7 ? 'bg-emerald-500' : skills[skill] >= 5 ? 'bg-blue-500' : 'bg-amber-500'}`}
                    style={{ width: `${(skills[skill] || 0) * 10}%` }}
                  ></div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

const FeedbackSnapshot = ({ latestHistory }: { latestHistory?: SubmissionListItemResponse }) => {
  const { i18n, t } = useTranslation();
  const isEn = i18n.language === 'en';
  if (!latestHistory) return null;

  const summary = isEn 
    ? (latestHistory.summaryEn || "Your latest report is ready. Click below to see detailed AI feedback.")
    : (latestHistory.summaryVi || "Báo cáo mới nhất của bạn đã sẵn sàng. Nhấn vào bên dưới để xem chi tiết nhận xét từ AI.");
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-fuchsia-100 dark:bg-fuchsia-500/10 rounded-xl flex items-center justify-center border border-fuchsia-200 dark:border-fuchsia-500/20">
            <MessageSquare className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Feedback Snapshot</h3>
       </div>
       <div className="bg-fuchsia-50/50 dark:bg-fuchsia-500/5 rounded-2xl p-4 border border-fuchsia-100 dark:border-fuchsia-500/10">
          <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
             &quot;{summary}&quot;
          </p>
          <div className="mt-4 pt-4 border-t border-fuchsia-100 dark:border-fuchsia-500/10 flex items-center justify-between">
             <span className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest">LATEST SUBMISSION</span>
             <Link href={`/practice/${latestHistory.questionId}/result?id=${latestHistory.id}`} className="text-xs font-bold flex items-center gap-1 hover:underline">Full Report <ArrowRight className="w-3 h-3" /></Link>
          </div>
       </div>
    </div>
  );
};

const RecommendedTasks = ({ weakSkills }: { weakSkills: string[] }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-8 shadow-sm">
       <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-200 dark:border-amber-500/20">
            <Target className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recommended Tasks</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Personalized study path based on your needs</p>
          </div>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {weakSkills.slice(0, 3).map(skill => (
            <div key={skill} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 group hover:border-emerald-500 transition-all cursor-pointer">
               <div className="flex justify-between items-start mb-4">
                  <span className="p-2 bg-white dark:bg-slate-800 rounded-lg text-emerald-500 border border-emerald-100 dark:border-emerald-500/10 group-hover:scale-110 transition-transform">
                     <Zap className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500">Suggested</span>
               </div>
               <h4 className="font-bold text-slate-900 dark:text-white mb-2">{t(`dashboard.chart.topics.${skill}`)}</h4>
               <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{t(`dashboard.chart.advice.${skill}`)}</p>
               <Link href="/resources" className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1">Practice Now <ArrowRight className="w-3 h-3" /></Link>
            </div>
          ))}
          {weakSkills.length === 0 && (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center justify-center text-center py-10 col-span-3">
               <p className="text-sm font-bold text-slate-400 mb-2">YOU ARE DOING GREAT!</p>
               <Link href="/practice-list">
                  <Button variant="outline" className="rounded-xl font-bold">Try Random Task</Button>
               </Link>
            </div>
          )}
       </div>
    </div>
  );
};

const NotificationsSection = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
       <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications</h3>
       </div>
       <div className="space-y-4">
          <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
             <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
             <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">AI Grading Complete</p>
                <p className="text-xs text-slate-500">Your latest essay has been graded. Band 7.5</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> 2 mins ago</span>
             </div>
          </div>
          <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors opacity-60">
             <div className="w-2 h-2 rounded-full bg-slate-300 mt-2"></div>
             <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">System Update</p>
                <p className="text-xs text-slate-500">New practice tasks added for Task 1.</p>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Clock className="w-3 h-3"/> 1 hour ago</span>
             </div>
          </div>
       </div>
    </div>
  );
};

export default function StudentDashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [history, setHistory] = useState<SubmissionListItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  
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

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('dashboard.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 pb-12 transition-colors duration-300">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 space-y-8">
        
        {/* Row 1: Overall Score & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
           <div className="bg-gradient-to-br from-vstep-dark to-slate-800 dark:from-slate-900 dark:to-vstep-dark rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full justify-between">
                 <div>
                    <h2 className="text-lg font-bold opacity-80 mb-1">{t('dashboard.welcome', { name: user?.name?.split(' ')[0] ?? 'Friend' })}</h2>
                    <p className="text-3xl font-black tracking-tight">{t('dashboard.overview')}</p>
                 </div>
                 <div className="mt-8 flex items-end gap-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Overall Score</p>
                       <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black tracking-tighter">{progress?.weightedOverallScore?.toFixed(1) ?? '0.0'}</span>
                          <span className="text-sm font-bold opacity-60">BAND</span>
                       </div>
                    </div>
                    <div className="flex-1 space-y-4 mb-2">
                       <div className="flex items-center justify-between text-xs font-bold">
                          <span>Progress to C1</span>
                          <span>{((progress?.weightedOverallScore ?? 0) / 9 * 100).toFixed(0)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(progress?.weightedOverallScore ?? 0) / 9 * 100}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
           </div>

           <div className="bg-emerald-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-emerald-100 dark:border-slate-700/50 flex flex-col justify-between shadow-sm relative group">
              <div>
                 <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-md border border-emerald-100 dark:border-slate-700 mb-6 group-hover:scale-110 transition-transform">
                    <FileEdit className="w-7 h-7 text-emerald-600" />
                 </div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">{t('dashboard.cta.title')}</h3>
                 <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{t('dashboard.cta.subtitle')}</p>
              </div>
              <Link href="/practice-list" className="mt-8">
                 <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14 rounded-2xl shadow-lg shadow-emerald-500/20 text-lg flex items-center justify-center gap-2">
                    {t('dashboard.cta.button')} <ArrowRight className="w-5 h-5" />
                 </Button>
              </Link>
           </div>
        </div>

        {/* Row 2: Progress Chart */}
        <MockLineChart history={progress?.scoreHistory ?? []} />

        {/* Row 3: Recent Submissions */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
           <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                 <Clock className="w-4 h-4 text-emerald-500" /> {t('dashboard.history.title')}
              </h3>
              <Link href="/history" className="text-xs font-black text-emerald-600 hover:underline flex items-center gap-1 uppercase tracking-widest">
                 {t('dashboard.history.viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-700/50">
                    <tr>
                       <th className="px-8 py-4">{t('dashboard.history.topic')}</th>
                       <th className="px-8 py-4">{t('dashboard.history.date')}</th>
                       <th className="px-8 py-4 text-center">{t('dashboard.history.score')}</th>
                       <th className="px-8 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-700/40">
                    {history.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                          <td className="px-8 py-5">
                             <p className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-emerald-600 transition-colors uppercase text-xs">{item.questionTitle || "Đề bài tự do"}</p>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.taskType}</span>
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-500 dark:text-slate-400">
                             {formatDate(item.createdAt, i18n.language)}
                          </td>
                          <td className="px-8 py-5 text-center">
                             <span className="inline-flex items-center justify-center min-w-[40px] h-10 px-3 rounded-xl bg-emerald-600 text-white font-black text-sm">
                                {item.overallScore?.toFixed(1) ?? 'N/A'}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <Link href={`/practice/${item.questionId}/result?id=${item.id}`}>
                                <Button variant="ghost" className="rounded-xl font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">Report</Button>
                             </Link>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Row 4: Skill Breakdown & Feedback Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <SkillBreakdown skills={progress?.averageBySkill ?? {}} />
           <FeedbackSnapshot latestHistory={history[0]} />
        </div>

        {/* Row 5: Recommended Tasks */}
        <RecommendedTasks weakSkills={progress?.weakSkills ?? []} />

        {/* Row 6: Notifications */}
        <NotificationsSection />

      </div>
    </div>
  );
}
