import { cn } from '@/lib/utils'

export interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
  }
  
  return (
    <span 
      data-testid="badge"
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 font-mono text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
