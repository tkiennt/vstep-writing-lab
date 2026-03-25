'use client';

import React from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-500" />
          System Settings
        </h1>
        <Button size="sm" className="rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700">
           <Save className="w-3.5 h-3.5 mr-2" /> Save Configuration
        </Button>
      </header>

      <main className="p-8 flex flex-col items-center justify-center h-[calc(100vh-128px)] text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6">
           <Settings className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Control Center</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 text-sm">
          System-wide rules, grading parameters, and integration keys will be manageable here in the next update.
        </p>
      </main>
    </div>
  );
}
