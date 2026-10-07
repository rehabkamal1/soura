import React, { useState } from 'react';
import { 
  HelpCircle, Upload, Printer, FileDown, Sparkles, RefreshCw, 
  AlertCircle, Check, BookOpen, Layers, Copy, Trash2, School, 
  Award, Clock, CheckCircle2, ChevronDown, ChevronUp, Image as ImageIcon
} from 'lucide-react';
import { convertToExam, getApiKey, cleanExamContent } from '../services/geminiService';
import { saveUserDocument } from '../services/storageService';
import { AdBanner } from '../components/AdBanner';
import { useExportAd } from '../context/ExportAdContext';

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
    maxScore: '٤٠',
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
    maxScore: '٤٠',
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
    maxScore: '٣٠',
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
  english: {
    subject: 'اللغة الإنجليزية',
    grade: 'الصف الثالث الإعدادي',
    time: 'ساعتان',
    maxScore: '٣٠',
    content: `A) Language Functions:
1. Finish the following dialogue: (5 Marks)
Ahmed and Omar are talking about their hobbies.
Ahmed: Hello Omar! What is your favourite hobby?
Omar: Hello Ahmed! ................................................................
Ahmed: Reading! What kind of books do you like?
Omar: ............................................................................
Ahmed: Who is your favourite author?
Omar: My favourite author is Naguib Mahfouz.

B) Reading Comprehension:
2. Read the following passage and answer the questions: (6 Marks)
Egypt is one of the most famous tourist destinations in the world. Millions of tourists visit Egypt every year to see the great Pyramids of Giza, the Sphinx, and ancient temples in Luxor and Aswan...
a) Give a suitable title for the passage.
b) Why do tourists come to Egypt?
c) What does the underlined word "destination" mean?

C) Vocabulary and Structure:
3. Choose the correct answer from a, b, c or d: (5 Marks)
1. A ............... is someone who designs buildings.
   [ a) doctor  |  b) architect  |  c) teacher  |  d) farmer ]
2. If it rains tomorrow, we ............... at home.
   [ a) stay  |  b) will stay  |  c) stayed  |  d) staying ]
3. She has lived in Cairo ............... 2015.
   [ a) for  |  b) since  |  c) ago  |  d) in ]

D) Writing:
4. Write a paragraph of about (90) words on: (4 Marks)
"A visit to a historical place in Egypt"`
  },
  social: {
    subject: 'الدراسات الاجتماعية',
    grade: 'الصف الثالث الإعدادي',
    time: 'ساعتان',
    maxScore: '٤٠',
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
  const { triggerExportWithAd } = useExportAd();
  const [image, setImage] = useState(null);
  const [subject, setSubject] = useState('اللغة العربية');
  const [customSubject, setCustomSubject] = useState('');
  const [grade, setGrade] = useState('الصف الأول الإعدادي');
  const [customGrade, setCustomGrade] = useState('');
  const [examTime, setExamTime] = useState('ساعتان');
  const [maxScore, setMaxScore] = useState('٤٠');
  const [schoolName, setSchoolName] = useState('');
  const [adminDept, setAdminDept] = useState('');
  const [termName, setTermName] = useState('امتحان الفصل الدراسي الأول');
  const [showAdvancedHeader, setShowAdvancedHeader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [examContent, setExamContent] = useState('');
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

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
      const cleaned = cleanExamContent(generated);
      setExamContent(cleaned);

      // Auto-save to "مستنداتي"
      saveUserDocument({
        name: `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`,
        type: 'Exam',
        size: `${Math.max(1, Math.round(cleaned.length / 1024))} KB`,
        pages: `اختبار ${activeSubject} - ${activeGrade}`,
        content: cleaned
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء معالجة ورقة الامتحان.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    if (!examContent) return;
    try {
      await navigator.clipboard.writeText(examContent);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch {
      // Fallback
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }
  };

  const handleClear = () => {
    if (examContent && window.confirm('هل تريد مسح محتوى ورقة الامتحان الحالية؟')) {
      setExamContent('');
    }
  };

  const handlePrint = () => {
    const finalCleanContent = cleanExamContent(examContent);

    saveUserDocument({
      name: `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`,
      type: 'Exam',
      size: `${Math.max(1, Math.round(finalCleanContent.length / 1024))} KB`,
      pages: `اختبار ${activeSubject} - ${activeGrade}`,
      content: finalCleanContent
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <title>امتحان ${activeSubject} - ${activeGrade}</title>
        <meta charset="UTF-8">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
        <!-- KaTeX for math formulas -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>
        <style>
          @page { size: A4 portrait; margin: 12mm 14mm 12mm 14mm; }
          * { box-sizing: border-box; }
          body { 
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif; 
            direction: rtl; 
            line-height: 1.85; 
            color: #111827; 
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .exam-container {
            border: 2px solid #000;
            outline: 1px solid #000;
            outline-offset: 3px;
            padding: 16px 20px;
            min-height: 98vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header-box { 
            border: 2px solid #000; 
            padding: 12px 16px; 
            margin-bottom: 18px; 
            border-radius: 8px; 
            background: #fafafa;
          }
          .header-top { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            font-weight: 700; 
            font-size: 13.5px; 
            margin-bottom: 10px; 
          }
          .header-side-right {
            text-align: right;
            line-height: 1.45;
            font-size: 13px;
          }
          .header-title-box {
            font-size: 19px; 
            font-weight: 900;
            text-align: center;
            line-height: 1.35;
          }
          .header-side-left {
            text-align: left;
            line-height: 1.45;
            font-size: 13px;
          }
          .header-fields { 
            display: flex; 
            justify-content: space-between; 
            font-size: 13px; 
            font-weight: 600;
            border-top: 1.5px dashed #374151; 
            padding-top: 8px; 
          }
          .grading-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
            font-size: 11px;
            text-align: center;
          }
          .grading-table th, .grading-table td {
            border: 1px solid #333;
            padding: 3px 6px;
          }
          .grading-table th {
            background: #f3f4f6;
            font-weight: 700;
          }
          .content { 
            font-size: 15px; 
            white-space: pre-wrap; 
            line-height: 1.95;
            font-weight: 500;
            padding: 6px 4px;
            flex-grow: 1;
          }
          .footer { 
            text-align: center; 
            margin-top: 25px; 
            font-weight: 800; 
            border-top: 1.5px solid #111827; 
            padding-top: 8px; 
            font-size: 13.5px; 
            color: #1f2937;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .exam-container { outline-offset: 2px; }
          }
        </style>
      </head>
      <body>
        <div class="exam-container">
          <div>
            <div class="header-box">
              <div class="header-top">
                <div class="header-side-right">
                  <b>جمهورية مصر العربية</b><br>
                  وزارة التربية والتعليم والتعليم الفني<br>
                  ${adminDept ? `إدارة: <b>${adminDept}</b>` : 'إدارة .................... التعليمية'}<br>
                  ${schoolName ? `مدرسة: <b>${schoolName}</b>` : 'مدرسة ....................'}
                </div>
                <div class="header-title-box">
                  <span style="font-size: 14px; color: #4b5563;">${termName}</span><br>
                  اختبار مادة: <span style="text-decoration: underline;">${activeSubject}</span><br>
                  <span style="font-size: 15px; font-weight: 800; color: #1f2937;">${activeGrade}</span>
                </div>
                <div class="header-side-left">
                  الزمن: <b>${examTime}</b><br>
                  الدرجة العظمى: [ <b>${maxScore}</b> ]<br>
                  العام الدراسي: <b>٢٠٢٦ / ٢٠٢٧</b>
                </div>
              </div>

              <div class="header-fields">
                <div>اسم الطالب: ....................................................</div>
                <div>رقم الجلوس: ...............</div>
                <div>الفصل: ...........</div>
              </div>
            </div>

            <!-- Official Grades Distribution Table -->
            <table class="grading-table">
              <tr>
                <th>السؤال</th>
                <td>الأول</td>
                <td>الثاني</td>
                <td>الثالث</td>
                <td>الرابع</td>
                <td>الخامس</td>
                <td>المجموع</td>
                <td>توقيع المصحح</td>
                <td>توقيع المراجع</td>
              </tr>
              <tr>
                <th>الدرجة</th>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp; / ${maxScore}</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </table>

            <div class="content" id="exam-body">${finalCleanContent}</div>
          </div>

          <div class="footer">
            <span>صفحة ( ١ من ١ )</span>
            <span>«مع أطيب التمنيات بالنجاح والتفوق»</span>
            <span>soura-app.web</span>
          </div>
        </div>

        <script>
          window.onload = function() {
            if (typeof renderMathInElement !== 'undefined') {
              renderMathInElement(document.body, {
                delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false}
                ],
                throwOnError: false
              });
            }
            setTimeout(() => { window.print(); }, 250);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadWord = () => {
    if (!examContent) return;
    const finalContent = cleanExamContent(examContent);

    saveUserDocument({
      name: `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`,
      type: 'Exam',
      size: `${Math.max(1, Math.round(finalContent.length / 1024))} KB`,
      pages: `اختبار ${activeSubject} - ${activeGrade}`,
      content: finalContent
    });

    const docHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>امتحان ${activeSubject} - ${activeGrade}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          body { 
            font-family: 'Cairo', 'Traditional Arabic', 'Segoe UI', Tahoma, sans-serif; 
            direction: rtl; 
            text-align: right; 
            line-height: 1.8; 
            font-size: 14pt;
          }
          table.header-box { 
            width: 100%; 
            border: 2px solid #000; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          table.header-box td { 
            padding: 8px 12px; 
            vertical-align: middle; 
          }
          .title { 
            text-align: center; 
            font-size: 16pt; 
            font-weight: bold; 
          }
          table.grades-box {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
            font-size: 11pt;
            text-align: center;
          }
          table.grades-box td, table.grades-box th {
            border: 1px solid #000;
            padding: 4px;
          }
          .content { 
            font-size: 13.5pt; 
            line-height: 2.0; 
            white-space: pre-wrap; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            border-top: 1.5px solid #000; 
            padding-top: 10px; 
            font-weight: bold; 
            font-size: 12pt;
          }
        </style>
      </head>
      <body lang="AR-EG" dir="rtl">
        <table class="header-box" border="1" dir="rtl">
          <tr>
            <td width="33%" align="right">
              <b>جمهورية مصر العربية</b><br>
              <b>وزارة التربية والتعليم والتعليم الفني</b><br>
              ${adminDept ? `إدارة: ${adminDept}<br>` : ''}
              ${schoolName ? `مدرسة: ${schoolName}` : ''}
            </td>
            <td width="34%" class="title">
              <span style="font-size: 12pt;">${termName}</span><br>
              اختبار مادة: ${activeSubject}<br>
              <span style="font-size: 13pt; font-weight: normal;">${activeGrade}</span>
            </td>
            <td width="33%" align="left">
              <b>الزمن: ${examTime}</b><br>
              <b>الدرجة العظمى: [ ${maxScore} ]</b><br>
              العام الدراسي: ٢٠٢٦ / ٢٠٢٧
            </td>
          </tr>
          <tr>
            <td colspan="2" align="right">
              اسم الطالب: ....................................................
            </td>
            <td align="left">
              رقم الجلوس: ............... الفصل: ........
            </td>
          </tr>
        </table>

        <table class="grades-box" border="1" dir="rtl">
          <tr>
            <th>السؤال</th>
            <td>الأول</td>
            <td>الثاني</td>
            <td>الثالث</td>
            <td>الرابع</td>
            <td>المجموع</td>
            <td>توقيع المصحح</td>
          </tr>
          <tr>
            <th>الدرجة</th>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td>&nbsp; / ${maxScore}</td>
            <td>&nbsp;</td>
          </tr>
        </table>

        <div class="content" dir="rtl">
          ${finalContent.replace(/\n/g, '<br/>')}
        </div>

        <div class="footer">
          «مع أطيب التمنيات بالنجاح والتفوق»
        </div>
      </body>
      </html>
    `;

    const fileName = `امتحان_${activeSubject}_${activeGrade.replace(/\s+/g, '_')}.doc`;
    triggerExportWithAd({
      title: 'تصدير وتحميل ورقة الامتحان (Word) 📝',
      fileName,
      onDownload: () => {
        const blob = new Blob(['\ufeff', docHtml], {
          type: 'application/msword;charset=utf-8'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    });
  };

  const loadSample = (sampleKey) => {
    const s = SAMPLE_EXAMS[sampleKey] || SAMPLE_EXAMS.arabic;
    setSubject(s.subject);
    setGrade(s.grade);
    setExamTime(s.time);
    if (s.maxScore) setMaxScore(s.maxScore);
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
      {/* Toast Feedback */}
      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <span>تم حفظ ورقة الامتحان في «مستنداتي» تلقائياً</span>
        </div>
      )}

      {copyFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>تم نسخ نص الامتحان إلى الحافظة بنجاح</span>
        </div>
      )}

      {/* Header Info Inputs */}
      <div className="bg-white dark:bg-slate-800/70 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3.5 transition-colors">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <School className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>بيانات ورقة الامتحان الرسمية (مطابقة للوزارة):</span>
          </h4>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 px-2.5 py-0.5 rounded-full font-bold border border-purple-500/20">
            A4 رسمي
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Subject Dropdown & Custom */}
          <div className="space-y-1">
            <label className="text-slate-600 dark:text-slate-400 block font-semibold text-[11px]">المادة الدراسية:</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans transition"
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
            <label className="text-slate-600 dark:text-slate-400 block font-semibold text-[11px]">الصف الدراسي والمرحلة:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans transition"
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

        {/* Time and Score Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              الزمن:
            </span>
            <select 
              value={examTime} 
              onChange={(e) => setExamTime(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 font-sans text-xs"
            >
              <option value="ساعة واحدة">ساعة واحدة</option>
              <option value="ساعة ونصف">ساعة ونصف</option>
              <option value="ساعتان">ساعتان</option>
              <option value="ساعتان ونصف">ساعتان ونصف</option>
              <option value="ثلاث ساعات">ثلاث ساعات</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-500" />
              الدرجة العظمى:
            </span>
            <input
              type="text"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              placeholder="٤٠"
              className="w-16 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-slate-800 dark:text-slate-200 font-sans text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Advanced School Fields (Collapsible) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvancedHeader(!showAdvancedHeader)}
            className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{showAdvancedHeader ? 'إخفاء' : 'إضافة'} بيانات المدرسة والإدارة (تظهر بالترويسة المطبوعة)</span>
            {showAdvancedHeader ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvancedHeader && (
            <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1">اسم المدرسة:</label>
                <input
                  type="text"
                  placeholder="مثال: مدرسة النصر الرسمية لغات"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1">الإدارة التعليمية:</label>
                <input
                  type="text"
                  placeholder="مثال: إدارة شرق التعليمية"
                  value={adminDept}
                  onChange={(e) => setAdminDept(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-slate-500 dark:text-slate-400 block text-[10px] mb-1">عنوان الامتحان:</label>
                <input
                  type="text"
                  placeholder="مثال: امتحان الفصل الدراسي الأول / امتحان نصف العام"
                  value={termName}
                  onChange={(e) => setTermName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Demo Samples */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>نماذج امتحانات قياسية للمعاينة والتجربة:</span>
          </span>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-500/20">جاهز للطباعة</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => loadSample('arabic')}
            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:border-purple-500/50 dark:hover:border-purple-500/50 transition active:scale-95 cursor-pointer shadow-xs"
          >
            اللغة العربية
          </button>
          <button
            onClick={() => loadSample('science')}
            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:border-purple-500/50 dark:hover:border-purple-500/50 transition active:scale-95 cursor-pointer shadow-xs"
          >
            العلوم
          </button>
          <button
            onClick={() => loadSample('math')}
            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:border-purple-500/50 dark:hover:border-purple-500/50 transition active:scale-95 cursor-pointer shadow-xs"
          >
            الرياضيات
          </button>
          <button
            onClick={() => loadSample('english')}
            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:border-purple-500/50 dark:hover:border-purple-500/50 transition active:scale-95 cursor-pointer shadow-xs"
          >
            اللغة الإنجليزية
          </button>
          <button
            onClick={() => loadSample('social')}
            className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold hover:border-purple-500/50 dark:hover:border-purple-500/50 transition active:scale-95 cursor-pointer shadow-xs"
          >
            الدراسات الاجتماعية
          </button>
        </div>
      </div>

      {/* Upload Question Photo */}
      <div 
        onClick={() => document.getElementById('exam-photo-upload').click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 rounded-3xl p-5 text-center bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition cursor-pointer shadow-sm dark:shadow-none group"
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
            <div className="relative inline-block">
              <img src={image} alt="صورة الأسئلة" className="max-h-44 rounded-2xl mx-auto border border-slate-200 dark:border-slate-700 object-contain shadow-md" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                }}
                className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow transition cursor-pointer"
                title="إلغاء الصورة"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">انقر لاستبدال صورة الأسئلة</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto group-hover:scale-105 transition">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">ارفع أو التقط صورة ورقة الأسئلة</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">تنسيق وصياغة تلقائية وفق المواصفات المعتمدة لأوراق الامتحانات المصرية</p>
          </div>
        )}
      </div>

      {/* Action Button */}
      {image && (
        <>
          {loading && (
            <div className="p-2 rounded-2xl bg-purple-500/5 border border-purple-500/20">
              <AdBanner label="إعلان ممول — جاري تنسيق ورقة الامتحان" />
            </div>
          )}
          <button
            onClick={handleGenerateExam}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-sm shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جارٍ تنسيق امتحان {activeSubject} لـ {activeGrade}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>إعداد وتنسيق ورقة الامتحان</span>
              </>
            )}
          </button>
        </>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Output & Printable Sheet */}
      <div className="bg-white dark:bg-slate-800/70 rounded-3xl p-4 border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-none space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>محرر ورقة الامتحان (جاهزة للتعديل والطباعة):</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {examContent && (
              <>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition text-[10px] flex items-center gap-1 cursor-pointer"
                  title="نسخ النص"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">نسخ</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 text-slate-500 dark:text-slate-400 transition cursor-pointer"
                  title="تفريغ المحتوى"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        <textarea
          dir="rtl"
          rows={12}
          value={examContent}
          onChange={(e) => setExamContent(e.target.value)}
          placeholder="سيظهر هيكل الامتحان هنا مقسماً للأسئلة مع خانات الإجابة..."
          className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 text-xs leading-relaxed text-slate-800 dark:text-slate-200 focus:outline-none focus:border-purple-500 font-sans transition"
        />

        {examContent && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{activeSubject} • {activeGrade}</span>
              <span>{examContent.split(/\s+/).filter(Boolean).length} كلمة • {examContent.length} حرف</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handlePrint}
                className="w-full py-3.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الامتحان / PDF (A4 رسمي)</span>
              </button>

              <button
                onClick={handleDownloadWord}
                className="w-full py-3.5 px-3 rounded-2xl bg-[#1d5fb4] hover:bg-[#18539e] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>تحميل بصيغة Word (.doc)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AdSense Banner */}
      <AdBanner />
    </div>
  );
}
