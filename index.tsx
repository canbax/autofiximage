import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PricingProvider } from './context/PricingContext';
import { ThemeProvider } from './context/ThemeContext';

import { DialogProvider } from './context/DialogContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <PricingProvider>
            <DialogProvider>
              <App />
            </DialogProvider>
          </PricingProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);