import { buildPromptWithCustomRules } from '../config/promptRules';
import type { QuestionItem, ScenarioData } from '../types';

export interface GenerationOptions {
  apiKey: string;
  model?: string;
  customRules?: string;
}

// Ham metinden doğru şıkkı ve konu özetini tespit eden yardımcı
function parseScenarioResponse(rawText: string): ScenarioData {
  let correctOption = '';
  const optionMatch = rawText.match(/Doğru\s*(?:Seçenek|Cevap)\s*[:*]*\s*([A-Ea-e])/i);
  if (optionMatch && optionMatch[1]) {
    correctOption = optionMatch[1].toUpperCase();
  }

  let topic = '';
  const topicMatch = rawText.match(/(?:Sınıf\s*&\s*Alan|Konu|Kazanım)\s*[:*]*\s*([^\n\r]+)/i);
  if (topicMatch && topicMatch[1]) {
    topic = topicMatch[1].replace(/[*#]/g, '').trim();
  }

  return {
    fullText: rawText,
    correctOption: correctOption || undefined,
    topic: topic || undefined
  };
}

/**
 * Tek bir soru görselini Gemini API'ye gönderip çözüm senaryosu üreten fonksiyon
 */
export async function generateScenarioForQuestion(
  question: QuestionItem,
  options: GenerationOptions
): Promise<ScenarioData> {
  let { apiKey, model = 'gemini-3.8-flash', customRules } = options;

  // Eski veya desteklenmeyen modelleri otomatik en yeni modele dönüştür
  if (!model || model === 'gemini-2.5-flash') {
    model = 'gemini-3.8-flash';
  }

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Lütfen geçerli bir Gemini API anahtarı girin.');
  }

  // Base64 görsel verisini temizle (varsa data:image/png;base64, kısmını ayıkla)
  let base64Data = question.imageBase64;
  let mimeType = question.mimeType || 'image/jpeg';

  if (base64Data.includes(',')) {
    const parts = base64Data.split(',');
    base64Data = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch && mimeMatch[1]) {
      mimeType = mimeMatch[1];
    }
  }

  const promptText = buildPromptWithCustomRules(customRules);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: promptText
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3, // Eğitsel doğruluk ve tutarlılık için düşük sıcaklık
      maxOutputTokens: 3000
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const message = errorJson.error?.message || `API Hatası (${response.status}): ${response.statusText}`;
    
    if (response.status === 400 && message.toLowerCase().includes('api key')) {
      throw new Error('Geçersiz Gemini API Anahtarı! Lütfen API anahtarınızı kontrol edin.');
    }
    if (response.status === 429) {
      throw new Error('API İstek Kotası (Rate Limit) aşıldı. Lütfen birkaç saniye bekleyin.');
    }
    throw new Error(message);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const textOutput = candidate?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Yapay zeka bu soru için yanıt üretemedi veya içerik güvenlik filtresine takıldı.');
  }

  return parseScenarioResponse(textOutput);
}

// Yardımcı bekleme fonksiyonu (Rate limit önlemek için)
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
