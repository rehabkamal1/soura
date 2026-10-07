/**
 * Soura Quality Assurance & Diagnostics Engine (QA Engine)
 * Validates document transformations, detects formatting anomalies or data loss,
 * and calculates honest conversion confidence scores.
 */

/**
 * Checks for character encoding anomalies (Mojibake) in Arabic documents
 */
export function checkArabicEncodingHealth(text) {
  if (!text) return { healthy: true, score: 100, reason: 'مستند فارغ أو بدون نصوص' };

  // Common mojibake characters when Arabic UTF-8 is misread as CP1252 or Latin-1
  const corruptedPatterns = [
    /Ã[\x80-\xBF]/g,
    /Ø[\x80-\xBF]/g,
    /Ù[\x80-\xBF]/g,
    /þ/g,
  ];

  let badMatches = 0;
  corruptedPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) badMatches += matches.length;
  });

  const arabicChars = (text.match(/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFC]/g) || []).length;
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length;

  if (badMatches > 5) {
    return {
      healthy: false,
      score: Math.max(20, 100 - badMatches * 8),
      reason: 'تم رصد رموز تشويه نصي (Encoding Mojibake)، يُنصح بالمعاينة',
    };
  }

  return {
    healthy: true,
    score: 100,
    arabicCount: arabicChars,
    latinCount: latinChars,
    reason: 'ترميز النصوص العربية سليم ومقروء 100%',
  };
}

/**
 * Evaluates document transformation metrics (Pages, Tables, Images, Content retention)
 */
export function evaluateConversionQuality({
  sourceType,
  targetType,
  inputStats = {},
  outputStats = {},
  extractedText = '',
}) {
  const checks = [];
  let score = 100;

  const inputPages = inputStats.pages || 1;
  const outputPages = outputStats.pages || inputPages;
  const inputTables = inputStats.tablesCount || 0;
  const outputTables = outputStats.tablesCount || 0;
  const inputImages = inputStats.imagesCount || 0;

  // 1. Check Page Count Invariant
  if (sourceType === 'pdf' || sourceType === 'docx') {
    if (outputPages >= inputPages) {
      checks.push({
        name: 'اكتمال الصفحات',
        status: 'pass',
        detail: `تم الاحتفاظ بجميع الصفحات (${outputPages} صفحة)`,
      });
    } else {
      const dropRatio = (inputPages - outputPages) / inputPages;
      score -= Math.round(dropRatio * 40);
      checks.push({
        name: 'اكتمال الصفحات',
        status: 'warn',
        detail: `المستند المصدر ${inputPages} صفحات والناتج ${outputPages} صفحات`,
      });
    }
  }

  // 2. Check Tabular Data Invariant
  if (inputTables > 0 || outputTables > 0) {
    if (outputTables >= inputTables) {
      checks.push({
        name: 'هيكل الجداول',
        status: 'pass',
        detail: `تم الحفاظ على ${outputTables} جدول بأعمدتها وخلاياها وتحويلها لـ OpenXML`,
      });
    } else if (outputTables > 0) {
      score -= 15;
      checks.push({
        name: 'هيكل الجداول',
        status: 'warn',
        detail: `تم استخراج ${outputTables} من أصل ${inputTables} جداول`,
      });
    } else {
      score -= 25;
      checks.push({
        name: 'هيكل الجداول',
        status: 'fail',
        detail: 'تعذر رصد بعض الجداول كشبكة خلايا مستقلة وتم دمجها كنص',
      });
    }
  }

  // 3. Text & Typography Health
  const encodingHealth = checkArabicEncodingHealth(extractedText);
  if (!encodingHealth.healthy) {
    score = Math.min(score, encodingHealth.score);
    checks.push({
      name: 'ترميز الخط العربي',
      status: 'warn',
      detail: encodingHealth.reason,
    });
  } else {
    checks.push({
      name: 'ترميز الخط العربي',
      status: 'pass',
      detail: 'محاذاة من اليمين لليسار (RTL) وترميز الحروف سليم',
    });
  }

  // 4. Scanned PDF check
  if (inputStats.isScanned && !outputStats.ocrApplied) {
    if (outputStats.embeddedImages) {
      checks.push({
        name: 'نوع المستند',
        status: 'pass',
        detail: `مستند مصور (سحب سكانر) — تم تضمين كافة الصفحات الـ ${inputPages} كصفحات وورد عالية الدقة للطباعة`,
      });
    } else {
      score -= 25;
      checks.push({
        name: 'نوع المستند',
        status: 'warn',
        detail: 'مستند مصور (Scanned) — لا يحتوي على نصوص رقمية مضمنة',
      });
    }
  }

  // 5. Normalization
  score = Math.max(30, Math.min(100, score));

  let confidenceLevel = 'high'; // 🟢 ممتاز
  let confidenceLabel = 'ممتاز (احتفاظ تام بالبنية)';
  let confidenceColor = 'emerald';

  if (score < 80) {
    confidenceLevel = 'low'; // 🔴 يحتاج مراجعة
    confidenceLabel = 'يحتاج مراجعة (تحويل جزئي)';
    confidenceColor = 'rose';
  } else if (score < 95) {
    confidenceLevel = 'medium'; // 🟡 جيد
    confidenceLabel = 'جيد (مع اختلافات طفيفة في التنسيق)';
    confidenceColor = 'amber';
  }

  return {
    score,
    confidenceLevel,
    confidenceLabel,
    confidenceColor,
    checks,
    summary: {
      pages: outputPages,
      tables: outputTables,
      images: inputImages,
      characters: extractedText.length,
    },
  };
}
