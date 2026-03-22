import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSemanticTheme, type SemanticTheme } from '../theme/semanticTheme';
import {
  type AppLanguage,
  type TranslationDict,
  interpolate,
  translations,
} from '../i18n/translations';

const STORAGE_THEME = '@vstep_theme_mode';
const STORAGE_LANG = '@vstep_language';

export type ThemeMode = 'light' | 'dark';

type Ctx = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  theme: SemanticTheme;
  t: (key: keyof TranslationDict, vars?: Record<string, string | number | undefined>) => string;
};

const AppSettingsContext = createContext<Ctx | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('vi');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [langRaw, themeRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_LANG),
          AsyncStorage.getItem(STORAGE_THEME),
        ]);
        if (cancelled) return;
        if (langRaw === 'vi' || langRaw === 'en') setLanguageState(langRaw);
        if (themeRaw === 'light' || themeRaw === 'dark') setThemeModeState(themeRaw);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(STORAGE_LANG, lang);
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    void AsyncStorage.setItem(STORAGE_THEME, mode);
  }, []);

  const effectiveDark = themeMode === 'dark';
  const theme = useMemo(() => getSemanticTheme(effectiveDark), [effectiveDark]);

  const t = useCallback(
    (key: keyof TranslationDict, vars?: Record<string, string | number | undefined>) => {
      const dict = translations[language];
      const raw = dict[key] ?? translations.en[key] ?? String(key);
      return vars ? interpolate(raw, vars) : raw;
    },
    [language]
  );

  const value = useMemo<Ctx>(
    () => ({
      language,
      setLanguage,
      themeMode,
      setThemeMode,
      isDark: effectiveDark,
      theme,
      t,
    }),
    [language, setLanguage, themeMode, setThemeMode, effectiveDark, theme, t]
  );

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings(): Ctx {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider');
  return ctx;
}
