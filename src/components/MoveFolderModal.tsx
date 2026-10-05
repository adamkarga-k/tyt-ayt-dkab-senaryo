import React, { useState } from 'react';
import { X, FolderInput, Folder } from 'lucide-react';
import type { Folder as FolderType } from '../types';

interface MoveFolderModalProps {
  isOpen: boolean;
  questionTitle: string;
  currentFolderId: string;
  folders: FolderType[];
  onMove: (targetFolderId: string) => void;
  onClose: () => void;
}

export const MoveFolderModal: React.FC<MoveFolderModalProps> = ({
  isOpen,
  questionTitle,
  currentFolderId,
  folders,
  onMove,
  onClose
}) => {
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    folders.find(f => f.id !== currentFolderId)?.id || folders[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedFolderId) {
      onMove(selectedFolderId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <FolderInput className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Soruyu Klasöre Taşı
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs text-slate-500">Taşınacak Soru:</span>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mt-0.5">
              {questionTitle}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Hedef Klasörü Seçin:
            </label>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {folders.map(folder => {
                const isCurrent = folder.id === currentFolderId;
                const isSelected = folder.id === selectedFolderId;
                return (
                  <button
                    key={folder.id}
                    disabled={isCurrent}
                    onClick={() => setSelectedFolderId(folder.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs sm:text-sm transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : isCurrent
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed opacity-60'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Folder className="w-4 h-4" style={{ color: folder.color || '#10b981' }} />
                      <span>{folder.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[11px] text-slate-400 italic">Şu anki klasör</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFolderId || selectedFolderId === currentFolderId}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-colors"
          >
            Bu Klasöre Taşı
          </button>
        </div>

      </div>
    </div>
  );
};
