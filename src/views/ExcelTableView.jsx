import React, { useState } from 'react';
import { Table, Upload, Download, Sparkles, RefreshCw, Key, AlertCircle, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { extractTableToCsv, getApiKey } from '../services/geminiService';
import { saveUserDocument } from '../services/storageService';
import { useExportAd } from '../context/ExportAdContext';

export function ExcelTableView({ onOpenSettings }) {
  const { triggerExportWithAd } = useExportAd();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState('');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const hasApiKey = Boolean(getApiKey());

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleProcessTable = async () => {
    if (!image) {
      setError('يرجى اختيار صورة الكشف أولاً.');
      return;
    }
    if (!hasApiKey) {
      setError('يرجى إضافة مفتاح Gemini API في الإعدادات.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const csv = await extractTableToCsv(image);
      setCsvData(csv);

      // Auto save to user documents
      const rows = csv.split('\n').filter(r => r.trim()).length;
      const fileName = `كشف_جدول_${Date.now()}.csv`;
      saveUserDocument({
        name: fileName,
        type: 'Excel',
        size: `${Math.max(1, Math.round(csv.length / 1024))} KB`,
        pages: `${rows} صفوف`,
        content: csv
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء قراءة الجدول.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!csvData) return;
    const fileName = `كشف_جدول_${Date.now()}.csv`;

    triggerExportWithAd({
      title: 'تنزيل جدول Excel (CSV)',
      fileName: fileName,
      onDownload: () => {
        // Save/update to documents
        const rows = parseCsvRows().length;
        saveUserDocument({
          name: fileName,
          type: 'Excel',
          size: `${Math.max(1, Math.round(csvData.length / 1024))} KB`,
          pages: `${rows} صفوف`,
          content: csvData
        });

        // Download via Data URI with UTF-8 BOM to avoid insecure blob connection warnings
        const blob = new Blob(['\ufeff', csvData], { type: 'text/csv;charset=utf-8' });
        const reader = new FileReader();
        reader.onload = () => {
          const a = document.createElement('a');
          a.href = reader.result;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try {
              document.body.removeChild(a);
            } catch (e) {}
          }, 500);
        };
        reader.readAsDataURL(blob);

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    });
  };

  const loadSample = () => {
    const sample = `م,اسم الطالب,رقم الجلوس,أعمال السنة,الامتحان التحريري,المجموع
1,أحمد محمد علي,101,18,36,54
2,سارة محمود حسن,102,20,39,59
3,يوسف كريم عبد الله,103,16,32,48
4,نور الدين طارق,104,19,38,57`;
    setCsvData(sample);
  };

  const parseCsvRows = () => {
    if (!csvData) return [];
    return csvData.split('\n').filter(r => r.trim()).map(r => r.split(','));
  };

  const tableRows = parseCsvRows();

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        onClick={() => document.getElementById('table-photo-input').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 rounded-3xl p-5 text-center bg-white dark:bg-slate-800/40 transition cursor-pointer shadow-sm dark:shadow-none"
      >
        <input 
          type="file" 
          id="table-photo-input" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        {image ? (
          <div className="space-y-2">
            <img src={image} alt="صورة الكشف" className="max-h-40 rounded-xl mx-auto border border-slate-200 dark:border-slate-700 object-contain shadow-sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400">انقر لتغيير الصورة</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Table className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">اختر صورة كشف درجات أو جدول ورقي</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">يتعرف الذكاء الاصطناعي على الأعمدة والصفوف ويحولها لإكسيل</p>
          </div>
        )}
      </div>

      {image && (
        <button
          onClick={handleProcessTable}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جارٍ استخراج وتنسيق خلايا الجدول...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>استخراج الجدول كملف Excel 📊</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>تم حفظ كشف الجدول في "مستنداتي" بنجاح!</span>
        </div>
      )}

      {/* Table Preview */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
            معاينة الجدول:
          </span>
          {!csvData && (
            <button 
              onClick={loadSample}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              عرض نموذج كشف درجات
            </button>
          )}
        </div>

        {tableRows.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                <tr>
                  {tableRows[0].map((h, i) => (
                    <th key={i} className="p-2.5 border-b border-slate-200 dark:border-slate-700 font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {tableRows.slice(1).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 whitespace-nowrap">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
            لم يتم استخراج جدول بعد. ارفع صورة الكشف واضغط على استخراج.
          </p>
        )}

        {csvData && (
          <button
            onClick={handleDownloadCsv}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition active:scale-98 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل ملف Excel (.csv باللغة العربية) وحفظه في مستنداتي</span>
          </button>
        )}
      </div>
    </div>
  );
}
