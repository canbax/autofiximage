import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

declare const __APP_VERSION__: string;
declare const __COMMIT_HASH__: string;

const AboutPage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-center">{t('about.title')}</h1>
            <div className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800/50 p-8 rounded-lg shadow-md text-lg leading-relaxed">
                <p>{t('about.story')}</p>
            </div>

            <div className="mt-8 text-center text-gray-400 text-sm font-mono">
                <p>v{__APP_VERSION__} ({__COMMIT_HASH__})</p>
            </div>
        </div>
    );
};

export default AboutPage;
