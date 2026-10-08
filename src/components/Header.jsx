import React from 'react';
import { Sparkles, DownloadCloud, CheckCircle, Moon, Sun, ArrowRight } from 'lucide-react';

export function Header({ currentView, onBack, onOpenInstall, darkMode, toggleDarkMode, isInstalled }) {
  const isHome = currentView === 'home';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 transition-colors duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {!isHome ? (
            <button
              onClick={onBack}
              aria-label="الرجوع للرئيسية"
              className="p-2 -mr-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition text-slate-700 dark:text-slate-300"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-md shadow-blue-500/25 ring-1 ring-white/20">
              <img src="/logo.png" alt="Soura Logo" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg text-slate-900 dark:text-white tracking-wide">
                {isHome ? 'Soura' : getViewTitle(currentView)}
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              {isHome ? 'حوّل صورك لمستندات ذكية' : getViewSubtitle(currentView)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isInstalled ? (
            <span
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              title="التطبيق مثبت ومحدث لآخر إصدار"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">أحدث إصدار</span>
            </span>
          ) : (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 active:scale-95 transition border border-emerald-500/30"
              title="تثبيت التطبيق"
            >
              <DownloadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تثبيت</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition text-slate-700 dark:text-slate-300"
            title={darkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
}

function getViewTitle(view) {
  switch (view) {
    case 'image-to-pdf': return 'صورة إلى PDF';
    case 'ocr': return 'استخراج النص (OCR)';
    case 'exam-maker': return 'تحويل لامتحان';
    case 'clean-sheet': return 'تنظيف وتصفية الورقة';
    case 'excel': return 'استخراج جدول كشف';
    case 'solver': return 'حل الأسئلة والمسائل';
    case 'documents': return 'مستنداتي المحفوظة';
    case 'settings': return 'الإعدادات';
    default: return 'Soura';
  }
}

function getViewSubtitle(view) {
  switch (view) {
    case 'image-to-pdf': return 'دمج، ترتيب، وفلترة الصور';
    case 'ocr': return 'قراءة العربية بدقة وتصدير للوورد';
    case 'exam-maker': return 'تنسيق الأسئلة لورقة اختبار جاهزة';
    case 'clean-sheet': return 'إزالة الظلال وتبييض الورقة';
    case 'excel': return 'تحويل الصور لجداول إكسيل';
    case 'solver': return 'تحليل الأسئلة والخطوات';
    case 'documents': return 'ملفاتك الجاهزة للتحميل';
    case 'settings': return 'تفضيلات التطبيق والمظهر';
    default: return '';
  }
}
