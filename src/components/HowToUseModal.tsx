import React from 'react';
import { X, Key, UploadCloud, Cpu, Edit3, FolderTree, Sliders, CheckCircle2 } from 'lucide-react';

interface HowToUseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApiSettings: () => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({
  isOpen,
  onClose,
  onOpenApiSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Başlığı */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center justify-center font-bold">
              📚
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Sistem Nasıl Kullanılır? (Detaylı Kılavuz)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                TYT-AYT Din Kültürü Çözüm Senaryoları Üretim Hattı Kullanım Rehberi
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

        {/* Modal İçerik (Kaydırılabilir) */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Adım 1 */}
          <div className="flex gap-4 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-600" /> Gemini API Anahtarınızı Tanımlayın
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Sistem, görsel soruları yüksek pedagojik hassasiyetle okumak için Google Gemini Vision modelini kullanır. 
                Google AI Studio üzerinden <strong>tamamen ücretsiz</strong> alacağınız API anahtarı yalnızca sizin tarayıcınızda (yerel) saklanır; hiçbir yabancı sunucuya gitmez.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenApiSettings();
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white dark:bg-slate-800 rounded-md border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                API Anahtarı Girişi & Rehberi Aç →
              </button>
            </div>
          </div>

          {/* Adım 2 */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-600" /> Klasörleme ve Test Düzeni Oluşturun
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Sol panelden dilediğiniz kadar klasör açabilirsiniz (Örn: <em>"TYT Tarama Testi 1"</em>, <em>"AYT Deneme 3"</em>, <em>"Kader ve Tevekkül Özel Sorular"</em>). 
                Sorularınız asla birbirine karışmaz. İstediğiniz soruyu sonradan farklı bir klasöre kolayca taşıyabilirsiniz.
              </p>
            </div>
          </div>

          {/* Adım 3 */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-purple-600" /> Çoklu Görsel Yükleyin (15 - 35+ Görsel)
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Yükleme alanına 15, 25 veya 35 görseli tek seferde sürükleyip bırakın veya dosya seçiciyle yükleyin. 
                Görseller anında seçili klasörünüze kaydedilir ve görsel kartları halinde sıraya dizilir.
              </p>
            </div>
          </div>

          {/* Adım 4 */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 font-bold">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-600" /> "Üretim Hattını Başlat" ile Sırayla Çözdürün
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                <strong>"Sırayla Çözüm Hattını Başlat"</strong> butonuna bastığınızda, sistem her bir soruyu API kota sınırlarını aşmayacak şekilde güvenli aralıklarla sırayla çözer. 
                İlerleme çubuğunda kaçıncı sorunun çözüldüğünü canlı olarak görebilir, dilerseniz durdurup devam ettirebilirsiniz.
              </p>
            </div>
          </div>

          {/* Adım 5 */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold">
              5
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-600" /> Senaryoyu Düzenleyin, Kopyalayın ve İndirin
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Üretilen senaryolar MEBİ & ÖSYM formatındadır (Konu Kazanımı, Soru Kökü Analizi, Doğru Cevap Gerekçesi, Çeldirici Şıkların Neden Elendiği ve ÖSYM Pedagojik Notu). 
                İstediğiniz cümleyi doğrudan kart üzerinde tıklayıp düzenleyebilir, tek tıkla panoya kopyalayabilir veya yazdırabilirsiniz.
              </p>
            </div>
          </div>

          {/* Adım 6 */}
          <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="h-9 w-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
              6
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-rose-600" /> Sistemi Eğitmeye Devam Edin (Prompt Studio)
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Sisteme yeni bir kural öğretmek istediğinizde (Örn: <em>"Ayet meallerini Diyanet İşleri Başkanlığı çevirisine göre açıkla"</em> veya <em>"Çeldiricileri 2'şer cümleyle sınırla"</em>), 
                <strong>"Sistemi Eğit"</strong> panelinden direkt kuralınızı yazabilirsiniz. Tüm yeni çözümlerde sistem bu kuralı öncelikli olarak uygular.
              </p>
            </div>
          </div>

          {/* Güvenlik & Kalıcılık Notu */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong>Veri Kaybı Yok:</strong> Tarayıcıyı kapatsanız, bilgisayarı yeniden başlatsanız dahi tüm klasörleriniz, görselleriniz ve yazdığınız senaryolar tarayıcının IndexedDB hafızasında saklanır. Ayrıca Header'daki <strong>İndir/Yükle</strong> butonlarıyla tüm arşivinizi tek tıkla yedekleyebilirsiniz.
            </p>
          </div>

        </div>

        {/* Modal Alt Kısım */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm active:scale-95"
          >
            Anladım, Başlayalım!
          </button>
        </div>

      </div>
    </div>
  );
};
