'use client';

// Side-effect: initializes i18next with default 'vi' language (SSR-safe)
import '@/i18n/config';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';
import { STORAGE_KEY } from '@/i18n/config';
import React, { useEffect } from 'react';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // After mount on the client, sync to the user's saved language preference.
  // This runs AFTER hydration so it never causes a mismatch.
  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
