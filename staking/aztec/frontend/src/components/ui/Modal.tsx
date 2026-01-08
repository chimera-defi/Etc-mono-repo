'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-aztec-card border border-aztec-border rounded-2xl shadow-xl',
          'w-full max-w-md mx-4 max-h-[90vh] overflow-auto',
          'animate-in fade-in zoom-in-95 duration-200',
          className
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-aztec-border">
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-aztec-dark"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
