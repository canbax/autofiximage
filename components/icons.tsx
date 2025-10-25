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

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9M3 12a9 9 0 019-9m-9 9a9 9 0 009 9m-9-9h18" />
  </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const MoonIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const AspectRatioIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M4 16v4h4m12-4v4h-4" />
    </svg>
);

export const WidthIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12l4-4m-4 4l4 4m12-4l-4-4m4 4l-4 4" />
    </svg>
);

export const HeightIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0 0l-4-4m4 4l4-4m0-8l-4 4m4-4l4 4" />
    </svg>
);

export const ResizeIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V4m0 0h4M3 4l4 4m8 0V4m0 0h-4m4 0l-4 4m-8 8v4m0 0h4m-4 0l4-4m8 0v4m0 0h-4m4 0l-4-4" />
    </svg>
);