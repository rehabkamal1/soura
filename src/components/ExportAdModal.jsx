import React, { useState, useEffect } from 'react';
import { DownloadCloud, CheckCircle, X, Sparkles, Loader2, FileCheck } from 'lucide-react';
import { AdBanner } from './AdBanner';

export function ExportAdModal({ isOpen, onClose, onDownload, title = 'جاري تصدير الملف', fileName = '' }) {
  const [countdown, setCountdown] = useState(3);
  const [ready, setReady] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      setReady(false);
      setDownloaded(false);
      return;
    }

    setCountdown(3);
    setReady(false);
    setDownloaded(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleExecuteDownload = () => {
    if (onDownload) {
      onDownload();
      setDownloaded(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      dir="rtl"
    >
      <div 
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4 text-center transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            {ready || downloaded ? (
              <FileCheck className="w-6 h-6 animate-bounce" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
          <h3 className="font-black text-sm text-slate-900 dark:text-white">
            {title}
          </h3>
          {fileName && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs mx-auto">
              {fileName}
            </p>
          )}
        </div>

        {/* AdSense Placement Inside Export Modal */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-2">
          <AdBanner label="إعلان ممول — شكرًا لدعمك لتطبيق صورة" />
        </div>

        {/* Progress or Ready Action */}
        <div className="space-y-2 pt-1">
          {!ready && !downloaded ? (
            <div className="space-y-2">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                جارٍ تجهيز المستند بأعلى دقة... ({countdown})
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleExecuteDownload}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-98 transition cursor-pointer"
              >
                <DownloadCloud className="w-4 h-4" />
                <span>{downloaded ? 'تم بدء التنزيل بنجاح! 🎉' : 'تنزيل وتحميل الملف الآن 📥'}</span>
              </button>
              <p className="text-[10px] text-slate-400">ملفك جاهز ومحفوظ محلياً أيضاً في «مستنداتي»</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
