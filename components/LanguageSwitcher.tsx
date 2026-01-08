

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGES } from '../lib/i18n';
import { GlobeIcon } from './icons';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const languageNames: { [key: string]: string } = {
    en: 'English',
    es: 'Español',
    tr: 'Türkçe',
    ar: 'العربية',
    fr: 'Français',
    de: 'Deutsch',
    pt: 'Português',
    ru: 'Русский',
    ja: '日本語',
    zh: '中文',
    it: 'Italiano',
    cs: 'Čeština',
  };

  const languageFlags: { [key: string]: string } = {
    en: '🇬🇧',
    es: '🇪🇸',
    tr: '🇹🇷',
    ar: '🇸🇦',
    fr: '🇫🇷',
    de: '🇩🇪',
    pt: '🇵🇹',
    ru: '🇷🇺',
    ja: '🇯🇵',
    zh: '🇨🇳',
    it: '🇮🇹',
    cs: '🇨🇿',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset search term and focus input when dropdown opens
      setSearchTerm('');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredLanguages = LANGUAGES.filter(lang =>
    languageNames[lang].toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <GlobeIcon className="h-5 w-5" />
        <span className="text-sm font-semibold">{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 rtl:origin-top-left rtl:left-0 rtl:right-auto flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('languageSwitcher.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <a
                  key={lang}
                  href={lang === 'en' ? '/' : `/${lang}/`}
                  onClick={(e) => {
                    // Allow default navigation for SEO/Refresh preference
                    // Or prevent default and use history API if we want SPA feel.
                    // Plan said: "Update language switcher to use links"
                    // Standard SEO usually prefers real links.
                    // Let's let it navigate.
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm ${language === lang ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg" aria-hidden="true">{languageFlags[lang]}</span>
                    <span>{languageNames[lang]}</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 text-center">{t('languageSwitcher.noResults')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};