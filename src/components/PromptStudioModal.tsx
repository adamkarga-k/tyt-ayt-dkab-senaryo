import React, { useState } from 'react';
import { X, Sliders, Sparkles, Check, Info, BookOpen } from 'lucide-react';
import { GLOBAL_TRAINING_RULES } from '../config/promptRules';
import type { AppSettings } from '../types';

interface PromptStudioModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (updated: Partial<AppSettings>) => void;
  onClose: () => void;
}

export const PromptStudioModal: React.FC<PromptStudioModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose
}) => {
  const [customRules, setCustomRules] = useState(settings.customPromptRules || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ customPromptRules: customRules });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Sistemi Eğit & Prompt Kural Motoru
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sorular çözülürken uygulanacak MEBİ ve ÖSYM pedagojik direktifleri
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* İçerik */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          
          {/* Bilgi Kutusu */}
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-950 dark:text-purple-200">Sistemi Nasıl Eğitirsiniz?</strong>
              <p className="mt-1">
                Aşağıdaki özel kurallar kutusuna yazdığınız her yönerge (Örn: <em>"Bundan sonra çeldiricileri açıklarken öğrencinin düşebileceği kavram yanılgısını özellikle vurgula"</em> veya <em>"Ayet meallerinde surenin adını belirt"</em>), 
                üretilecek tüm yeni çözüm senaryolarına öncelikli talimat olarak eklenir.
              </p>
            </div>
          </div>

          {/* Aktif Sistem Kuralları (Müfredat ve Pedagoji) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" /> Yerleşik MEBİ & ÖSYM Standart Kuralları (Varsayılan)
            </label>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              {GLOBAL_TRAINING_RULES.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    ✓
                  </span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Özel Eğitim / Ek Direktifler Metin Alanı */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Özel Eğitim ve Kural Girişi
              </label>
              <span className="text-[11px] text-slate-400">
                Tüm yeni çözümlere uygulanır
              </span>
            </div>
            
            <textarea
              rows={5}
              value={customRules}
              onChange={(e) => setCustomRules(e.target.value)}
              placeholder="Örnek: Bundan sonra sorular çözülürken, senaryo oluşturulurken özellikle şu kavramlara dikkat edilsin: Şıkların analizinde 'A şıkkı yanlıştır çünkü...' kalıbı yerine 'A seçeneğinde geçen tevil kavramı ayetteki zahir mana ile uyuşmamaktadır...' şeklinde detaylı gerekçelendirme yapılsın."
              className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans leading-relaxed"
            />
          </div>

          {/* Hızlı Öneri Şablonları */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hızlı Kural Ekleme Butonları:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCustomRules(prev => prev + (prev ? '\n' : '') + '- Ayet ve hadislerde geçen kavramların lise Din Kültürü ders kitabındaki tam terim anlamlarını ver.')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                + Ayet/Hadis Kavramlarını Vurgula
              </button>
              <button
                type="button"
                onClick={() => setCustomRules(prev => prev + (prev ? '\n' : '') + '- Çeldirici şıklardaki kavram yanılgılarını tek tek maddeleyerek anlat.')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                + Çeldirici Yanılgılarını Derinleştir
              </button>
              <button
                type="button"
                onClick={() => setCustomRules(prev => prev + (prev ? '\n' : '') + '- Çözüm sonundaki ÖSYM notunda TYT/AYT çıkmış soru benzerliklerine atıf yap.')}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                + Çıkmış Soru Benzerliği Ekle
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={() => setCustomRules('')}
            className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium"
          >
            Kuralları Sıfırla
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md active:scale-95"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Kaydedildi!</span>
              </>
            ) : (
              <span>Kuralları Sisteme Uygula</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
