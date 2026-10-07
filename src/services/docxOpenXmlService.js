import * as fflate from 'fflate';
import { parseDocumentBlocks } from './markdownTableParser.js';

/**
 * Soura OpenXML Engine v2.0
 * Generates true, native Microsoft Word (.docx) files adhering to ECMA-376 OpenXML standard.
 * Features:
 * - Intelligent Markdown & Tabular parsing: removes :---: and converts <br> to real cell lines
 * - Native RTL support (<w:bidi/>, <w:rtl/>, <w:bidiVisual/>)
 * - Auto-detects wide tables (>7 columns) and switches to A4 Landscape orientation
 * - Standard Cairo & Arial typography with A4 margins
 * - Header, Footer, and OpenXML styling
 */

function escapeXml(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render a table cell with support for multiline text (<w:br/>)
 */
function renderCellContent(text, isHeader) {
  if (!text) {
    return `<w:p><w:pPr><w:bidi/><w:jc w:val="right"/></w:pPr></w:p>`;
  }

  const lines = text.split('\n');
  let runs = '';

  lines.forEach((line, idx) => {
    runs += `
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
          ${isHeader ? '<w:b/><w:color w:val="0F172A"/>' : '<w:color w:val="334155"/>'}
          <w:sz w:val="${isHeader ? '20' : '18'}"/>
          <w:szCs w:val="${isHeader ? '20' : '18'}"/>
          <w:rtl/>
        </w:rPr>
        <w:t xml:space="preserve">${escapeXml(line)}</w:t>
      </w:r>
    `;

    if (idx < lines.length - 1) {
      runs += '<w:r><w:br/></w:r>';
    }
  });

  return `
    <w:p>
      <w:pPr>
        <w:bidi/>
        <w:jc w:val="${isHeader ? 'center' : 'right'}"/>
        <w:spacing w:before="40" w:after="40" w:line="240" w:lineRule="auto"/>
      </w:pPr>
      ${runs}
    </w:p>
  `;
}

/**
 * Builds word/document.xml content from parsed blocks
 */
function buildDocumentXml({ title, blocks }) {
  let bodyContent = '';
  let hasWideTable = false;

  // Title / Document Header if present
  if (title) {
    bodyContent += `
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Heading1"/>
          <w:bidi/>
          <w:jc w:val="center"/>
          <w:spacing w:before="200" w:after="200"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
            <w:b/>
            <w:color w:val="1E3A8A"/>
            <w:sz w:val="32"/>
            <w:szCs w:val="32"/>
            <w:rtl/>
          </w:rPr>
          <w:t>${escapeXml(title)}</w:t>
        </w:r>
      </w:p>
    `;
  }

  // Iterate over parsed blocks
  blocks.forEach((block) => {
    if (block.type === 'heading') {
      const sz = block.level === 1 ? '28' : block.level === 2 ? '24' : '22';
      bodyContent += `
        <w:p>
          <w:pPr>
            <w:bidi/>
            <w:jc w:val="right"/>
            <w:spacing w:before="160" w:after="100"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
              <w:b/>
              <w:color w:val="1E293B"/>
              <w:sz w:val="${sz}"/>
              <w:szCs w:val="${sz}"/>
              <w:rtl/>
            </w:rPr>
            <w:t>${escapeXml(block.text)}</w:t>
          </w:r>
        </w:p>
      `;
    } else if (block.type === 'paragraph') {
      bodyContent += `
        <w:p>
          <w:pPr>
            <w:bidi/>
            <w:jc w:val="right"/>
            <w:spacing w:before="60" w:after="60" w:line="300" w:lineRule="auto"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
              <w:color w:val="334155"/>
              <w:sz w:val="22"/>
              <w:szCs w:val="22"/>
              <w:rtl/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(block.text)}</w:t>
          </w:r>
        </w:p>
      `;
    } else if (block.type === 'table') {
      const colCount = block.maxCols || (block.rows[0] ? block.rows[0].length : 1);
      if (colCount > 7) {
        hasWideTable = true;
      }

      bodyContent += `
        <w:tbl>
          <w:tblPr>
            <w:tblW w:w="5000" w:type="pct"/>
            <w:bidiVisual/>
            <w:tblBorders>
              <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
              <w:left w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
              <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
              <w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
              <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
              <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            </w:tblBorders>
            <w:tblCellMar>
              <w:top w:w="80" w:type="dxa"/>
              <w:left w:w="100" w:type="dxa"/>
              <w:bottom w:w="80" w:type="dxa"/>
              <w:right w:w="100" w:type="dxa"/>
            </w:tblCellMar>
          </w:tblPr>
      `;

      block.rows.forEach((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        bodyContent += `
          <w:tr>
            <w:trPr>
              ${isHeader ? '<w:tblHeader/>' : ''}
              <w:cantSplit/>
            </w:trPr>
        `;

        row.forEach((cellText) => {
          bodyContent += `
            <w:tc>
              <w:tcPr>
                ${isHeader ? '<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>' : ''}
                <w:vAlign w:val="center"/>
              </w:tcPr>
              ${renderCellContent(cellText, isHeader)}
            </w:tc>
          `;
        });

        bodyContent += `</w:tr>`;
      });

      bodyContent += `</w:tbl>`;
      bodyContent += `<w:p><w:pPr><w:spacing w:after="160"/></w:pPr></w:p>`;
    }
  });

  // Footer attribution
  bodyContent += `
    <w:p>
      <w:pPr>
        <w:bidi/>
        <w:jc w:val="center"/>
        <w:spacing w:before="300" w:after="100"/>
        <w:pBdr>
          <w:top w:val="dashed" w:sz="4" w:space="8" w:color="CBD5E1"/>
        </w:pBdr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
          <w:color w:val="94A3B8"/>
          <w:sz w:val="18"/>
          <w:szCs w:val="18"/>
          <w:rtl/>
        </w:rPr>
        <w:t>تم إنشاء الجداول والمستند بواسطة تطبيق Soura — دقة تحويل المستندات الذكية</w:t>
      </w:r>
    </w:p>
  `;

  // Page Setup: If document contains wide tables, use Landscape A4 (16838 x 11906 dxa)
  const isLandscape = hasWideTable;
  const pageWidth = isLandscape ? 16838 : 11906;
  const pageHeight = isLandscape ? 11906 : 16838;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    ${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="${pageWidth}" w:h="${pageHeight}" ${isLandscape ? 'w:orient="landscape"' : ''} w:code="9"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>
      <w:bidi w:val="1"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const DOCUMENT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
</Relationships>`;

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Cairo" w:eastAsia="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:lang w:val="ar-EG" w:eastAsia="ar-EG" w:bidi="ar-EG"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:bidi/>
        <w:jc w:val="right"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
</w:styles>`;

const SETTINGS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="720"/>
  <w:characterSpacingControl w:val="doNotCompress"/>
  <w:compat>
    <w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/>
  </w:compat>
</w:settings>`;

const FONT_TABLE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fontTable xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Cairo">
    <w:pitch w:val="variable"/>
    <w:family w:val="swiss"/>
  </w:font>
  <w:font w:name="Calibri">
    <w:pitch w:val="variable"/>
    <w:family w:val="swiss"/>
  </w:font>
  <w:font w:name="Arial">
    <w:pitch w:val="variable"/>
    <w:family w:val="swiss"/>
  </w:font>
</w:fontTable>`;

function dataUrlToUint8(dataUrl) {
  if (typeof dataUrl !== 'string') return new Uint8Array(0);
  const commaIdx = dataUrl.indexOf(',');
  const b64 = commaIdx >= 0 ? dataUrl.substring(commaIdx + 1) : dataUrl;
  if (typeof atob === 'function') {
    const binaryStr = atob(b64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

/**
 * Generates a DOCX with high-resolution page images embedded (for Scanned PDFs)
 */
export function generateScannedDocxBlob({ title = '', pageImages = [] }) {
  if (!pageImages || pageImages.length === 0) {
    return generateNativeDocxBlob({ title, text: 'مستند بدون صفحات' });
  }

  const first = pageImages[0] || {};
  const isLandscape = Boolean(first.width && first.height && first.width > first.height);
  const pageWidth = isLandscape ? 16838 : 11906;
  const pageHeight = isLandscape ? 11906 : 16838;

  const maxW_emu = isLandscape ? 9600000 : 6400000;
  const maxH_emu = isLandscape ? 6400000 : 9200000;

  let bodyContent = '';

  if (title) {
    bodyContent += `
      <w:p>
        <w:pPr>
          <w:pStyle w:val="Heading1"/>
          <w:bidi/>
          <w:jc w:val="center"/>
          <w:spacing w:before="120" w:after="160"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Cairo" w:hAnsi="Cairo" w:cs="Cairo"/>
            <w:b/>
            <w:color w:val="1E3A8A"/>
            <w:sz w:val="28"/>
            <w:szCs w:val="28"/>
            <w:rtl/>
          </w:rPr>
          <w:t>${escapeXml(title)}</w:t>
        </w:r>
      </w:p>
    `;
  }

  let docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
`;

  const files = {
    '[Content_Types].xml': fflate.strToU8(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
</Types>`),
    '_rels/.rels': fflate.strToU8(RELS_XML),
    'word/styles.xml': fflate.strToU8(STYLES_XML),
    'word/settings.xml': fflate.strToU8(SETTINGS_XML),
    'word/fontTable.xml': fflate.strToU8(FONT_TABLE_XML),
  };

  pageImages.forEach((img, idx) => {
    const relId = `rIdImg${idx + 1}`;
    const mediaName = `image${idx + 1}.jpeg`;

    docRels += `  <Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${mediaName}"/>\n`;
    files[`word/media/${mediaName}`] = dataUrlToUint8(img.dataUrl);

    const w = img.width || 1200;
    const h = img.height || 1600;
    let renderW = maxW_emu;
    let renderH = Math.round((h / w) * renderW);
    if (renderH > maxH_emu) {
      renderH = maxH_emu;
      renderW = Math.round((w / h) * renderH);
    }

    bodyContent += `
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="0" w:after="60"/>
        </w:pPr>
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
              <wp:extent cx="${renderW}" cy="${renderH}"/>
              <wp:effectExtent l="0" t="0" r="0" b="0"/>
              <wp:docPr id="${idx + 1}" name="Page ${img.pageNumber || (idx + 1)}"/>
              <wp:cNvGraphicFramePr>
                <a:graphicFrameLocks noChangeAspect="1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
              </wp:cNvGraphicFramePr>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="${idx + 1}" name="Page ${img.pageNumber || (idx + 1)}"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="${relId}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${renderW}" cy="${renderH}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
      </w:p>
    `;

    if (idx < pageImages.length - 1) {
      bodyContent += `<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:br w:type="page"/></w:r></w:p>`;
    }
  });

  docRels += '</Relationships>';
  files['word/_rels/document.xml.rels'] = fflate.strToU8(docRels);

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyContent}
    <w:sectPr>
      <w:pgSz w:w="${pageWidth}" w:h="${pageHeight}" ${isLandscape ? 'w:orient="landscape"' : ''} w:code="9"/>
      <w:pgMar w:top="540" w:right="540" w:bottom="540" w:left="540" w:header="360" w:footer="360" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  files['word/document.xml'] = fflate.strToU8(documentXml);

  const zipped = fflate.zipSync(files, { level: 4 });
  return new Blob([zipped], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * Generates a standard binary .docx Blob
 */
export function generateNativeDocxBlob({ title = '', text = '', tables = [], blocks = null, pageImages = [] }) {
  if (pageImages && pageImages.length > 0 && (!blocks || blocks.length === 0) && (!text || text.trim().length === 0) && (!tables || tables.length === 0)) {
    return generateScannedDocxBlob({ title, pageImages });
  }

  let docBlocks = blocks;

  if (!docBlocks) {
    if (text) {
      docBlocks = parseDocumentBlocks(text);
    } else if (tables && tables.length > 0) {
      docBlocks = tables.map(tbl => ({
        type: 'table',
        rows: tbl,
        maxCols: tbl[0] ? tbl[0].length : 1,
      }));
    } else {
      docBlocks = [];
    }
  }

  const documentXml = buildDocumentXml({ title, blocks: docBlocks });

  const files = {
    '[Content_Types].xml': fflate.strToU8(CONTENT_TYPES_XML),
    '_rels/.rels': fflate.strToU8(RELS_XML),
    'word/_rels/document.xml.rels': fflate.strToU8(DOCUMENT_RELS_XML),
    'word/document.xml': fflate.strToU8(documentXml),
    'word/styles.xml': fflate.strToU8(STYLES_XML),
    'word/settings.xml': fflate.strToU8(SETTINGS_XML),
    'word/fontTable.xml': fflate.strToU8(FONT_TABLE_XML),
  };

  const zipped = fflate.zipSync(files, { level: 6 });

  return new Blob([zipped], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}
