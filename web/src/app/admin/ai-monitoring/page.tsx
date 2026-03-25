'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Zap, 
  AlertCircle, 
  Clock, 
  Database,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { aiMonitoringService, AiLogDTO, AiStatsDTO } from '@/services/admin/aiMonitoringService';
import { useGlobal } from '@/components/GlobalProvider';

export default function AdminAiMonitoringPage() {
  const { addToast } = useGlobal();
  const [logs, setLogs] = useState<AiLogDTO[]>([]);
  const [stats, setStats] = useState<AiStatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [logsData, statsData] = await Promise.all([
        aiMonitoringService.getLogs(30),
        aiMonitoringService.getStats()
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      addToast('error', 'Failed to synchronize AI telemetry');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 h-screen bg-slate-50 dark:bg-slate-950 gap-4">
        <Activity className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Intercepting Model Streams...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-500" />
          Neural Engine Pulse
        </h1>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">System Online</span>
           </div>
           <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchData} 
              disabled={refreshing}
              className="rounded-xl h-9 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs uppercase tracking-wider transition-all"
           >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> 
              {refreshing ? 'Polling...' : 'Hard Refresh'}
           </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-500" />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Success Rate</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                 {stats ? (((stats.totalCalls - stats.errorCount) / stats.totalCalls) * 100).toFixed(1) : '—'}%
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">LIFETIME ACCURACY</p>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-500" />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg Latency</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                 {stats?.averageLatencyMs || '—'}<span className="text-lg text-slate-400 ml-1">ms</span>
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">RESPONSE VELOCITY</p>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-500" />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">M-Tokens</p>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                 {stats ? (stats.totalTokens / 1000000).toFixed(2) : '—'}<span className="text-lg text-slate-400 ml-1">M</span>
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">BURNOUT QUOTA</p>
           </div>

           <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-rose-500" />
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident Root</p>
              </div>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-500">
                 {stats?.errorCount || 0}
              </p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">30D ERROR STACK</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Detailed Stream Logs */}
           <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between px-2">
                 <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    Agent Activity Stream
                 </h2>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                       <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                          <tr>
                             <th className="px-6 py-4">Status</th>
                             <th className="px-6 py-4">Model & Vector</th>
                             <th className="px-6 py-4 text-center">Tokens</th>
                             <th className="px-6 py-4 text-center">Latency</th>
                             <th className="px-6 py-4 text-right">Timestamp</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
                          {logs.map((log) => (
                             <tr key={log.logId} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-5">
                                   <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`} />
                                </td>
                                <td className="px-6 py-5">
                                   <p className="font-bold text-slate-900 dark:text-slate-200">{log.model}</p>
                                   <p className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">{log.submissionId}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <span className="font-black text-slate-600 dark:text-slate-400">{log.totalTokens}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <span className={`font-bold ${log.latencyMs > 5000 ? 'text-amber-500' : 'text-slate-500'}`}>
                                      {log.latencyMs}ms
                                   </span>
                                </td>
                                <td className="px-6 py-5 text-right font-medium text-slate-400">
                                   {new Date(log.createdAt).toLocaleTimeString()}
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>

           {/* Model Distribution & Intelligence */}
           <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 px-2">
                 <BarChart3 className="w-4 h-4 text-emerald-500" />
                 Model Architecture
              </h2>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                 {stats && Object.entries(stats.modelUsage).map(([model, usage], idx) => (
                    <div key={model} className="space-y-2">
                       <div className="flex justify-between items-end">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{model}</p>
                          <p className="text-sm font-black text-emerald-500">{usage} <span className="text-[10px] text-slate-400 uppercase">reqs</span></p>
                       </div>
                       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full bg-gradient-to-r ${idx === 0 ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'} rounded-full`}
                             style={{ width: `${(usage / stats.totalCalls) * 100}%` }}
                          />
                       </div>
                    </div>
                 ))}

                 <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Health Manifest</h3>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Prompt Caching</span>
                             <span className="text-xs font-black text-emerald-500">OPTIMIZED</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Gateway Latency</span>
                             <span className="text-xs font-black text-slate-900 dark:text-white">LOW</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Model Throttling</span>
                             <span className="text-xs font-black text-slate-400">NONE</span>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
}
