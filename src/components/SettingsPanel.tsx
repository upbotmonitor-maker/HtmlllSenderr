/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MailSettings } from '../types';
import { Mail, Key, Eye, EyeOff, Save, CheckCircle, HelpCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsPanelProps {
  settings: MailSettings;
  onSave: (newSettings: MailSettings) => void;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [gmailAddress, setGmailAddress] = useState(settings.gmailAddress);
  const [gmailAppPassword, setGmailAppPassword] = useState(settings.gmailAppPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setGmailAddress(settings.gmailAddress);
    setGmailAppPassword(settings.gmailAppPassword);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ gmailAddress, gmailAppPassword });
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 3000);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10" id="settings-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-400" />
          Gmail SMTP Ayarları
        </h3>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-slate-400 hover:text-blue-400 transition-colors"
          title="Yardım"
          id="help-toggle-btn"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
            id="help-box"
          >
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-300 text-xs space-y-2">
              <p className="font-semibold text-blue-400">SMTP Ayarları Nasıl Yapılır?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Gmail hesabınızda <strong>2 Adımlı Doğrulama</strong>'nın açık olduğundan emin olun.</li>
                <li>Google Hesabım {'>'} Güvenlik sayfasına gidin.</li>
                <li>Arama çubuğuna <strong>"Uygulama şifreleri"</strong> veya <strong>"App passwords"</strong> yazın.</li>
                <li>Uygulamanız için bir isim vererek (örn: Mail Sender) 16 haneli bir şifre oluşturun.</li>
                <li>Oluşturulan 16 karakterli şifreyi aralardaki boşluklar olmadan buradaki şifre alanına girin.</li>
              </ol>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4" id="settings-form">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="gmailAddress">
            Gmail Adresiniz
          </label>
          <div className="relative">
            <input
              id="gmailAddress"
              type="email"
              placeholder="ornek@gmail.com"
              value={gmailAddress}
              onChange={(e) => setGmailAddress(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200"
              required
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400">@</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="gmailAppPassword">
            Gmail App Şifresi (16 Karakter)
          </label>
          <div className="relative">
            <input
              id="gmailAppPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="xxxx xxxx xxxx xxxx"
              value={gmailAppPassword}
              onChange={(e) => setGmailAppPassword(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200 font-mono tracking-widest"
              required
            />
            <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              id="password-visibility-btn"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/10 cursor-pointer text-sm"
            id="save-settings-btn"
          >
            <Save className="w-4 h-4" />
            Kaydet
          </button>
        </div>

        <AnimatePresence>
          {showSavedMsg && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 text-emerald-400 text-xs justify-center font-medium bg-emerald-500/10 border border-emerald-500/20 py-2 rounded-xl"
              id="saved-notification"
            >
              <CheckCircle className="w-4 h-4" />
              Ayarlar başarıyla kaydedildi!
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="mt-5 pt-4 border-t border-white/5" id="security-notice-box">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[11px] leading-relaxed text-slate-300">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-400">🛡️ Güvenlik ve Gizlilik Garantisi</p>
            <p>
              Şifreniz ve e-posta adresiniz <strong>asla harici bir sunucuda veya veritabanında saklanmaz</strong>. Bilgileriniz tamamen tarayıcınızın kendi <strong>Yerel Depolama (Local Storage)</strong> alanında barındırılır.
            </p>
            <p>
              E-posta gönderimi esnasında, bilgileriniz doğrudan ve anlık (bellekte geçici olarak) güvenli SSL bağlantısıyla SMTP geçidimize aktarılır. Kodlarımız tamamen şeffaf ve güvenlidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
