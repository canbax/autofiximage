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
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ja: '日本語',
    zh: '中文 (简体)',
    hi: 'हिन्दी',
    bn: 'বাংলা',
    id: 'Bahasa Indonesia',
    tr: 'Türkçe',
    ar: 'العربية',
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
  ).sort((a, b) => languageNames[a].localeCompare(languageNames[b]));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <GlobeIcon className="h-5 w-5" />
        <span className="text-sm font-semibold">{language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 rtl:origin-top-left rtl:left-0 rtl:right-auto flex flex-col">
          <div className="p-2 border-b border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('languageSwitcher.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <a
                  key={lang}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setLanguage(lang);
                    setIsOpen(false);
                  }}
                  className={`block px-4 py-2 text-sm ${language === lang ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  role="menuitem"
                >
                  {languageNames[lang]}
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
