import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  initializeDatabase,
  getAppSettings,
  saveAppSettings,
  exportAllDataAsJSON,
  importDataFromJSON,
  DEFAULT_FOLDER_ID
} from './db';
import { generateScenarioForQuestion, sleep } from './services/aiService';
import type { QuestionItem, Folder, AppSettings, BatchProgress } from './types';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';
import { BatchUploader } from './components/BatchUploader';
import { QuestionCard } from './components/QuestionCard';
import { HowToUseModal } from './components/HowToUseModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { PromptStudioModal } from './components/PromptStudioModal';
import { MoveFolderModal } from './components/MoveFolderModal';
import { ImageModal } from './components/ImageModal';

import { Search, Printer } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  // Ayarlar ve Tema
  const [settings, setSettings] = useState<AppSettings>(getAppSettings());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Seçili Klasör & Filtreler
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'error'>('all');

  // Modallar
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false);
  const [movingQuestion, setMovingQuestion] = useState<QuestionItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; title: string } | null>(null);

  // Toplu Üretim Durumu (Batch Queue)
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    isRunning: false,
    total: 0,
    current: 0,
    successCount: 0,
    errorCount: 0,
    currentQuestionTitle: ''
  });
  const stopBatchRef = useRef(false);

  // Veritabanını Canlı İzleme (Dexie Reactive Hooks)
  const folders = useLiveQuery(() => db.folders.toArray(), []) || [];
  const questions = useLiveQuery(() => db.questions.reverse().sortBy('createdAt'), []) || [];

  // İlk yüklemede DB'yi hazırla & Onboarding kontrolü
  useEffect(() => {
    initializeDatabase().then(() => {
      const currentSettings = getAppSettings();
      setSettings(currentSettings);
      // Kullanıcının ilk girişi ise veya API anahtarı boşsa API rehber modalini aç
      if (!currentSettings.onboardingCompleted || !currentSettings.geminiApiKey) {
        setIsApiSettingsOpen(true);
      }
    });
  }, []);

  // Tema Değişimi
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleSaveSettings = (updated: Partial<AppSettings>) => {
    const newSettings = saveAppSettings(updated);
    setSettings(newSettings);
  };

  // Klasör İşlemleri
  const handleCreateFolder = async (name: string) => {
    const newFolder: Folder = {
      id: 'folder-' + Date.now(),
      name,
      createdAt: Date.now(),
      color: '#10b981'
    };
    await db.folders.add(newFolder);
    setSelectedFolderId(newFolder.id);
  };

  const handleUpdateFolder = async (id: string, name: string) => {
    await db.folders.update(id, { name });
  };

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('Bu klasörü silmek istediğinize emin misiniz? Klasördeki sorular Genel Havuz klasörüne aktarılacaktır.')) {
      await db.questions.where('folderId').equals(id).modify({ folderId: DEFAULT_FOLDER_ID });
      await db.folders.delete(id);
      if (selectedFolderId === id) {
        setSelectedFolderId('all');
      }
    }
  };

  // Çoklu Dosya Yükleme (15 - 35+ Görsel)
  const handleFilesSelected = async (files: File[]) => {
    const targetFolder = selectedFolderId === 'all' ? DEFAULT_FOLDER_ID : selectedFolderId;
    const newItems: QuestionItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await readFileAsBase64(file);
      const questionTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      newItems.push({
        id: 'q-' + Date.now() + '-' + i + '-' + Math.random().toString(36).substring(2, 6),
        folderId: targetFolder,
        title: questionTitle || `Soru ${i + 1}`,
        originalFileName: file.name,
        imageBase64: base64,
        mimeType: file.type || 'image/jpeg',
        status: 'pending',
        createdAt: Date.now() + i,
        updatedAt: Date.now() + i
      });
    }

    await db.questions.bulkAdd(newItems);
  };

  // Dosyayı Base64 string'e dönüştürme
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Toplu Çözüm Sıralı Üretim Motoru (Queue)
  const handleStartBatchProcessing = async () => {
    if (!settings.geminiApiKey) {
      setIsApiSettingsOpen(true);
      return;
    }

    const targetList = questions.filter(q => {
      const folderMatch = selectedFolderId === 'all' || q.folderId === selectedFolderId;
      return folderMatch && (q.status === 'pending' || q.status === 'error');
    });

    if (targetList.length === 0) return;

    stopBatchRef.current = false;
    setBatchProgress({
      isRunning: true,
      total: targetList.length,
      current: 0,
      successCount: 0,
      errorCount: 0,
      currentQuestionTitle: ''
    });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < targetList.length; i++) {
      if (stopBatchRef.current) break;

      const currentQ = targetList[i];
      setBatchProgress(prev => ({
        ...prev,
        current: i + 1,
        currentQuestionTitle: currentQ.title
      }));

      // Durumu 'processing' yap
      await db.questions.update(currentQ.id, { status: 'processing', errorMessage: undefined });

      try {
        const scenario = await generateScenarioForQuestion(currentQ, {
          apiKey: settings.geminiApiKey,
          model: settings.selectedModel,
          customRules: settings.customPromptRules
        });

        await db.questions.update(currentQ.id, {
          status: 'completed',
          scenario,
          updatedAt: Date.now()
        });
        successCount++;
      } catch (err: any) {
        console.error('Soru işleme hatası:', err);
        await db.questions.update(currentQ.id, {
          status: 'error',
          errorMessage: err.message || 'Hata oluştu',
          updatedAt: Date.now()
        });
        errorCount++;
      }

      setBatchProgress(prev => ({
        ...prev,
        successCount,
        errorCount
      }));

      // Rate limit koruması için sorular arasında güvenli bekleme süresi
      if (i < targetList.length - 1 && !stopBatchRef.current) {
        await sleep(Math.max((settings.autoDelaySeconds || 2) * 1000, 1500));
      }
    }

    setBatchProgress(prev => ({ ...prev, isRunning: false }));

    if (successCount > 0) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  const handleStopBatchProcessing = () => {
    stopBatchRef.current = true;
    setBatchProgress(prev => ({ ...prev, isRunning: false }));
  };

  // Tek Bir Soruyu Yeniden Üretme
  const handleRegenerateQuestion = async (q: QuestionItem) => {
    if (!settings.geminiApiKey) {
      setIsApiSettingsOpen(true);
      return;
    }

    await db.questions.update(q.id, { status: 'processing', errorMessage: undefined });

    try {
      const scenario = await generateScenarioForQuestion(q, {
        apiKey: settings.geminiApiKey,
        model: settings.selectedModel,
        customRules: settings.customPromptRules
      });

      await db.questions.update(q.id, {
        status: 'completed',
        scenario,
        updatedAt: Date.now()
      });
    } catch (err: any) {
      await db.questions.update(q.id, {
        status: 'error',
        errorMessage: err.message || 'Hata oluştu',
        updatedAt: Date.now()
      });
    }
  };

  // Doğru Cevap Şıkkı Belirleme (A, B, C, D, E veya auto)
  const handleSelectCorrectAnswer = async (questionId: string, answer: 'A' | 'B' | 'C' | 'D' | 'E' | 'auto') => {
    await db.questions.update(questionId, {
      correctAnswer: answer,
      updatedAt: Date.now()
    });
  };

  // Senaryo Metnini Düzenleme
  const handleUpdateScenarioText = async (questionId: string, updatedText: string) => {
    const q = await db.questions.get(questionId);
    if (q) {
      const currentScenario = q.scenario || { fullText: updatedText };
      await db.questions.update(questionId, {
        scenario: { ...currentScenario, fullText: updatedText },
        updatedAt: Date.now()
      });
    }
  };

  // Soru Silme
  const handleDeleteQuestion = async (id: string) => {
    if (window.confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
      await db.questions.delete(id);
    }
  };

  // Soruyu Başka Klasöre Taşıma
  const handleMoveQuestion = async (targetFolderId: string) => {
    if (movingQuestion) {
      await db.questions.update(movingQuestion.id, { folderId: targetFolderId });
      setMovingQuestion(null);
    }
  };

  // Tüm Verileri JSON Olarak Dışa Aktar
  const handleExportData = async () => {
    const jsonStr = await exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tyt-ayt-din-senaryolari-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Yedeğini Geri Yükle
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const text = await file.text();
        const res = await importDataFromJSON(text);
        alert(res.message);
      }
    };
    input.click();
  };

  // Mevcut klasörün adı
  const currentFolderName = selectedFolderId === 'all'
    ? 'Tüm Sorular Havuzu'
    : folders.find(f => f.id === selectedFolderId)?.name || 'Seçili Klasör';

  // Filtrelenmiş Sorular
  const filteredQuestions = questions.filter(q => {
    // Klasör filtresi
    if (selectedFolderId !== 'all' && q.folderId !== selectedFolderId) return false;
    // Durum filtresi
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    // Arama filtresi
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const titleMatch = q.title.toLowerCase().includes(query);
      const textMatch = q.scenario?.fullText?.toLowerCase().includes(query);
      if (!titleMatch && !textMatch) return false;
    }
    return true;
  });

  const pendingQuestionsInScope = questions.filter(q => {
    const folderMatch = selectedFolderId === 'all' || q.folderId === selectedFolderId;
    return folderMatch && (q.status === 'pending' || q.status === 'error');
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Header */}
      <Header
        settings={settings}
        onOpenHowToUse={() => setIsHowToUseOpen(true)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        onOpenPromptStudio={() => setIsPromptStudioOpen(true)}
        onToggleTheme={handleToggleTheme}
        onExportData={handleExportData}
        onImportData={handleImportData}
        isDarkMode={isDarkMode}
      />

      {/* Ana Gövde (Sidebar + Çalışma Alanı) */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Sol Panel: Klasörler */}
        <Sidebar
          folders={folders}
          questions={questions}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={handleCreateFolder}
          onUpdateFolder={handleUpdateFolder}
          onDeleteFolder={handleDeleteFolder}
        />

        {/* Sağ/Ana Bölüm: Yükleyici ve Soru Kartları */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Toplu Yükleme ve Üretim Hattı Motoru */}
          <BatchUploader
            currentFolderName={currentFolderName}
            onFilesSelected={handleFilesSelected}
            onStartBatchProcessing={handleStartBatchProcessing}
            onStopBatchProcessing={handleStopBatchProcessing}
            batchProgress={batchProgress}
            pendingCount={pendingQuestionsInScope}
            hasApiKey={Boolean(settings.geminiApiKey)}
            onOpenApiSettings={() => setIsApiSettingsOpen(true)}
          />

          {/* Arama ve Filtreleme Çubuğu */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Soru veya senaryo içinde ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Durum Filtresi */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tümü ({filteredQuestions.length})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'completed'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Çözülenler
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    statusFilter === 'pending'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Bekleyenler
                </button>
              </div>

              {/* Yazdır / PDF Al Butonu */}
              <button
                onClick={() => window.print()}
                className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="Tüm Listeyi Yazdır / PDF Olarak Kaydet"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Soru Kartları Listesi */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Bu görünümde soru bulunamadı
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Yukarıdaki alandan 15-35+ soru görseli yükleyebilir veya arama filtrenizi temizleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map(question => {
                const folder = folders.find(f => f.id === question.folderId);
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    folderName={folder?.name || 'Genel Havuz'}
                    onUpdateScenario={handleUpdateScenarioText}
                    onSelectCorrectAnswer={handleSelectCorrectAnswer}
                    onRegenerate={handleRegenerateQuestion}
                    onDelete={handleDeleteQuestion}
                    onOpenMoveModal={(q) => setMovingQuestion(q)}
                    onOpenImageModal={(src, title) => setZoomedImage({ src, title })}
                  />
                );
              })}
            </div>
          )}

        </main>
      </div>

      {/* Footer (İstenen Ubeydullah Öz Instagram linkiyle) */}
      <Footer />

      {/* Modallar */}
      <HowToUseModal
        isOpen={isHowToUseOpen}
        onClose={() => setIsHowToUseOpen(false)}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />

      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setIsApiSettingsOpen(false)}
        isFirstTime={!settings.onboardingCompleted}
      />

      <PromptStudioModal
        isOpen={isPromptStudioOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setIsPromptStudioOpen(false)}
      />

      <MoveFolderModal
        isOpen={Boolean(movingQuestion)}
        questionTitle={movingQuestion?.title || ''}
        currentFolderId={movingQuestion?.folderId || ''}
        folders={folders}
        onMove={handleMoveQuestion}
        onClose={() => setMovingQuestion(null)}
      />

      {zoomedImage && (
        <ImageModal
          isOpen={true}
          imageSrc={zoomedImage.src}
          title={zoomedImage.title}
          onClose={() => setZoomedImage(null)}
        />
      )}

    </div>
  );
}

export default App;
