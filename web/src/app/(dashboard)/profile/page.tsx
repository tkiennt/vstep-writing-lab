'use client';

import React from 'react';
import { User, Mail, Lock, Target, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function ProfileSettings() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-8 pb-12 px-6 sm:px-8 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t('profile.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('profile.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Nav Sidebar */}
          <div className="lg:col-span-1 border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800 overflow-hidden h-max shadow-sm">
            <nav className="flex flex-col">
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 text-left">
                <User className="w-5 h-5" /> {t('profile.nav.personalInfo')}
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 border-l-4 border-transparent transition-colors text-left border-t border-slate-100 dark:border-slate-700/40">
                <Target className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('profile.nav.learningGoals')}
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 border-l-4 border-transparent transition-colors text-left border-t border-slate-100 dark:border-slate-700/40">
                <Lock className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('profile.nav.security')}
              </button>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40 border-l-4 border-transparent transition-colors text-left border-t border-slate-100 dark:border-slate-700/40">
                <Bell className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('profile.nav.notifications')}
              </button>
            </nav>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Personal Info */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('profile.personal.title')}
              </h2>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 bg-emerald-600 dark:bg-vstep-dark text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-inner">N</div>
                <div>
                  <Button variant="outline" className="rounded-xl h-9 text-xs font-semibold mr-3">
                    {t('profile.personal.changeAvatar')}
                  </Button>
                  <Button variant="ghost" className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl h-9 text-xs font-semibold">
                    {t('profile.personal.remove')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('profile.personal.firstName')}</label>
                  <input type="text" defaultValue="Nguyen" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('profile.personal.lastName')}</label>
                  <input type="text" defaultValue="Van A" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('profile.personal.emailAddress')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input type="email" defaultValue="student@vnu.edu.vn" disabled className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('profile.personal.emailNote')}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-vstep-dark dark:hover:bg-emerald-900 text-white rounded-xl font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4" /> {t('profile.personal.saveChanges')}
                </Button>
              </div>
            </div>

            {/* Target Band Score */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-400 dark:text-slate-500" /> {t('profile.goals.title')}
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-3">{t('profile.goals.question')}</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { level: 'B1', subLabel: t('profile.goals.intermediate') },
                      { level: 'B2', subLabel: t('profile.goals.upperInter') },
                      { level: 'C1', subLabel: t('profile.goals.advanced') },
                    ].map(({ level, subLabel }) => (
                      <label key={level} className="cursor-pointer">
                        <input type="radio" name="level" className="peer sr-only" defaultChecked={level === 'B2'} />
                        <div className="rounded-xl border-2 border-slate-200 dark:border-slate-600 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-500/10 transition-all text-center">
                          <span className="block font-bold text-slate-700 dark:text-slate-200 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400">{level}</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">{subLabel}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700 dark:bg-vstep-dark dark:hover:bg-emerald-900 text-white rounded-xl font-semibold flex items-center gap-2">
                  <Save className="w-4 h-4" /> {t('profile.goals.saveGoals')}
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" /> {t('profile.danger.title')}
              </h2>
              <p className="text-sm text-red-500/70 dark:text-red-400/70 mb-6">{t('profile.danger.subtitle')}</p>
              <Button variant="outline" className="border-red-300 dark:border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-300 rounded-xl font-semibold">
                {t('profile.danger.deleteBtn')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
