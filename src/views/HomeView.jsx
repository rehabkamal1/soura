import React from 'react';
import { 
  Sparkles, FileText, Type, HelpCircle, BookOpen, 
  Table, UploadCloud, Clock, Eye, Download, CheckCircle, 
  ArrowLeft, BrainCircuit
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
