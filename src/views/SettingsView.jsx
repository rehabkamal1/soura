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

      {/* Community & Social Channels */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">قنوات ومجتمع صورة الرسمي</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">انضم للمناقشات، تحميل الملازم، وطلب الميزات الجديدة</p>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            تواصل معنا
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <a
            href="https://whatsapp.com/channel/0029VbE2zatLSmbUpmedvs2N"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm hover:shadow-emerald-500/20 active:scale-95 text-center cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>قناة الواتساب</span>
          </a>

          <a
            href="https://www.facebook.com/share/g/1UzezFmWgF/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold transition shadow-sm hover:shadow-blue-500/20 active:scale-95 text-center cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>جروب الفيسبوك</span>
          </a>
        </div>
      </div>

      {/* About Soura */}
      <div className="text-center p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 transition-colors">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shadow-blue-500/20 mx-auto ring-1 ring-white/30 dark:ring-slate-700">
          <img src="/logo.png" alt="Soura Logo" className="w-full h-full object-cover" />
        </div>
        <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">Soura — صورة</h5>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          الإصدار 1.0.0 • صُمم خصيصاً للمجتمع التعليمي في مصر والعالم العربي 🇪🇬
        </p>
      </div>
    </div>
  );
}
