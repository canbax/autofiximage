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
    <div className="flex flex-col items-center justify-center text-center p-4 h-full w-full">
      <div
        className="animate-fade-in"
        style={{ animationDelay: '100ms', animationFillMode: 'backwards' }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {t('landing.title')}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400">
          {t('landing.subtitle')}
        </p>
      </div>
      <div
        className="mt-10 w-full animate-fade-in"
        style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}
      >
        <ImageUploader onImageUpload={onImageUpload} isProcessing={isProcessing} />
      </div>
    </div>
  );
};

export default LandingPage;