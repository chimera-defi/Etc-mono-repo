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
    <div className={cn('glass-panel p-6', className)}>
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-sky-300">{icon}</div>}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}
