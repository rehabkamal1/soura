import React, { useState, useEffect } from 'react';
import { X, Smartphone, Share2, PlusSquare, CheckCircle, ArrowDown } from 'lucide-react';

export function InstallModal({ isOpen, onClose, deferredPrompt, onInstalled }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Check if standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          localStorage.setItem('soura_pwa_installed', 'true');
          if (onInstalled) onInstalled();
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
      onClose();
    } else {
      // If prompt not available (e.g. Chrome already installed or desktop browser)
      alert('لتثبيت Soura، اضغط على زر خيارات المتصفح (⋮) ثم اختر "تثبيت التطبيق" أو "Install App".');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative animate-slide-up"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* App Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/25 mb-4 relative">
            <Smartphone className="w-10 h-10 text-white" />
            <span className="absolute -bottom-1 -right-1 bg-slate-900 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
              Soura
            </span>
          </div>

          <h3 className="text-xl font-bold text-white mb-1.5">
            ثبّت تطبيق Soura
          </h3>

          <p className="text-sm text-slate-300 max-w-xs mb-5 leading-relaxed">
            استخدم Soura كتطبيق سريع على جهازك بدون تحميل ثقيل وبدون إعلانات، مع دعم العمل أوفلاين.
          </p>

          {isIOS ? (
            /* iOS Safari Instructions */
            <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4 text-right mb-5 space-y-2.5 text-xs text-slate-300">
              <p className="font-bold text-emerald-400 text-sm mb-1 flex items-center gap-1.5">
                <span>طريقة التثبيت على آيفون (Safari):</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>اضغط على أيقونة المشاركة بالأسفل</span>
                <Share2 className="w-4 h-4 text-blue-400 inline" />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>اختر <strong>«إضافة إلى الشاشة الرئيسية»</strong></span>
                <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>اضغط على كلمة <strong>«إضافة»</strong> أعلى الشاشة.</span>
              </div>
            </div>
          ) : (
            /* Android / Chrome One-Click Install */
            <div className="w-full space-y-2.5 mb-2">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-base hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5" />
                <span>تثبيت التطبيق الآن</span>
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-slate-400 hover:text-slate-200 font-medium text-sm transition"
              >
                لاحقًا
              </button>
            </div>
          )}

          {isIOS && (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-slate-800 text-slate-200 font-semibold text-sm hover:bg-slate-700 transition"
            >
              فهمت، شكرًا
            </button>
          )}

          {/* Quick Features List */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 w-full grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>مساحة صفرية تقريبًا</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>خصوصية تامة للصور</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
