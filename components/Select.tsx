import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface SelectProps {
  options: { value: string; label: string }[];
  value: string;
  // Simulating the event object for compatibility with existing handlers.
  onChange: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, disabled = false, searchPlaceholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const selectedOption = options.find(option => option.value === value) || options[0];

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
      setSearchTerm('');
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    if (disabled) return;
    onChange({ target: { value: selectedValue } });
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-left text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 flex justify-between items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span>{selectedOption.label}</span>
        <svg className="w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 flex flex-col">
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              ref={searchInputRef}
              type="text"
              placeholder={searchPlaceholder || t('languageSwitcher.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="py-1 max-h-60 overflow-y-auto" role="listbox" aria-orientation="vertical">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <a
                  key={option.value}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelect(option.value);
                  }}
                  className={`block px-4 py-2 text-sm ${value === option.value ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  role="option"
                  aria-selected={value === option.value}
                >
                  {option.label}
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