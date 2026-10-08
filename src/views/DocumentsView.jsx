import React, { useState, useEffect } from 'react';
import { FolderClock, Download, Trash2, Sparkles, FolderOpen, FileText, CheckCircle2 } from 'lucide-react';
import { getUserDocuments, deleteUserDocument, clearUserDocuments, triggerDownload } from '../services/storageService';
import { useExportAd } from '../context/ExportAdContext';

export function DocumentsView({ darkMode }) {
  const { triggerExportWithAd } = useExportAd();
  const [documents, setDocuments] = useState([]);
  const [showDemoSamples, setShowDemoSamples] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Default sample files for demonstration
  const demoSamples = [
    {
      id: 'demo-1',
      name: 'ملزمة_الرياضيات_الترم_الأول.pdf',
      type: 'PDF',
      size: '2.4 MB',
      pages: '14 صفحة',
      time: 'منذ ساعتين'
    },
    {
      id: 'demo-2',
      name: 'امتحان_اللغة_العربية_الميدترم.pdf',
      type: 'Exam',
      size: '890 KB',
      pages: 'صفحتان',
      time: 'أمس'
    },
    {
      id: 'demo-3',
      name: 'كشف_درجات_الشهر_فصل_أولى_ثاني.csv',
      type: 'Excel',
      size: '120 KB',
      pages: 'جدول درجات',
      time: 'منذ يومين'
    }
  ];

  const loadDocs = () => {
    const list = getUserDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocs();

    const handleDocsChanged = () => {
      loadDocs();
    };

    window.addEventListener('soura_documents_changed', handleDocsChanged);
    window.addEventListener('storage', handleDocsChanged);

    return () => {
      window.removeEventListener('soura_documents_changed', handleDocsChanged);
      window.removeEventListener('storage', handleDocsChanged);
    };
  }, []);

  const handleDelete = async (id) => {
    const updated = await deleteUserDocument(id);
    setDocuments(updated);
  };

  const handleClearAll = async () => {
    if (window.confirm('هل تريد مسح جميع المستندات المحفوظة من السجل؟')) {
      await clearUserDocuments();
      setDocuments([]);
      setShowDemoSamples(false);
    }
  };

  const handleDownloadDoc = async (doc) => {
    triggerExportWithAd({
      title: `تنزيل ${doc.name}`,
      fileName: doc.name,
      onDownload: async () => {
        setDownloadingId(doc.id);
        try {
          await triggerDownload(doc);
        } catch (e) {
          console.error('Download error:', e);
        } finally {
          setTimeout(() => setDownloadingId(null), 1000);
        }
      }
    });
  };

  const displayList = documents.length > 0 ? documents : (showDemoSamples ? demoSamples : []);

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20';
      case 'Exam':
        return 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20';
      case 'Excel':
        return 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20';
      case 'Image':
        return 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-500/20';
      default:
        return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Title & Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
            <FolderClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>مستنداتي المحفوظة</span>
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            الملفات التي قمت بإنشائها تُحفظ محلياً وتلقائياً على جهازك ({documents.length} مستند)
          </p>
        </div>

        {displayList.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[11px] text-red-500 hover:text-red-600 dark:text-red-400 font-semibold cursor-pointer"
          >
            مسح السجل
          </button>
        )}
      </div>

      {/* Notice explaining what these files are */}
      {showDemoSamples && documents.length === 0 && (
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <span>💡 الملفات المعروضة بالأسفل هي **نماذج توضيحية تجريبية** فقط لعرض أنواع الملفات (PDF / امتحانات / كشوف Excel).</span>
          <button 
            onClick={() => setShowDemoSamples(false)}
            className="text-[11px] font-bold underline whitespace-nowrap mr-2"
          >
            إخفاء النماذج
          </button>
        </div>
      )}

      {/* List of Documents */}
      {displayList.length > 0 ? (
        <div className="space-y-2.5">
          {displayList.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${getTypeBadgeClass(doc.type)}`}
                >
                  {doc.type}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[190px]">
                    {doc.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {doc.pages} • {doc.size} • {doc.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleDownloadDoc(doc)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    downloadingId === doc.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                  }`}
                  title="تنزيل الملف مجدداً"
                >
                  {downloadingId === doc.id ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition cursor-pointer"
                  title="حذف من السجل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <div>
            <h5 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
              سجل مستنداتك فارغ حالياً
            </h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              أي مستند تقوم بإنشائه (تحويل صور لـ PDF، استخراج نصوص، تبييض ورق، أو كشوف Excel) سيتم حفظه تلقائياً هنا!
            </p>
          </div>
          <button
            onClick={() => setShowDemoSamples(true)}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>عرض نماذج توضيحية للأشكال المتاحة</span>
          </button>
        </div>
      )}
    </div>
  );
}
