import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGES } from '../lib/i18n';
import { GlobeIcon } from './icons';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languageNames: { [key: string]: string } = {
    en: 'English',
    es: 'Español',
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <GlobeIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {LANGUAGES.map((lang) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
