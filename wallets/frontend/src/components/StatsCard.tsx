import { cn } from '@/lib/utils';
import { Panel } from '@/components/ui/panel';

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ label, value, description, icon, className }: StatsCardProps) {
  return (
    <Panel className={cn('p-5 md:p-6', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      )}
    </Panel>
  );
}
