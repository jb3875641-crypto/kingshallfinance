import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend = 'neutral', className }: MetricCardProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-primary',
  };

  const iconBgColors = {
    up: 'bg-success/10',
    down: 'bg-destructive/10',
    neutral: 'bg-primary/10',
  };

  return (
    <div className={cn(
      "bg-card p-6 rounded-lg shadow-sm border border-border/50 transition-all duration-200 hover:shadow-md animate-fade-in",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold tracking-tight", trendColors[trend])}>
            {typeof value === 'number' ? `$${value.toFixed(2)}` : value}
          </p>
        </div>
        <div className={cn("p-3 rounded-xl", iconBgColors[trend])}>
          <Icon className={cn("h-6 w-6", trendColors[trend])} />
        </div>
      </div>
    </div>
  );
}
