/**
 * Gemini AI Service for Soura using gemini-3.8-flash
 */

const STORAGE_KEY = 'soura_gemini_api_key';
export const DEFAULT_KEY = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) ? import.meta.env.VITE_GEMINI_API_KEY : '';

export function getApiKey() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.trim() && !stored.includes('sQQ') && !stored.includes('gqA')) {
    return stored.trim();
  }
  if (DEFAULT_KEY) {
    localStorage.setItem(STORAGE_KEY, DEFAULT_KEY);
    return DEFAULT_KEY;
  }
  return '';
}

export function saveApiKey(key) {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Call Gemini Vision with gemini-3.8-flash
 */
async function callGeminiVision(imageBase64, prompt, systemInstruction = '') {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('يرجى إدخال مفتاح Gemini API في الإعدادات.');
  }

  // Remove data URL prefix
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const mimeType = imageBase64.startsWith('data:') 
    ? imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'))
    : 'image/jpeg';

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 4096,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  // Primary production models: gemini-1.5-flash is universally available on all keys
  let models = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash-8b',
    'gemini-2.5-flash',
  ];

  // Try dynamic model resolution once if possible
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const validNames = (listData?.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace(/^models\//, ''));
      if (validNames.length > 0) {
        // Prioritize flash models, then pro
        const flashFirst = [
          ...validNames.filter(n => n.includes('flash')),
          ...validNames.filter(n => !n.includes('flash'))
        ];
        models = Array.from(new Set([...flashFirst, ...models]));
      }
    }
  } catch (discoveryErr) {
    // continue with static models
  }

  let lastError = null;

  for (const model of models) {
    // 1. Try with x-goog-api-key header
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const data = await res.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) return textOutput;
      }

      // If model not found (404), overloaded (503), or rate-limited (429): immediately try next model!
      if (res.status === 404 || res.status === 503 || res.status === 429) {
        await new Promise(r => setTimeout(r, 200));
        continue;
      }

      const errJson = await res.json().catch(() => ({}));
      lastError = errJson?.error?.message || `خطأ ${res.status}`;
    } catch (e) {
      lastError = e.message;
    }

    // 2. Try URL query parameter fallback
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (res.ok) {
        const data = await res.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) return textOutput;
      }

      if (res.status === 404 || res.status === 503 || res.status === 429) {
        await new Promise(r => setTimeout(r, 200));
        continue;
      }

      const errJson = await res.json().catch(() => ({}));
      if (errJson?.error?.message) {
        lastError = errJson.error.message;
      }
    } catch (e) {
      // try next model
    }
  }

  throw new Error(lastError || 'فشل الاتصال بالذكاء الاصطناعي.');
}

/**
 * 1. Arabic OCR - Extract Arabic Text with exact formatting
 */
export async function extractArabicOcr(imageBase64) {
  const prompt = `أنت خبير OCR فائق الدقة ومتخصص في اللغة العربية، المناهج والكتب المدرسية المصرية والعربية.
المطلوب:
1. اقرأ جميع النصوص المكتوبة باللغة العربية بدقة متناهية.
2. حافظ على الترتيب والفقرات، والعناوين الرئيسية والفرعية، وأرقام الصفحات.
3. التزم بالأرقام المستخدمة (سواء عربية شرقية ١ ٢ ٣ أو إنجليزية 1 2 3).
4. صحح أي أخطاء طباعية واضحة في الحروف مع الحفاظ على المعنى الأصلي.
5. أخرج النص بتنسيق Markdown عربي منظم وجاهز للقراءة والتعديل مباشرة دون أي مقدمات أو كلام زائد.`;

  return callGeminiVision(imageBase64, prompt);
}

/**
 * Clean and normalize generated exam text to remove duplicate headers, LaTeX code, and AI chatter
 */
export function cleanExamContent(raw) {
  if (!raw) return '';
  let text = raw;

  // 1. Find where the first question starts and cut off all prior chatter, duplicate headers, or preambles
  const firstQuestionMatch = text.match(/(السؤال\s*(الأول|الاول|1)|أولاً|اولاً|س\s*1|1[\.\-\)])/);
  if (firstQuestionMatch) {
    text = text.substring(firstQuestionMatch.index);
  } else {
    // Fallback if not matched: strip chatter and duplicate headers
    text = text.replace(/^(إليك|تفضل|هذه هي|ورقة الامتحان|فيما يلي|مرحباً|أهلاً)[\s\S]*?\n+/i, '');
    text = text.replace(/^[^\n]*جاهز للطباعة[^\n]*\n+/gi, '');
    text = text.replace(/^[^\n]*تنسيق رسمي[^\n]*\n+/gi, '');
    text = text.replace(/^---+\s*\n+/gm, '');
    text = text.replace(/جمهورية مصر العربية[\s\S]*?(اسم الطالب|رقم الجلوس|الفصل|الدرجة)[\.\s\:\-_]*\n+/gi, '');
    text = text.replace(/وزارة التربية والتعليم[\s\S]*?(اسم الطالب|رقم الجلوس|الفصل)[\.\s\:\-_]*\n+/gi, '');
  }

  // 2. Clean broken LaTeX artifacts into clean readable math text:
  // Remove \text{...}
  text = text.replace(/\\?text\{([^}]*)\}/g, '$1');
  text = text.replace(/\\?text\b/g, '');
  // Fractions \frac{a}{b} -> a/b
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2');
  // Superscripts ^2 or {^2} -> ²
  text = text.replace(/\}\^\{?2\}?|\^\{?2\}?|\^2/g, '²');
  text = text.replace(/\}\^\{?3\}?|\^\{?3\}?|\^3/g, '³');
  // Remove standalone $ symbols
  text = text.replace(/\$+/g, '');
  // Clean backslashes and orphaned braces
  text = text.replace(/\\/g, '');
  text = text.replace(/[{}]/g, '');
  // Clean multiple spaces and multiple newlines
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');

  // 3. Strip trailing conversational sign-offs
  text = text.replace(/\n*«?مع أطيب التمنيات بالنجاح والتفوق»?\s*$/i, '');
  text = text.replace(/\n*انتهت الأسئلة\s*$/i, '');

  return text.trim();
}

