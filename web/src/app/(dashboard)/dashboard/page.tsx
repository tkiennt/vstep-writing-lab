'use client';

import React, { useState } from 'react';
import { 
  FileEdit, TrendingUp, Flame, ChevronDown, ChevronUp,
  LineChart as LineChartIcon, Award, ArrowRight, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useTranslation } from 'react-i18next';

/* ── Mock Line Chart ── */
const MockLineChart = () => (
  <div className="relative h-64 w-full flex items-end justify-between px-4 pb-8 pt-4">
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pt-4">
      <div className="w-full h-px bg-slate-700/50" /><div className="w-full h-px bg-slate-700/50" />
      <div className="w-full h-px bg-slate-700/50" /><div className="w-full h-px bg-slate-700/50" />
    </div>
    <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-[10px] font-bold text-slate-500 pb-8 pt-4 w-6">
      <span>8.0</span><span>7.0</span><span>6.0</span><span>5.0</span>
    </div>
    <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
      <path d="M 40 180 Q 200 160 350 120 T 600 80 T 900 60" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      <path d="M 40 180 Q 200 160 350 120 T 600 80 T 900 60" fill="url(#chartGrad)" strokeWidth="0" opacity="0.12"/>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
    {[
      { date: 'Oct 01', top: '180px' },{ date: 'Oct 05', top: '150px' },
      { date: 'Oct 12', top: '120px' },{ date: 'Oct 18', top: '110px' },
      { date: 'Oct 25', top: '80px' },
    ].map((point, i) => (
      <div key={i} className="relative z-10 flex flex-col items-center group h-full justify-end">
        <div className="w-3 h-3 bg-slate-900 border-2 border-emerald-500 rounded-full z-10 absolute hover:scale-125 transition-transform cursor-pointer" style={{ top: point.top }}>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border border-slate-600">
            Band {(5.5 + i * 0.5).toFixed(1)}
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2">{point.date}</span>
      </div>
    ))}
  </div>
);

const MOCK_HISTORY = [
  { id: '1', title: 'Advantages of Studying Abroad', type: 'Task 2', score: 6.5, date: 'Oct 25, 2026',
    details: { taskFulfilment: 7.0, coherence: 6.5, lexical: 6.0, grammar: 5.5 }},
  { id: '2', title: 'Email to Hotel Manager', type: 'Task 1', score: 6.5, date: 'Oct 18, 2026',
    details: { taskFulfilment: 7.0, coherence: 7.0, lexical: 6.0, grammar: 6.0 }},
  { id: '3', title: 'Impact of AI on Education', type: 'Task 2', score: 6.0, date: 'Oct 12, 2026',
    details: { taskFulfilment: 6.0, coherence: 6.5, lexical: 6.0, grammar: 5.0 }},
];

export default function StudentDashboard() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const toggleRow = (id: string) => setExpandedRow(expandedRow === id ? null : id);

  return (
    <div className="min-h-full bg-slate-950">
      <DashboardHeader />
      
      <div className="space-y-5 max-w-7xl mx-auto px-6 sm:px-8 pb-12 pt-5">

        {/* Welcome */}
        <div>
          <h2 className="text-base font-bold text-slate-100">{t('dashboard.welcome', { name: firstName })}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{t('dashboard.overview')}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-200">
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.totalEssays')}</p>
              <span className="text-4xl font-black text-white">24</span>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between group hover:border-blue-500/30 transition-all duration-200">
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.avgBand')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">6.2</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/>+0.5</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5 text-blue-400" />
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between group hover:border-orange-500/30 transition-all duration-200">
            <div>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('dashboard.stats.streak')}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">5</span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t('dashboard.stats.days')}</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Chart + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-slate-800 rounded-2xl border border-slate-700/50 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-slate-500" /> {t('dashboard.chart.title')}
              </h2>
              <select className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-700 border border-slate-600 rounded-lg py-1.5 px-3 outline-none cursor-pointer">
                <option>{t('dashboard.chart.last30')}</option>
                <option>{t('dashboard.chart.allTime')}</option>
              </select>
            </div>
            <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700/30">
              <MockLineChart />
            </div>
          </div>

          <div className="bg-vstep-dark rounded-2xl shadow-xl p-5 text-white relative flex flex-col justify-between overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <FileEdit className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-bold mb-1.5">{t('dashboard.cta.title')}</h3>
                <p className="text-emerald-100/70 text-sm leading-relaxed">{t('dashboard.cta.subtitle')}</p>
              </div>
            </div>
            <Link href="/practice-list" className="relative z-10 w-full mt-5">
              <Button className="w-full bg-white text-vstep-dark hover:bg-slate-100 font-bold rounded-xl h-11">
                {t('dashboard.cta.button')}
              </Button>
            </Link>
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-900">
            <h2 className="text-sm font-bold text-slate-100">{t('dashboard.history.title')}</h2>
            <Link href="/practice-list" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 flex items-center gap-1 transition-colors">
              {t('dashboard.history.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900 text-slate-500 font-black text-[10px] uppercase tracking-widest border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3">{t('dashboard.history.topic')}</th>
                  <th className="px-6 py-3">{t('dashboard.history.date')}</th>
                  <th className="px-6 py-3 text-center">{t('dashboard.history.score')}</th>
                  <th className="px-6 py-3 text-right">{t('dashboard.history.details')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {MOCK_HISTORY.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr onClick={() => toggleRow(item.id)} className={`cursor-pointer transition-colors group ${expandedRow === item.id ? 'bg-slate-700/30' : 'hover:bg-slate-700/20'}`}>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors mb-1">{item.title}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider
                          ${item.type === 'Task 1' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-fuchsia-500/15 text-fuchsia-400'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-medium">{item.date}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-vstep-dark text-white font-black text-sm">
                          {item.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center">
                          {expandedRow === item.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                        </button>
                      </td>
                    </tr>

                    {expandedRow === item.id && (
                      <tr className="bg-slate-900/60">
                        <td colSpan={4} className="px-6 py-5 border-b border-slate-700/50">
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            {[
                              [t('dashboard.history.task'), item.details.taskFulfilment],
                              [t('dashboard.history.coherence'), item.details.coherence],
                              [t('dashboard.history.lexical'), item.details.lexical],
                              [t('dashboard.history.grammar'), item.details.grammar],
                            ].map(([label, val]) => (
                              <div key={label as string} className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">{label as string}</span>
                                <span className="font-bold text-slate-100">{(val as number).toFixed(1)}</span>
                              </div>
                            ))}
                            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center col-span-2 lg:col-span-1">
                              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 rounded-lg text-xs" onClick={() => window.location.href=`/results/${item.id}`}>
                                {t('dashboard.history.fullReport')}
                              </Button>
                            </div>
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
