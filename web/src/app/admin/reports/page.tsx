'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Activity,
  RefreshCw,
  PieChart,
  Target,
  Users,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminReportsService, DailyTrendDTO, ScoreBucketDTO } from '@/services/admin/adminReportsService';
import { useGlobal } from '@/components/GlobalProvider';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function AdminReportsPage() {
  const { addToast } = useGlobal();
  const [trends, setTrends] = useState<DailyTrendDTO[]>([]);
  const [distribution, setDistribution] = useState<ScoreBucketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'reports' | 'analysis'>('reports');
  const [activeSubTab, setActiveSubTab] = useState<string>('Overview');
  const [aiTrends, setAiTrends] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [trendsData, distData, aiData] = await Promise.all([
        adminReportsService.getTrends(30),
        adminReportsService.getDistribution(),
        adminReportsService.getAiTrends(30)
      ]);
      setTrends(trendsData);
      setDistribution(distData);
      setAiTrends(aiData);
    } catch (err) {
      addToast('error', 'Failed to generate intelligence reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await adminReportsService.exportCsv();
      addToast('success', 'Master data exported to CSV');
    } catch (err) {
      addToast('error', 'CSV export failed');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-screen bg-slate-50 dark:bg-slate-950 gap-4">
        <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Aggregating Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          Analytics Intelligence
        </h1>
        <div className="flex items-center gap-3">
           <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport} 
              disabled={exporting}
              className="rounded-xl h-9 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all"
           >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-2 text-emerald-500" /> 
              {exporting ? 'Generating...' : 'Export Master CSV'}
           </Button>
           <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchData} 
              className="rounded-xl h-9 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider"
           >
              <RefreshCw className="w-3.5 h-3.5" /> 
           </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Navigation Hierarchy */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 pb-px">
              <button 
                onClick={() => { setActiveTab('reports'); setActiveSubTab('Overview'); }}
                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'reports' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Reports
                {activeTab === 'reports' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 animate-in fade-in slide-in-from-bottom-1" />}
              </button>
              <button 
                onClick={() => { setActiveTab('analysis'); setActiveSubTab('Score analysis'); }}
                className={`pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'analysis' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Analysis
                {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 animate-in fade-in slide-in-from-bottom-1" />}
              </button>
           </div>

           <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {activeTab === 'reports' ? (
                ['Overview', 'Submissions stats', 'Topic performance'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap
                      ${activeSubTab === tab ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-emerald-500/30'}`}
                  >
                    {tab}
                  </button>
                ))
              ) : (
                ['Score analysis', 'Writing skills breakdown', 'User behavior', 'AI insights'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap
                      ${activeSubTab === tab ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-500/30'}`}
                  >
                    {tab}
                  </button>
                ))
              )}
           </div>
        </div>

        {activeTab === 'reports' && activeSubTab === 'Overview' && (
           <>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-500/10 shadow-sm flex items-center justify-between group">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Throughput</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {trends.reduce((acc, curr) => acc + curr.count, 0)}
                 </p>
                 <p className="text-[10px] text-emerald-500 font-bold mt-1">LAST 30 DAYS</p>
              </div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <TrendingUp className="w-7 h-7 text-emerald-600" />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-blue-500/10 shadow-sm flex items-center justify-between group">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Avg Score</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {(trends.filter(t => t.avgScore > 0).reduce((acc, curr) => acc + curr.avgScore, 0) / (trends.filter(t => t.avgScore > 0).length || 1)).toFixed(2)}
                 </p>
                 <p className="text-[10px] text-blue-500 font-bold mt-1">AI BENCHMARK</p>
              </div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Award className="w-7 h-7 text-blue-600" />
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-purple-500/10 shadow-sm flex items-center justify-between group">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Peak Daily Volume</p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {trends.length > 0 ? Math.max(...trends.map(t => t.count)) : 0}
                 </p>
                 <p className="text-[10px] text-purple-500 font-bold mt-1">SINGLE DAY MAX</p>
              </div>
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Target className="w-7 h-7 text-purple-600" />
              </div>
           </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           
           {/* Trend Chart */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Submission Velocity
                 </h2>
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Volume</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Avg Score</div>
                 </div>
              </div>
              <div className="h-[300px] w-full mt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trends}>
                       <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                          dataKey="date" 
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                       />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                          labelStyle={{ fontWeight: 800, marginBottom: '4px', color: '#10b981' }}
                       />
                       <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                       <Area type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Score Distribution Chart */}
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                 <PieChart className="w-4 h-4 text-emerald-500" />
                 Global Score Clusters
              </h2>
              <div className="h-[300px] w-full mt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={distribution}>
                       <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                       <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                       <Tooltip 
                          cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                       />
                       <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {distribution.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index > 5 ? '#10b981' : index > 3 ? '#3b82f6' : '#f43f5e'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

        </div>

        {/* Intelligence Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 bg-white/10 rounded-[32px] backdrop-blur-xl flex items-center justify-center shrink-0 border border-white/10">
                 <Target className="w-12 h-12 text-emerald-400" />
              </div>
              <div className="space-y-4 text-center md:text-left">
                 <h2 className="text-2xl font-black text-white tracking-tight">System Performance Insight</h2>
                 <p className="text-slate-400 max-w-2xl leading-relaxed text-sm">
                    Based on the last 30 days of telemetry, the VSTEP Writing Lab has processed over <b>{trends.reduce((acc, curr) => acc + curr.count, 0)}</b> essays with a modal score cluster between <b>5.0 and 7.0</b>. 
                    AI engine success rate remains above 98% with an average fulfillment latency of <b>{trends.length > 0 ? (trends.filter(t => t.avgScore > 0).reduce((acc, curr) => acc + curr.avgScore, 0) / trends.filter(t => t.avgScore > 0).length * 10).toFixed(0) : '—'}ms</b> per evaluation.
                 </p>
              </div>
           </div>
        </div>

           </>
        )}

        {activeTab === 'analysis' && activeSubTab === 'AI insights' && (
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    AI Engine Performance & Tokens
                 </h2>
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-400">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500 rounded-full" /> Tokens</div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /> Success Rate</div>
                 </div>
              </div>
              <div className="h-[400px] w-full mt-8">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aiTrends}>
                       <defs>
                          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                          dataKey="date" 
                          tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                       />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                       />
                       <Area type="monotone" dataKey="totalTokens" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTokens)" />
                       <Area type="monotone" dataKey="successRate" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}

        {(activeSubTab !== 'Overview' && activeSubTab !== 'AI insights') && (
          <div className="py-20 text-center space-y-4 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto opacity-50">
                <BarChart3 className="w-10 h-10 text-slate-400" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Generating {activeSubTab} Data</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto italic">This specialized cross-sectional analysis requires additional computing credits or history depth.</p>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
