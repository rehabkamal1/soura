import React from 'react';
import { 
  Sparkles, FileText, Type, HelpCircle, BookOpen, 
  Table, UploadCloud, Clock, Eye, Download, CheckCircle, 
  ArrowLeft, BrainCircuit, Users, ArrowLeftRight
} from 'lucide-react';

export function HomeView({ onSelectTool, onSelectTab }) {
  const tools = [
    {
      id: 'image-to-pdf',
      title: 'صورة ← PDF',
      desc: 'دمج، ترتيب، وفلترة الصور لملف PDF واحد',
      icon: FileText,
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:border-emerald-500/30',
      badge: 'أساسي'
    },
    {
      id: 'ocr',
      title: 'صورة ← نص عربي (OCR)',
      desc: 'قراءة الكتب والملازم وتحويلها لنص قابل للتعديل',
      icon: Type,
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
      badge: 'AI فائق'
    },
    {
      id: 'exam-maker',
      title: 'صانع الامتحانات 🔥',
      desc: 'صورة الأسئلة ← ورقة اختبار جاهزة للطباعة فوراً',
      icon: HelpCircle,
      color: 'from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
      badge: 'للمعلمين'
    },
    {
      id: 'clean-sheet',
      title: 'نظّف الورقة 🧼',
      desc: 'إزالة الظلال وتبييض الورق لتوفير حبر الطباعة',
      icon: Sparkles,
      color: 'from-teal-500/10 to-cyan-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20 dark:border-teal-500/30',
      badge: 'CamScanner'
    },
    {
      id: 'excel',
      title: 'كشف درجات ← Excel 📊',
      desc: 'تحويل صور الكشوف والجداول لملف إكسيل منظم',
      icon: Table,
      color: 'from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
      badge: 'جداول'
    },
    {
      id: 'solver',
      title: 'حل المسائل والأسئلة 💡',
      desc: 'صورة المسألة ← الحل النموذجي بالخطوات',
      icon: BrainCircuit,
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 dark:border-amber-500/30',
      badge: 'للطلاب'
    },
    {
      id: 'converter',
      title: 'تحويل المستندات 🔄',
      desc: 'Word ⇄ PDF ⇄ Excel تحويل فوري للتعديل والطباعة',
      icon: ArrowLeftRight,
      color: 'from-blue-600/10 to-purple-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 dark:border-indigo-500/30',
      badge: 'جديد ومهم'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-teal-50/50 to-slate-50 dark:from-emerald-950/60 dark:via-slate-800/90 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> مخصص للمنهج والورق المصري
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                مجاني 100%
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white leading-snug mb-1">
              مستنداتك الذكية في مكان واحد 📄
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ارفع صور الملازم، دفاتر التحضير، أو الكشوف الورقية وحوّلها لملفات قابلة للطباعة والتعديل فوراً.
            </p>
          </div>
          <img src="/logo.png" alt="Soura Logo" className="w-16 h-16 rounded-2xl shadow-lg shadow-blue-500/25 object-cover flex-shrink-0 ring-2 ring-white/30 dark:ring-slate-700/60" />
        </div>

        <button
          onClick={() => onSelectTool('image-to-pdf')}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition"
        >
          <UploadCloud className="w-4 h-4" />
          <span>ابدأ برفع الصور الآن</span>
        </button>
      </div>

      {/* Tools Section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            ماذا تريد أن تفعل اليوم؟
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">أدوات ذكية متخصصة</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="text-right p-3.5 rounded-2xl bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/40 transition-all active:scale-[0.98] flex flex-col justify-between h-36 relative overflow-hidden group shadow-sm dark:shadow-none"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center group-hover:scale-110 transition border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {tool.badge}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition">
                    {tool.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                    {tool.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Community Links (Facebook Group & WhatsApp Channel) */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/40 to-emerald-50 dark:from-blue-950/40 dark:via-slate-800/60 dark:to-emerald-950/30 rounded-3xl p-4 border border-blue-200/80 dark:border-blue-500/20 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">مجتمع صورة التعليمي 🇪🇬</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">تابع أحدث الملازم، الامتحانات، والتحديثات أولاً بأول</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            انضم الآن
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
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

      {/* Kotob Sync Highlight */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">تكامل مع مكتبة كتب Kotob</h5>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">احفظ الملازم والكتب المعالجة مباشرة في حسابك</p>
          </div>
        </div>
        <button 
          onClick={() => alert('ميزة الربط المباشر مع Kotob ستتوفر قريباً!')}
          className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          ربط
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> آخر الملفات المعالجة
          </span>
          <button onClick={() => onSelectTab('documents')} className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold">
            عرض الكل
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                PDF
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">ملزمة_العلوم_ترم_ثاني.pdf</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">12 صفحة • 2.1 MB • منذ ساعتين</p>
              </div>
            </div>
            <button 
              onClick={() => alert('المستند محفوظ وجاهز')}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
