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

// Denenecek model öncelik listesi (Google'ın yeni kullanıcılara sunduğu güncel ve kararlı modeller)
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash'
];

/**
 * Tek bir soru görselini Gemini API'ye gönderip çözüm senaryosu üreten fonksiyon
 * Yüksek yoğunluk (high demand) veya geçici hatalarda otomatik olarak alternatif modellere geçer.
 */
export async function generateScenarioForQuestion(
  question: QuestionItem,
  options: GenerationOptions
): Promise<ScenarioData> {
  let { apiKey, model = 'gemini-3.8-flash', customRules } = options;

  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Lütfen geçerli bir Gemini API anahtarı girin.');
  }

  // Google'ın yeni kullanıcılara kapattığı 2.5 modellerini kesin olarak engelle ve 3.8'e yükselt
  if (!model || model.includes('2.5')) {
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

  // İlk denenecek model ve ardından sırayla denenecek yedek modeller
  const candidateModels = [
    model,
    ...FALLBACK_MODELS.filter(m => m !== model && !m.includes('2.5'))
  ];

  let lastErrorMessage = '';

  for (let i = 0; i < candidateModels.length; i++) {
    const activeModel = candidateModels[i];
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

    try {
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

        // Geçersiz API anahtarı ise model değiştirmeye gerek yok, doğrudan hata ver
        if (response.status === 400 && message.toLowerCase().includes('api key')) {
          throw new Error('Geçersiz Gemini API Anahtarı! Lütfen API anahtarınızı kontrol edin.');
        }

        // Yüksek yoğunluk veya kota ise yedek modeli dene
        lastErrorMessage = message;
        console.warn(`Model ${activeModel} yanıt veremedi (${message}), yedek model deneniyor...`);
        await sleep(1000);
        continue;
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const textOutput = candidate?.content?.parts?.[0]?.text;

      if (!textOutput) {
        lastErrorMessage = 'Yapay zeka bu modelde metin üretemedi.';
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

  throw new Error(lastErrorMessage || 'Google AI sunucularından yanıt alınamadı. Lütfen birkaç saniye sonra "Tekrar Dene" butonuna basın.');
}

// Yardımcı bekleme fonksiyonu (Rate limit önlemek için)
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
