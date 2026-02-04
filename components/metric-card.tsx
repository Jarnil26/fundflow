'use client';

import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color?: string;
  trend?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  color = 'from-slate-500 to-slate-600',
  trend,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-6 text-white bg-gradient-to-r ${color}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-90">{title}</p>
        <Icon className="h-5 w-5 opacity-90" />
      </div>

      <p className="text-2xl font-bold mt-2">{value}</p>

      {trend && (
        <p className="text-xs opacity-80 mt-1">
          {trend}
        </p>
      )}
    </div>
  );
}
