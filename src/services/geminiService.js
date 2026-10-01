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

  // Active models verified to work with the user's API key without 503 or deprecation errors
  const models = [
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest'
  ];

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
 * 2. Exam Maker - Convert questions photo into official printable exam sheet
 */
export async function convertToExam(imageBase64, examInfo = {}) {
  const prompt = `حلل صورة ورقة الأسئلة المرفقة، وحوّلها إلى ورقة امتحان مدرسية رسمية جاهزة للطباعة والتوزيع على الطلاب.
معلومات الترويسة:
المادة: ${examInfo.subject || 'غير محدد'}
الصف: ${examInfo.grade || 'غير محدد'}
الزمن: ${examInfo.time || 'ساعتان'}

المطلوب إخراج النص بتنسيق ورقة امتحان رسمية تحتوي على:
1. ترويسة عليا منظمة (جمهورية مصر العربية - وزارة التربية والتعليم - خانة لاسم الطالب ورقم الجلوس والدرجة).
2. الأسئلة مصنفة بدقة:
   - السؤال الأول: اختر الإجابة الصحيحة مع خيارات مرتبة أ)، ب)، ج)، د)
   - السؤال الثاني: ضع علامة (✓) أو (✗)
   - الأسئلة المقالية أو المسائل الحسابية مع ترك مساحة للنقط [........]
3. أخرج النتيجة بتنسيق منسق وواضح مباشرة.`;

  return callGeminiVision(imageBase64, prompt);
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
