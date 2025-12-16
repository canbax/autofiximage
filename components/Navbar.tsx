import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { ThemeSwitcher } from './ThemeSwitcher';
import { MenuIcon } from './icons';

interface NavbarProps {
  image: HTMLImageElement | null;
  mode: 'crop-rotate' | 'resize' | 'blur';
  setMode: (mode: 'crop-rotate' | 'resize' | 'blur') => void;
}


const Navbar: React.FC<NavbarProps> = ({ image, mode, setMode }) => {
  const { t } = useTranslation();
  const { user, openLoginDialog, logout } = useAuth();
  const { openPricingDialog } = usePricing();
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

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openPricingDialog();
    setIsMenuOpen(false);
  };

  const handleCropRotateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMode('crop-rotate');
    setIsMenuOpen(false);
  };

  const handleResizeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMode('resize');
    setIsMenuOpen(false);
  };

  const handleBlurClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMode('blur');
    setIsMenuOpen(false);
  };

  const modeKey = mode.replace(/-(\w)/g, (_, c) => c.toUpperCase());

  const getMenuItemClasses = (itemMode: 'crop-rotate' | 'resize' | 'blur') => {
    const baseClasses = 'block px-4 py-2 text-sm';
    if (mode === itemMode) {
      return `${baseClasses} bg-indigo-600 text-white`;
    }
    return `${baseClasses} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl text-gray-900 dark:text-white">AutoFix Image</span>
            {image && (
              <span className="hidden sm:block text-lg text-gray-500 dark:text-gray-400">/ {t(`app.mode.${modeKey}`)}</span>
            )}
          </a>
          <div className="flex items-center space-x-2">
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
                    {image && (
                      <>
                        <a href="#" onClick={handleCropRotateClick} className={getMenuItemClasses('crop-rotate')} role="menuitem">{t('navbar.cropRotate')}</a>
                        <a href="#" onClick={handleResizeClick} className={getMenuItemClasses('resize')} role="menuitem">{t('navbar.resize')}</a>
                        <a href="#" onClick={handleBlurClick} className={getMenuItemClasses('blur')} role="menuitem">{t('navbar.blur')}</a>
                        <div role="separator" className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      </>
                    )}
                    <a href="#" onClick={handlePricingClick} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.pricing')}</a>
                    <a href="#/terms" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.terms')}</a>
                    <a href="#/privacy" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.privacy')}</a>
                    <a href="#/contact" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{t('navbar.contact')}</a>
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
