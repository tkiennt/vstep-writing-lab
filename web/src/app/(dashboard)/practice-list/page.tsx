'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, Search, ArrowRight, Trophy, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGlobal } from '@/components/GlobalProvider';
import { questionService } from '@/services/questionService';
import { ExamPrompt } from '@/types';
import { useTranslation } from 'react-i18next';

export default function ExamList() {
  const [prompts, setPrompts] = useState<ExamPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useGlobal();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await questionService.getExamPrompts();
        setPrompts(data);
      } catch (err) {
        addToast('error', t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchPrompts();
  }, [addToast, t]);

  const TABS = [
    { key: 'all', label: t('practiceList.tabs.all') },
    { key: 'task1', label: t('practiceList.tabs.task1') },
    { key: 'task2', label: t('practiceList.tabs.task2') },
  ];

  const filteredPrompts = prompts.filter(p => {
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'task1' && p.taskType.toLowerCase() === 'task1') ||
                       (activeTab === 'task2' && p.taskType.toLowerCase() === 'task2');
    const matchesSearch = p.instruction.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.topicCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.topicKeyword.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const groupedByLevel = {
    'B1': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'B1'),
    'B2': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'B2'),
    'C1': filteredPrompts.filter(p => p.cefrLevel.toUpperCase() === 'C1'),
  };

  const LevelSection = ({ level, items }: { level: string; items: ExamPrompt[] }) => (
    items.length > 0 ? (
      <div className="space-y-4 mb-10">
        <div className="flex items-center gap-4 mb-3">
          <h2 className={`text-sm font-black px-3 py-1 rounded-lg border ${
            level === 'C1' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
            level === 'B2' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 
            'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
          }`}>VSTEP {level}</h2>
          <div className="h-px flex-1 bg-slate-700/60"></div>
        </div>

        <div className="grid gap-4">
          {items.map((p) => (
            <div key={p.id} className="group flex flex-col md:flex-row gap-6 p-6 rounded-2xl border border-slate-700/50 bg-slate-800 hover:border-emerald-500/30 hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                    p.taskType.toLowerCase() === 'task1' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-fuchsia-500/15 text-fuchsia-400'
                  }`}>
                    {p.taskType === 'task1' ? t('practiceList.card.vstepTask1') : t('practiceList.card.vstepTask2')}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-600 text-white">
                    <Sparkles className="w-3 h-3 inline mr-1 mb-0.5" />{p.topicCategory}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-700 px-2.5 py-1 rounded-md inline-flex items-center border border-slate-600">
                    <Target className="w-3.5 h-3.5 mr-1" /> {p.essayType || t('practiceList.card.standard')}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-100 mb-2 leading-tight group-hover:text-emerald-400 transition-colors">
                  {p.topicKeyword || 'General Topic'}
                </h3>
                <p className="text-slate-400 line-clamp-2 text-sm leading-relaxed mb-4">{p.instruction}</p>
                
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    {p.taskType === 'task1' ? t('practiceList.card.minutes20') : t('practiceList.card.minutes40')}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    {t('practiceList.card.difficulty')}: {p.difficulty}/3
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end md:w-48 border-t md:border-t-0 md:border-l border-slate-700/50 pt-5 md:pt-0 md:pl-6">
                <Link href={`/practice/${p.id}`} className="w-full">
                  <Button className="w-full bg-vstep-dark hover:bg-emerald-950 text-white rounded-xl h-14 font-black text-base flex items-center justify-center gap-3 transition-all active:scale-95">
                    {t('practiceList.card.startExam')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-500/8 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="min-h-full bg-slate-950">
      <div className="space-y-5 max-w-6xl mx-auto pb-16 px-6 sm:px-8 pt-5">

        {/* Hero */}
        <div className="relative bg-slate-800 p-8 md:p-10 rounded-2xl border border-slate-700/50 overflow-hidden group">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest mb-5 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" /> {t('practiceList.hero.badge')}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight mb-3">
              {t('practiceList.hero.title')} <span className="text-emerald-400">{t('practiceList.hero.titleHighlight')}</span>
            </h1>
            <p className="text-slate-400 text-base font-medium leading-relaxed">
              {t('practiceList.hero.subtitle')}
            </p>
          </div>
          <div className="absolute top-1/2 right-10 -translate-y-1/2 hidden lg:block opacity-5 group-hover:opacity-10 transition-opacity">
            <Trophy className="w-40 h-40 text-emerald-400" />
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/8 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        </div>

        {/* Control Panel */}
        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-slate-800 p-3 rounded-2xl border border-slate-700/50 sticky top-4 z-30">
          <div className="flex bg-slate-900 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => (
              <button 
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-2 text-sm font-black rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-slate-700 text-emerald-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0 flex-1 xl:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={t('practiceList.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-2.5 bg-slate-700 border border-slate-600 rounded-xl text-sm font-medium text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-800 rounded-2xl border border-slate-700/50">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <p className="text-slate-500 font-black mt-6 text-sm uppercase tracking-widest animate-pulse">{t('practiceList.loading')}</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="text-center py-24 bg-slate-800 rounded-2xl border border-slate-700/50">
            <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-600">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-black text-slate-100 mb-2">{t('practiceList.empty.title')}</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mb-6">{t('practiceList.empty.subtitle')}</p>
            <Button className="rounded-xl px-8 font-black bg-emerald-600 hover:bg-emerald-700" onClick={() => { setActiveTab('all'); setSearchTerm(''); }}>
              {t('practiceList.empty.reset')}
            </Button>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LevelSection level="C1" items={groupedByLevel['C1']} />
            <LevelSection level="B2" items={groupedByLevel['B2']} />
            <LevelSection level="B1" items={groupedByLevel['B1']} />
          </div>
        )}
      </div>
    </div>
  );
}
