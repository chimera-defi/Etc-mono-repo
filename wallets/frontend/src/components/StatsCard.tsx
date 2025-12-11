import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({ label, value, description, icon, className }: StatsCardProps) {
  return (
    <div className={cn('p-6 rounded-lg border border-border bg-card', className)}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-primary">{icon}</div>}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
