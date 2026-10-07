/**
 * Soura Document Storage Service
 * Uses IndexedDB for reliable, unlimited local storage of PDFs, images, and text
 * With localStorage fallback for instant sync and offline reliability
 */

const DB_NAME = 'soura_documents_db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';
const LS_KEY = 'soura_saved_documents';

// Helper to open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      console.warn('IndexedDB open error, falling back to localStorage:', req.error);
      resolve(null);
    };
  });
}

// Get lightweight metadata list from localStorage
export function getUserDocuments() {
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading documents from localStorage:', e);
    return [];
  }
}

// Retrieve full document (including large dataUrl or blob) by ID
export async function getDocumentFull(id) {
  try {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }
  } catch (e) {
    console.warn('Error reading from IndexedDB:', e);
  }

  // Fallback to localStorage
  const list = getUserDocuments();
  return list.find((d) => d.id === id) || null;
}

// Save document to both IndexedDB (full data) and localStorage (metadata)
export async function saveUserDocument({ name, type, size, pages, content, dataUrl }) {
  const docId = 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(5);
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const fullDoc = {
    id: docId,
    name: name || `مستند_جديد_${now.toLocaleDateString('ar-EG')}`,
    type: type || 'PDF', // 'PDF' | 'Exam' | 'Text' | 'Excel' | 'Image'
    size: size || '1.0 MB',
    pages: pages || 'صفحة واحدة',
    content: content || '',
    dataUrl: dataUrl || '',
    time: timeFormatted,
    createdAt: now.toISOString()
  };

  // 1. Try to save full document into IndexedDB
  try {
    const db = await openDB();
    if (db) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(fullDoc);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e);
      });
    }
  } catch (err) {
    console.warn('Failed to save in IndexedDB:', err);
  }

  // 2. Save metadata (and short text content) into localStorage
  try {
    const existing = getUserDocuments();
    // Exclude large dataUrl from localStorage to avoid QuotaExceededError
    const metaDoc = {
      ...fullDoc,
      dataUrl: dataUrl && dataUrl.length < 50000 ? dataUrl : ''
    };
    const updated = [metaDoc, ...existing.filter((d) => d.id !== docId).slice(0, 49)];
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('LocalStorage quota warning, trimming cache:', e);
    try {
      // If quota exceeded, strip all large content and keep last 20
      const existing = getUserDocuments();
      const slim = [
        { id: fullDoc.id, name: fullDoc.name, type: fullDoc.type, size: fullDoc.size, pages: fullDoc.pages, time: fullDoc.time, createdAt: fullDoc.createdAt },
        ...existing.slice(0, 19).map(d => ({ id: d.id, name: d.name, type: d.type, size: d.size, pages: d.pages, time: d.time, createdAt: d.createdAt }))
      ];
      localStorage.setItem(LS_KEY, JSON.stringify(slim));
    } catch (ignore) {}
  }

  // Trigger custom event so open views reactively update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('soura_documents_changed'));
  }

  return fullDoc;
}

// Delete document from both stores
export async function deleteUserDocument(id) {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
    }
  } catch (e) {
    console.warn('IndexedDB delete error:', e);
  }

  try {
    const existing = getUserDocuments();
    const updated = existing.filter((doc) => doc.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('soura_documents_changed'));
    }
    return updated;
  } catch (e) {
    console.error('Error deleting document:', e);
    return [];
  }
}

// Clear all documents
export async function clearUserDocuments() {
  try {
    const db = await openDB();
    if (db) {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    }
  } catch (e) {}

  localStorage.removeItem(LS_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('soura_documents_changed'));
  }
}

// Safely trigger download (handles blob URLs, data URLs, and plain text/csv)
export async function triggerDownload(doc) {
  let targetDoc = doc;

  // If no inline dataUrl or content, fetch from IndexedDB
  if (!targetDoc.dataUrl && !targetDoc.content && targetDoc.id) {
    const full = await getDocumentFull(targetDoc.id);
    if (full) targetDoc = full;
  }

  if (targetDoc.dataUrl) {
    downloadViaAnchor(targetDoc.dataUrl, targetDoc.name);
    return;
  }

  if (targetDoc.content) {
    const isDoc = targetDoc.name.endsWith('.doc');
    const isCsv = targetDoc.name.endsWith('.csv') || targetDoc.type === 'Excel';
    const mime = isDoc ? 'application/msword' : (isCsv ? 'text/csv;charset=utf-8' : 'text/plain;charset=utf-8');
    
    // Create UTF-8 blob with BOM for Arabic support
    const blob = new Blob(['\ufeff', targetDoc.content], { type: mime });
    
    // Convert blob to Data URI to prevent "blob loaded over insecure connection" HTTP warnings in Chrome!
    const reader = new FileReader();
    reader.onload = () => {
      downloadViaAnchor(reader.result, targetDoc.name);
    };
    reader.readAsDataURL(blob);
    return;
  }

  alert(`المستند "${targetDoc.name}" مسجل بنجاح في سجل مستنداتك.`);
}

function downloadViaAnchor(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'document';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
    } catch (e) {}
  }, 500);
}
