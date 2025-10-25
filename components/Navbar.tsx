import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { useApiDocs } from '../context/ApiDocsContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MenuIcon } from './icons';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, openLoginDialog, logout } = useAuth();
  const { openPricingDialog } = usePricing();
  const { openApiDocsDialog } = useApiDocs();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">PixelPerfect AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={openPricingDialog} variant="secondary" className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hidden sm:inline-flex">{t('navbar.pricing')}</Button>
            {user && (
              <Button onClick={openApiDocsDialog} variant="secondary" className="bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 hidden sm:inline-flex">{t('navbar.api')}</Button>
            )}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 dark:text-gray-300 hidden sm:block">{t('navbar.welcome')}{user.email}</span>
                <Button onClick={logout} variant="secondary">{t('navbar.logout')}</Button>
              </div>
            ) : (
               <Button onClick={openLoginDialog} variant="primary">{t('navbar.login')}</Button>
            )}
            <LanguageSwitcher />
            <ThemeSwitcher />

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
                aria-haspopup="true"
                aria-expanded={isMenuOpen}
                aria-label="Open main menu"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              
              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.terms')}</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.privacy')}</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.contact')}</a>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
