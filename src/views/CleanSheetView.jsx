import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Upload, Download, RefreshCw, Sliders, CheckCircle2 } from 'lucide-react';
import { saveUserDocument } from '../services/storageService';
import { useExportAd } from '../context/ExportAdContext';

export function CleanSheetView() {
  const { triggerExportWithAd } = useExportAd();
  const [imageSrc, setImageSrc] = useState(null);
  const [threshold, setThreshold] = useState(135);
  const [contrast, setContrast] = useState(130);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;

      for (let i = 0; i < d.length; i += 4) {
        // Luminance
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        // Contrast / Threshold
        const val = gray < threshold ? 0 : 255;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [imageSrc, threshold, contrast]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const fileName = `ورقة_مبيضة_${Date.now()}.jpg`;

    // Save to storage service
    saveUserDocument({
      name: fileName,
      type: 'Image',
      size: `${Math.round((dataUrl.length * 0.75) / 1024)} KB`,
      pages: 'صورة مبيضة للطباعة',
      dataUrl: dataUrl
    });

    triggerExportWithAd({
      title: 'تصدير وتحميل الورقة المبيضة 🧼',
      fileName,
      onDownload: () => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          try {
            document.body.removeChild(a);
          } catch (e) {}
        }, 500);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Upload */}
      <div 
        onClick={() => document.getElementById('clean-file-input').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500/60 rounded-3xl p-5 text-center bg-white dark:bg-slate-800/40 transition cursor-pointer shadow-sm dark:shadow-none"
      >
        <input 
          type="file" 
          id="clean-file-input" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload} 
        />
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-sm text-slate-800 dark:text-white">اختر صورة المستند أو الورقة الورقية</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">معالجة بصرية لإزالة الظلال وتوحيد بياض الخلفية لتوفير حبر الطباعة</p>
      </div>

      {imageSrc && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 space-y-3 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Sliders className="w-4 h-4 text-teal-500 dark:text-teal-400" /> درجة تبييض ونقاء الخلفية:
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">{threshold}</span>
            </div>
            <input 
              type="range" 
              min="80" 
              max="200" 
              value={threshold} 
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-teal-500 cursor-pointer" 
            />
          </div>

          {/* Processed Preview */}
          <div className="rounded-2xl bg-slate-900 p-2 border border-slate-700 overflow-hidden flex justify-center">
            <canvas ref={canvasRef} className="max-h-72 object-contain rounded-xl" />
          </div>

          {savedSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>تم حفظ المستند المعالج ومتاح دائماً في «مستنداتي»</span>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تحميل المستند المعالج للطباعة</span>
          </button>
        </div>
      )}
    </div>
  );
}
