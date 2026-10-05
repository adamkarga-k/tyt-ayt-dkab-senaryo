import Dexie, { type Table } from 'dexie';
import type { Folder, QuestionItem, AppSettings } from '../types';

export class ScenarioDatabase extends Dexie {
  folders!: Table<Folder, string>;
  questions!: Table<QuestionItem, string>;

  constructor() {
    super('TytAytDinScenarioDb');
    this.version(1).stores({
      folders: 'id, name, createdAt',
      questions: 'id, folderId, status, createdAt, updatedAt'
    });
  }
}

export const db = new ScenarioDatabase();

export const DEFAULT_FOLDER_ID = 'default-folder';

// Başlangıçta varsayılan klasör yoksa oluşturan yardımcı fonksiyon
export async function initializeDatabase() {
  const count = await db.folders.count();
  if (count === 0) {
    await db.folders.bulkAdd([
      {
        id: DEFAULT_FOLDER_ID,
        name: 'Genel Havuz (Gelen Sorular)',
        createdAt: Date.now(),
        color: '#10b981',
        description: 'Yüklenen tüm soruların ilk toplandığı ana havuz'
      },
      {
        id: 'tyt-tarama-1',
        name: 'TYT Din Kültürü - Tarama Testi 1',
        createdAt: Date.now() + 1,
        color: '#3b82f6',
        description: 'İnanç, İbadet ve Ahlak konuları tarama soruları'
      },
      {
        id: 'ayt-deneme-1',
        name: 'AYT Din Kültürü - Deneme 1',
        createdAt: Date.now() + 2,
        color: '#8b5cf6',
        description: 'Kelam, Mezhepler ve Dinler Tarihi'
      }
    ]);
  }
}

// Ayarları LocalStorage üzerinde saklama
const SETTINGS_KEY = 'tyt_ayt_scenario_app_settings';

export const defaultSettings: AppSettings = {
  geminiApiKey: '',
  selectedModel: 'gemini-2.5-flash',
  customPromptRules: '',
  onboardingCompleted: false,
  autoDelaySeconds: 2,
  theme: 'light'
};

export function getAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveAppSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
}

// Yedek Dışa Aktarma (Backup JSON)
export async function exportAllDataAsJSON(): Promise<string> {
  const folders = await db.folders.toArray();
  const questions = await db.questions.toArray();
  const settings = getAppSettings();

  const backupData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    folders,
    questions,
    settings: {
      ...settings,
      geminiApiKey: settings.geminiApiKey ? '***' : '' // Gizlilik için anahtarı maskele veya kullanıcıya sor
    }
  };

  return JSON.stringify(backupData, null, 2);
}

// Yedek İçe Aktarma (Import JSON)
export async function importDataFromJSON(jsonString: string): Promise<{ success: boolean; message: string }> {
  try {
    const data = JSON.parse(jsonString);
    if (!data.folders || !data.questions) {
      throw new Error('Geçersiz yedek dosyası formatı.');
    }

    await db.transaction('rw', db.folders, db.questions, async () => {
      await db.folders.clear();
      await db.questions.clear();
      await db.folders.bulkAdd(data.folders);
      await db.questions.bulkAdd(data.questions);
    });

    return { success: true, message: `${data.folders.length} klasör ve ${data.questions.length} soru başarıyla geri yüklendi!` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Yedek yüklenirken bir hata oluştu.' };
  }
}
