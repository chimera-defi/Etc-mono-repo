'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

export function Card({ title, children, className, headerRight }: CardProps) {
  return (
    <div
      className={cn(
        'bg-aztec-card border border-aztec-border rounded-2xl',
        'shadow-lg shadow-black/20',
        className
      )}
    >
      {(title || headerRight) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-aztec-border">
          {title && (
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          )}
          {headerRight}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
