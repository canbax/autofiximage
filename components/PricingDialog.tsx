import React, { useState } from 'react';
import { usePricing } from '../context/PricingContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './Button';
import Spinner from './Spinner';

const CheckmarkIcon: React.FC = () => (
  <svg className="w-5 h-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

type PaymentState = 'idle' | 'processing' | 'success';

export const PricingDialog: React.FC = () => {
  const { isPricingOpen, closePricingDialog } = usePricing();
  const { user, updateUserPlan, openLoginDialog } = useAuth();
  const { t } = useTranslation();
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');

  if (!isPricingOpen) {
    return null;
  }

  const handleUpgradeClick = () => {
    if (!user) {
      // Prompt user to log in first if they are not authenticated
      closePricingDialog();
      openLoginDialog();
      return;
    }

    setPaymentState('processing');
    setTimeout(() => {
      setPaymentState('success');
      updateUserPlan('pro');
      setTimeout(() => {
        closePricingDialog();
        setPaymentState('idle'); // Reset for next time
      }, 2500);
    }, 2000);
  };

  const renderContent = () => {
    switch (paymentState) {
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 h-64">
            <Spinner />
            <p className="text-lg text-gray-300">{t('pricing.processing')}</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 h-64 text-center">
             <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckmarkIcon />
            </div>
            <h3 className="text-xl font-bold text-white">{t('pricing.successTitle')}</h3>
            <p className="text-gray-400">{t('pricing.successMessage')}</p>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Free Plan */}
            <div className="border border-gray-700 rounded-lg p-6 flex flex-col">
              <h3 className="text-xl font-semibold text-white">{t('pricing.freePlan.title')}</h3>
              <p className="mt-2 text-gray-400">{t('pricing.freePlan.description')}</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400"> / {t('pricing.month')}</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.freePlan.feature1')}</span></li>
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.freePlan.feature2')}</span></li>
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.freePlan.feature3')}</span></li>
              </ul>
              <div className="mt-auto pt-6">
                <Button className="w-full" variant="secondary" disabled={user?.plan === 'free'}>
                    {t('pricing.currentPlan')}
                </Button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="relative border-2 border-indigo-500 rounded-lg p-6 flex flex-col">
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold tracking-wider text-white uppercase bg-indigo-600 rounded-full">
                      {t('pricing.popular')}
                  </span>
              </div>
              <h3 className="text-xl font-semibold text-white">{t('pricing.proPlan.title')}</h3>
              <p className="mt-2 text-gray-400">{t('pricing.proPlan.description')}</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-white">$9.99</span>
                <span className="text-gray-400"> / {t('pricing.month')}</span>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.proPlan.feature1')}</span></li>
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.proPlan.feature2')}</span></li>
                <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.proPlan.feature3')}</span></li>
                 <li className="flex items-center gap-3"><CheckmarkIcon /><span>{t('pricing.proPlan.feature4')}</span></li>
              </ul>
              <div className="mt-auto pt-6">
                 <Button onClick={handleUpgradeClick} className="w-full" variant="primary" disabled={user?.plan === 'pro'}>
                    {user?.plan === 'pro' ? t('pricing.currentPlan') : t('pricing.upgrade')}
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 z-40 flex items-center justify-center animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-3xl m-4 relative border border-gray-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pricing-dialog-title"
      >
        <button onClick={() => { closePricingDialog(); setPaymentState('idle'); }} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors z-10" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-center">
            <h2 id="pricing-dialog-title" className="text-2xl font-bold text-white">{t('pricing.title')}</h2>
            <p className="mt-2 text-gray-400">{t('pricing.subtitle')}</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};
