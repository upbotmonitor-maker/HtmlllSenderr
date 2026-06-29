/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

// Initialize Gemini SDK safely if key is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Route: Send Email
  app.post('/api/send-email', async (req, res) => {
    const { fromEmail, appPassword, toEmail, subject, htmlContent } = req.body;

    if (!fromEmail || !appPassword || !toEmail || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm alanları doldurun (Gönderen, App Şifresi, Alıcı, Konu ve E-posta içeriği boş bırakılamaz).',
      });
    }

    try {
      console.log(`[SMTP-over-HTTPS] Initiating secure REST delivery for ${fromEmail} via HTTPS Port 443...`);
      
      const payload = {
        Host: 'smtp.gmail.com',
        Username: fromEmail,
        Password: appPassword,
        To: toEmail,
        From: fromEmail,
        Subject: subject,
        Body: htmlContent,
        Action: 'Send'
      };

      const bodyText = JSON.stringify(payload);

      // Make request to SmtpJS bridge over port 443
      const response = await fetch('https://smtpjs.com/v3/smtpjs.aspx?', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyText,
      });

      const responseText = await response.text();
      console.log(`[SMTP-over-HTTPS] SmtpJS API response:`, responseText);

      if (responseText && responseText.trim() === 'OK') {
        return res.json({
          success: true,
          message: 'E-posta başarıyla gönderildi (HTTPS / Port 443 üzerinden tünellendi).',
          messageId: `msg_${Date.now()}_smtpjs`,
        });
      } else {
        throw new Error(responseText || 'SMTP Köprüsü geçerli bir yanıt vermedi.');
      }
    } catch (error: any) {
      console.error('SMTP-over-HTTPS sending error:', error);
      const errMsg = error.message || String(error);
      let errorFriendlyMessage = errMsg;

      if (
        errMsg.includes('Authentication failed') || 
        errMsg.includes('Username and Password not accepted') || 
        errMsg.includes('bad credentials') ||
        errMsg.includes('EAUTH')
      ) {
        errorFriendlyMessage = 'Kimlik doğrulama hatası! Gmail adresinizin ve 16 haneli App Password (Uygulama Şifresi) bilginizin doğru olduğundan ve Gmail ayarlarınızda 2 adımlı doğrulamanın aktif olduğundan emin olun.';
      } else if (
        errMsg.includes('not a valid address') || 
        errMsg.includes('invalid address') || 
        errMsg.includes('Mailbox not found') ||
        errMsg.includes('EENVELOPE')
      ) {
        errorFriendlyMessage = 'Alıcı e-posta adresi biçimi geçersiz veya posta kutusu mevcut değil. Lütfen alıcı adresini kontrol edin.';
      } else if (errMsg.includes('Daily user sending quota exceeded') || errMsg.includes('quota exceeded')) {
        errorFriendlyMessage = 'Gmail günlük gönderme limitinize ulaştınız. Lütfen daha sonra tekrar deneyin.';
      } else if (errMsg.includes('fetch failed') || errMsg.includes('Network') || errMsg.includes('timeout')) {
        errorFriendlyMessage = 'Ağ / Bağlantı Hatası! Güvenli SMTP HTTPS tünel sunucusuyla geçici olarak iletişim kurulamadı. Lütfen birkaç saniye sonra tekrar deneyin.';
      }

      return res.status(500).json({
        success: false,
        message: errorFriendlyMessage,
        details: errMsg,
      });
    }
  });

  // Helper function to call Gemini with retry logic & fallback models
  async function generateContentWithRetry(aiClient: GoogleGenAI, prompt: string, systemInstruction: string) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      let delay = 500; // Lower start delay (500ms instead of 1000ms) for speed
      const maxRetries = 2; // Try max 2 times per model instead of 3 to avoid blocking users

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Gemini] Attempting generation with model "${model}" (attempt ${attempt}/${maxRetries})...`);
          const response = await aiClient.models.generateContent({
            model: model,
            contents: `Generate an email template for: "${prompt}"`,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            },
          });
          if (response && response.text) {
            console.log(`[Gemini] Successfully generated content using model: ${model}`);
            return response;
          }
          throw new Error('Yapay zeka boş veya geçersiz bir şablon döndürdü.');
        } catch (error: any) {
          lastError = error;
          const errMsg = error.message || String(error);
          console.error(`[Gemini] Error on model "${model}", attempt ${attempt}:`, errMsg);

          // If it's a non-retryable error (like invalid API key 400), don't bother retrying or switching models
          if (
            errMsg.includes('API key') ||
            errMsg.includes('API_KEY') ||
            (error.status === 400 && errMsg.includes('key'))
          ) {
            throw error;
          }

          // If the model is overloaded (503) or rate-limited (429), do not wait and retry this model.
          // Instantly switch to the next model in the list to avoid slowing down the user!
          if (
            error.status === 503 || 
            error.status === 429 || 
            errMsg.includes('503') || 
            errMsg.includes('429') || 
            errMsg.includes('UNAVAILABLE') || 
            errMsg.includes('high demand') ||
            errMsg.includes('quota') ||
            errMsg.includes('limit')
          ) {
            console.log(`[Gemini] Model "${model}" is overloaded or rate-limited. Skipping retries and moving to next model immediately...`);
            break; // Breaks the inner attempt loop, moves to the next fallback model immediately!
          }

          // Wait with exponential backoff before next attempt (for transient network errors only)
          if (attempt < maxRetries) {
            console.log(`[Gemini] Waiting ${delay}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }
      console.log(`[Gemini] Model "${model}" failed. Trying next fallback model...`);
    }

    throw lastError || new Error('Yapay zeka şablon oluşturma işlemi tüm denemelere rağmen başarısız oldu.');
  }

  // API Route: Generate HTML Template with Gemini
  app.post('/api/generate-template', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: 'Şablon oluşturmak için lütfen bir açıklama girin.',
      });
    }

    if (!ai) {
      return res.status(503).json({
        success: false,
        message: 'Gemini API anahtarı (GEMINI_API_KEY) sunucuda yapılandırılmamış. Şablonu yapay zeka ile oluşturamazsınız ancak hazır şablonları kullanabilirsiniz.',
      });
    }

    try {
      const systemInstruction = `You are a professional HTML email template designer.
Your task is to generate a fully responsive, modern, beautiful, and clean HTML email template.
Requirements:
1. Use inline CSS styles for high compatibility across all email clients (Gmail, Outlook, Apple Mail, etc.).
2. Use modern clean colors (dark/light theme elements, sleek panels, borders, typography).
3. Include structural parts: a beautiful header, clear hierarchy, rich components (like tables, feature cards, social links, or beautifully styled CTA buttons), and a detailed professional footer with links.
4. IMAGE & LOGO SECURITY RULE:
   - NEVER use relative or local image paths (e.g. logo.png, cat.jpg, placeholder.png) because they will show as broken.
   - For logos, use either a beautifully styled text logo with modern typography and borders, OR a clean SVG path inline.
   - For any photographs, product pictures, or banners, you MUST use real, highly-reliable, royalty-free public URLs from Unsplash or placehold.co.
     Examples of reliable URLs to use or adapt:
     * Cat/Pets: https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80
     * Food/Restaurant: https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80
     * Technology/Office: https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80
     * Shopping/E-commerce: https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=600&q=80
     * Travel/Nature: https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80
     * Generic Corporate Banner: https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80
     * If you need any other category, use Unsplash with specific IDs or fallback to 'https://placehold.co/600x400/ececec/666666/png?text=Bulten+Gorseli'.
   - Avoid using broken/random placeholder URLs. Always ensure the "src" attributes point to these valid domains.
5. ICON & SOCIAL MEDIA SECURITY RULE:
   - DO NOT use local image files (like icon-facebook.png, icon-mail.png) or standard Unicode Emojis (like ✉️, ⚙️, ✅, 🔵, 🐦) for primary icons, UI indicators, or social media links. Emojis make the design look unprofessional and display differently across devices.
   - INSTEAD, you MUST use beautiful, modern, inline SVGs with standard attributes (xmlns, viewBox, width, height, fill, stroke, stroke-width, stroke-linecap, stroke-linejoin). Inline SVGs render perfectly on all devices, look premium, and never break!
   - Make sure your inline SVGs are clean, modern, have explicit dimensions (e.g., width="24" height="24") and inline styling (e.g. style="display:inline-block; vertical-align:middle; color:#4f46e5;").
   - Examples of clean inline SVGs to use:
     * Facebook: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;color:#ffffff;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
     * Twitter/X: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;color:#ffffff;"><path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/></svg>
     * Instagram: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;color:#ffffff;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
     * Envelope/Mail: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
     * Shield/Security: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
     * Gear/Settings: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
     * Star/Award: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
6. Return ONLY valid, complete HTML content starting with '<!DOCTYPE html>' and ending with '</html>'.
7. DO NOT wrap the output in any markdown tags like \`\`\`html or \`\`\`. Avoid any introduction text or summary. The response MUST be purely the raw HTML code itself, as it will be loaded directly into an editor.`;

      const response = await generateContentWithRetry(ai, prompt, systemInstruction);

      let html = response.text || '';

      // Clean up markdown blocks if the model ignored systemInstruction constraints
      html = html.trim();
      if (html.startsWith('```html')) {
        html = html.slice(7);
      } else if (html.startsWith('```')) {
        html = html.slice(3);
      }
      if (html.endsWith('```')) {
        html = html.slice(0, -3);
      }
      html = html.trim();

      return res.json({
        success: true,
        html: html,
      });
    } catch (error: any) {
      console.error('Gemini generation error:', error);
      
      let rawMsg = error.message || String(error);
      let beautifiedMessage = '';
      
      try {
        const trimmedMsg = typeof rawMsg === 'string' ? rawMsg.trim() : '';
        if (trimmedMsg.startsWith('{') || trimmedMsg.startsWith('[')) {
          const parsed = JSON.parse(trimmedMsg);
          const innerError = parsed.error || (Array.isArray(parsed) ? parsed[0]?.error : null);
          if (innerError) {
            const code = innerError.code;
            const msg = innerError.message || '';
            
            if (code === 503 || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('temporarily unavailable')) {
              beautifiedMessage = 'Yapay zeka şu anda aşırı yoğunluk yaşıyor (Hata: 503). Lütfen 5-10 saniye bekledikten sonra tekrar deneyiniz.';
            } else if (code === 429 || msg.includes('Quota exceeded') || msg.includes('rate limit')) {
              beautifiedMessage = 'Yapay zeka istek limiti aşıldı (Hata: 429). Lütfen bir dakika bekleyip tekrar deneyiniz.';
            } else if (code === 400 && (msg.includes('API key') || msg.includes('API key not valid'))) {
              beautifiedMessage = 'Gemini API anahtarı geçersiz veya yetkilendirilmemiş (Hata: 400). Lütfen sunucu ayarlarını veya .env dosyasını kontrol edin.';
            } else {
              beautifiedMessage = `Yapay zeka servisi hatası: ${msg} (Kod: ${code})`;
            }
          }
        }
      } catch (e) {
        // Fallback to text checks if JSON parsing fails
      }

      if (!beautifiedMessage) {
        if (typeof rawMsg === 'string') {
          if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
            beautifiedMessage = 'Yapay zeka şu anda aşırı yoğunluk yaşıyor (Hata: 503). Lütfen 5-10 saniye bekledikten sonra tekrar deneyiniz.';
          } else if (rawMsg.includes('429') || rawMsg.includes('quota') || rawMsg.includes('limit')) {
            beautifiedMessage = 'Yapay zeka istek limiti aşıldı (Hata: 429). Lütfen bir dakika bekleyip tekrar deneyiniz.';
          } else if (rawMsg.includes('API key') || rawMsg.includes('API_KEY')) {
            beautifiedMessage = 'Gemini API anahtarı geçersiz veya yapılandırılmamış. Lütfen sunucu ayarlarını kontrol edin.';
          } else {
            beautifiedMessage = `Yapay zeka şablonu oluştururken hata oluştu: ${rawMsg}`;
          }
        } else {
          beautifiedMessage = `Yapay zeka şablonu oluştururken hata oluştu: ${rawMsg}`;
        }
      }

      return res.status(500).json({
        success: false,
        message: beautifiedMessage,
      });
    }
  });

  // Serve Frontend
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
