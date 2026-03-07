import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-l-4 border-l-success',
  warning: 'border-l-4 border-l-warning',
  destructive: 'border-l-4 border-l-destructive',
};

export function DashboardCard({ title, value, icon: Icon, trend, variant = 'default', className }: DashboardCardProps) {
  return (
    <div className={cn('bg-card rounded-lg p-4 sm:p-5 card-shadow border', variantStyles[variant], className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider mb-0.5" title={title}>{title}</p>
          <p className="text-lg sm:text-xl font-extrabold text-foreground">{typeof value === 'number' ? value.toLocaleString('en-IN') : value}</p>
          {trend && <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{trend}</p>}
        </div>
        <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
        </div>
      </div>
    </div>
  );
}
