import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TermsPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-center">{t('navbar.terms')}</h1>
      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md">
        <h2>{t('terms.intro.title')}</h2>
        <p>{t('terms.intro.p1')}</p>
        <p>{t('terms.intro.p2')}</p>

        <h2>{t('terms.cookies.title')}</h2>
        <p>{t('terms.cookies.p1')}</p>

        <h2>{t('terms.license.title')}</h2>
        <p>{t('terms.license.p1')}</p>
        <p>{t('terms.license.p2')}</p>
        <ul>
          <li>{t('terms.license.l1')}</li>
          <li>{t('terms.license.l2')}</li>
          <li>{t('terms.license.l3')}</li>
          <li>{t('terms.license.l4')}</li>
        </ul>

        <h2>{t('terms.disclaimer.title')}</h2>
        <p>{t('terms.disclaimer.p1')}</p>
        <ul>
          <li>{t('terms.disclaimer.l1')}</li>
          <li>{t('terms.disclaimer.l2')}</li>
          <li>{t('terms.disclaimer.l3')}</li>
          <li>{t('terms.disclaimer.l4')}</li>
        </ul>
        <p>{t('terms.disclaimer.p2')}</p>
        <p>{t('terms.disclaimer.p3')}</p>
      </div>
    </div>
  );
};

export default TermsPage;
