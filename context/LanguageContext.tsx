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
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }
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