'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ExpenseCardProps {
  id: string;
  title: string;
  amount: number;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  submittedBy: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function ExpenseCard({
  id,
  title,
  amount,
  category,
  status,
  submittedDate,
  submittedBy,
  onApprove,
  onReject,
}: ExpenseCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'rejected':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="bg-card border-border p-4 hover:border-accent/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-sm text-muted-foreground">{submittedBy}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="mb-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-semibold text-foreground">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Category</span>
          <span className="text-sm font-medium text-foreground">{category}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Submitted</span>
          <span className="text-sm text-foreground">{formatDate(submittedDate)}</span>
        </div>
      </div>

      {status === 'pending' && (
        <div className="flex gap-2 pt-3 border-t border-border">
          <Button
            size="sm"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => onApprove?.(id)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-red-500 hover:text-red-600 bg-transparent"
            onClick={() => onReject?.(id)}
          >
            Reject
          </Button>
        </div>
      )}
    </Card>
  );
}
