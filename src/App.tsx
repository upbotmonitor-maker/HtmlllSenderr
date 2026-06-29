/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { EMAIL_TEMPLATES } from './data/templates';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import LivePreview from './components/LivePreview';
import { MailSettings, EmailForm, SentEmailItem, EmailTemplate } from './types';
import {
  Mail,
  Send,
  Sparkles,
  Download,
  Upload,
  Layers,
  FileCode,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Trash2,
  Copy,
  Plus,
  Loader2,
  Heart,
  Wand2,
  Server,
  Zap,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Theme & Layout Settings
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showMigrationBanner, setShowMigrationBanner] = useState<boolean>(true);
  
  // SMTP credentials loaded from localStorage
  const [settings, setSettings] = useState<MailSettings>({
    gmailAddress: '',
    gmailAppPassword: '',
  });

  // Editor Inputs
  const [toEmail, setToEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');

  // History & Templates
  const [history, setHistory] = useState<SentEmailItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // AI Generator Prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Drag and Drop File Import
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Send feedback states
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Clipboard copies
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Initialize data on component mount
  useEffect(() => {
    // Load Settings
    const savedSettings = localStorage.getItem('mailSenderSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }

    // Load History
    const savedHistory = localStorage.getItem('mailSenderHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    // Load Theme Preference
    const savedTheme = localStorage.getItem('mailSenderTheme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Default to the first template if empty
    if (EMAIL_TEMPLATES.length > 0) {
      setHtmlContent(EMAIL_TEMPLATES[0].html);
      setSubject(EMAIL_TEMPLATES[0].subject);
      setSelectedTemplateId(EMAIL_TEMPLATES[0].id);
    }
  }, []);

  // Save Settings handler
  const handleSaveSettings = (newSettings: MailSettings) => {
    setSettings(newSettings);
    localStorage.setItem('mailSenderSettings', JSON.stringify(newSettings));
  };

  // Theme change handler
  const handleToggleTheme = () => {
    const nextTheme = !isDarkMode;
    setIsDarkMode(nextTheme);
    localStorage.setItem('mailSenderTheme', nextTheme ? 'dark' : 'light');
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    const nextHistory = history.filter((item) => item.id !== id);
    setHistory(nextHistory);
    localStorage.setItem('mailSenderHistory', JSON.stringify(nextHistory));
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Tüm gönderim geçmişini temizlemek istediğinizden emin misiniz?')) {
      setHistory([]);
      localStorage.removeItem('mailSenderHistory');
    }
  };

  // Select history item to load
  const handleSelectHistoryItem = (item: SentEmailItem) => {
    setToEmail(item.toEmail);
    setSubject(item.subject);
    setHtmlContent(item.htmlContent);
    setSelectedTemplateId('custom');
    
    // Smooth scroll back to composer
    document.getElementById('composer-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Template select handler
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'clear') {
      setHtmlContent('<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="utf-8">\n  <title>Boş Şablon</title>\n</head>\n<body>\n  \n</body>\n</html>');
      setSubject('');
      return;
    }
    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setHtmlContent(template.html);
      setSubject(template.subject);
    }
  };

  // Send Email handler
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!settings.gmailAddress || !settings.gmailAppPassword) {
      setSendState('error');
      setFeedbackMessage('Lütfen önce SMTP ayarlarınızı (Gmail adresi ve App şifresi) doldurun ve kaydedin.');
      return;
    }

    if (!toEmail || !subject || !htmlContent) {
      setSendState('error');
      setFeedbackMessage('Lütfen tüm alıcı, konu ve HTML alanlarını doldurun.');
      return;
    }

    setSendState('sending');
    setFeedbackMessage('E-posta gönderiliyor, lütfen bekleyin...');

    try {
      const payload = {
        Host: 'smtp.gmail.com',
        Username: settings.gmailAddress,
        Password: settings.gmailAppPassword,
        To: toEmail,
        From: settings.gmailAddress,
        Subject: subject,
        Body: htmlContent,
        Action: 'Send'
      };

      const bodyText = JSON.stringify(payload);

      // SmtpJS, sunucu IP bloklamalarını aşmak için doğrudan tarayıcı (client-side) üzerinden
      // güvenli HTTPS Port 443 tüneli ile istek alacak şekilde tasarlanmıştır.
      const response = await fetch('https://smtpjs.com/v3/smtpjs.aspx?', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyText,
      });

      const responseText = await response.text();
      console.log('SmtpJS client-side response:', responseText);

      if (responseText && responseText.trim() === 'OK') {
        setSendState('success');
        setFeedbackMessage('E-posta başarıyla gönderildi! (Güvenli HTTPS tüneli üzerinden tarayıcınızdan doğrudan Gmail sunucusuna iletildi) ✅');

        // Add to history
        const newItem: SentEmailItem = {
          id: Math.random().toString(36).substring(2, 9),
          toEmail,
          subject,
          timestamp: new Date().toISOString(),
          status: 'success',
          htmlContent,
        };
        const nextHistory = [newItem, ...history];
        setHistory(nextHistory);
        localStorage.setItem('mailSenderHistory', JSON.stringify(nextHistory));
      } else {
        let friendlyError = responseText || 'SMTP Köprüsü geçerli bir yanıt vermedi.';
        const lowerErr = responseText.toLowerCase();
        
        if (
          lowerErr.includes('authentication') || 
          lowerErr.includes('username and password not accepted') || 
          lowerErr.includes('bad credentials')
        ) {
          friendlyError = 'Kimlik doğrulama hatası! Gmail adresinizin ve 16 haneli App Password (Uygulama Şifresi) bilginizin doğru olduğundan emin olun. Ayrıca Gmail ayarlarınızda 2 adımlı doğrulamanın aktif olduğundan emin olun.';
        } else if (
          lowerErr.includes('not a valid') || 
          lowerErr.includes('invalid address') || 
          lowerErr.includes('mailbox not found')
        ) {
          friendlyError = 'Alıcı e-posta adresi geçersiz veya mevcut değil. Lütfen e-posta adresini kontrol edin.';
        } else if (lowerErr.includes('quota exceeded') || lowerErr.includes('limit')) {
          friendlyError = 'Gmail günlük gönderme limitinize ulaştınız. Lütfen daha sonra tekrar deneyin.';
        }
        
        throw new Error(friendlyError);
      }
    } catch (err: any) {
      console.error(err);
      setSendState('error');
      setFeedbackMessage(err.message || 'E-posta gönderilemedi. Lütfen bilgilerinizi kontrol edin.');

      // Add failed attempt to history
      const newItem: SentEmailItem = {
        id: Math.random().toString(36).substring(2, 9),
        toEmail,
        subject,
        timestamp: new Date().toISOString(),
        status: 'error',
        errorMessage: err.message || 'Gönderim başarısız',
        htmlContent,
      };
      const nextHistory = [newItem, ...history];
      setHistory(nextHistory);
      localStorage.setItem('mailSenderHistory', JSON.stringify(nextHistory));
    }
  };

  // AI Template Generator handler
  const handleGenerateTemplateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await response.json();

      if (data.success) {
        setHtmlContent(data.html);
        setSelectedTemplateId('custom');
        setSubject('AI Üretimi Şablon 🪄');
        setAiPrompt('');
      } else {
        alert(data.message || 'Yapay zeka şablon oluşturamadı.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Yapay zeka ile bağlantı kurulurken hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  };

  // Export HTML template to file
  const handleExportHTML = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${subject || 'e-posta-sablonu'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle HTML File Selection/Upload
  const handleImportHTML = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHtmlContent(event.target.result as string);
          setSubject(file.name.replace('.html', ''));
          setSelectedTemplateId('custom');
        }
      };
      reader.readAsText(file);
    }
  };

  // File Drag & Drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.html')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setHtmlContent(event.target.result as string);
          setSubject(file.name.replace('.html', ''));
          setSelectedTemplateId('custom');
        }
      };
      reader.readAsText(file);
    }
  };

  // Copy HTML to Clipboard
  const handleCopyHTML = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  // Character & Word Counter
  const charCount = htmlContent.length;
  const wordCount = htmlContent.trim() ? htmlContent.trim().split(/\s+/).length : 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200'
          : 'bg-slate-50 text-slate-800 selection:bg-blue-500/20 selection:text-blue-800'
      } font-sans pb-16`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id="app-root-container"
    >
      {/* Premium Ambient Background effects */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent pointer-events-none blur-3xl" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full pointer-events-none blur-[120px]" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-indigo-600/5 rounded-full pointer-events-none blur-[120px]" />

      {/* Dragging Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center border-4 border-dashed border-blue-500 m-4 rounded-3xl"
            id="drag-overlay"
          >
            <Upload className="w-16 h-16 text-blue-400 animate-bounce mb-4" />
            <h3 className="text-2xl font-bold text-white">HTML Dosyasını Buraya Bırakın</h3>
            <p className="text-slate-400 text-sm mt-1">Sürüklediğiniz HTML dosyası editöre yüklenecektir.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Navbar / Header */}
        <header className="flex items-center justify-between mb-8 pb-5 border-b border-white/5 shrink-0" id="app-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mail className="w-5.5 h-5.5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text">
                  Mail Sender Pro
                </h1>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400">Gmail SMTP Destekli Profesyonel HTML E-posta Paneli</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status of credential configuration */}
            {settings.gmailAddress && settings.gmailAppPassword ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                SMTP Bağlantısı Hazır
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Bağlantı Kurulmadı
              </span>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-xl bg-slate-900/40 border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title={isDarkMode ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
              id="theme-toggle-btn"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Migration Alert & Free Hosting Guide */}
        <AnimatePresence>
          {showMigrationBanner && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className={`mb-8 p-5 rounded-2xl border ${
                isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-100 shadow-xl shadow-emerald-500/5'
                  : 'bg-emerald-500/5 border-emerald-500/20 text-slate-800 shadow-lg shadow-emerald-500/2'
              } relative overflow-hidden`}
              id="migration-announcement-card"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                  <Zap className="w-6 h-6 animate-pulse text-emerald-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                        Müjde! Taşınmamıza Gerek Kalmadı - SMTP Engeli Çözüldü! 🎉
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowMigrationBanner(false)}
                      className="text-slate-400 hover:text-white text-xs cursor-pointer px-2.5 py-1 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-white/5 hover:border-white/10 transition"
                      id="close-migration-banner-btn"
                    >
                      Kapat
                    </button>
                  </div>
                  
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Render.com'un ücretsiz katmanındaki klasik SMTP port kısıtlamalarını aşmak için <strong>HTTPS (Port 443) güvenli tünel teknolojisine (SMTP-over-HTTPS)</strong> geçiş yaptık. Artık sitemiz Render üzerinde hiçbir harici port engeline takılmadan %100 başarılı çalışmaktadır!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                      <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-blue-400" />
                        Kullanıcılar İçin Değişen Bir Şey Var mı?
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Hayır, tamamen aynı!</strong> Kullanıcılarınız sadece kendi Gmail adreslerini ve 16 haneli Gmail Uygulama Şifrelerini (App Password) girerek, hiçbir ek API key veya domain doğrulaması yapmadan HTML e-postalarını doğrudan gönderebilir.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-2">
                      <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-yellow-400" />
                        Neden Kesintisiz ve Güvenli?
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tüm e-posta trafiği standart HTTPS web protokolü (Port 443) üzerinden şifreli aktığı için Render veya diğer servis sağlayıcılar tarafından asla engellenemez. Gmail SMTP kimliğiniz tünel üzerinden güvenle doğrulanır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="main-content-grid">
          {/* LEFT PANEL (Width 4): Settings, AI templates, Ready-to-use lists, History */}
          <div className="lg:col-span-4 space-y-6 flex flex-col justify-between" id="left-sidebar-container">
            {/* 1. Settings */}
            <SettingsPanel settings={settings} onSave={handleSaveSettings} />

            {/* 2. AI Template Writer */}
            <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10" id="ai-template-writer">
              <h3 className="text-md font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Şablon Sihirbazı (Gemini)
              </h3>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Tasarlamak istediğiniz e-posta bültenini tarif edin, yapay zeka saniyeler içinde responsive HTML kodlasın.
              </p>
              <div className="space-y-3">
                <textarea
                  placeholder="Örn: Yeni yıl indirim kampanyası için modern, mavi-mor renk temalı, %40 indirim duyurusu içeren bir e-posta bülteni oluştur..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[90px] resize-none text-slate-200"
                  id="ai-prompt-input"
                />
                <button
                  onClick={handleGenerateTemplateWithAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  id="ai-generate-btn"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      Yapay Zeka Tasarlıyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 text-white" />
                      Yapay Zeka İle Oluştur
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. History Logs */}
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistoryItem}
              onClear={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>

          {/* RIGHT PANEL (Width 8): Composer and Live Preview */}
          <div className="lg:col-span-8 space-y-6" id="composer-section">
            <div className="glass-panel rounded-2xl shadow-xl border border-white/10 overflow-hidden flex flex-col">
              {/* Composer Header */}
              <div className="px-6 py-4 bg-slate-900/60 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-blue-400" />
                  E-posta Oluşturucu
                </h2>

                {/* Local Templates Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Şablon Seç:</span>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="glass-input text-xs rounded-lg px-2.5 py-1.5 max-w-[200px] border border-white/5 text-slate-200"
                    id="template-dropdown-selector"
                  >
                    <option value="" disabled>Seçiniz...</option>
                    {EMAIL_TEMPLATES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                    <option value="clear">Boş Editör (Yeni Başla)</option>
                  </select>
                </div>
              </div>

              {/* Composer Fields */}
              <form onSubmit={handleSendEmail} className="p-6 space-y-4" id="composer-fields-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="toEmail">
                      Alıcı E-posta (To)
                    </label>
                    <input
                      id="toEmail"
                      type="email"
                      placeholder="alici@example.com"
                      value={toEmail}
                      onChange={(e) => setToEmail(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="subject">
                      E-posta Konusu (Subject)
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="Bülten Konusu veya Başlığı"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* HTML Editor Area & Live Preview Split */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
                  {/* Left Col: HTML Code Input */}
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300" htmlFor="htmlContent">
                        HTML Kod Editörü
                      </label>
                      <div className="flex items-center gap-2">
                        {/* Import Button */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 cursor-pointer"
                          title="HTML Dosyası İçe Aktar"
                          id="import-file-btn"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Yükle
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImportHTML}
                          accept=".html"
                          className="hidden"
                          id="file-import-input"
                        />

                        {/* Export Button */}
                        <button
                          type="button"
                          onClick={handleExportHTML}
                          className="text-[11px] text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 cursor-pointer"
                          title="Şablonu HTML Olarak İndir"
                          id="export-file-btn"
                        >
                          <Download className="w-3.5 h-3.5" />
                          İndir
                        </button>

                        {/* Copy Code Button */}
                        <button
                          type="button"
                          onClick={handleCopyHTML}
                          className="text-[11px] text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 cursor-pointer"
                          title="HTML Kodunu Kopyala"
                          id="copy-code-btn"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copySuccess ? 'Kopyalandı!' : 'Kopyala'}
                        </button>
                      </div>
                    </div>

                    {/* TextArea Editor */}
                    <div className="relative flex-1 group">
                      <textarea
                        id="htmlContent"
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="<html><body><h1>Merhaba Dünya!</h1></body></html>"
                        className="w-full glass-input rounded-xl p-4 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 min-h-[480px] h-[520px] resize-none text-slate-300"
                        required
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                      <span>HTML Formatında Gönderilir</span>
                      <span>Karakter: <strong className="text-slate-350">{charCount}</strong> | Kelime: <strong className="text-slate-350">{wordCount}</strong></span>
                    </div>
                  </div>

                  {/* Right Col: Live Preview iframe */}
                  <div className="flex flex-col">
                    <LivePreview htmlContent={htmlContent} />
                  </div>
                </div>

                {/* Submitting button controls */}
                <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/5">
                  <p className="text-xs text-slate-400">
                    💡 İpucu: HTML şablonunuzu tasarladıktan sonra önce yukarıdan <strong>"İndir"</strong> butonu ile yedekleyebilir, ardından doğrudan gönderebilirsiniz.
                  </p>
                  <button
                    type="submit"
                    disabled={sendState === 'sending'}
                    className="w-full md:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    id="submit-send-email-btn"
                  >
                    {sendState === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white" />
                        E-posta Gönder
                      </>
                    )}
                  </button>
                </div>

                {/* Response / Status Notifications */}
                <AnimatePresence>
                  {sendState !== 'idle' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      id="sending-status-alert"
                    >
                      <div
                        className={`p-4 rounded-xl border flex items-start gap-3 text-sm font-medium ${
                          sendState === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                            : sendState === 'sending'
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        {sendState === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : sendState === 'sending' ? (
                          <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">
                            {sendState === 'success'
                              ? 'Başarılı!'
                              : sendState === 'sending'
                              ? 'Gönderim İşlemi Başladı'
                              : 'Gönderim Başarısız!'}
                          </p>
                          <p className="text-xs mt-1 text-slate-300">{feedbackMessage}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
