import React, { createContext, useState, useContext, ReactNode } from 'react';

interface PricingContextType {
  isPricingOpen: boolean;
  openPricingDialog: () => void;
  closePricingDialog: () => void;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const openPricingDialog = () => setIsPricingOpen(true);
  const closePricingDialog = () => setIsPricingOpen(false);

  const value = { isPricingOpen, openPricingDialog, closePricingDialog };

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = (): PricingContextType => {
  const context = useContext(PricingContext);
  if (context === undefined) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
};
