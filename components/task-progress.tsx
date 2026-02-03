'use client';

import { Card } from '@/components/ui/card';

interface TaskProgressProps {
  completed: number;
  total: number;
  label?: string;
}

export function TaskProgress({ completed, total, label = 'Tasks Completed' }: TaskProgressProps) {
  const percentage = (completed / total) * 100;

  return (
    <Card className="bg-card border-border p-6 flex flex-col gap-4">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{percentage.toFixed(0)}%</span>
        <span className="text-xs text-muted-foreground">
          {completed} of {total}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="bg-accent h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </Card>
  );
}
