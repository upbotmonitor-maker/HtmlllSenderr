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
      // Create a transporter using Gmail SMTP
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: fromEmail,
          pass: appPassword,
        },
      });

      // Verify connection configuration
      await transporter.verify();

      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"${fromEmail}" <${fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      });

      console.log('Email sent successfully:', info.messageId);

      return res.json({
        success: true,
        message: 'E-posta başarıyla gönderildi.',
        messageId: info.messageId,
      });
    } catch (error: any) {
      console.error('SMTP sending error:', error);
      let errorFriendlyMessage = error.message || 'E-posta gönderilirken bilinmeyen bir hata oluştu.';
      
      if (error.code === 'EAUTH') {
        errorFriendlyMessage = 'Kimlik doğrulama hatası! Gmail adresinizin ve 16 haneli App Password (Uygulama Şifresi) bilginizin doğru olduğundan ve Gmail ayarlarınızda 2 adımlı doğrulamanın aktif olduğundan emin olun.';
      } else if (error.code === 'EENVELOPE') {
        errorFriendlyMessage = 'Alıcı e-posta adresi biçimi geçersiz. Lütfen alıcı adresini kontrol edin.';
      } else if (error.networkError) {
        errorFriendlyMessage = 'Ağ bağlantısı hatası! Sunucu Gmail SMTP sunucusuna bağlanamadı.';
      }

      return res.status(500).json({
        success: false,
        message: errorFriendlyMessage,
        details: error.code || error.message,
      });
    }
  });

  // Helper function to call Gemini with retry logic & fallback models
  async function generateContentWithRetry(aiClient: GoogleGenAI, prompt: string, systemInstruction: string) {
    const modelsToTry = ['gemini-3.5-flash', 'gemini-flash-latest'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      let delay = 1000; // Start with 1 second delay
      const maxRetries = 3;

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

          // Wait with exponential backoff before next attempt
          if (attempt < maxRetries) {
            console.log(`[Gemini] Waiting ${delay}ms before retrying...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          }
        }
      }
      console.log(`[Gemini] Model "${model}" failed all attempts. Trying next fallback model...`);
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
4. Return ONLY valid, complete HTML content starting with '<!DOCTYPE html>' and ending with '</html>'.
5. DO NOT wrap the output in any markdown tags like \`\`\`html or \`\`\`. Avoid any introduction text or summary. The response MUST be purely the raw HTML code itself, as it will be loaded directly into an editor.`;

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
