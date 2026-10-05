export interface Folder {
  id: string;
  name: string;
  createdAt: number;
  color?: string;
  description?: string;
}

export interface ScenarioData {
  fullText: string;
  topic?: string;
  correctOption?: string;
  questionText?: string;
  questionRootAnalysis?: string;
  correctAnswerReason?: string;
  distractorsAnalysis?: {
    [key: string]: string;
  };
  pedagogicalNote?: string;
}

export interface QuestionItem {
  id: string;
  folderId: string;
  title: string;
  originalFileName: string;
  imageBase64: string;
  mimeType: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  correctAnswer?: 'A' | 'B' | 'C' | 'D' | 'E' | 'auto';
  createdAt: number;
  updatedAt: number;
  scenario?: ScenarioData;
}

export interface AppSettings {
  geminiApiKey: string;
  selectedModel: string;
  customPromptRules: string;
  onboardingCompleted: boolean;
  autoDelaySeconds: number;
  theme: 'light' | 'dark' | 'system';
}

export interface BatchProgress {
  isRunning: boolean;
  total: number;
  current: number;
  successCount: number;
  errorCount: number;
  currentQuestionTitle: string;
}
