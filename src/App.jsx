import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { InstallModal } from './components/InstallModal';

import { HomeView } from './views/HomeView';
import { ImageToPdfView } from './views/ImageToPdfView';
import { OcrView } from './views/OcrView';
import { ExamMakerView } from './views/ExamMakerView';
import { CleanSheetView } from './views/CleanSheetView';
import { ExcelTableView } from './views/ExcelTableView';
import { SolverView } from './views/SolverView';
import { DocumentsView } from './views/DocumentsView';
import { ConverterView } from './views/ConverterView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [isInstallOpen, setIsInstallOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateToast, setUpdateToast] = useState(null);
  const [darkMode, setDarkMode] = useState(true);

  const showToast = (message) => {
    setUpdateToast(message);
    setTimeout(() => {
      setUpdateToast(null);
    }, 4000);
  };

  // Initialize Theme and Check if Already Installed (Standalone)
  useEffect(() => {
    const savedTheme = localStorage.getItem('soura_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone === true ||
                            localStorage.getItem('soura_pwa_installed') === 'true';
    if (checkStandalone) {
      setIsInstalled(true);
    }
  }, []);

  // Capture PWA Install Prompt & Instant appinstalled Event
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hasShown = localStorage.getItem('soura_install_prompted');
      if (!hasShown && !isInstalled) {
        setTimeout(() => {
          setIsInstallOpen(true);
          localStorage.setItem('soura_install_prompted', 'true');
        }, 3500);
      }
    };

    // Instant update when app is installed without requiring page refresh
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallOpen(false);
      localStorage.setItem('soura_pwa_installed', 'true');
      showToast('🎉 تم تثبيت تطبيق صورة بنجاح، التطبيق يعمل الآن بأحدث إصدار!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('soura_theme', nextMode ? 'dark' : 'light');
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') setCurrentView('home');
    else if (tabId === 'tools') setCurrentView('converter');
    else if (tabId === 'documents') setCurrentView('documents');
    else if (tabId === 'settings') setCurrentView('settings');
  };

  const handleSelectTool = (toolId) => {
    setCurrentView(toolId);
    setActiveTab('tools');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveTab('home');
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
      {/* Mobile-first centered container */}
      <div className="w-full max-w-md mx-auto min-h-screen flex flex-col bg-white dark:bg-slate-900 shadow-2xl relative border-x border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        
        {/* Header */}
        <Header
          currentView={currentView}
          onBack={handleBackToHome}
          onOpenInstall={() => setIsInstallOpen(true)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          isInstalled={isInstalled}
        />

        {/* Floating Instant Update Toast Notification */}
        {updateToast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-xs font-bold border border-white/20 animate-bounce text-center">
            <span>{updateToast}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 pb-24 overflow-y-auto px-4 py-4 space-y-4">
          {currentView === 'home' && (
            <HomeView onSelectTool={handleSelectTool} onSelectTab={handleTabChange} darkMode={darkMode} />
          )}

          {currentView === 'image-to-pdf' && <ImageToPdfView darkMode={darkMode} />}
          {currentView === 'ocr' && <OcrView onOpenSettings={() => setCurrentView('settings')} darkMode={darkMode} />}
          {currentView === 'exam-maker' && <ExamMakerView onOpenSettings={() => setCurrentView('settings')} darkMode={darkMode} />}
          {currentView === 'clean-sheet' && <CleanSheetView darkMode={darkMode} />}
          {currentView === 'excel' && <ExcelTableView onOpenSettings={() => setCurrentView('settings')} darkMode={darkMode} />}
          {currentView === 'solver' && <SolverView onOpenSettings={() => setCurrentView('settings')} darkMode={darkMode} />}
          {currentView === 'converter' && <ConverterView darkMode={darkMode} />}
          {currentView === 'documents' && <DocumentsView darkMode={darkMode} />}
          {currentView === 'settings' && (
            <SettingsView darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} darkMode={darkMode} />

        {/* PWA Bottom Sheet Install Modal */}
        <InstallModal
          isOpen={isInstallOpen}
          onClose={() => setIsInstallOpen(false)}
          deferredPrompt={deferredPrompt}
          onInstalled={() => {
            setIsInstalled(true);
            showToast('🎉 تم تثبيت تطبيق صورة وتحديثه لآخر إصدار فورياً!');
          }}
        />
      </div>
    </div>
  );
}
