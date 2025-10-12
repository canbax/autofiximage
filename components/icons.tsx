import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const RotateIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M16.56,5.44L15.11,6.89C16.84,8.62 18,10.75 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13C6,11.54 6.58,10.23 7.5,9.2L6.08,7.78C4.71,9.15 4,10.96 4,13A8,8 0 0,0 12,21A8,8 0 0,0 20,13C20,10.04 18.67,7.44 16.56,5.44M18.5,4L22.5,8L18.5,12L17.5,11L20,8.5L14,8.5L14,7.5L20,7.5L17.5,5L18.5,4Z" />
    </svg>
);


export const CropIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7,17V1H5V5H1V7H5V19H19V21H21V19H23V17H7M17,15H19V7C19,5.89 18.1,5 17,5H9V7H17V15Z" />
    </svg>
);

export const WandIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104l-1.385 2.771A1.125 1.125 0 016.99 6.99l-2.77 1.385a1.125 1.125 0 01-1.115-1.115l1.386-2.771a1.125 1.125 0 011.115-1.115l2.77-1.385a1.125 1.125 0 011.375 1.375zM19.125 9.75l-2.77 1.385a1.125 1.125 0 01-1.115-1.115l1.385-2.77a1.125 1.125 0 011.115-1.115l2.77-1.385a1.125 1.125 0 011.375 1.375L21.375 9.75a1.125 1.125 0 01-1.115 1.115L19.125 9.75zM14.25 19.125l-1.385-2.77a1.125 1.125 0 00-1.115-1.115l-2.77-1.385a1.125 1.125 0 00-1.375 1.375l1.385 2.77a1.125 1.125 0 001.115 1.115l2.77 1.385a1.125 1.125 0 001.375-1.375z" />
  </svg>
);

export const ResetIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6 6m0-6l6 6M9 9V5a3 3 0 013-3h.01M9 9h4.01M9 9l-6 6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);