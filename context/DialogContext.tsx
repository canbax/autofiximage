import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Dialog } from '../components/Dialog';
import { Button } from '../components/Button';
import { useTranslation } from '../hooks/useTranslation';

interface DialogOptions {
    title?: string;
    message: string;
}

interface DialogContextType {
    showAlert: (message: string, title?: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<DialogOptions | null>(null);
    const [resolver, setResolver] = useState<(() => void) | null>(null);
    const { t } = useTranslation(); // Assuming translation hook is available

    const showAlert = useCallback((message: string, title?: string) => {
        setOptions({ message, title });
        setIsOpen(true);
        return new Promise<void>((resolve) => {
            setResolver(() => resolve);
        });
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (resolver) resolver();
        setResolver(null);
    };

    return (
        <DialogContext.Provider value={{ showAlert }}>
            {children}
            <Dialog isOpen={isOpen} onClose={handleClose} title={options?.title}>
                <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap">{options?.message}</p>
            </Dialog>
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('useDialog must be used within DialogProvider');
    return context;
};
