import React from 'react';
import { ImageUploader } from './ImageUploader';
import { useTranslation } from '../hooks/useTranslation';

interface LandingPageProps {
  onImageUpload: (file: File) => void;
  isProcessing: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageUpload, isProcessing }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 pb-12">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-12 md:py-20 w-full animate-fade-in">
        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-6 drop-shadow-sm">
          {t('landing.title')}
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          {t('landing.subtitle')}
        </p>

        <div className="mt-10 w-full max-w-3xl transform transition-all duration-300 hover:scale-[1.01]">
          <ImageUploader onImageUpload={onImageUpload} isProcessing={isProcessing} />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full py-16 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t('landing.howItWorks.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-transform hover:-translate-y-1">
              <div className="w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4 text-blue-600 dark:text-blue-400 font-bold text-xl">
                {step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {t(`landing.howItWorks.step${step}.title`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(`landing.howItWorks.step${step}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t('landing.features.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Auto-Correct */}
          <div className="p-8 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-sm border border-indigo-100 dark:border-gray-700">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('landing.features.autoCorrect.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.features.autoCorrect.desc')}
            </p>
          </div>

          {/* Feature 2: Privacy */}
          <div className="p-8 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-sm border border-green-100 dark:border-gray-700">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('landing.features.privacy.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.features.privacy.desc')}
            </p>
          </div>

          {/* Feature 3: Manual Tools */}
          <div className="p-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-sm border border-purple-100 dark:border-gray-700">
            <div className="text-purple-600 dark:text-purple-400 mb-4">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{t('landing.features.manual.title')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('landing.features.manual.desc')}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="w-full py-16 max-w-3xl border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
          {t('landing.faq.title')}
        </h2>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="bg-white dark:bg-gray-800/50 rounded-lg p-6 shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                {t(`landing.faq.q${q}`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(`landing.faq.a${q}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;