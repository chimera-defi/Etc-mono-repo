'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle2, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

type ToastType = 'success' | 'error' | 'info' | 'pending';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, description?: string) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, type: ToastType, message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, type, message, description };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss non-pending toasts after 5 seconds
    if (type !== 'pending') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateToast = useCallback((id: string, type: ToastType, message: string, description?: string) => {
    setToasts((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, type, message, description } : t
      )
    );

    // Auto-dismiss after update if not pending
    if (type !== 'pending') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-aztec-success" />,
    error: <AlertCircle className="w-5 h-5 text-aztec-error" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    pending: <Loader2 className="w-5 h-5 text-aztec-purple-light animate-spin" />,
  };

  const backgrounds = {
    success: 'border-aztec-success/30',
    error: 'border-aztec-error/30',
    info: 'border-blue-400/30',
    pending: 'border-aztec-purple/30',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 min-w-[300px] max-w-md',
        'bg-aztec-card border rounded-xl shadow-xl',
        'animate-in slide-in-from-right-5 duration-200',
        backgrounds[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white">{toast.message}</p>
        {toast.description && (
          <p className="text-sm text-gray-400 mt-0.5">{toast.description}</p>
        )}
      </div>
      {toast.type !== 'pending' && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
