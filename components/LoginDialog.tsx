import React, { useState, useEffect } from 'react';
import { useAuth, getLoginToken } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './Button';
import Spinner from './Spinner';

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export const LoginDialog: React.FC = () => {
  const { loginState, loginError, countdown, loginEmail, closeLoginDialog, sendLoginLink, confirmLogin } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    // Reset local state when dialog is opened or closed
    if (loginState === 'prompting' || loginState === 'idle') {
      setEmail('');
      setLocalError('');
    }
  }, [loginState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('loginDialog.error.invalidEmail');
      return;
    }
    setLocalError('');
    sendLoginLink(email);
  };

  if (loginState === 'idle') {
    return null;
  }

  const renderContent = () => {
    switch (loginState) {
      case 'prompting':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('loginDialog.emailLabel')}</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm text-gray-900 dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>
            {localError && <p className="text-sm text-red-500 dark:text-red-400">{t(localError)}</p>}
            <Button type="submit" className="w-full" variant="primary">
              {t('loginDialog.sendLink')}
            </Button>
          </form>
        );
      case 'sending':
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Spinner />
            <p>{t('loginDialog.sending')}</p>
          </div>
        );
      case 'waiting':
        const loginToken = getLoginToken();
        return (
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('loginDialog.checkEmail')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('loginDialog.waitingText')
                .replace('{email}', loginEmail)
                .replace('{countdown}', formatCountdown(countdown))}
            </p>
            <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg">
              <a 
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    confirmLogin(loginToken);
                }}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold break-all"
                >
                {t('loginDialog.clickHere')}
              </a>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="text-center space-y-4">
            <p className="text-red-500 dark:text-red-400">{loginError ? t(loginError) : 'An unknown error occurred.'}</p>
            <Button onClick={() => sendLoginLink(loginEmail)} variant="primary">
              Try Again
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 z-50 flex items-center justify-center animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 relative border border-gray-200 dark:border-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-dialog-title"
      >
        <button onClick={closeLoginDialog} className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-white transition-colors" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="login-dialog-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('loginDialog.title')}</h2>
        {renderContent()}
      </div>
    </div>
  );
};