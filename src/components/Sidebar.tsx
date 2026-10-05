import React, { useState } from 'react';
import { Folder, FolderPlus, Trash2, Edit2, Check, X, Layers, Sparkles } from 'lucide-react';
import type { Folder as FolderType, QuestionItem } from '../types';

interface SidebarProps {
  folders: FolderType[];
  questions: QuestionItem[];
  selectedFolderId: string | 'all';
  onSelectFolder: (folderId: string | 'all') => void;
  onCreateFolder: (name: string) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  folders,
  questions,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreating(false);
    }
  };

  const handleUpdateSubmit = (id: string) => {
    if (editingName.trim()) {
      onUpdateFolder(id, editingName.trim());
      setEditingFolderId(null);
    }
  };

  const totalQuestions = questions.length;
  const completedQuestions = questions.filter(q => q.status === 'completed').length;

  return (
    <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
      
      {/* Üst Kısım: Klasör Başlığı & Ekle Butonu */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
            Test Klasörleri
          </h2>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1.5 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Yeni Test/Klasör Oluştur"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Yeni</span>
        </button>
      </div>

      {/* Yeni Klasör Oluşturma Girişi */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="p-3 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              autoFocus
              placeholder="Örn: TYT Tarama Testi 2"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              title="Kaydet"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setNewFolderName(''); }}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg"
              title="İptal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Klasör Listesi */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        
        {/* Tüm Sorular Butonu */}
        <button
          onClick={() => onSelectFolder('all')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            selectedFolderId === 'all'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>Tüm Sorular (Genel Liste)</span>
          </div>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            selectedFolderId === 'all'
              ? 'bg-emerald-700 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            {totalQuestions}
          </span>
        </button>

        {/* Ayrıcı Çizgi */}
        <div className="my-2 border-t border-slate-100 dark:border-slate-800/80" />

        {/* Dinamik Klasörler */}
        {folders.map(folder => {
          const folderQuestions = questions.filter(q => q.folderId === folder.id);
          const isSelected = selectedFolderId === folder.id;
          const isEditing = editingFolderId === folder.id;

          if (isEditing) {
            return (
              <div key={folder.id} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => handleUpdateSubmit(folder.id)}
                  className="p-1 bg-emerald-600 text-white rounded-md"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingFolderId(null)}
                  className="p-1 text-slate-500 rounded-md"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={folder.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/70 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => onSelectFolder(folder.id)}
                className="flex items-center gap-2.5 flex-1 truncate text-left"
              >
                <Folder className="w-4 h-4 shrink-0" style={{ color: folder.color || '#10b981' }} />
                <span className="truncate">{folder.name}</span>
              </button>

              <div className="flex items-center gap-1">
                {/* Soru Sayısı Rozeti */}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected
                    ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:hidden'
                }`}>
                  {folderQuestions.length}
                </span>

                {/* Aksiyon Butonları (Hover ile görünür) */}
                <div className="hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingFolderId(folder.id);
                      setEditingName(folder.name);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    title="Adını Değiştir"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {folders.length > 1 && (
                    <button
                      onClick={() => onDeleteFolder(folder.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                      title="Klasörü Sil"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Alt İstatistik Kartı */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tamamlanan Senaryo
          </span>
          <span className="font-bold text-slate-900 dark:text-white">
            {completedQuestions} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0}%` }}
          />
        </div>
      </div>

    </aside>
  );
};
