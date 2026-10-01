import React, { useState } from 'react';
import { HelpCircle, Upload, Printer, Sparkles, RefreshCw, AlertCircle, Check, BookOpen, Layers } from 'lucide-react';
import { convertToExam, getApiKey } from '../services/geminiService';
import { saveUserDocument } from '../services/storageService';

const POPULAR_GRADES = [
  'الصف الرابع الابتدائي',
  'الصف الخامس الابتدائي',
  'الصف السادس الابتدائي',
  'الصف الأول الإعدادي',
  'الصف الثاني الإعدادي',
  'الصف الثالث الإعدادي',
  'الصف الأول الثانوي',
  'الصف الثاني الثانوي',
  'الصف الثالث الثانوي',
  'مرحلة جامعية / أخرى'
];

const POPULAR_SUBJECTS = [
  'اللغة العربية',
  'اللغة الإنجليزية',
  'الرياضيات',
  'العلوم',
  'الدراسات الاجتماعية',
  'الفيزياء',
  'الكيمياء',
  'الأحياء',
  'التاريخ',
  'الجغرافيا',
  'التربية الدينية',
  'الحاسب الآلي',
  'مادة أخرى'
];

const SAMPLE_EXAMS = {
  arabic: {
    subject: 'اللغة العربية',
    grade: 'الصف الأول الإعدادي',
    time: 'ساعتان ونصف',
    content: `أولاً: التعبير: (٨ درجات)
أ) التعبير الوظيفي: اكتب لافتة تحث فيها زملائك على ترشيد استهلاك المياه.
ب) التعبير الإبداعي: اكتب في موضوع واحد (بر الوالدين أو النظافة وحماية البيئة).

ثانياً: القراءة: (١٠ درجات)
من موضوع «الحرية»:
"فالحرية شمس يجب أن تشرق في كل نفس، فمن عاش محروماً منها عاش في ظلمة حالكة..."
١. هات مرادف (حالكة)، ومضاد (الحرية) في جملتين من عندك.
٢. بماذا شبّه الكاتب الحرية في العبارة السابقة؟
٣. دلل من خلال فهمك للموضوع على أن الحيوان يشعر بالحرية كالإنسان.

ثالثاً: النصوص: (١٠ درجات)
من نص «من مكارم الأخلاق»:
قال رسول الله ﷺ: "ما نقص مال من صدقة، وما زاد الله عبداً بعفو إلا عزاً..."
١. ما الفكرة الرئيسة التي يدعو إليها الحديث الشريف؟
٢. وضح الجمال في قول النبي ﷺ: (ما نقص مال من صدقة).
٣. اكتب بقية الحديث الشريف حتى آخره.

رابعاً: النحو: (١٠ درجات)
«الصدق خلق كريم حث عليه ديننا الحنيف، والمسلم الصادق يحبه الله والناس...»
١. أعرب ما تحته خط: (خلق - الحنيف - الناس).
٢. استخرج من الفقرة: فعلاً لازماً، وفعلاً متعدياً، وخبراً وبين نوعه.

خامساً: الخط والإملاء: (٢ درجات)
اكتب ما يلي بخط الرقعة مرة وبخط النسخ مرة: «بالعلم والعمل تبنى الأمم».`
  },
  science: {
    subject: 'العلوم',
    grade: 'الصف الثاني الإعدادي',
    time: 'ساعتان',
    content: `السؤال الأول: (أ) اكتب المصطلح العلمي الدال على كل عبارة: (٥ درجات)
١. الاضطراب الذي ينتقل ويقوم بنقل الطاقة في اتجاه انتشارها. ( .................... )
٢. عناصر تجمع بين خواص الفلزات واللافلزات. ( .................... )
٣. طبقة في الغلاف الجوي تحمي الأرض من الأشعة فوق البنفسجية الضارة. ( .................... )

(ب) علل لما يأتي: (٥ درجات)
١. شذوذ خواص الماء وارتفاع درجة غليانه عن المتوقع.
........................................................................................
٢. يفضل الطيارون التحليق في الجزء السفلي من طبقة الستراتوسفير.
........................................................................................

السؤال الثاني: ضع علامة (✓) أو (✗): (٥ درجات)
١. تزداد الخاصية الفلزية في الدورة الواحدة بزيادة العدد الذري. (   )
٢. الأشعة تحت الحمراء لها تأثير حراري. (   )
٣. الحفرية المرشدة تدل على العمر النسبي للصخور الرسوبية. (   )

السؤال الثالث: مسائل ومقارنات: (٥ درجات)
احسب سرعة انتشار موجة صوتية ترددها ٢٠٠ هرتز وطولها الموجي ١.٧ متر.`
  },
  math: {
    subject: 'الرياضيات',
    grade: 'الصف الأول الإعدادي',
    time: 'ساعتان',
    content: `السؤال الأول: اختر الإجابة الصحيحة مما بين القوسين: (١٠ درجات)
١. إذا كانت س + ٣ = ٧، فإن س = ................
   [ أ) ٢  |  ب) ٣  |  ج) ٤  |  د) ٥ ]
٢. قياس الزاوية القائمة يساوي ................
   [ أ) ٤٥°  |  ب) ٩٠°  |  ج) ١٨٠°  |  د) ٣٦٠° ]
٣. الوسط الحسابي للقيم (٢، ٥، ٨) هو ................
   [ أ) ٥  |  ب) ٦  |  ج) ٧  |  د) ٨ ]
٤. مجموع قياسات الزوايا المتجمعة حول نقطة واحدة يساوي ................
   [ أ) ٩٠°  |  ب) ١٨٠°  |  ج) ٢٧٠°  |  د) ٣٦٠° ]

السؤال الثاني: ضع علامة (✓) أمام الصواب وعلامة (✗) أمام الخطأ: (١٠ درجات)
١. القطران متساويان في الطول ومتعامدان في المربع. (   )
٢. العدد الأولي الزوجي الوحيد هو الرقم ٢. (   )
٣. الزاويتان المتتامتان مجموع قياسهما ١٨٠ درجة. (   )

السؤال الثالث: أجب عن المسألة الآتية: (١٠ درجات)
مستطيل طوله ٦ سم وعرضه ٤ سم، احسب:
أ) محيط المستطيل: ................................................................
ب) مساحة المستطيل: ................................................................`
  },
  social: {
    subject: 'الدراسات الاجتماعية',
    grade: 'الصف الثالث الإعدادي',
    time: 'ساعتان',
    content: `أولاً: الجغرافيا:
السؤال الأول: أمامك خريطة صماء للعالم، وضح ما تدل عليه الأرقام: (٥ درجات)
١. هضبة: ....................................
٢. إقليم مناخي: ....................................
٣. المحيط: ....................................

السؤال الثاني: بم تفسر: (٥ درجات)
١. ضيق السهول الساحلية في شرق قارة أستراليا.
........................................................................................
٢. تعد قارة آسيا أكبر قارات العالم سكاناً.
........................................................................................

ثانياً: التاريخ:
السؤال الثالث: لمن تنسب الأعمال التاريخية الآتية: (٥ درجات)
١. هزم الصفويين في معركة جالديران عام ١٥١٤م. ( .................... )
٢. قاد ثورة القاهرة الأولى ضد الحملة الفرنسية. ( .................... )
٣. أنشأ القناطر الخيرية واهتم بزراعة القطن في مصر. ( .................... )`
  }
};

