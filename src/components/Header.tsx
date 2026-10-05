import React from 'react';
import { BookOpen, HelpCircle, Key, Sliders, Moon, Sun, Download, Upload } from 'lucide-react';
import type { AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  onOpenHowToUse: () => void;
  onOpenApiSettings: () => void;
  onOpenPromptStudio: () => void;
  onToggleTheme: () => void;
  onExportData: () => void;
  onImportData: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenHowToUse,
  onOpenApiSettings,
  onOpenPromptStudio,
  onToggleTheme,
  onExportData,
  onImportData,
  isDarkMode
}) => {
  const hasApiKey = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 0);

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo ve Başlık */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                TYT-AYT Din Kültürü
              </h1>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                MEBİ & ÖSYM Hattı
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Pedagojik Çözüm Senaryosu Üretim ve Yönetim Sistemi
            </p>
          </div>
        </div>

        {/* Aksiyon Butonları */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nasıl Kullanılır? Butonu (Kullanıcı tarafından özellikle istendi) */}
          <button
            onClick={onOpenHowToUse}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-all shadow-sm active:scale-95"
            title="Sistemin nasıl kullanılacağını öğrenin"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Nasıl Kullanılır?</span>
          </button>

          {/* Sistemi Eğit / Prompt Kuralları */}
          <button
            onClick={onOpenPromptStudio}
            className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
            title="Pedagojik kuralları düzenle ve sistemi eğit"
          >
            <Sliders className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden md:inline">Sistemi Eğit</span>
          </button>

          {/* API Anahtarı Durumu & Ayarlar */}
          <button
            onClick={onOpenApiSettings}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all active:scale-95 ${
              hasApiKey
                ? 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800 animate-pulse'
            }`}
            title="Gemini veya diğer API anahtarını yönet"
          >
            <Key className={`w-4 h-4 ${hasApiKey ? 'text-emerald-600' : 'text-amber-600'}`} />
            <span className="hidden sm:inline">
              {hasApiKey ? 'API Hazır' : 'API Gerekli'}
            </span>
          </button>

          {/* Veri Yedekleme Menüsü */}
          <div className="flex items-center border-l border-slate-200 dark:border-slate-800 pl-2 ml-1 gap-1">
            <button
              onClick={onExportData}
              title="Tüm verileri ve soruları JSON olarak dışa aktar (Yedek Al)"
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onImportData}
              title="Daha önce indirdiğiniz JSON yedeğini yükle"
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleTheme}
              title="Aydınlık / Karanlık Mod Değiştir"
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
