'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface FinanceRecord {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId?: string;
}

interface FinanceListProps {
  records: FinanceRecord[];
  loading?: boolean;
}

export function FinanceList({ records, loading }: FinanceListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border p-6">
        <p className="text-muted-foreground text-center">Loading records...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {records.length === 0 ? (
        <Card className="bg-card border-border p-6">
          <p className="text-muted-foreground text-center">No finance records yet</p>
        </Card>
      ) : (
        records.map((record) => (
          <Card
            key={record._id}
            className="bg-card border-border p-4 hover:border-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`p-2 rounded-lg ${
                    record.type === 'income'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}
                >
                  {record.type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{record.category}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {record.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`font-semibold ${
                    record.type === 'income'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(record.date)}
                </span>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
