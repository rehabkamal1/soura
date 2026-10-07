/**
 * Markdown & Tabular Data Parser for Soura
 * Converts raw OCR or text output (which may contain Markdown tables, tab-separated columns,
 * alignment markers like :---:, and <br> tags) into structured document blocks:
 * - paragraphs
 * - headings
 * - tables (with real rows and cells)
 */

export function isMarkdownDividerRow(line) {
  if (!line) return false;
  const trimmed = line.trim();
  // Match lines consisting solely of table dividers like :---:, :---, ---:, :-:, ---
  const tokens = trimmed.split(/[\t|]/).map(t => t.trim()).filter(Boolean);
  if (tokens.length === 0) {
    return /^[\s|:-]+$/.test(trimmed) && trimmed.includes('-');
  }
  return tokens.every(t => /^:?-+:?$/.test(t));
}

export function cleanCellText(cell) {
  if (!cell) return '';
  return cell
    .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to actual newline
    .replace(/&nbsp;/gi, ' ')
    .replace(/\*\*(.*?)\*\*/g, '$1') // Strip bold markdown asterisks
    .replace(/\*(.*?)\*/g, '$1')     // Strip italic markdown asterisks
    .trim();
}

export function parseTableRow(line) {
  if (!line || isMarkdownDividerRow(line)) return null;

  const hasTabs = line.includes('\t');
  const hasPipes = line.includes('|');
  if (!hasTabs && !hasPipes) return null;

  const separator = hasTabs ? '\t' : '|';
  const rawCells = line.split(separator);

  const cleaned = rawCells
    .map(c => cleanCellText(c))
    .filter((c, idx, arr) => {
      // If pipe table, ignore leading and trailing empty split items
      if (hasPipes && (idx === 0 || idx === arr.length - 1) && c === '') {
        return false;
      }
      return true;
    });

  return cleaned.length >= 2 ? cleaned : null;
}

/**
 * Parses full document text into an array of structured blocks:
 * [
 *   { type: 'heading', level: 1, text: '...' },
 *   { type: 'paragraph', text: '...' },
 *   { type: 'table', rows: [['م', 'الاسم'], ['1', 'أحمد']], maxCols: 2 }
 * ]
 */
export function parseDocumentBlocks(fullText) {
  if (!fullText) return [];

  const rawLines = fullText.split('\n');
  const blocks = [];
  let currentTableRows = [];

  const flushTable = () => {
    if (currentTableRows.length > 0) {
      const maxCols = Math.max(...currentTableRows.map(r => r.length));
      // Normalize row lengths so all rows have the same number of cells
      const normalizedRows = currentTableRows.map(row => {
        const diff = maxCols - row.length;
        if (diff > 0) {
          return [...row, ...Array(diff).fill('')];
        }
        return row;
      });

      blocks.push({
        type: 'table',
        rows: normalizedRows,
        maxCols,
      });
      currentTableRows = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Skip empty lines
    if (!trimmed) {
      flushTable();
      continue;
    }

    // Skip table divider rows completely! (:---:, :---, :-:, etc.)
    if (isMarkdownDividerRow(trimmed)) {
      continue;
    }

    // Try parsing as table row
    const tableCells = parseTableRow(trimmed);
    if (tableCells) {
      currentTableRows.push(tableCells);
      continue;
    }

    // Not a table row -> Flush any active table
    flushTable();

    // Check for headings
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: trimmed.replace(/^#\s*/, '') });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.replace(/^##\s*/, '') });
    } else if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.replace(/^###\s*/, '') });
    } else {
      // Normal paragraph
      const cleanP = cleanCellText(trimmed);
      if (cleanP) {
        blocks.push({ type: 'paragraph', text: cleanP });
      }
    }
  }

  flushTable();
  return blocks;
}
