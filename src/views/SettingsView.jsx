import React, { useState } from 'react';
import { Key, Moon, Sun, ShieldCheck, ExternalLink, Check, Trash2, Info, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/geminiService';

export function SettingsView({ darkMode, toggleDarkMode }) {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    saveApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`, {
        headers: { 'x-goog-api-key': apiKey.trim() }
      });
      const data = await res.json();

      if (res.ok && data.models) {
        const models = data.models.map(m => m.name.replace('models/', ''));
        setTestResult({
          success: true,
          message: `تم الاتصال بنجاح بجوجل! الموديلات المتاحة لمفتاحك: ${models.slice(0, 3).join(', ')}`
        });
      } else {
        setTestResult({
          success: false,
          message: data?.error?.message || `خطأ ${res.status}: المفتاح غير مفعّل لموديلات Gemini في Google AI Studio.`
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: 'فشل الاتصال: ' + e.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع المستندات المحفوظة مؤقتاً؟')) {
      localStorage.removeItem('soura_history');
      alert('تم مسح الذاكرة المؤقتة بنجاح.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Gemini API Key Box */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">مفتاح الذكاء الاصطناعي (Gemini)</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">مجاني 100% لتشغيل قارئ النصوص والامتحانات</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Google AI
          </span>
        </div>

        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => {
              setApiKeyState(e.target.value);
              setTestResult(null);
            }}
            placeholder="AQ... أو AIzaSy..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-mono tracking-wider"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute left-2.5 top-2.5 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {showKey ? 'إخفاء' : 'إظهار'}
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedSuccess ? 'تم الحفظ!' : 'حفظ'}</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
              className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition border border-slate-200 dark:border-transparent disabled:opacity-50"
            >
              {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{testing ? 'جارٍ الفحص...' : 'اختبار المفتاح'}</span>
            </button>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>استخراج مفتاح مجاني</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30'
          }`}>
            {testResult.success ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <p>
            يتم حفظ المفتاح داخل متصفحك محلياً عبر LocalStorage ولا يشارك مع أي خوادم طرف ثالث.
          </p>
        </div>
      </div>

      {/* App Preferences */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2">تفضيلات التطبيق</h4>

        <div className="flex items-center justify-between py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            {darkMode ? <Moon className="w-4 h-4 text-slate-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>الوضع الليلي (Dark Mode)</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs transition border border-slate-200 dark:border-transparent"
          >
            {darkMode ? 'مفعّل' : 'معطّل'}
          </button>
        </div>

        <div className="flex items-center justify-between py-1.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/60">
          <span>حجم الصفحة الافتراضي للـ PDF</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">A4 القياسي (210×297 mm)</span>
        </div>

        <div className="flex items-center justify-between py-1.5 text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700/60">
          <span>مسح الذاكرة المؤقتة وسجل المستندات</span>
          <button
            onClick={handleClearCache}
            className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح الذاكرة</span>
          </button>
        </div>
      </div>

      {/* About Soura */}
      <div className="text-center p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 transition-colors">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white mx-auto font-black text-lg shadow-md shadow-emerald-500/20">
          ص
        </div>
        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">Soura — صورة</h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          الإصدار 1.0.0 • صُمم خصيصاً للمجتمع التعليمي في مصر والعالم العربي 🇪🇬
        </p>
      </div>
    </div>
  );
}
