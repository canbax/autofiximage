import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
  <img
    loading="lazy"
    src="/favicon.ico"
    alt="AutoFix Image Logo"
    className={className}
  />
);