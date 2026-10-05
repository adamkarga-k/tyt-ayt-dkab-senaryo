import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import type { AppSettings } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (updated: Partial<AppSettings>) => void;
  onClose: () => void;
  isFirstTime?: boolean;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
  isFirstTime = false
}) => {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [selectedModel, setSelectedModel] = useState(settings.selectedModel || 'gemini-2.5-flash');
  const [activeTab, setActiveTab] = useState<'gemini' | 'others'>('gemini');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      geminiApiKey: apiKey.trim(),
      selectedModel,
      onboardingCompleted: true
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isFirstTime ? 'Hoş Geldiniz! API Kurulum Rehberi' : 'API & Model Yönetimi'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Görsel soru çözümü için API anahtarınızı tanımlayın
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Seçimi */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'gemini'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Google Gemini (Önerilen & Ücretsiz)
          </button>
          <button
            onClick={() => setActiveTab('others')}
            className={`pb-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'others'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Diğer Sağlayıcılar (OpenAI, Claude vb.)
          </button>
        </div>

        {/* İçerik */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          
          {activeTab === 'gemini' ? (
            <>
              {/* Adım Adım Rehber Kutusu */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> 1 Dakikada Ücretsiz API Anahtarı Nasıl Alınır?
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 underline"
                  >
                    Google AI Studio'ya Git <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <ol className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300 list-decimal list-inside leading-relaxed">
                  <li>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-medium underline"
                    >
                      aistudio.google.com/app/apikey
                    </a> adresini açın ve Google hesabınızla giriş yapın.
                  </li>
                  <li>Sayfadaki <strong>"Create API key" (API Anahtarı Oluştur)</strong> butonuna tıklayın.</li>
                  <li>Oluşturulan anahtarı kopyalayın ve aşağıdaki alana yapıştırın.</li>
                  <li><strong>"Kaydet ve Başla"</strong> butonuna basarak sınırsız soru çözümüne başlayın!</li>
                </ol>
              </div>

              {/* API Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Gemini API Anahtarınız (AIzaSy...)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Anahtarınız yalnızca tarayıcınızın yerel hafızasında saklanır.
                </p>
              </div>

              {/* Model Seçimi */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Kullanılacak Vision Modeli
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (En Hızlı, Yüksek Doğruluk ve Önerilen)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Hızlı ve Dengeli)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Klasik Sürüm)</option>
                </select>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                  Diğer Yapay Zeka API Sağlayıcıları Nasıl Eklenir?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Şu an sistemin soru görseli analizi (vision/OCR) ve MEBİ pedagojik doğruluğu en yüksek oranda <strong>Google Gemini Flash</strong> modelleriyle optimize edilmiştir.
                </p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">OpenAI (GPT-4o Vision)</span>
                      <p className="text-[11px] text-slate-500">platform.openai.com üzerinden API anahtarı alınabilir.</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Gelecek Sürüm
                    </span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">Anthropic Claude (Sonnet 3.7)</span>
                      <p className="text-[11px] text-slate-500">console.anthropic.com üzerinden alınabilir.</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      Gelecek Sürüm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Butonları */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            {isFirstTime ? 'Şimdilik Atla / İncele' : 'Vazgeç'}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-white" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <span>Ayarları Kaydet ve Başla</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
