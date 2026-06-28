/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmailTemplate } from '../types';

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Hoş Geldiniz Bülteni (Welcome)',
    description: 'Yeni üyeler veya kullanıcılar için modern ve şık bir hoş geldiniz bülteni.',
    subject: 'Aramıza Hoş Geldiniz! 🚀',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aramıza Hoş Geldiniz!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f6f9fc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .content h2 {
      color: #1e3a8a;
      font-size: 20px;
      margin-top: 0;
    }
    .content p {
      color: #555555;
      font-size: 16px;
      margin-bottom: 24px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      background-color: #2563eb;
      color: #ffffff !important;
      padding: 12px 30px;
      text-decoration: none;
      font-weight: 600;
      border-radius: 6px;
      display: inline-block;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }
    .footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="padding: 20px 0;">
    <div class="container">
      <div class="header">
        <h1>Mail Sender Pro</h1>
      </div>
      <div class="content">
        <h2>Topluluğumuza Hoş Geldiniz! 🎉</h2>
        <p>Merhaba,</p>
        <p>Aramıza katıldığınız için son derece heyecanlıyız! Mail Sender Pro platformu üzerinden profesyonel HTML bültenlerinizi kolayca tasarlayıp doğrudan Gmail hesabınızla gönderebilirsiniz.</p>
        <p>Uygulamamızın sunduğu şık şablonları, canlı önizleme panelini ve AI destekli şablon yazıcıyı keşfetmek için aşağıdaki butona tıklayarak panelinizi ziyaret edebilirsiniz.</p>
        <div class="btn-container">
          <a href="#" class="btn">Panelinizi Keşfedin</a>
        </div>
        <p>Sorularınız veya geri bildirimleriniz olursa, bize her zaman bu e-posta adresi üzerinden ulaşabilirsiniz.</p>
        <p>Sevgiler,<br><strong>Mail Sender Pro Ekibi</strong></p>
      </div>
      <div class="footer">
        <p>Bu bülten size Mail Sender Pro uygulaması ile gönderilmiştir.</p>
        <p>&copy; 2026 Mail Sender Pro. Tüm hakları saklıdır.</p>
        <p><a href="#">Abonelikten Çık</a> | <a href="#">Gizlilik Politikası</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'product_launch',
    name: 'Ürün Lansmanı & Promosyon',
    description: 'Yeni bir ürünü, özelliği veya kampanyayı duyurmak için tasarlanmış modern ürün kartı şablonu.',
    subject: 'Yeni Özelliğimizi Duyurmaktan Gurur Duyuyoruz! 🎉🚀',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Büyük Lansman!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0f172a;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #334155;
      margin-top: 30px;
      margin-bottom: 30px;
    }
    .header {
      background-color: #0f172a;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 1px solid #334155;
    }
    .badge {
      background-color: #3b82f6;
      color: #ffffff;
      padding: 4px 12px;
      font-size: 12px;
      font-weight: bold;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
      display: inline-block;
      margin-bottom: 12px;
    }
    .content {
      padding: 40px 30px;
      line-height: 1.6;
    }
    .content h2 {
      color: #3b82f6;
      font-size: 24px;
      margin-top: 0;
      font-weight: 700;
    }
    .content p {
      color: #94a3b8;
      font-size: 16px;
      margin-bottom: 24px;
    }
    .feature-card {
      background-color: #0f172a;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .feature-card h3 {
      margin-top: 0;
      color: #3b82f6;
      font-size: 18px;
    }
    .feature-card p {
      margin-bottom: 0;
      font-size: 14px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0 10px 0;
    }
    .btn {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: #ffffff !important;
      padding: 14px 35px;
      text-decoration: none;
      font-weight: 600;
      border-radius: 8px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    .footer {
      background-color: #0f172a;
      padding: 25px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #334155;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="padding: 10px 0;">
    <div class="container">
      <div class="header">
        <span class="badge">YENİ ÖZELLİK</span>
        <h1 style="margin:0; font-size: 26px; color:#ffffff; font-weight:800;">Yeni Sürüm Yayında!</h1>
      </div>
      <div class="content">
        <h2>Karşınızda: Mail Sender Pro v2.0</h2>
        <p>Sizlere iş süreçlerinizi katlayacak, e-posta gönderim kalitesini en üst seviyeye çıkaracak yepyeni v2.0 sürümümüzü tanıtmaktan gurur duyuyoruz.</p>
        
        <div class="feature-card">
          <h3>⚡ %50 Daha Hızlı Gönderim</h3>
          <p>Yenilenen SMTP kuyruk yönetim sistemimiz sayesinde e-postalarınız milisaniyeler içerisinde alıcılara ulaştırılır.</p>
        </div>

        <div class="feature-card">
          <h3>🤖 AI Şablon Üretici (Gemini 3.5)</h3>
          <p>Sadece fikrinizi yazın, yapay zekamız sizin için mükemmel, responsive ve modern HTML şablonları saniyeler içinde kodlasın.</p>
        </div>

        <div class="btn-container">
          <a href="#" class="btn">Hemen Deneyimleyin</a>
        </div>
      </div>
      <div class="footer">
        <p>Bu mail, sistem güncellemelerinden haberdar olmak istediğiniz için gönderilmiştir.</p>
        <p>&copy; 2026 Mail Sender Pro. Tüm hakları saklıdır.</p>
        <p><a href="#">E-posta Ayarları</a> | <a href="#">Yardım Merkezi</a></p>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'invoice',
    name: 'Fatura & Bilgilendirme (Invoice)',
    description: 'Şık ve profesyonel bir işlem faturası veya işlem tamamlandı e-postası.',
    subject: 'İşleminiz Başarıyla Tamamlandı - Fatura Detayı 🧾',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fatura Detayı</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: "Courier New", Courier, monospace, sans-serif;
      color: #334155;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .header {
      border-bottom: 2px dashed #cbd5e1;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      color: #0f172a;
      text-transform: uppercase;
    }
    .invoice-details {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 30px;
      line-height: 1.5;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .table th {
      border-bottom: 1px solid #e2e8f0;
      text-align: left;
      padding: 10px 0;
      font-size: 14px;
      color: #64748b;
    }
    .table td {
      padding: 12px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }
    .total-row td {
      border-top: 2px dashed #cbd5e1;
      border-bottom: none;
      font-weight: bold;
      font-size: 16px;
      padding-top: 15px;
      color: #0f172a;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 40px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="title">FATURA / FIŞ</div>
      <div style="font-size: 14px; color: #64748b;">No: #INV-2026-9481</div>
    </div>
    
    <div class="invoice-details">
      <strong>Müşteri:</strong> upbot.monitor@gmail.com<br>
      <strong>Tarih:</strong> 28 Haziran 2026<br>
      <strong>Ödeme Yöntemi:</strong> Kredi Kartı (**** 4242)<br>
      <strong>Durum:</strong> ÖDENDİ ✅
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Açıklama</th>
          <th style="text-align: right;">Adet</th>
          <th style="text-align: right;">Fiyat</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Mail Sender Pro - Pro Plan (Yıllık)</td>
          <td style="text-align: right;">1</td>
          <td style="text-align: right;">$149.00</td>
        </tr>
        <tr>
          <td>SMTP Premium Dedicated IP Eklentisi</td>
          <td style="text-align: right;">1</td>
          <td style="text-align: right;">$49.00</td>
        </tr>
        <tr class="total-row">
          <td>Toplam</td>
          <td></td>
          <td style="text-align: right;">$198.00</td>
        </tr>
      </tbody>
    </table>

    <div style="background-color: #f8fafc; padding: 15px; border-radius: 4px; font-size: 13px; text-align: center; color: #475569;">
      Ödemeniz başarıyla alınmıştır. Mail Sender Pro'yu tercih ettiğiniz için teşekkür ederiz!
    </div>

    <div class="footer">
      Bu belge mali nitelik taşımayan bilgilendirme amaçlı bir faturadır.<br>
      Mail Sender Pro Ltd. Şti. | Destek: upbot.monitor@gmail.com
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'password_reset',
    name: 'Şifre Sıfırlama (Password Reset)',
    description: 'Şık ve minimalist, odaklanmış bir şifre sıfırlama veya işlem onaylama şablonu.',
    subject: 'Şifre Sıfırlama Talebi 🔐',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifrenizi Sıfırlayın</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
    }
    .container {
      max-width: 500px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    .logo-container {
      padding: 30px 30px 10px 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
      text-align: center;
    }
    .content h2 {
      font-size: 22px;
      font-weight: 700;
      color: #111827;
      margin-top: 0;
    }
    .content p {
      color: #4b5563;
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      background-color: #dc2626;
      color: #ffffff !important;
      padding: 12px 35px;
      text-decoration: none;
      font-weight: 600;
      border-radius: 6px;
      display: inline-block;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
    }
    .divider {
      margin: 30px 0;
      border-top: 1px solid #e5e7eb;
    }
    .small-text {
      color: #6b7280;
      font-size: 13px;
      line-height: 1.5;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-container">
      <div style="font-size: 24px; font-weight: 800; color: #dc2626;">🔐 Mail Sender Pro</div>
    </div>
    <div class="content">
      <h2>Şifre Sıfırlama Talebi</h2>
      <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak ve yeni şifre oluşturmak için aşağıdaki butona tıklayın.</p>
      
      <a href="#" class="btn">Şifremi Sıfırla</a>
      
      <div class="divider"></div>
      
      <p class="small-text">Eğer bu talebi siz yapmadıysanız, bu e-postayı güvenle yok sayabilirsiniz. Şifreniz güvende kalacaktır.</p>
    </div>
    <div class="footer">
      Mail Sender Pro Güvenlik Ekibi<br>
      © 2026 Mail Sender Pro. Tüm hakları saklıdır.
    </div>
  </div>
</body>
</html>`
  }
];
