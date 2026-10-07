import React, { useEffect, useRef } from 'react';

/**
 * Reusable Google AdSense Banner Component
 * Handles auto-ads and responsive ad units safely with fallback styling
 */
export function AdBanner({ 
  slot = '', 
  format = 'auto', 
  responsive = 'true', 
  className = '',
  label = 'إعلان ممول' 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      // Gracefully catch ad-blocker or duplicate push errors
      console.debug('AdSense info:', err);
    }
  }, []);

  return (
    <aside 
      aria-label="مساحة إعلانية"
      className={`relative overflow-hidden rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 p-2.5 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between px-1.5 mb-1">
        <span className="text-[9px] font-bold tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse"></span>
          {label}
        </span>
        <span className="text-[9px] text-slate-400/80 dark:text-slate-600 font-mono">Soura Ads</span>
      </div>

      <div className="min-h-[60px] flex items-center justify-center overflow-hidden" ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client="ca-pub-8985355779670194"
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </aside>
  );
}
