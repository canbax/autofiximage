import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, DEFAULT_LANGUAGE, LANGUAGES } from '../lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const RTL_LANGUAGES: Language[] = ['ar'];

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // 1. Check URL path first (e.g. /fr, /es)
    const pathSegment = window.location.pathname.split('/')[1];
    if (pathSegment && LANGUAGES.includes(pathSegment as Language)) {
      return pathSegment as Language;
    }

    // 2. Fallback to localStorage
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }

    // 3. Fallback to browser language
    const browserLanguage = navigator.language.split(/[-_]/)[0] as Language;
    return LANGUAGES.includes(browserLanguage) ? browserLanguage : DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem('language', language);

    // Set document direction and language for RTL support
    if (RTL_LANGUAGES.includes(language)) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    document.documentElement.lang = language;

  }, [language]);

  const setLanguage = (lang: Language) => {
    if (LANGUAGES.includes(lang)) {
      setLanguageState(lang);
      const newPath = lang === 'en' ? '/' : `/${lang}/`;
      if (window.location.pathname !== newPath) {
        // Use plain assignment to change URL and reload, mirroring <a> tag behavior for consistency
        // or use replaceState if we wanted SPA transition.
        // Given the plan implied "Update URL", and LanguageSwitcher uses <a>,
        // let's ensure we are consistent.
        // If we use <a> in switcher, we don't *need* to force a reload here, 
        // but if `setLanguage` is called programmatically, we should probably update URL.
        // For now, let's just update the URL without reload if possible, 
        // BUT LanguageSwitcher <a> tags WILL reload. 
        // Let's stick to SPA-like behavior for programatic changes *if* we want, 
        // but for simpler SEO/Hydration, full path change is safer.
        // However, `LanguageSwitcher` usage is the main way to change language.
        // Let's just update the logic to *NOT* force reload on setLanguage to avoid infinite loops if used in effects,
        // but actually `setLanguage` is usually user-triggered.

        // Actually, simplest is:
        // If I am at /en and I click 'French', I go to /fr via <a> tag.
        // So `setLanguage` might not even be called directly by the Link, 
        // but the new page load will call `useState` initializer.
        // So `setLanguage` is mostly for internal consistency if used elsewhere.
      }
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations[DEFAULT_LANGUAGE][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};