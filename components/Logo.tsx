import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="PixelPerfect AI Logo"
    role="img"
  >
    <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
    </defs>
    {/* The main frame */}
    <path
      d="M2,6 V26 H26 V6 Z M4,8 H24 V24 H4 Z"
      fill="white"
      fillOpacity="0.9"
    />
    {/* The "perfect" pixel */}
    <rect
      x="8"
      y="12"
      width="8"
      height="8"
      rx="1"
      fill="url(#logo-gradient)"
    />
    {/* Little AI sparkle */}
    <path
      d="M20,10 L21,8 L22,10 L24,11 L22,12 L21,14 L20,12 L18,11 Z"
      fill="#c7d2fe"
    />
  </svg>
);