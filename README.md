# TYT-AYT Din Kültürü ve Ahlak Bilgisi Çözüm Senaryoları (Özel Üretim Hattı)

Millî Eğitim Bakanlığı (MEBİ) ve ÖSYM pedagojisine tam oturan, lise düzeyine uygun, doğru cevabın neden doğru olduğunu ve çeldiricilerin mantığını detaylıca açıklayan **Din Kültürü ve Ahlak Bilgisi Görsel Soru Çözüm Hattı**.

---

## 🌟 Öne Çıkan Özellikler

1. **MEBİ & ÖSYM Pedagojik Çözüm Şablonu**:
   - 📌 **Konu ve Kazanım Analizi:** (Sınıf, konu, kavram ve MEB kazanımı)
   - 🔍 **Soru Kökü ve Çözüm Yaklaşımı:** (Olumsuz/tuzak ifadeler ve öğrenci yönlendirmesi)
   - 📖 **Metin & Ayet/Hadis Tahlili:** (Kavramsal derinlik ve ana düşünce)
   - ✅ **Doğru Cevabın Gerekçeli Açıklaması:** (Metindeki dayanak ve terim anlamı)
   - ❌ **Çeldiricilerin Analizi:** (A, B, C, D, E şıklarının tek tek neden elendiği ve kavram yanılgıları)
   - 💡 **ÖSYM & MEBİ Pedagojik Notu (Kavram Köşesi):** (Sınavda hayat kurtaracak hap ipucu)

2. **Toplu Görsel Yükleme (Batch Processing)**:
   - Aynı anda **15, 25 veya 35 görseli** tek seferde yükleyebilme.
   - API istek kotalarını koruyan sıralı ve güvenli çözüm kuyruğu.
   - Canlı ilerleme çubuğu, durdur/devam et kontrolleri.

3. **Görsellerin ve Senaryoların Karışmadığı Çift Panelli Arayüz**:
   - Sol tarafta soru görseli (büyüteç, tıkla-büyüt ve yakınlaştır).
   - Sağ tarafta MEBİ standartlarında çözüm senaryosu.
   - Anında düzenleme (inline-edit) ve panoya kopyalama.

4. **Klasörleme & Koleksiyon Yönetimi**:
   - Soruları konulara veya testlere göre ayırma (Örn: *TYT Tarama Testi 1*, *AYT Deneme 2*).
   - Soruları sonradan farklı klasörlere kolayca taşıyabilme.
   - Tüm soruları tek bir havuzda görebilme veya klasöre göre filtreleme.

5. **Tarayıcı Tabanında %100 Kalıcılık (IndexedDB)**:
   - Tarayıcıyı kapatsanız dahi yüklediğiniz hiçbir görsel ve hazırladığınız senaryo kaybolmaz.
   - Tek tıkla JSON yedeği alma (Dışa Aktar) ve geri yükleme (İçe Aktar).

6. **Sistemi Eğitmeye Devam Etme (Prompt Studio & Kural Motoru)**:
   - Arayüzdeki **"Sistemi Eğit"** panelinden yeni pedagojik kurallar ekleyebilme.
   - Kaynak koddaki `src/config/promptRules.ts` dosyasından tüm kullanıcılar için geçerli global kurallar tanımlayabilme.

7. **API Güvenliği & İlk Giriş Rehberi**:
   - Google AI Studio'dan 1 dakikada ücretsiz Gemini API anahtarı alma rehberi.
   - API anahtarınız asla sunucuya gitmez, yalnızca kendi tarayıcınızda yerel olarak saklanır.

8. **Tek Tıkla Yazdır & PDF Al**:
   - Testleri ve senaryoları baskıya uygun temiz sayfa düzeninde yazdırabilme.

---

## 🚀 GitHub'a Yükleme ve Vercel'de Yayınlama

Bu projeyi Vercel üzerinde canlıya almak yalnızca 2 dakikanızı alır:

### 1. GitHub Deposu Oluşturun
1. [GitHub](https://github.com) hesabınızda yeni bir repository (depo) açın: `tyt-ayt-din-senaryo`
2. Proje dizininde terminalden şu komutları çalıştırın:
```bash
git init
git add .
git commit -m "feat: ilk sürüm - TYT AYT Din Çözüm Hattı"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADINIZ/tyt-ayt-din-senaryo.git
git push -u origin main
```

### 2. Vercel'e Dağıtın (Deploy)
1. [Vercel](https://vercel.com) adresine gidin ve GitHub ile giriş yapın.
2. **"Add New Project"** butonuna tıklayın ve `tyt-ayt-din-senaryo` reposunu seçin.
3. Framework Preset olarak **Vite** otomatik algılanacaktır.
4. **"Deploy"** butonuna basın!
5. 30 saniye içinde siteniz `https://projeniz.vercel.app` adresinde dünyadaki herkesin kullanımına açılacaktır!

---

## 🛠️ Yerel Geliştirme (Localhost)

```bash
# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi (Build)
npm run build
```

---

## 👤 Yapımcı

**Sistemi Oluşturan:** Ubeydullah Öz  
🔗 Instagram: [instagram.com/adamkarga](https://instagram.com/adamkarga)
