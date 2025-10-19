import React, { useState, useCallback } from 'react';
import { useApiDocs } from '../context/ApiDocsContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './Button';
import { getAutoCorrection } from '../services/geminiService';
import { fileToBase64 } from '../lib/utils';
import { applyCorrection } from '../lib/imageUtils';
import Spinner from './Spinner';

const CopyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

type ApiTestState = 'idle' | 'loading' | 'success' | 'error';

export const ApiDocsDialog: React.FC = () => {
    const { isApiDocsOpen, closeApiDocsDialog } = useApiDocs();
    const { user, regenerateApiKey, consumeApiCredit } = useAuth();
    const { t } = useTranslation();
    const [isCopied, setIsCopied] = useState(false);
    const [testState, setTestState] = useState<ApiTestState>('idle');
    const [testError, setTestError] = useState('');
    const [resultImage, setResultImage] = useState<string | null>(null);

    if (!isApiDocsOpen || !user) {
        return null;
    }

    const PLAN_LIMITS = { free: 5, pro: Infinity };
    const usagePercentage = user.plan === 'pro' ? 0 : (user.apiUsage / PLAN_LIMITS.free) * 100;
    const usageText = user.plan === 'pro' ? t('apiDocs.usage.unlimited') : `${user.apiUsage} / ${PLAN_LIMITS.free}`;
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(user.apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRegenerateKey = () => {
        if (window.confirm(t('apiDocs.regenerateConfirm'))) {
            regenerateApiKey();
        }
    };
    
    const handleApiTest = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setTestState('loading');
        setTestError('');
        setResultImage(null);

        if (!consumeApiCredit()) {
            setTestError(t('apiDocs.error.limitReached'));
            setTestState('error');
            return;
        }

        try {
            const base64Data = await fileToBase64(file);
            const correction = await getAutoCorrection(base64Data, file.type);
            
            const image = new Image();
            const imageUrl = URL.createObjectURL(file);
            image.src = imageUrl;
            await new Promise((resolve, reject) => {
                image.onload = resolve;
                image.onerror = reject;
            });

            const correctedBlob = await applyCorrection(image, correction.rotation, correction.crop, file.type);
            URL.revokeObjectURL(imageUrl);
            
            setResultImage(URL.createObjectURL(correctedBlob));
            setTestState('success');

        } catch (error) {
            setTestError(error instanceof Error ? error.message : t('apiDocs.error.unknown'));
            setTestState('error');
        }
    };

    const codeSnippet = `curl -X POST \\
  'https://api.pixelperfect.ai/v1/autocorrect' \\
  -H 'Authorization: Bearer ${user.apiKey}' \\
  -F 'image=@/path/to/your/image.jpg'`;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-40 flex items-center justify-center animate-fade-in" style={{ animationDuration: '0.2s' }}>
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl m-4 relative border border-gray-700 h-[90vh] flex flex-col" role="dialog" aria-labelledby="api-dialog-title">
                <button onClick={closeApiDocsDialog} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center border-b border-gray-700 pb-4">
                    <h2 id="api-dialog-title" className="text-2xl font-bold text-white">{t('apiDocs.title')}</h2>
                    <p className="mt-2 text-gray-400">{t('apiDocs.subtitle')}</p>
                </div>

                <div className="flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                    {/* Left Column: Docs & Code */}
                    <div className="prose prose-invert prose-sm max-w-none">
                        <h3 className="text-lg font-semibold text-white">{t('apiDocs.authHeader')}</h3>
                        <p>{t('apiDocs.authText')}</p>

                        <h3 className="text-lg font-semibold text-white mt-6">{t('apiDocs.endpointHeader')}</h3>
                        <p>{t('apiDocs.endpointText')}</p>
                        <pre className="bg-gray-900/80 p-3 rounded-md text-xs whitespace-pre-wrap"><code>POST /v1/autocorrect</code></pre>
                        
                        <h3 className="text-lg font-semibold text-white mt-6">{t('apiDocs.exampleHeader')}</h3>
                        <p>{t('apiDocs.exampleText')}</p>
                        <div className="relative">
                           <pre className="bg-gray-900/80 p-3 rounded-md text-xs whitespace-pre-wrap"><code className="language-bash">{codeSnippet}</code></pre>
                        </div>
                    </div>

                    {/* Right Column: Key, Usage, Test */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{t('apiDocs.keyHeader')}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="text" readOnly value={user.apiKey} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm text-gray-400 font-mono" />
                                <Button onClick={handleCopyToClipboard} variant="secondary" className="flex-shrink-0">
                                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                                </Button>
                            </div>
                            <Button onClick={handleRegenerateKey} variant="danger" className="text-xs mt-2">{t('apiDocs.regenerate')}</Button>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white">{t('apiDocs.usage.title')}</h3>
                            <div className="mt-2 bg-gray-900 p-3 rounded-md">
                                <div className="flex justify-between items-center text-sm font-medium text-gray-300">
                                    <span>{t(`pricing.${user.plan}Plan.title`)} Plan</span>
                                    <span>{usageText}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{t('apiDocs.usage.resetInfo')}</p>
                            </div>
                        </div>

                        <div>
                             <h3 className="text-lg font-semibold text-white">{t('apiDocs.tryIt.title')}</h3>
                             <p className="text-xs text-gray-400 mt-1 mb-3">{t('apiDocs.tryIt.subtitle')}</p>
                             <div className="bg-gray-900 p-4 rounded-lg text-center">
                                {testState === 'idle' && (
                                    <label className="cursor-pointer">
                                        <div className="p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-indigo-500 transition-colors">
                                           <p className="text-sm font-semibold">{t('apiDocs.tryIt.upload')}</p>
                                        </div>
                                        <input type="file" className="sr-only" accept="image/*" onChange={handleApiTest} />
                                    </label>
                                )}
                                {testState === 'loading' && <Spinner />}
                                {testState === 'error' && <p className="text-red-400">{testError}</p>}
                                {testState === 'success' && resultImage && (
                                    <div>
                                        <img src={resultImage} alt="API result" className="max-w-full max-h-48 mx-auto rounded-md" />
                                        <Button onClick={() => setTestState('idle')} className="mt-4" variant="secondary">{t('apiDocs.tryIt.another')}</Button>
                                    </div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
