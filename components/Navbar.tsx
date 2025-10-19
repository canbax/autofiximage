import React from 'react';
import { Button } from './Button';
import { Logo } from './Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { useApiDocs } from '../context/ApiDocsContext';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, openLoginDialog, logout } = useAuth();
  const { openPricingDialog } = usePricing();
  const { openApiDocsDialog } = useApiDocs();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl text-white">PixelPerfect AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={openPricingDialog} variant="secondary" className="bg-transparent hover:bg-gray-700 hidden sm:inline-flex">{t('navbar.pricing')}</Button>
            {user && (
              <Button onClick={openApiDocsDialog} variant="secondary" className="bg-transparent hover:bg-gray-700 hidden sm:inline-flex">{t('navbar.api')}</Button>
            )}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300 hidden sm:block">{t('navbar.welcome')}{user.email}</span>
                <Button onClick={logout} variant="secondary">{t('navbar.logout')}</Button>
              </div>
            ) : (
               <Button onClick={openLoginDialog} variant="primary">{t('navbar.login')}</Button>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
