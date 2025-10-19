import React, { useEffect } from 'react';

// Make window.adsbygoogle type-safe
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

interface AdBannerProps {
  'data-ad-client': string;
  'data-ad-slot': string;
  'data-ad-format'?: string;
  'data-full-width-responsive'?: string;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = (props) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className={props.className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        {...props}
      />
    </div>
  );
};

export default AdBanner;
