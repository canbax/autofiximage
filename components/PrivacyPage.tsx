import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('navbar.privacy')}</h1>
      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md">
        <h2>{t('privacy.info.title')}</h2>
        <p>{t('privacy.info.p1')}</p>
        <p>{t('privacy.info.p2')}</p>
        <p>{t('privacy.info.p3')}</p>

        <h2>{t('privacy.usage.title')}</h2>
        <p>{t('privacy.usage.p1')}</p>
        <ul>
            <li>{t('privacy.usage.l1')}</li>
            <li>{t('privacy.usage.l2')}</li>
            <li>{t('privacy.usage.l3')}</li>
            <li>{t('privacy.usage.l4')}</li>
            <li>{t('privacy.usage.l5')}</li>
            <li>{t('privacy.usage.l6')}</li>
            <li>{t('privacy.usage.l7')}</li>
        </ul>
        
        <h2>{t('privacy.logs.title')}</h2>
        <p>{t('privacy.logs.p1')}</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
