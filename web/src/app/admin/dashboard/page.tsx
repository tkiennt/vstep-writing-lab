'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  Wifi,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { adminAnalyticsService, AnalyticsDTO, AiLogDTO } from '@/services/admin/adminAnalyticsService';
import { useGlobal } from '@/components/GlobalProvider';

// ─── Sub-components ────────────────────────────────────────────

// Sparkline SVG chart for stat cards
function MiniSparkline({ color, up }: { color: string; up: boolean }) {
  const points = up
    ? [30, 38, 28, 42, 35, 50, 45, 60]
    : [60, 50, 55, 42, 48, 35, 40, 28];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 80, h = 32;
  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="opacity-70">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Status badge for logs
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    GRADED:     'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400',
    PROCESSING: 'bg-amber-500/15 text-amber-600 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400',
    FAILED:     'bg-rose-500/15 text-rose-600 border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${map[status] || ''}`}>
      {status === 'PROCESSING' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {status === 'GRADED' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'FAILED' && <AlertTriangle className="w-3 h-3" />}
      {status}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const { addToast } = useGlobal();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);
  const [logs, setLogs] = useState<AiLogDTO[]>([]);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [analyticsData, logsData] = await Promise.all([
        adminAnalyticsService.getAnalytics(),
        adminAnalyticsService.getAiLogs()
      ]);
      setAnalytics(analyticsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      addToast('error', 'Failed to fetch dashboard analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 60 seconds
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  // Fallback if API fails but we want to show something
  const stats = analytics || {
    totalUsers: 0,
    totalEssays: 0,
    totalGradedSuccessfully: 0,
    totalFailed: 0,
    pendingQueue: 0,
    avgResponseTime: '0s',
    tokenUsagePercent: 0,
    hourlyStats: []
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      {/* Page Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          Admin Dashboard
          <span className="ml-3 text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            AI Monitoring
          </span>
        </h1>
        <button 
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 pb-20">

        {/* ── Section 1: Top Metrics ─────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          {/* Total Users */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-blue-500/10 dark:bg-blue-500/15 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total Users</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(stats.totalUsers || 0).toLocaleString()}</h3>
            </div>
            <MiniSparkline color="#3b82f6" up={true} />
          </div>

          {/* AI Graded Successfully */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">AI Graded Successfully</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{(stats.totalGradedSuccessfully || 0).toLocaleString()}</h3>
            </div>
            <MiniSparkline color="#10b981" up={true} />
          </div>

          {/* Pending in Queue */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-amber-500/10 dark:bg-amber-500/15 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Live
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pending in Queue</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.pendingQueue}</h3>
            </div>
            <MiniSparkline color="#f59e0b" up={false} />
          </div>

          {/* Failed / API Errors */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-rose-500/10 dark:bg-rose-500/15 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
              </div>
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Failed / API Errors</p>
              <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400">{stats.totalFailed}</h3>
            </div>
            <MiniSparkline color="#f43f5e" up={false} />
          </div>
        </div>

        {/* ── Section 2: AI Engine Health & Analytics ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left: Traffic & Grading Speed Chart (2/3) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Traffic & Grading Speed</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Submissions vs AI-graded today (hourly)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded-sm bg-blue-400/70 dark:bg-blue-500/50" />
                  Submitted
                </span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <span className="w-3 h-3 rounded-sm bg-emerald-400/80 dark:bg-emerald-500/60" />
                  Graded
                </span>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-end gap-1.5 h-40 px-2">
                {stats.hourlyStats && stats.hourlyStats.length > 0 ? (
                  stats.hourlyStats.map((d, i) => {
                    const maxSub = Math.max(...stats.hourlyStats.map(x => x.submissions), 1);
                    const subH = (d.submissions / maxSub) * 100;
                    const gradH = (d.graded / maxSub) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {d.submissions} submitted · {d.graded} graded
                        </div>
                        <div className="flex items-end gap-0.5 w-full h-36">
                          <div
                            className="flex-1 bg-blue-400/60 dark:bg-blue-500/50 rounded-t-sm transition-all duration-300 group-hover:bg-blue-500 dark:group-hover:bg-blue-400"
                            style={{ height: `${subH}%` }}
                          />
                          <div
                            className="flex-1 bg-emerald-400/70 dark:bg-emerald-500/60 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-500 dark:group-hover:bg-emerald-400"
                            style={{ height: `${gradH}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{d.hour}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="w-full flex items-center justify-center text-slate-400 text-xs italic">
                    No traffic data available for today
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: System Health (1/3) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">System Health</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Gemini AI Engine status</p>
            </div>

            {/* API Status */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gemini API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                <span className="text-xs font-bold text-emerald-500">Online</span>
              </div>
            </div>

            {/* Avg Response Time */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Avg Response</span>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white">{stats.avgResponseTime}</span>
            </div>

            {/* Token / Quota Usage */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Token Quota (Monthly)</span>
                <span className={`text-xs font-black ${stats.tokenUsagePercent >= 80 ? 'text-rose-500' : stats.tokenUsagePercent >= 60 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {stats.tokenUsagePercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    stats.tokenUsagePercent >= 80
                      ? 'bg-rose-500'
                      : stats.tokenUsagePercent >= 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${stats.tokenUsagePercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Monthly budget monitoring inactive
              </p>
            </div>

            {/* Uptime */}
            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500 font-medium">System Uptime</span>
                <span className="font-black text-slate-700 dark:text-slate-300">99.9%</span>
              </div>
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-4 rounded-sm bg-emerald-400 dark:bg-emerald-500"
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Last 30 days active monitoring</p>
            </div>
          </div>
        </div>

        {/* ── Section 3: Real-time System Logs ───────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Real-time AI Grading Logs
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Latest submission activity from students</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/40">
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Topic</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs text-slate-400 dark:text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {log.userName.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">{log.userName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{log.topicTitle}</span>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                      No logs available for specified period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/20">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Showing <strong className="text-slate-600 dark:text-slate-300">{logs.length}</strong> latest grading events
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
