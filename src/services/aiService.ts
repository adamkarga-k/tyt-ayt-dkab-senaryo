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

// Google Gemini resmi ve güncel 3.x serisi modelleri
const SUPPORTED_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite'
];

/**
 * Tek bir soru görselini Gemini API'ye gönderip çözüm senaryosu üreten fonksiyon
 * Anlık dalgalanmalarda önce akıllı tekrar dener (retry), gerekirse güncel 3.x yedek modele geçer.
 */
export async function generateScenarioForQuestion(
  question: QuestionItem,
  options: GenerationOptions
): Promise<ScenarioData> {
  let { apiKey, model = 'gemini-3.8-flash', customRules } = options;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Lütfen geçerli bir Gemini API anahtarı girin.');
  }

  // Eski/kapatılmış modelleri (1.5, 2.0, 2.5) kesin olarak engelle ve 3.8-flash'a yükselt
  if (!model || model.includes('1.5') || model.includes('2.0') || model.includes('2.5')) {
    model = 'gemini-3.8-flash';
  }

  // Base64 görsel verisini temizle
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

  let promptText = buildPromptWithCustomRules(customRules);

  // Öğretmen/Kullanıcı tarafından doğru cevap şıkkı belirlendiyse yapay zekaya zorunlu talimat olarak ekle
  if (question.correctAnswer && question.correctAnswer !== 'auto') {
    promptText += `\n\n🎯 KESİN DOĞRU CEVAP TALİMATI: Bu sorunun doğru cevabı kesinlikle "${question.correctAnswer}" seçeneğidir. Görseldeki metni ve şıkları eksiksiz oku; "${question.correctAnswer}" seçeneğinin neden doğru olduğunu ve diğer seçeneklerin neden elendiğini az önce belirlenen MEBİ video seslendirme senaryosu kalıplarına uygun olarak açıkla.`;
  }

  // Denenecek güncel modeller listesi
  const candidateModels = [
    model,
    ...SUPPORTED_MODELS.filter(m => m !== model)
  ];

  let lastErrorMessage = '';

  for (const activeModel of candidateModels) {
    // Her model için anlık dalgalanmalara karşı 2 defa deneme hakkı
    for (let attempt = 1; attempt <= 2; attempt++) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { text: promptText },
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
          temperature: 0.3,
          maxOutputTokens: 3000
        }
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorJson = await response.json().catch(() => ({}));
          const message = errorJson.error?.message || `API Hatası (${response.status}): ${response.statusText}`;

          if (response.status === 400 && message.toLowerCase().includes('api key')) {
            throw new Error('Geçersiz Gemini API Anahtarı! Lütfen API anahtarınızı kontrol edin.');
          }

          lastErrorMessage = message;
          // Eğer 404 (model bulunamadı) ise bu modelde tekrar deneme yapma, sıradaki modele geç
          if (response.status === 404) {
            break;
          }

          // Geçici yoğunluk ise kısa süre bekleyip tekrar dene
          await sleep(1200);
          continue;
        }

        const data = await response.json();
        const candidate = data.candidates?.[0];
        const textOutput = candidate?.content?.parts?.[0]?.text;

        if (!textOutput) {
          lastErrorMessage = 'Yapay zeka bu görsel için metin üretemedi.';
          continue;
        }

        return parseScenarioResponse(textOutput);
      } catch (err: any) {
        if (err.message?.includes('Geçersiz Gemini API')) {
          throw err;
        }
        lastErrorMessage = err.message || 'Bağlantı hatası oluştu.';
        await sleep(1000);
      }
    }
  }

  throw new Error(lastErrorMessage || 'Google AI sunucularından yanıt alınamadı. Lütfen birkaç saniye sonra "Tekrar Dene" butonuna basın.');
}

// Yardımcı bekleme fonksiyonu (Rate limit önlemek için)
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
