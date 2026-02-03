'use client';

import { Card } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: LucideIcon;
  type: 'income' | 'expense' | 'task' | 'approval';
}

interface ActivityListProps {
  activities: Activity[];
  title?: string;
}

export function ActivityList({ activities, title = 'Recent Activity' }: ActivityListProps) {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'income':
        return 'text-green-500';
      case 'expense':
        return 'text-red-500';
      case 'task':
        return 'text-accent';
      case 'approval':
        return 'text-yellow-500';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No activity yet</p>
        ) : (
          activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex gap-3 pb-3 border-b border-border last:border-0">
                <div className={`mt-1 ${getTypeColor(activity.type)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
