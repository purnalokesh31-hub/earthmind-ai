'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../stores/app-store';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  durationMs?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const toastIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
};

const toastBorders = {
  success: 'border-emerald-500/40 bg-[#061410]/95 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  error: 'border-rose-500/40 bg-[#16080b]/95 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
  warning: 'border-amber-500/40 bg-[#171105]/95 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  info: 'border-cyan-500/40 bg-[#05111b]/95 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
};

// Single Toast Item Component
const ToastCard: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const type = toast.type || 'info';

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs || 4500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'p-3.5 rounded-xl border backdrop-blur-xl flex items-start gap-3 min-w-[300px] max-w-sm pointer-events-auto font-mono text-slate-100 relative overflow-hidden',
        toastBorders[type]
      )}
    >
      {toastIcons[type]}
      <div className="flex-1 min-w-0 pr-2">
        <h5 className="text-[11px] font-bold tracking-wide leading-snug">{toast.title}</h5>
        {toast.message && (
          <p className="text-[10px] text-slate-300 mt-0.5 leading-normal">{toast.message}</p>
        )}

        {/* Optional Action Button (e.g. Undo) */}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="mt-2 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black text-[10px] border border-amber-500/40 transition uppercase tracking-wider shadow-sm flex items-center gap-1"
          >
            <span>{toast.action.label}</span>
          </button>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/10 transition shrink-0"
      >
        <X className="w-3 h-3" />
      </button>

      {/* Timer Progress Indicator */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.durationMs || 4500) / 1000, ease: 'linear' }}
        className={cn(
          'absolute bottom-0 left-0 h-0.5',
          type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-rose-400' : type === 'warning' ? 'bg-amber-400' : 'bg-cyan-400'
        )}
      />
    </motion.div>
  );
};

// Global Lightweight Toast Provider Component
export const ToastProvider: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastProvider;
