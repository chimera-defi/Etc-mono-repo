import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const variantClasses: Record<BadgeVariant, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  accent: 'border-primary/25 bg-primary/10 text-primary',
  success: 'border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-400',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-300',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.02em]',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
