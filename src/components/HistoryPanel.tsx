/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SentEmailItem } from '../types';
import { History, CheckCircle2, XCircle, Trash2, FileEdit, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryPanelProps {
  history: SentEmailItem[];
  onSelect: (item: SentEmailItem) => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

export default function HistoryPanel({ history, onSelect, onClear, onDeleteItem }: HistoryPanelProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl shadow-xl border border-white/10 flex flex-col h-[400px]" id="history-panel">
      <div className="flex items-center justify-between mb-4 shrink-0">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Gönderim Geçmişi ({history.length})
        </h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10"
            id="clear-all-history-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Tümünü Temizle
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="history-list-container">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center py-8">
            <Clock className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
            <p className="text-sm">Henüz gönderim geçmişi bulunmuyor.</p>
            <p className="text-xs mt-1">Gönderdiğiniz mailler burada listelenir.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3.5 rounded-xl bg-slate-900/40 border border-white/5 hover:border-blue-500/25 transition-all flex items-start justify-between gap-3 group relative"
                id={`history-item-${item.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" title="Başarılı" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" title="Hata" />
                    )}
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDate(item.timestamp)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate pr-4">
                    Alıcı: {item.toEmail}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">
                    Konu: {item.subject}
                  </p>
                  {item.status === 'error' && item.errorMessage && (
                    <p className="text-[10px] text-rose-400 mt-1 line-clamp-2 bg-rose-500/5 p-1 rounded border border-rose-500/10 font-mono">
                      Hata: {item.errorMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelect(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    title="Editörde Aç ve Düzenle"
                    id={`load-history-${item.id}`}
                  >
                    <FileEdit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                    title="Sil"
                    id={`delete-history-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
