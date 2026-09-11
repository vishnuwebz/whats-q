import React from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useQiyamStore();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium transition-all transform translate-y-0 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-slate-900 text-white border-slate-800'
                : isWarning
                ? 'bg-amber-900 text-white border-amber-800'
                : isError
                ? 'bg-red-900 text-white border-red-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {isWarning && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {isError && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            {!isSuccess && !isWarning && !isError && <Info className="w-4 h-4 text-blue-400 shrink-0" />}

            <span className="flex-1">{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

