import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useNotification();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClasses = 'border-brand-500 bg-slate-900 text-white';
        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClasses = 'border-emerald-500 bg-slate-900 text-white';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClasses = 'border-rose-500 bg-slate-900 text-white';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClasses = 'border-amber-500 bg-slate-900 text-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border-l-4 ${borderClasses} backdrop-blur-md animate-slide-in transition-all`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-brand-400" />
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
