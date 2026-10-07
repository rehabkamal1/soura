import React from 'react';
import { DownloadCloud, CheckCircle, Moon, Sun, ArrowRight, ShieldCheck } from 'lucide-react';

export function Header({ currentView, onBack, onOpenInstall, darkMode, toggleDarkMode, isInstalled }) {
  const isHome = currentView === 'home';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-colors duration-200">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome ? (
            <button
              onClick={onBack}
              aria-label="الرجوع للرئيسية"
              className="p-2 -mr-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 active:scale-95 transition text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10 flex-shrink-0 bg-emerald-500/10">
              <img src="/logo.png" alt="Soura Logo" className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-normal font-cairo">
                {isHome ? 'منصة صورة' : getViewTitle(currentView)}
              </h1>
              {isHome && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                  النسخة المدرسية
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
              {isHome ? 'أدوات المستندات والامتحانات للمعلمين والطلاب' : getViewSubtitle(currentView)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInstalled ? (
            <span
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
              title="التطبيق مثبت ومحدث"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">الإصدار المعتمد</span>
            </span>
          ) : (
            <button
              onClick={onOpenInstall}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition border border-slate-200 dark:border-slate-700 cursor-pointer"
              title="تثبيت التطبيق على جهازك"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 active:scale-95 transition text-slate-700 dark:text-slate-300 cursor-pointer"
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
    case 'ocr': return 'استخراج النصوص (OCR)';
    case 'exam-maker': return 'منسق الامتحانات الرسمية';
    case 'clean-sheet': return 'معالجة وتبييض الورق';
    case 'excel': return 'استخراج جداول Excel';
    case 'solver': return 'المساعد الدراسي الذكي';
    case 'documents': return 'مستنداتي المحفوظة';
    case 'settings': return 'الإعدادات';
    default: return 'منصة صورة';
  }
}

function getViewSubtitle(view) {
  switch (view) {
    case 'image-to-pdf': return 'دمج وتنسيق أوراق المذكرات للطباعة';
    case 'ocr': return 'تفريغ نصوص الكتب والمذكرات لملف Word';
    case 'exam-maker': return 'تنسيق نماذج الاختبارات بمواصفات الوزارة';
    case 'clean-sheet': return 'تنقية الخلفية وإزالة الظلال لتوفير الحبر';
    case 'excel': return 'تحويل كشوف الدرجات لجداول بيانات منظمة';
    case 'solver': return 'تحليل الأسئلة والحل النموذجي خطوة بخطوة';
    case 'documents': return 'سجل المستندات الجاهزة للتحميل والطباعة';
    case 'settings': return 'تخصيص المظهر وتفضيلات التطبيق';
    default: return '';
  }
}
