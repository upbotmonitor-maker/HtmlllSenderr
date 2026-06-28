/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from 'lucide-react';

interface LivePreviewProps {
  htmlContent: string;
}

type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export default function LivePreview({ htmlContent }: LivePreviewProps) {
  const [device, setDevice] = useState<PreviewDevice>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  const handleRefresh = () => {
    setPreviewKey((prev) => prev + 1);
  };

  const getDeviceWidthClass = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[375px] h-[550px]';
      case 'tablet':
        return 'max-w-[640px] h-[650px]';
      case 'desktop':
      default:
        return 'w-full h-[650px]';
    }
  };

  const handleOpenNewWindow = () => {
    const win = window.open();
    if (win) {
      win.document.write(htmlContent);
      win.document.close();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden" id="live-preview-container">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/60 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-xs font-semibold text-slate-300 ml-2">Canlı Önizleme (Sandbox)</span>
        </div>

        {/* Device selectors */}
        <div className="flex items-center bg-slate-850 p-0.5 rounded-lg border border-white/5">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1.5 rounded-md transition-all ${
              device === 'desktop'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Masaüstü (Tam Genişlik)"
            id="device-desktop-btn"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1.5 rounded-md transition-all ${
              device === 'tablet'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tablet (640px)"
            id="device-tablet-btn"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1.5 rounded-md transition-all ${
              device === 'mobile'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Mobil (375px)"
            id="device-mobile-btn"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Yeniden Yükle"
            id="preview-refresh-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleOpenNewWindow}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title="Yeni Sekmede Aç"
            id="preview-external-btn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Wrapper */}
      <div className="flex-1 bg-slate-950/20 p-4 overflow-auto flex items-center justify-center min-h-[400px]" id="preview-frame-wrapper">
        <div className={`w-full transition-all duration-300 shadow-2xl rounded-xl overflow-hidden border border-white/5 bg-white ${getDeviceWidthClass()}`}>
          {htmlContent ? (
            <iframe
              key={previewKey}
              srcDoc={htmlContent}
              className="w-full h-full border-0 bg-white"
              title="HTML E-posta Önizleme"
              sandbox="allow-same-origin"
            />
          ) : (
            <div className="w-full h-full bg-white flex flex-col items-center justify-center p-8 text-slate-400 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Monitor className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-semibold text-slate-700">Canlı Önizleme Alanı</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                Önizleme oluşturmak için sol taraftaki editöre kod yazabilir veya hazır bir şablon seçebilirsiniz.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
