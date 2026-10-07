import { jsPDF } from 'jspdf';
import * as fflate from 'fflate';
import { generateNativeDocxBlob } from './docxOpenXmlService.js';

/**
 * Ensures PDF.js is loaded dynamically if not already present on window
 */
export async function ensurePdfJsLoaded() {
  if (typeof window === 'undefined') return false;
  if (window.pdfjsLib) return true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(true);
      } else {
        resolve(false);
      }
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

/**
 * Decodes Arabic PDF Mojibake where 16-bit Arabic Presentation Forms-B
 * were split into Latin-1 (0xFE / thorn character)
 */
export function fixArabicPdfMojibake(text) {
  if (!text) return '';
  if (!text.includes('þ') && !/[\uFE70-\uFEFC\uFB50-\uFDFF]/.test(text)) {
    return text;
  }

  const cp1252Map = {
    '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87,
    '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8a, '\u2039': 0x8b, '\u0152': 0x8c, '\u017D': 0x8e,
    '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
    '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9a, '\u203A': 0x9b, '\u0153': 0x9c, '\u017E': 0x9e, '\u0178': 0x9f
  };

  let decoded = '';
  let i = 0;
  while (i < text.length) {
    if (text[i] === 'þ' && i + 1 < text.length) {
      const ch = text[i + 1];
      const b2 = cp1252Map[ch] !== undefined ? cp1252Map[ch] : (ch.charCodeAt(0) & 0xFF);
      const code = (0xFE << 8) | b2;
      decoded += String.fromCharCode(code);
      i += 2;
    } else {
      decoded += text[i];
      i++;
    }
  }

  let normalized = decoded.normalize('NFKD');
  const lines = normalized.split('\n');
  const fixedLines = lines.map(line => {
    const tokens = line.split(/(\s+)/);
    return tokens.map(token => {
      if (/[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFC]/.test(token)) {
        return Array.from(token).reverse().join('');
      }
      return token;
    }).join('');
  });

  return fixedLines.join('\n').replace(/þ/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}

/**
 * Extract text and structure from a binary PDF file deterministically:
 * - Sorts items top-to-bottom and left-to-right
 * - Preserves lines and detects table columns via coordinate gaps (\t)
 * - 100% local, zero external network or Gemini dependencies!
 */
export async function extractTextFromPdfFile(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  await ensurePdfJsLoaded();

  let totalPages = 1;
  const pagesText = [];

  if (window.pdfjsLib) {
    try {
      const loadingTask = window.pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
      });
      const pdf = await loadingTask.promise;
      totalPages = pdf.numPages;

      for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(Math.round((i / totalPages) * 85));
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract items with position metadata for layout preservation
        const items = (textContent.items || [])
          .filter(it => it.str && it.str.trim())
          .map(it => ({
            str: it.str,
            x: it.transform[4],
            y: it.transform[5],
            w: it.width || (it.str.length * 6),
          }));

        // Sort: top to bottom (Y descending), left to right (X ascending)
        items.sort((a, b) => {
          if (Math.abs(a.y - b.y) > 4) {
            return b.y - a.y;
          }
          return a.x - b.x;
        });

        // Group into lines based on Y coordinate
        const pageLines = [];
        let currentLine = [];
        let currentY = null;

        for (const it of items) {
          if (currentY === null || Math.abs(it.y - currentY) <= 4) {
            currentLine.push(it);
            currentY = it.y;
          } else {
            if (currentLine.length > 0) {
              pageLines.push(formatLineWithTabs(currentLine));
            }
            currentLine = [it];
            currentY = it.y;
          }
        }
        if (currentLine.length > 0) {
          pageLines.push(formatLineWithTabs(currentLine));
        }

        const pageStr = pageLines.join('\n');
        if (pageStr.trim()) {
          pagesText.push(pageStr.trim());
        }
      }
    } catch (e) {
      console.warn('PDF.js text parse warning:', e);
    }
  }

  let fullText = pagesText.join('\n\n');
  if (fullText.includes('þ')) {
    fullText = fixArabicPdfMojibake(fullText);
  }

  const isScanned = !fullText || fullText.trim().length < 15;
  let pageImages = [];

  // If scanned PDF, generate high-res page images directly without calling Gemini
  if (isScanned) {
    try {
      pageImages = await convertPdfToImages(file, (p) => {
        if (onProgress) onProgress(85 + Math.round(p * 0.15));
      });
    } catch (imgErr) {
      console.warn('Scanned PDF image extraction warning:', imgErr);
    }
  }

  if (onProgress) onProgress(100);

  return {
    numPages: totalPages,
    text: fullText.trim(),
    isScanned,
    pageImages,
  };
}

function formatLineWithTabs(items) {
  let lineStr = '';
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      const prev = items[i - 1];
      const curr = items[i];
      const gap = curr.x - (prev.x + prev.w);
      // If gap is significant, treat as a table column delimiter (\t)
      lineStr += gap > 18 ? '\t' : ' ';
    }
    lineStr += items[i].str;
  }
  return lineStr;
}

/**
 * Render PDF pages to high-res Image Data URLs (PDF to Image)
 */
