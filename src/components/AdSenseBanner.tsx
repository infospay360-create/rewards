import React, { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

interface AdSenseBannerProps {
  client?: string;
  slot?: string;
  className?: string;
}

export const AdSenseBanner: React.FC<AdSenseBannerProps> = ({
  client = 'ca-pub-7502019743291076',
  slot,
  className = '',
}) => {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      // Gracefully handle AdSense initialization (e.g. ad blockers or sandbox environments)
      console.debug('AdSense initialization notice:', e);
    }
  }, []);

  return (
    <div
      id="bottom-adsense-container"
      className={`w-full max-w-6xl mx-auto my-6 px-3 sm:px-4 text-center ${className}`}
    >
      <div className="text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5 flex items-center justify-center gap-1.5">
        <span className="w-6 h-px bg-slate-700/60"></span>
        <span>ADVERTISEMENT • SPONSORED</span>
        <span className="w-6 h-px bg-slate-700/60"></span>
      </div>

      <div className="min-h-[90px] sm:min-h-[100px] w-full rounded-xl bg-slate-900/40 border border-slate-800/80 p-2 flex items-center justify-center overflow-hidden">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '90px' }}
          data-ad-client={client}
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
