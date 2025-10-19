import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ApiDocsContextType {
  isApiDocsOpen: boolean;
  openApiDocsDialog: () => void;
  closeApiDocsDialog: () => void;
}

const ApiDocsContext = createContext<ApiDocsContextType | undefined>(undefined);

export const ApiDocsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);

  const openApiDocsDialog = () => setIsApiDocsOpen(true);
  const closeApiDocsDialog = () => setIsApiDocsOpen(false);

  const value = { isApiDocsOpen, openApiDocsDialog, closeApiDocsDialog };

  return (
    <ApiDocsContext.Provider value={value}>
      {children}
    </ApiDocsContext.Provider>
  );
};

export const useApiDocs = (): ApiDocsContextType => {
  const context = useContext(ApiDocsContext);
  if (context === undefined) {
    throw new Error('useApiDocs must be used within an ApiDocsProvider');
  }
  return context;
};
