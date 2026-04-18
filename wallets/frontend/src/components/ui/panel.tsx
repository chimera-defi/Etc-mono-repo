import * as React from 'react';
import { cn } from '@/lib/utils';

type PanelTone = 'default' | 'muted' | 'accent';

const toneClasses: Record<PanelTone, string> = {
  default: 'bg-card/85',
  muted: 'bg-muted/35',
  accent: 'bg-primary/10',
};

export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone;
}

export function Panel({ className, tone = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'wr-panel border border-border rounded-2xl backdrop-blur-sm',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