export function ExamMakerView({ onOpenSettings }) {
  const [image, setImage] = useState(null);
  const [subject, setSubject] = useState('اللغة العربية');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('الصف الأول الإعدادي');
  const [customGrade, setCustomGrade] = useState('');
  const [examTime, setExamTime] = useState('ساعتان');
  const [loading, setLoading] = useState(false);
  const [examContent, setExamContent] = useState('');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const activeSubject = subject === 'مادة أخرى' ? (customSubject || 'مادة دراسية') : subject;
  const activeGrade = grade === 'مرحلة جامعية / أخرى' ? (customGrade || 'صف دراسي') : grade;

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

  const handleGenerateExam = async () => {
    if (!image) {
      setError('يرجى اختيار صورة الأسئلة أولاً.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const generated = await convertToExam(image, {
        subject: activeSubject,
        grade: activeGrade,
        time: examTime
      });
      setExamContent(generated);

      // Auto-save to "مستنداتي"
      saveUserDocument({
        name: `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`,
        type: 'Exam',
        size: `${Math.max(1, Math.round(generated.length / 1024))} KB`,
        pages: `اختبار ${activeSubject} - ${activeGrade}`,
        content: generated
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء معالجة ورقة الامتحان.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    saveUserDocument({
      name: `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`,
      type: 'Exam',
      size: `${Math.max(1, Math.round(examContent.length / 1024))} KB`,
      pages: `اختبار ${activeSubject} - ${activeGrade}`,
      content: examContent
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html lang="ar" dir="rtl">
      <head>
        <title>امتحان ${activeSubject} - ${activeGrade}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Cairo', Tahoma, sans-serif; direction: rtl; line-height: 1.6; color: #000; }
          .header-box { border: 2px solid #000; padding: 12px; margin-bottom: 20px; border-radius: 8px; }
          .header-top { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 8px; }
          .header-fields { display: flex; justify-content: space-between; font-size: 13px; border-top: 1px dashed #666; padding-top: 8px; }
          .content { font-size: 15px; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 30px; font-weight: bold; border-top: 1px solid #000; padding-top: 8px; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div class="header-top">
            <div>جمهورية مصر العربية<br>وزارة التربية والتعليم</div>
            <div style="font-size: 18px; text-align: center;">اختبار مادة: ${activeSubject}<br><span style="font-size: 14px;">${activeGrade}</span></div>
            <div>الزمن: ${examTime}<br>الدرجة العظمى: [ ٤٠ ]</div>
          </div>
          <div class="header-fields">
            <div>اسم الطالب: ....................................................</div>
            <div>رقم الجلوس: ...............</div>
            <div>الفصل: ...........</div>
          </div>
        </div>
        <div class="content">${examContent}</div>
        <div class="footer">«مع أطيب التمنيات بالنجاح والتفوق»</div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const loadSample = (sampleKey) => {
    const s = SAMPLE_EXAMS[sampleKey] || SAMPLE_EXAMS.arabic;
    setSubject(s.subject);
    setGrade(s.grade);
    setExamTime(s.time);
    setExamContent(s.content);
    saveUserDocument({
      name: `نموذج_امتحان_${s.subject}_${s.grade.replace(/\s+/g, '_')}.doc`,
      type: 'Exam',
      size: `${Math.max(1, Math.round(s.content.length / 1024))} KB`,
      pages: `نموذج ${s.subject}`,
      content: s.content
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 text-purple-800 dark:text-purple-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>تم حفظ ورقة الامتحان في قائمة «مستنداتي» تلقائياً! 📁</span>
        </div>
      )}

      {/* Header Info Inputs */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>بيانات ترويسة ورقة الامتحان (لكل المراحل والمواد):</span>
          </h4>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full font-bold">
            جميع الصفوف
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Subject Dropdown & Custom */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 block font-semibold">المادة الدراسية:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              {POPULAR_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {subject === 'مادة أخرى' && (
              <input
                type="text"
                placeholder="اكتب اسم المادة (مثال: علم النفس، كيمياء...)"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full mt-1.5 bg-slate-50 dark:bg-slate-900 border border-purple-300 dark:border-purple-500/50 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              />
            )}
          </div>

          {/* Grade Dropdown & Custom */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 block font-semibold">الصف الدراسي والمرحلة:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
            >
              {POPULAR_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {grade === 'مرحلة جامعية / أخرى' && (
              <input
                type="text"
                placeholder="اكتب الصف أو الفرقة (مثال: أولى كلية تربية...)"
                value={customGrade}
                onChange={(e) => setCustomGrade(e.target.value)}
                className="w-full mt-1.5 bg-slate-50 dark:bg-slate-900 border border-purple-300 dark:border-purple-500/50 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none"
              />
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-slate-500 dark:text-slate-400 font-semibold">زمن الإجابة المحدد:</span>
          <select 
            value={examTime} 
            onChange={(e) => setExamTime(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 font-sans"
          >
            <option value="ساعة واحدة">ساعة واحدة</option>
            <option value="ساعة ونصف">ساعة ونصف</option>
            <option value="ساعتان">ساعتان</option>
            <option value="ساعتان ونصف">ساعتان ونصف</option>
            <option value="ثلاث ساعات">ثلاث ساعات</option>
          </select>
        </div>
      </div>

      {/* Quick Demo Samples */}
      <div className="bg-purple-50/50 dark:bg-purple-500/10 rounded-2xl p-3 border border-purple-100 dark:border-purple-500/20 space-y-2">
        <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>نماذج امتحانات جاهزة للتجربة الفورية لعدة مواد:</span>
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => loadSample('arabic')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition cursor-pointer"
          >
            📖 لغة عربية
          </button>
          <button
            onClick={() => loadSample('science')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition cursor-pointer"
          >
            🔬 علوم
          </button>
          <button
            onClick={() => loadSample('math')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition cursor-pointer"
          >
            📐 رياضيات
          </button>
          <button
            onClick={() => loadSample('social')}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-[11px] font-semibold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition cursor-pointer"
          >
            🌍 دراسات اجتماعية
          </button>
        </div>
      </div>

      {/* Upload Question Photo */}
      <div 
        onClick={() => document.getElementById('exam-photo-upload').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 rounded-3xl p-5 text-center bg-white dark:bg-slate-800/40 transition cursor-pointer shadow-sm dark:shadow-none"
      >
        <input 
          type="file" 
          id="exam-photo-upload" 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange} 
        />
        
        {image ? (
          <div className="space-y-2">
            <img src={image} alt="صورة الأسئلة" className="max-h-40 rounded-xl mx-auto border border-slate-200 dark:border-slate-700 object-contain shadow-sm" />
            <p className="text-xs text-slate-500 dark:text-slate-400">انقر لاستبدال صورة الأسئلة</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">التقط أو ارفع صورة ورقة الأسئلة لأي مادة وأي صف</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">يقوم الذكاء الاصطناعي بإعادة صياغتها وتنظيمها كاختبار رسمي مطبوع</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {image && (
        <button
          onClick={handleGenerateExam}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md shadow-purple-500/20 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جارٍ صياغة امتحان {activeSubject} لـ {activeGrade}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>توليد ورقة امتحان {activeSubject} الرسمية 🔥</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output & Printable Sheet */}
      <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-purple-700 dark:text-purple-300">
            معاينة ورقة الامتحان (قابلة للتعديل والطباعة):
          </span>
          {examContent && (
            <span className="text-[10px] text-slate-400">
              {activeSubject} • {activeGrade}
            </span>
          )}
        </div>

        <textarea
          dir="rtl"
          rows={11}
          value={examContent}
          onChange={(e) => setExamContent(e.target.value)}
          placeholder="سيظهر هيكل الامتحان هنا مقسماً للأسئلة مع خانات الإجابة..."
          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans"
        />

        {examContent && (
          <button
            onClick={handlePrint}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition active:scale-98 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الامتحان / حفظ PDF بحجم A4</span>
          </button>
        )}
      </div>
    </div>
  );
}