export async function convertPdfToImages(file, onProgress) {
  const arrayBuffer = await file.arrayBuffer();
  await ensurePdfJsLoaded();

  if (!window.pdfjsLib) {
    throw new Error('تعذر تحميل مكتبة قراءة ملفات الـ PDF.');
  }

  const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const images = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (onProgress) onProgress(Math.round((i / pdf.numPages) * 90));
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // 2x high resolution
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    images.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height
    });
  }

  return images;
}

/**
 * Extract plain text from a Word .docx file using fflate
 */
export async function extractTextFromDocx(file) {
  const arrayBuffer = await file.arrayBuffer();
  return new Promise((resolve) => {
    try {
      const u8 = new Uint8Array(arrayBuffer);
      const unzipped = fflate.unzipSync(u8);
      const docXmlBytes = unzipped['word/document.xml'];
      
      if (!docXmlBytes) {
        const text = new TextDecoder('utf-8', { fatal: false }).decode(u8);
        resolve(cleanExtractedText(text));
        return;
      }

      const xmlStr = new TextDecoder('utf-8').decode(docXmlBytes);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
      const paragraphs = xmlDoc.getElementsByTagName('w:p');
      const lines = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const textNodes = paragraphs[i].getElementsByTagName('w:t');
        let pText = '';
        for (let j = 0; j < textNodes.length; j++) {
          pText += textNodes[j].textContent || '';
        }
        if (pText.trim()) lines.push(pText.trim());
      }

      resolve(lines.join('\n\n'));
    } catch (e) {
      console.warn('Docx extract error:', e);
      const text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(arrayBuffer));
      resolve(cleanExtractedText(text));
    }
  });
}

/**
 * Export text as a 100% native Word (.docx) OpenXML file with table and RTL support
 */
export function exportToWordDocument(text, filename = 'مستند_محول.docx') {
  const safeName = filename.endsWith('.docx') ? filename : filename.replace(/\.doc$/, '') + '.docx';
  const blob = generateNativeDocxBlob({
    title: 'مستند صورة — وورد',
    text: text || 'مستند بدون محتوى',
  });
  triggerFileDownload(blob, safeName);
  return blob;
}

/**
 * Export text as formatted PDF
 */
export function exportToPdfDocument(text, filename = 'مستند_محول.pdf') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 15;
  const pageWidth = 210;
  const maxWidth = pageWidth - (margin * 2);
  const lines = doc.splitTextToSize(text || 'مستند بدون نص', maxWidth);

  let cursorY = 25;
  const lineHeight = 7.5;
  const pageHeight = 297;

  doc.setFontSize(15);
  doc.text('Soura Document — مستند صورة', pageWidth / 2, 14, { align: 'center' });
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString('ar-EG'), margin, 14);

  doc.setFontSize(11);
  for (let i = 0; i < lines.length; i++) {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(lines[i], pageWidth - margin, cursorY, { align: 'right' });
    cursorY += lineHeight;
  }

  const blob = doc.output('blob');
  triggerFileDownload(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  return blob;
}

/**
 * Export CSV / Table as formatted Landscape Table PDF
 */
export function exportTableToPdf(csvOrText, filename = 'جدول_محول.pdf') {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const rows = csvOrText.split('\n').filter(r => r.trim()).map(r => r.split(','));
  const pageWidth = 297;
  const margin = 15;
  const colCount = rows[0] ? rows[0].length : 1;
  const colWidth = (pageWidth - margin * 2) / colCount;

  let startY = 25;
  const rowHeight = 9;

  doc.setFontSize(15);
  doc.text('جدول البيانات المحول — Soura Excel to PDF', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(10);
  rows.forEach((row, rowIndex) => {
    if (startY + rowHeight > 195) {
      doc.addPage();
      startY = 20;
    }

    const isHeader = rowIndex === 0;
    doc.setFillColor(isHeader ? 220 : (rowIndex % 2 === 0 ? 245 : 255), isHeader ? 230 : (rowIndex % 2 === 0 ? 245 : 255), isHeader ? 242 : (rowIndex % 2 === 0 ? 245 : 255));
    doc.rect(margin, startY - 6, pageWidth - margin * 2, rowHeight, 'F');
    doc.rect(margin, startY - 6, pageWidth - margin * 2, rowHeight, 'S');

    row.forEach((cell, colIndex) => {
      const x = pageWidth - margin - (colIndex * colWidth) - (colWidth / 2);
      doc.text((cell || '').trim(), x, startY, { align: 'center' });
    });

    startY += rowHeight;
  });

  const blob = doc.output('blob');
  triggerFileDownload(blob, filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  return blob;
}

/**
 * Export tabular data as CSV (Excel compatible)
 */
export function exportToExcelCsv(text, filename = 'جدول_Excel.csv') {
  const blob = new Blob(['\ufeff', text], {
    type: 'text/csv;charset=utf-8'
  });
  triggerFileDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
  return blob;
}

export function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { document.body.removeChild(a); } catch (e) {}
    URL.revokeObjectURL(url);
  }, 1500);
}

function cleanExtractedText(text) {
  return text
    .replace(/[^\S\r\n]+/g, ' ')
    .replace(/(\r\n|\r|\n){3,}/g, '\n\n')
    .trim();
}

