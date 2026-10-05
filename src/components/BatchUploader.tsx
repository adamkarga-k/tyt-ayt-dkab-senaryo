import React, { useRef, useState } from 'react';
import { UploadCloud, Play, Pause, AlertCircle, CheckCircle2, Loader2, ImagePlus } from 'lucide-react';
import type { BatchProgress } from '../types';

interface BatchUploaderProps {
  currentFolderName: string;
  onFilesSelected: (files: File[]) => void;
  onStartBatchProcessing: () => void;
  onStopBatchProcessing: () => void;
  batchProgress: BatchProgress;
  pendingCount: number;
  hasApiKey: boolean;
  onOpenApiSettings: () => void;
}

export const BatchUploader: React.FC<BatchUploaderProps> = ({
  currentFolderName,
  onFilesSelected,
  onStartBatchProcessing,
  onStopBatchProcessing,
  batchProgress,
  pendingCount,
  hasApiKey,
  onOpenApiSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    }
    // Girişi sıfırla ki aynı dosyalar tekrar seçilebilsin
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const percentage = batchProgress.total > 0
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      
      {/* Üst Bilgi ve Aksiyon Çubuğu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Soru Üretim Hattı ({currentFolderName})
            </h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              15-35+ Görsel Destekli
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Görselleri topluca yükleyin; yapay zeka sırayla MEBİ & ÖSYM formatında çözsün.
          </p>
        </div>

        {/* Çalıştırma / Durdurma Butonları */}
        <div className="flex items-center gap-2">
          {!hasApiKey ? (
            <button
              onClick={onOpenApiSettings}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-pulse"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Önce API Anahtarını Girin</span>
            </button>
          ) : batchProgress.isRunning ? (
            <button
              onClick={onStopBatchProcessing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors active:scale-95"
            >
              <Pause className="w-4 h-4" />
              <span>Üretim Hattını Durdur</span>
            </button>
          ) : (
            <button
              onClick={onStartBatchProcessing}
              disabled={pendingCount === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Sırayla Çözüm Hattını Başlat ({pendingCount} Soru)</span>
            </button>
          )}
        </div>
      </div>

      {/* Canlı İlerleme Çubuğu (Batch Progress) */}
      {batchProgress.isRunning && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Üretim Hattı Aktif: {batchProgress.currentQuestionTitle || 'İşleniyor...'}</span>
            </div>
            <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">
              {batchProgress.current} / {batchProgress.total} (%{percentage})
            </span>
          </div>

          <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/50 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300 relative"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Başarılı: {batchProgress.successCount}
            </span>
            {batchProgress.errorCount > 0 && (
              <span className="flex items-center gap-1 text-rose-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Hata: {batchProgress.errorCount}
              </span>
            )}
            <span className="text-slate-400">
              Kota koruması için sorular arasında güvenli gecikme uygulanıyor
            </span>
          </div>
        </div>
      )}

      {/* Sürükle Bırak / Yükleme Alanı */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[0.99]'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="h-14 w-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>

        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Soru Görsellerini Buraya Sürükleyin veya Dosya Seçin
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
          Aynı anda <strong>15, 25 veya 35 görseli</strong> birden yükleyebilirsiniz. PNG, JPG, JPEG veya WebP formatları desteklenir.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
            <ImagePlus className="w-3.5 h-3.5" /> Çoklu Görsel Yükle
          </span>
        </div>
      </div>

    </div>
  );
};
