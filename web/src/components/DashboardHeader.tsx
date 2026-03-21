'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function DashboardHeader() {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-emerald-50 dark:bg-slate-900 border-b border-emerald-200 dark:border-slate-700/50 px-6 sm:px-8 py-3 sm:py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 w-full">

        {/* Left: Text Content */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Badge */}
          <span className="hidden sm:inline-flex shrink-0 items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
            <Sparkles className="w-2.5 h-2.5" />
            {t('dashboard.header.badge')}
          </span>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-emerald-200 dark:bg-slate-700 shrink-0" />

          {/* Title + Subtitle */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
              {t('dashboard.header.title')}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-500 leading-snug mt-0.5 hidden md:block truncate">
              {t('dashboard.header.subtitle')}
            </p>
          </div>
        </div>

        {/* Right: Tiny decorative mockup */}
        <div className="hidden lg:block relative shrink-0 w-16 h-10">
          <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700/50 shadow-md overflow-hidden" style={{ transform: 'rotate(-3deg)', opacity: 0.6 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
            <div className="p-1 space-y-0.5">
              <div className="flex items-center gap-0.5 mb-0.5">
                <div className="w-1 h-1 rounded-full bg-red-400/50" />
                <div className="w-1 h-1 rounded-full bg-amber-400/50" />
                <div className="w-1 h-1 rounded-full bg-emerald-400/50" />
              </div>
              <div className="w-1/2 h-1 bg-emerald-500/20 rounded-sm" />
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600/30 rounded-sm" />
              <div className="w-4/5 h-0.5 bg-slate-300 dark:bg-slate-600/30 rounded-sm" />
            </div>
          </div>
          <div className="absolute -bottom-1.5 -left-2.5 w-5 h-9 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700/50 shadow-md overflow-hidden" style={{ opacity: 0.7 }}>
            <div className="w-3 h-px bg-slate-300 dark:bg-slate-600/40 mx-auto mt-0.5 rounded-full" />
            <div className="p-0.5 mt-0.5 space-y-0.5">
              <div className="w-full h-0.5 bg-emerald-400/30 rounded-sm" />
              <div className="w-full h-0.5 bg-slate-300 dark:bg-slate-600/30 rounded-sm" />
              <div className="w-3/4 h-0.5 bg-slate-300 dark:bg-slate-600/30 rounded-sm" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
