import React, { useState } from 'react';
import { Upload, Type, Copy, Download, Check, Sparkles, AlertCircle, FileText, RefreshCw, Key } from 'lucide-react';
import { extractArabicOcr, getApiKey } from '../services/geminiService';
import { saveUserDocument } from '../services/storageService';

export function OcrView({ onOpenSettings }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleProcessOcr = async () => {
    if (!image) {
      setError('يرجى اختيار صورة أولاً.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const text = await extractArabicOcr(image);
      setExtractedText(text);

      // Auto-save to "مستنداتي"
      saveUserDocument({
        name: `نص_مستخرج_${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }).replace(/[:\s]/g, '_')}.doc`,
        type: 'Text',
        size: `${Math.max(0.1, (text.length / 1024)).toFixed(1)} KB`,
        pages: 'نص عربي مفرغ',
        content: text
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!extractedText) return;
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!extractedText) return;
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Soura_Arabic_OCR.txt';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleDownloadDoc = () => {
    if (!extractedText) return;
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Soura Document</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div dir="rtl">
          ${extractedText.replace(/\n/g, '<br/>')}
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Soura_Document.doc';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const loadSample = () => {
    const sample = `الوحدة الأولى: أسس ومفاهيم
الدرس الأول: الحضارة والتاريخ - الصف الأول الثانوي

أولاً: مفهوم الحضارة:
هي ثمرة أي مجهود يقوم به الإنسان نتيجة تفاعله مع البيئة لتحسين ظروف حياته على وجه الأرض ماديًا أو معنويًا لتعمير الكون الذي يعيش فيه.

ثانياً: غاية الحضارة:
- تعمير الأرض (وهو من أهم مقاصد خلق الإنسان).
- تبادل التراث الإنساني عبر العصور دون تعصب أو انعزال.`;
    setExtractedText(sample);
    saveUserDocument({
      name: 'نموذج_درس_التاريخ_أولى_ثانوي.doc',
      type: 'Text',
      size: '1.2 KB',
      pages: 'نص عربي مفرغ',
      content: sample
    });
  };

  return (
    <div className="space-y-4">
      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>تم حفظ النص في قائمة «مستنداتي» تلقائياً! 📁</span>
        </div>
      )}

      {/* Upload Box */}
      <div 
        onClick={() => document.getElementById('ocr-file-upload').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-3xl p-5 text-center bg-slate-50 dark:bg-slate-800/40 transition cursor-pointer"
      >
        <input 
          type="file" 
          id="ocr-file-upload" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        {image ? (
          <div className="space-y-3">
            <div className="relative max-h-48 rounded-2xl overflow-hidden inline-block bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 shadow-sm">
              <img src={image} alt="معاينة الصورة" className="max-h-48 object-contain mx-auto" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">انقر لتغيير الصورة المحددة</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">اختر صورة صفحة كتاب أو ملزمة</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">يدعم المذكرات، الكتب المدرسية، والمستندات العربية</p>
          </div>
        )}
      </div>

      {/* Process Button */}
      {image && (
        <button
          onClick={handleProcessOcr}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جارٍ قراءة النص العربي بالذكاء الاصطناعي...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>استخراج النص العربي الآن</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Extracted Text Area */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            النص المستخرج (قابل للتعديل):
          </span>
          <div className="flex items-center gap-2">
            {!extractedText && (
              <button 
                onClick={loadSample}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                جرب نموذج تجريبي
              </button>
            )}
            {extractedText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>
            )}
          </div>
        </div>

        <textarea
          dir="rtl"
          rows={9}
          value={extractedText}
          onChange={(e) => setExtractedText(e.target.value)}
          placeholder="سيظهر النص العربي هنا بعد معالجة الصورة، ويمكنك مراجعته والتعديل عليه مباشرة..."
          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 text-xs leading-relaxed text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500 transition font-sans"
        />

        {extractedText && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleDownloadDoc}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تصدير Word (.doc)</span>
            </button>
            <button
              onClick={handleDownloadTxt}
              className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>تصدير ملف نصي (.txt)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
