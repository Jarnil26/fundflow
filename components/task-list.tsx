'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  estimatedHours: number;
  assignedTo: string;
}

interface TaskListProps {
  tasks: Task[];
  onStatusChange?: (taskId: string, status: string) => void;
  loading?: boolean;
}

export function TaskList({ tasks, onStatusChange, loading }: TaskListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border p-6">
        <p className="text-muted-foreground text-center">Loading tasks...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <Card className="bg-card border-border p-6">
          <p className="text-muted-foreground text-center">No tasks yet</p>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card
            key={task._id}
            className="bg-card border-border p-4 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{task.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status === 'in-progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {task.estimatedHours}h estimated
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due: {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              </div>

              {task.status !== 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    onStatusChange?.(
                      task._id,
                      task.status === 'pending' ? 'in-progress' : 'completed'
                    )
                  }
                  className="whitespace-nowrap"
                >
                  {task.status === 'pending' ? 'Start' : 'Complete'}
                </Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
