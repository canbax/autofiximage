import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 animate-fade-in" style={{ animationDuration: '0.2s' }}>
      <div
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 relative border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-800 dark:text-gray-500 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {title && <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 pr-6">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
};
