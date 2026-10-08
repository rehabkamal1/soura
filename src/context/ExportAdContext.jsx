import React, { createContext, useContext, useState } from 'react';
import { ExportAdModal } from '../components/ExportAdModal';

const ExportAdContext = createContext(null);

export function ExportAdProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: 'جاري تصدير وتنزيل الملف',
    fileName: '',
    onDownload: null
  });

  const triggerExportWithAd = ({ title, fileName, onDownload }) => {
    setModalState({
      isOpen: true,
      title: title || 'جاري تجهيز وتصدير الملف',
      fileName: fileName || '',
      onDownload
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ExportAdContext.Provider value={{ triggerExportWithAd }}>
      {children}
      <ExportAdModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onDownload={modalState.onDownload}
        title={modalState.title}
        fileName={modalState.fileName}
      />
    </ExportAdContext.Provider>
  );
}

export function useExportAd() {
  const context = useContext(ExportAdContext);
  if (!context) {
    // Fallback: direct download execution if outside provider
    return {
      triggerExportWithAd: ({ onDownload }) => {
        if (onDownload) onDownload();
      }
    };
  }
  return context;
}

