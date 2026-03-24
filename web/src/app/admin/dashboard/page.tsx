'use client';

import React, { useState, useEffect } from 'react';
import { adminAnalyticsService } from '@/services/admin/adminAnalyticsService';
import { 
  BarChart, 
  Users, 
  FileText, 
  CheckCircle, 
  Activity 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAnalyticsService.getAnalytics();
        setStats(data);
      } catch (error) {
        console.error('Failed to load analytics', error);
        // Fallback or empty state could be managed here
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen">
        <Activity className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="h-16 bg-card border-b border-border flex items-center px-8 shrink-0">
         <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BarChart className="w-5 h-5 text-emerald-500" /> Admin Dashboard
         </h1>
      </header>

      <main className="flex-1 p-8 overflow-y-auto w-full max-w-7xl mx-auto space-y-8 pb-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* Users Card */}
           <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center gap-5">
             <div className="w-14 h-14 bg-blue-500/10 text-blue-500 outline outline-1 outline-blue-500/20 rounded-2xl flex items-center justify-center">
               <Users className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Users</p>
               <h3 className="text-3xl font-black text-foreground mt-1">{stats?.totalUsers || 0}</h3>
             </div>
           </div>

           {/* Submissions Card */}
           <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center gap-5">
             <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 outline outline-1 outline-emerald-500/20 rounded-2xl flex items-center justify-center">
               <FileText className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Submissions</p>
               <h3 className="text-3xl font-black text-foreground mt-1">{stats?.totalSubmissions || 0}</h3>
             </div>
           </div>

           {/* Active Questions Card */}
           <div className="bg-card p-6 rounded-3xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex items-center gap-5">
             <div className="w-14 h-14 bg-purple-500/10 text-purple-500 outline outline-1 outline-purple-500/20 rounded-2xl flex items-center justify-center">
               <CheckCircle className="w-6 h-6" />
             </div>
             <div>
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Topics</p>
               <h3 className="text-3xl font-black text-foreground mt-1">{stats?.totalQuestions || 0}</h3>
             </div>
           </div>
         </div>
      </main>
    </div>
  );
}
