import React, { useEffect, useRef } from 'react';

/**
 * Reusable Google AdSense Banner Component
 * Standard horizontal banner format for sleek, non-intrusive top banners
 */
export function AdBanner({ 
  slot = '', 
  format = 'horizontal', 
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
      className={`relative w-full overflow-hidden rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 px-2 py-1 text-center transition-all ${className}`}
    >
      <div className="flex items-center justify-between px-1 mb-0.5 leading-none">
        <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></span>
          {label}
        </span>
        <span className="text-[8px] text-slate-400/80 dark:text-slate-600 font-mono">Soura</span>
      </div>

      <div className="w-full min-h-[50px] max-h-[65px] sm:max-h-[90px] flex items-center justify-center overflow-hidden" ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: '50px', maxHeight: '90px' }}
          data-ad-client="ca-pub-8985355779670194"
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </aside>
  );
}