/**
 * 2. Exam Maker - Convert questions photo into official printable exam sheet
 */
export async function convertToExam(imageBase64, examInfo = {}) {
  const prompt = `أنت خبير ومعلم متخصص في صياغة ورق امتحانات المدارس الرسمية في مصر والعالم العربي لمادة (${examInfo.subject || 'الرياضيات'}) لـ (${examInfo.grade || 'الصف الأول الإعدادي'}).

المطلوب بدقة واحترافية متناهية:
1. **استخراج جميع الأسئلة بلا استثناء:**
   - اقرأ وانقل **كافة الأسئلة والمسائل والتمارين الموجودة في الصورة بالكامل (من السؤال 1 حتى آخر سؤال في الورقة)**.
   - إذا كان في الورقة 8 أسئلة، يجب كتابة الـ 8 أسئلة كاملة دون حذف أو اختصار أي سؤال نهائياً.

2. **قواعد صياغة الرياضيات والأرقام (هام جداً جداً):**
   - **ممنوع منعاً باتاً** استخدام أي أكواد أو رموز LaTeX مثل ($ أو \\text أو \\frac أو \\^ أو غيرها) لأنها تظهر كأكواد برمجية مشوهة عند الطباعة.
   - اكتب الأرقام والرموز الرياضية كنصوص عربية نقية ورموز يونيكود عادية واضحة:
     - الأسس: م²، سم²، س²، ص³ (استخدم الرموز المباشرة ² ، ³)
     - العمليات: × ، ÷ ، + ، - ، = ، √ ، % ، °
     - المجموعات: ∩ (تقاطع)، ∪ (اتحاد)، ∈ (ينتمي)، ∉ (لا ينتمي)، ⊂ (جزئية)، ∅ (فاي)، { 2 ، 3 ، 4 }
     - التناسب والنسب: 3 : 5 أو 1 : 1000
     - المتغيرات: اكتب الحروف واضحة ومستقلة: س، ص، أو x ، y
   - إذا كان هناك شكل هندسي أو رسم (مثل شكل فن Venn diagram): اشرح واكتب معطياته وأسئلته بدقة وبشكل نصي واضح للطلاب.

3. **تنسيق وترتيب الأسئلة للطباعة:**
   - رتب خيارات الاختيار من متعدد في سطر واحد أو بشكل منظم:
     [ أ ] ....     [ ب ] ....     [ ج ] ....     [ د ] ....
   - اترك مساحات نقطية واضحة للإجابة: ( .................... )

4. **شروط إخراج النص:**
   - **لا تكتب ترويسة عليا** (مثل: جمهورية مصر العربية، اسم الطالب، رقم الجلوس) لأنها مدمجة ومطبوعة تلقائياً في التصميم الرسمي.
   - **لا تكتب أي مقدمات أو تحيات أو كلام إضافي نهائياً** (مثل: إليك ورقة الامتحان، تفضل، بالتوفيق، أو فواصل ---).
   - ابدأ فوراً بالسطر الأول للأسئلة:
السؤال الأول: ...`;

  const rawResult = await callGeminiVision(imageBase64, prompt);
  return cleanExamContent(rawResult);
}

/**
 * 3. Table Extractor - Convert sheet image into CSV/Table format
 */
export async function extractTableToCsv(imageBase64) {
  const prompt = `استخرج الجدول أو كشف الأسماء والدرجات من الصورة المرفقة.
أخرج النتيجة بصيغة CSV قياسية فقط (مفصولة بفواصل comma أو فاصلة منقوطة)، بحيث تكون الأعمدة واضحة (مثال: م, الاسم, رقم الجلوس, الدرجة, الملاحظات).
لا تكتب أي كود markdown أو شروحات، فقط أسطر الـ CSV النظيفة لتصديرها مباشرة لإكسيل.`;

  return callGeminiVision(imageBase64, prompt);
}

/**
 * 4. Problem Solver - Step by step solution
 */
export async function solveProblem(imageBase64) {
  const prompt = `أنت معلم متخصص في المناهج التعليمية.
قم بتحليل المسألة أو السؤال في الصورة:
1. اذكر نص المسألة بدقة.
2. اذكر المعطيات والمطلوب.
3. قدّم الحل النموذجي بالتفصيل خطوة بخطوة مع توضيح القوانين المستخدمة.
4. اكتب الناتج النهائي بشكل مميز وواضح.`;

  return callGeminiVision(imageBase64, prompt);
}
