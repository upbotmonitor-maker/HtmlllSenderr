# 📧 Mail Sender Pro - Gmail HTML E-posta Gönderici & AI Şablon Sihirbazı

**Mail Sender Pro**, kendi Gmail hesabınızı ve güvenli Uygulama Şifrenizi (App Password) kullanarak duyarlı (responsive) HTML e-postalar tasarlayıp gönderebileceğiniz, modern, hızlı ve yapay zeka destekli tek sayfalık bir web uygulamasıdır.

Uygulama, Google'ın en yeni **Gemini 3.5 Flash** modelini içeren `@google/genai` SDK'sı ile donatılmıştır. Sadece e-postanızın amacını yazarak, yapay zekanın sizin yerinize mükemmel inline CSS uyumlu HTML şablonları tasarlamasını sağlayabilirsiniz.

---

## ✨ Özellikler

- **⚙️ Güvenli Kimlik Doğrulama**: Gmail adresinizi ve 16 haneli Gmail App Şifrenizi girerek SMTP bağlantısı kurun. Bilgileriniz tamamen güvenli bir şekilde tarayıcınızın `Local Storage` alanında saklanır, asla sunucu veritabanına kaydedilmez.
- **✉️ Gelişmiş E-posta Tasarımcısı**:
  - Alıcı ve Konu alanları.
  - Canlı sözdizimi destekli ve kelime/karakter sayaçlı HTML Kod Editörü.
  - **Canlı HTML Önizleme Paneli**: Masaüstü (full-width), Tablet (640px) ve Mobil (375px) ekran boyutlarına göre e-postanızın nasıl görüneceğini anlık test edin.
- **🪄 Yapay Zeka Şablon Sihirbazı (Gemini)**: "Yeni Yıl İndirimi", "Lansman Duyurusu" veya "Müşteri Karşılama" gibi bir açıklama girin; Gemini sizin için harika tasarımlı, responsive ve modern HTML kodları üretsin!
- **📋 Hazır Tasarım Şablonları**: Hoş Geldiniz bülteni, Ürün Lansman/Promosyon kartı, İşlem Faturası ve Şifre Sıfırlama gibi kullanıma hazır 4 farklı profesyonel şablon tek tıkla yüklenebilir.
- **📜 Gönderim Geçmişi**: Gönderdiğiniz e-postaları (ve başarısız olanları hata detaylarıyla birlikte) tarayıcı geçmişinizde saklayın. Tek tıkla eski bir e-postayı editöre geri yükleyin.
- **🛡️ Güvenlik ve Doğrulama**: HTML önizleme paneli güvenli `iframe (sandbox)` yapısı kullanır. Boş alan doğrulamaları ve hata kontrol mekanizmaları entegre edilmiştir.
- **📤 Dosya İçe/Dışa Aktarma (Import/Export)**:
  - Bilgisayarınızdaki `.html` şablonlarını sürükle-bırak yöntemiyle veya dosya seçerek içe aktarın.
  - Tasarladığınız bültenleri `.html` dosyası olarak bilgisayarınıza indirin.
- **🌙 Çift Tema Desteği**: Göz yormayan, cam kırığı (glassmorphism) efektli ve mavi tonlu lüks Koyu Tema ile modern Açık Tema arasında anında geçiş yapın.

---

## ⚙️ Gmail SMTP Ayarları Nasıl Yapılır?

Gmail güvenliği gereği normal Gmail şifreniz e-posta göndermek için kullanılamaz. Bunun yerine **16 haneli özel bir Uygulama Şifresi (App Password)** oluşturmalısınız:

1. Gmail hesabınızda **2 Adımlı Doğrulama** özelliğinin açık olduğundan emin olun.
2. [Google Hesabım](https://myaccount.google.com/) sayfasına gidin.
3. Üstteki arama çubuğuna **"Uygulama şifreleri"** (veya İngilizce ise **"App passwords"**) yazıp çıkan sonuca tıklayın.
4. Bir isim girin (örneğin: `Mail Sender Pro`) ve **Oluştur** butonuna tıklayın.
5. Ekrandaki sarı kutucukta gösterilen **16 karakterli şifreyi** (aradaki boşlukları silerek) kopyalayın.
6. Uygulamamızın sol üstündeki **Gmail SMTP Ayarları** alanına Gmail adresinizle birlikte yapıştırıp **Kaydet** butonuna basın.

---

## 🚀 Proje Kurulumu ve Çalıştırma

### Gerekli Ortam Değişkenleri (.env)

Sunucuda Gemini şablon üreticisini aktif etmek için kök dizinde bir `.env` dosyası oluşturun ve Gemini API anahtarınızı ekleyin:

```env
GEMINI_API_KEY="AI_STUDIO_PANELINDEN_ALDIGINIZ_ANAHTAR"
```

### Yerel Çalıştırma (Development)

Bağımlılıkları yükleyin ve yerel geliştirme sunucusunu başlatın:

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu çalıştır (Port: 3000)
npm run dev
```

---

## 🌐 Render Üzerinde Canlıya Alma (Deploy)

Bu proje Render veya benzeri bulut platformlarında çalıştırılmak üzere tam uyumlu ve optimize edilmiş bir full-stack (Express + Vite) mimariye sahiptir.

### Render Ayarları:

1. **Repository**: GitHub deponuzu Render'a bağlayın.
2. **Environment**: `Web Service` seçeneğini seçin.
3. **Build Command** (Derleme Komutu):
   ```bash
   npm run build
   ```
   *(Bu komut, hem React frontend uygulamasını statik olarak `dist/` klasörüne derler, hem de `server.ts` Express sunucusunu `esbuild` kullanarak Node'un sıfır hata ile çalıştırabileceği tek bir `dist/server.cjs` dosyasına paketler).*
4. **Start Command** (Başlatma Komutu):
   ```bash
   npm run start
   ```
   *(Derlenen sunucuyu çalıştırmak için `node dist/server.cjs` komutunu tetikler).*
5. **Environment Variables** (Ortam Değişkenleri):
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = *(Google AI Studio veya Google Cloud konsolundan aldığınız API Anahtarı)*

### Render'ın Sürekli Aktif (Keep-Alive) Kalması İçin Yapılandırma

Render'ın ücretsiz katmanındaki (free tier) uygulamalar 15 dakika boyunca istek almazsa uyku moduna geçer ve sonraki ilk istekte 50 saniyeye varan gecikmeler yaşanabilir. Bunu önlemek için:

- Sunucumuzda yer alan `/api/send-email` veya `/api/generate-template` rotaları yerine doğrudan anasayfaya veya sunucunun root dizinine belirli aralıklarla (örn: 10 dakikada bir) ping atan bir cronjob servisi (örneğin [UptimeRobot](https://uptimerobot.com/)) kurabilirsiniz.
- Sunucumuz bu sayede her an aktif ve istekleri anında işleyecek şekilde çalışmaya devam edecektir.

---

## 📦 Bağımlılıklar ve Teknolojiler

- **Frontend**: React 19, Tailwind CSS v4, Motion (Animasyonlar), Lucide React (İkonlar).
- **Backend**: Node.js, Express, Nodemailer (SMTP yönetimi), `@google/genai` (Yapay Zeka Şablonları).
- **Build Araçları**: Vite, Esbuild, TSX, TypeScript.

---
*Mail Sender Pro ile bültenlerinizi profesyonelce ulaştırın!* 🚀
