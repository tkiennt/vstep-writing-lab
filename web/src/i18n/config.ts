import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import vi from './locales/vi.json';

const STORAGE_KEY = 'vstep_language';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export { STORAGE_KEY };
export default i18n;
