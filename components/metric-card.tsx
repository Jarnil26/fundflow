'use client';

import { Card } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export function MetricCard({ title, value, icon: Icon, trend, trendPositive }: MetricCardProps) {
  return (
    <Card className="bg-card border-border p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <Icon className="w-5 h-5 text-accent" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && (
          <p className={`text-xs font-medium ${trendPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend}
          </p>
        )}
      </div>
    </Card>
  );
}
