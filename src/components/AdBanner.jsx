import React, { useEffect, useRef } from 'react';

/**
 * Reusable Google AdSense Banner Component
 * Standard 50px ultra-slim horizontal banner format
 */
export function AdBanner({ 
  slot = '', 
  format = 'horizontal', 
  responsive = 'true', 
  className = '',
  label = 'إعلان' 
}) {
  const adRef = useRef(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.debug('AdSense info:', err);
    }
  }, []);

  return (
    <aside 
      aria-label="مساحة إعلانية"
      className={`relative w-full h-[50px] max-h-[50px] overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center transition-all ${className}`}
      style={{ maxHeight: '50px', height: '50px' }}
    >
      <span className="absolute top-1 left-2 text-[8px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider pointer-events-none z-10 select-none">
        {label}
      </span>

      <div className="w-full h-[50px] max-h-[50px] flex items-center justify-center overflow-hidden" ref={adRef}>
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '100%', height: '50px', maxHeight: '50px' }}
          data-ad-client="ca-pub-8985355779670194"
          {...(slot ? { 'data-ad-slot': slot } : {})}
          data-ad-format={format}
          data-full-width-responsive={responsive}
        />
      </div>
    </aside>
  );
}

