'use client';

import { useTranslation } from 'react-i18next';
import i18n, { STORAGE_KEY } from '@/i18n/config';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n: i18nHook } = useTranslation();
  const currentLang = i18nHook.language;

  const toggle = () => {
    const next = currentLang === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted border border-border hover:bg-accent hover:border-foreground/10 transition-all text-xs font-bold text-muted-foreground hover:text-foreground select-none"
      title="Switch language"
      aria-label="Toggle language"
    >
      <Globe className="w-3.5 h-3.5 shrink-0" />
      <span className="tracking-wider uppercase">{currentLang === 'vi' ? 'VI' : 'EN'}</span>
      <span className="text-muted-foreground/50 hidden sm:inline">|</span>
      <span className="text-muted-foreground/50 hidden sm:inline">{currentLang === 'vi' ? 'EN' : 'VI'}</span>
    </button>
  );
}
