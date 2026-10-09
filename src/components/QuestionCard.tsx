import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  FolderInput,
  Trash2,
  Maximize2,
  Edit3,
  Save,
  BookOpen,
  Sparkles,
  XCircle,
  Scissors
} from 'lucide-react';
import type { QuestionItem } from '../types';

interface QuestionCardProps {
  question: QuestionItem;
  folderName: string;
  onUpdateScenario: (questionId: string, updatedText: string) => void;
  onSelectCorrectAnswer: (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E' | 'auto') => void;
  onRegenerate: (question: QuestionItem) => void;
  onShortenScenario: (question: QuestionItem) => Promise<void>;
  onCancelProcessing: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  onOpenMoveModal: (question: QuestionItem) => void;
  onOpenImageModal: (imageSrc: string, title: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  folderName,
  onUpdateScenario,
  onSelectCorrectAnswer,
  onRegenerate,
  onShortenScenario,
  onCancelProcessing,
  onDelete,
  onOpenMoveModal,
  onOpenImageModal
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(question.scenario?.fullText || '');
  const [copied, setCopied] = useState(false);
  const [isShortening, setIsShortening] = useState(false);

  const selectedAnswer = question.correctAnswer || question.scenario?.correctOption || 'auto';

  const handleCopy = () => {
    if (question.scenario?.fullText) {
      navigator.clipboard.writeText(question.scenario.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShorten = async () => {
    if (!question.scenario?.fullText) return;
    setIsShortening(true);
    try {
      await onShortenScenario(question);
    } finally {
      setIsShortening(false);
    }
  };

  const handleSaveEdit = () => {
    onUpdateScenario(question.id, editedText);
    setIsEditing(false);
  };

  const statusBadge = () => {
    switch (question.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Senaryo Hazır
          </span>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-300 dark:border-blue-800 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> Çözüm Üretiliyor...
            </span>
            <button
              onClick={() => onCancelProcessing(question.id)}
              title="İşlemi İptal Et / Sıfırla"
              className="p-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-full transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Hata Oluştu
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-500" /> Sırada Bekliyor
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col xl:flex-row">
      
      {/* Sol Panel: Soru Görseli ve Görsel Kontrolleri */}
      <div className="xl:w-80 shrink-0 p-4 bg-slate-50 dark:bg-slate-800/40 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate max-w-[170px]" title={question.title}>
              {question.title}
            </span>
            {statusBadge()}
          </div>

          {/* Görsel Çerçevesi */}
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 flex items-center justify-center min-h-[220px] max-h-[320px]">
            <img
              src={question.imageBase64}
              alt={question.title}
              className="max-h-[300px] w-auto object-contain cursor-pointer transition-transform group-hover:scale-[1.02]"
              onClick={() => onOpenImageModal(question.imageBase64, question.title)}
            />
            {/* Üzerine gelince büyüteç butonu */}
            <button
              onClick={() => onOpenImageModal(question.imageBase64, question.title)}
              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity gap-1.5 font-semibold text-xs backdrop-blur-[2px]"
            >
              <Maximize2 className="w-4 h-4" /> Büyüt ve İncele
            </button>
          </div>

          {/* Doğru Cevap Seçim Barı (A, B, C, D, E) */}
          <div className="mt-3 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Doğru Cevap:
              </span>
              <span className="text-[10px] text-slate-400">
                {question.correctAnswer && question.correctAnswer !== 'auto'
                  ? `Belirlendi (${question.correctAnswer})`
                  : 'Yapay Zeka Tespiti'}
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {(['A', 'B', 'C', 'D', 'E'] as const).map(opt => {
                const isSelected = selectedAnswer === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onSelectCorrectAnswer(question.id, opt)}
                    className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-105'
                        : 'bg-slate-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                    title={`Doğru cevabı ${opt} olarak belirle`}
                  >
                    {opt}
                  </button>
                );
              })}
              <button
                onClick={() => onSelectCorrectAnswer(question.id, 'auto')}
                className={`py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                  selectedAnswer === 'auto'
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-slate-800'
                    : 'bg-slate-50 dark:bg-slate-700/60 text-slate-500 border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
                title="Yapay zeka kendisi tespit etsin"
              >
                Oto
              </button>
            </div>
          </div>
        </div>

        {/* Görsel Altı Bilgi & Hızlı İşlemler */}
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span className="truncate max-w-[180px] text-[11px]" title={`Klasör: ${folderName}`}>
            📁 {folderName}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenMoveModal(question)}
              className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Soruyu Farklı Klasöre Taşı"
            >
              <FolderInput className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Soruyu Sil"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sağ Panel: Çözüm Senaryosu ve Düzenleme Alanı */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        
        {/* Üst Bilgi Barı */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Din Kültürü ve Ahlak Bilgisi Çözüm Senaryosu
              </h3>
              {question.scenario?.correctOption && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  Doğru Seçenek: {question.scenario.correctOption}
                </span>
              )}
            </div>
          </div>

          {/* Senaryo Aksiyon Butonları */}
          <div className="flex items-center gap-1.5">
            {question.status === 'completed' && (
              <>
                <button
                  onClick={handleShorten}
                  disabled={isShortening}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-purple-700 hover:text-purple-900 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition-colors disabled:opacity-50"
                  title="Soru kökünü ve öncülleri bozmadan sadece izahları kısalt (Hızlı Video Versiyonu)"
                >
                  <Scissors className={`w-3.5 h-3.5 text-purple-600 dark:text-purple-400 ${isShortening ? 'animate-spin' : ''}`} />
                  <span>{isShortening ? 'Kısaltılıyor...' : 'Senaryoyu Kısalt'}</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  title="Senaryoyu Panoya Kopyala"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setEditedText(question.scenario?.fullText || '');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  title="Senaryoyu Düzenle"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isEditing ? 'İptal' : 'Düzenle'}</span>
                </button>
              </>
            )}

            <button
              onClick={() => onRegenerate(question)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 transition-colors"
              title="Yeniden Çözüm Senaryosu Üret"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${question.status === 'processing' ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yeniden Üret</span>
            </button>
          </div>
        </div>

        {/* Senaryo Metin Alanı */}
        <div className="py-4 flex-1">
          {question.status === 'processing' ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Görsel analiz ediliyor ve MEBİ-ÖSYM pedagojisine uygun senaryo hazırlanıyor...
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kavramlar, ayet/hadis tahlili ve çeldirici analizleri derleniyor.
                </p>
              </div>

              {/* Takılma Önleyici İptal ve Yeniden Başlat Butonları */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => onCancelProcessing(question.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>İşlemi İptal Et / Sıfırla</span>
                </button>
                <button
                  onClick={() => onRegenerate(question)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 transition-colors shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Yeniden Başlat</span>
                </button>
              </div>
            </div>
          ) : question.status === 'error' ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Çözüm üretilirken bir sorun oluştu:</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                {question.errorMessage || 'Yapay zeka yanıt veremedi. Lütfen API anahtarınızı kontrol edip tekrar deneyin.'}
              </p>
              <button
                onClick={() => onRegenerate(question)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Tekrar Dene
              </button>
            </div>
          ) : question.scenario ? (
            isEditing ? (
              <div className="space-y-3">
                <textarea
                  rows={14}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-sans bg-slate-50/70 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800 select-text">
                {question.scenario.fullText}
              </div>
            )
          ) : (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
              <p>Bu soru henüz çözülmedi.</p>
              <p className="text-[11px]">Yukarıdaki <strong>"Sırayla Çözüm Hattını Başlat"</strong> butonuna basın veya sağ üstteki <strong>"Yeniden Üret"</strong> ile tek tek çözdürün.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
