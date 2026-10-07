import React, { useState } from 'react';
import { BrainCircuit, Upload, Sparkles, RefreshCw, Key, AlertCircle, CheckCircle } from 'lucide-react';
import { solveProblem, getApiKey } from '../services/geminiService';

export function SolverView({ onOpenSettings }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [error, setError] = useState('');

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

  const handleSolve = async () => {
    if (!image) {
      setError('يرجى اختيار صورة المسألة أولاً.');
      return;
    }
    if (!hasApiKey) {
      setError('يرجى إضافة مفتاح Gemini API في الإعدادات.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await solveProblem(image);
      setSolution(res);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حل المسألة.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setSolution(`📌 نص المسألة:
أوجد قيمة س في المعادلة التالية:
٣س + ٥ = ٢٠

📋 خطوات الحل التفصيلية:
١. بطرح الرقم (٥) من طرفي المعادلة:
   ٣س + ٥ - ٥ = ٢٠ - ٥
   ٣س = ١٥

٢. بقسمة طرفي المعادلة على معامل س وهو (٣):
   (٣س ÷ ٣) = (١٥ ÷ ٣)
   س = ٥

✅ الناتج النهائي:
قيمة س = ٥`);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div 
        onClick={() => document.getElementById('solver-photo-input').click()}
        className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-3xl p-5 text-center bg-slate-800/40 transition cursor-pointer"
      >
        <input 
          type="file" 
          id="solver-photo-input" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        {image ? (
          <div className="space-y-2">
            <img src={image} alt="صورة المسألة" className="max-h-40 rounded-xl mx-auto border border-slate-700 object-contain" />
            <p className="text-xs text-slate-400">انقر لتغيير الصورة</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-white">صوّر مسألة رياضيات أو سؤال علمي</h4>
            <p className="text-[11px] text-slate-400">تحليل السؤال واستخراج الحل النموذجي بالخطوات والقوانين</p>
          </div>
        )}
      </div>

      {image && (
        <button
          onClick={handleSolve}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جارٍ فهم وتحليل خطوات الحل...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>عرض الحل النموذجي بالخطوات 💡</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Solution Box */}
      <div className="bg-slate-800/60 rounded-3xl p-4 border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-amber-300">
            الحل النموذجي والشرح:
          </span>
          {!solution && (
            <button 
              onClick={loadSample}
              className="text-[11px] text-amber-400 hover:underline"
            >
              عرض نموذج مسألة جبر
            </button>
          )}
        </div>

        <div className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl p-3.5 text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans min-h-[120px]">
          {solution || 'التقط صورة المسألة من كتابك واضغط على عرض الحل لمعرفة النتيجة والشرح...'}
        </div>
      </div>
    </div>
  );
}
