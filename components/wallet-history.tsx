'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Wallet, Download, Upload } from 'lucide-react';

interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string;
  date: string;
  category: string;
}

interface WalletHistoryProps {
  transactions: Transaction[];
  loading?: boolean;
}

export function WalletHistory({ transactions, loading }: WalletHistoryProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <Upload className="w-4 h-4 text-green-500" />;
      case 'expense':
        return <Download className="w-4 h-4 text-red-500" />;
      case 'transfer_in':
      case 'transfer_out':
        return <Send className="w-4 h-4 text-accent" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'expense':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      case 'transfer_in':
      case 'transfer_out':
        return 'bg-accent/10 text-accent';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="bg-card border-border p-6">
        <p className="text-muted-foreground text-center">Loading history...</p>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Transaction History</h3>
      {transactions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">
                    {transaction.category}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-semibold ${
                    transaction.type === 'income' || transaction.type === 'transfer_in'
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {transaction.type === 'income' || transaction.type === 'transfer_in'
                    ? '+'
                    : '-'}
                  ${transaction.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
