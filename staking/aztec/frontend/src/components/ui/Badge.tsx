'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'pending' | 'error' | 'default';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    success: 'bg-aztec-success/20 text-aztec-success border-aztec-success/30',
    warning: 'bg-aztec-warning/20 text-aztec-warning border-aztec-warning/30',
    pending: 'bg-aztec-purple/20 text-aztec-purple-light border-aztec-purple/30 animate-pulse-slow',
    error: 'bg-aztec-error/20 text-aztec-error border-aztec-error/30',
    default: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
