
import React from 'react';

export const UploadIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const RotateIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l16 16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 4h5v5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.65 8.35A9 9 0 0012 3a9 9 0 00-9 9 9 9 0 009 9 9 9 0 007.65-4.35" />
    </svg>
);


export const CropIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
