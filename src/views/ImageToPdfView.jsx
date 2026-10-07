import React, { useState } from 'react';
import { Upload, RotateCw, Trash2, ArrowRight, ArrowLeft, Download, Sliders, CheckCircle, Images, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveUserDocument } from '../services/storageService';
import { useExportAd } from '../context/ExportAdContext';
import { AdBanner } from '../components/AdBanner';

export function ImageToPdfView() {
  const { triggerExportWithAd } = useExportAd();
  const [images, setImages] = useState([]);
  const [filter, setFilter] = useState('original');
  const [margin, setMargin] = useState('small');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            src: event.target.result,
            rotation: 0
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRotate = (index) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index].rotation = (updated[index].rotation + 90) % 360;
      return updated;
    });
  };

  const handleMove = (index, delta) => {
    setImages((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[target];
      updated[target] = temp;
      return updated;
    });
  };

  const handleDelete = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    setImages([]);
  };

  const generatePDF = async () => {
    if (!images.length) return;

    setIsProcessing(true);
    setProgressMsg('جارٍ تجهيز الصفحات والـ PDF...');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const marginSize = margin === 'none' ? 0 : margin === 'wide' ? 20 : 10;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();
        setProgressMsg(`معالجة الصفحة ${i + 1} من ${images.length}...`);

        const item = images[i];
        const img = new Image();
        img.src = item.src;
        await new Promise((res) => { img.onload = res; });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const isSideways = item.rotation === 90 || item.rotation === 270;
        canvas.width = isSideways ? img.height : img.width;
        canvas.height = isSideways ? img.width : img.height;

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        if (filter === 'bw' || filter === 'high-contrast') {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const d = imgData.data;
          for (let j = 0; j < d.length; j += 4) {
            const avg = d[j] * 0.299 + d[j + 1] * 0.587 + d[j + 2] * 0.114;
            const val = filter === 'high-contrast' ? (avg < 140 ? 0 : 255) : avg;
            d[j] = val;
            d[j + 1] = val;
            d[j + 2] = val;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        const processedUrl = canvas.toDataURL('image/jpeg', 0.85);

        const usableW = pageWidth - marginSize * 2;
        const usableH = pageHeight - marginSize * 2;
        const imgRatio = canvas.width / canvas.height;
        const targetRatio = usableW / usableH;

        let renderW, renderH;
        if (imgRatio > targetRatio) {
          renderW = usableW;
          renderH = usableW / imgRatio;
        } else {
          renderH = usableH;
          renderW = usableH * imgRatio;
        }

        const posX = marginSize + (usableW - renderW) / 2;
        const posY = marginSize + (usableH - renderH) / 2;

        pdf.addImage(processedUrl, 'JPEG', posX, posY, renderW, renderH);
      }

      const docName = `ملزمة_Soura_${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }).replace(/[:\s]/g, '_')}.pdf`;
      
      // Save locally to user downloads via Export Ad Modal
      triggerExportWithAd({
        title: 'تصدير وتحميل ملف PDF 📄',
        fileName: docName,
        onDownload: () => pdf.save(docName)
      });

      // Save to "مستنداتي" storage persistently
      try {
        const dataUrl = pdf.output('datauristring');
        saveUserDocument({
          name: docName,
          type: 'PDF',
          size: `${(images.length * 0.35).toFixed(1)} MB`,
          pages: `${images.length} صفحة`,
          dataUrl: dataUrl
        });
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } catch (err) {
        console.warn('Could not cache full PDF dataurl in storage, saved metadata instead:', err);
        saveUserDocument({
          name: docName,
          type: 'PDF',
          size: `${(images.length * 0.35).toFixed(1)} MB`,
          pages: `${images.length} صفحة`
        });
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء تصدير الـ PDF');
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="space-y-4">
      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="font-bold">تم تحميل الـ PDF وحفظه في سجل «مستنداتي» بنجاح! 📁</span>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div 
        onClick={() => document.getElementById('image-upload-multi').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-3xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 transition cursor-pointer"
      >
        <input
          type="file"
          id="image-upload-multi"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFiles}
        />
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
          <Images className="w-7 h-7" />
        </div>
        <h4 className="font-bold text-sm text-slate-900 dark:text-white">انقر لاختيار الصور أو التقط بالكاميرا</h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">يمكنك رفع وترتيب أي عدد من الصور</p>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              {images.length} صفحة محددة
            </span>
            <button
              onClick={handleClear}
              className="text-xs text-red-500 dark:text-red-400 hover:underline font-semibold"
            >
              مسح الكل
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {images.map((img, idx) => (
              <div 
                key={img.id}
                className="relative rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-none"
              >
                <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={img.src}
                    alt={`صفحة ${idx + 1}`}
                    style={{
                      transform: `rotate(${img.rotation}deg)`,
                      filter: filter === 'bw' 
                        ? 'grayscale(100%)' 
                        : filter === 'high-contrast' 
                        ? 'grayscale(100%) contrast(170%) brightness(110%)' 
                        : 'none'
                    }}
                    className="max-h-full max-w-full object-contain transition duration-200"
                  />
                  <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                    ص {idx + 1}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <button
                    onClick={() => handleRotate(idx)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-transparent hover:bg-slate-100 dark:hover:bg-slate-600"
                    title="تدوير 90°"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={() => handleMove(idx, -1)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-transparent hover:bg-slate-100"
                        title="تحريك للأمام"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        onClick={() => handleMove(idx, 1)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-transparent hover:bg-slate-100"
                        title="تحريك للخلف"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100"
                    title="حذف الصفحة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              خيارات التنسيق والفلترة للـ PDF:
            </h5>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                onClick={() => setFilter('original')}
                className={`py-2 px-1 rounded-xl font-bold border transition ${
                  filter === 'original'
                    ? 'bg-emerald-500 text-white dark:text-slate-950 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ألوان أصلية
              </button>
              <button
                onClick={() => setFilter('bw')}
                className={`py-2 px-1 rounded-xl font-bold border transition ${
                  filter === 'bw'
                    ? 'bg-emerald-500 text-white dark:text-slate-950 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                أبيض وأسود
              </button>
              <button
                onClick={() => setFilter('high-contrast')}
                className={`py-2 px-1 rounded-xl font-bold border transition ${
                  filter === 'high-contrast'
                    ? 'bg-emerald-500 text-white dark:text-slate-950 border-emerald-500'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                توضيح خط
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700/60">
              <span>هوامش ورقة الطباعة (A4):</span>
              <select
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
              >
                <option value="none">بدون هوامش</option>
                <option value="small">هوامش عادية (افتراضي)</option>
                <option value="wide">هامش عريض (للتخريم)</option>
              </select>
            </div>
          </div>

          {isProcessing && (
            <div className="p-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <AdBanner label="إعلان ممول — جاري معالجة صفحات الـ PDF" />
            </div>
          )}

          <button
            onClick={generatePDF}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-md shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{isProcessing ? progressMsg : 'تصدير وتحميل ملف PDF الآن'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
