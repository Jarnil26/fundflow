'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Send, Plus } from 'lucide-react';

interface WalletCardProps {
  name: string;
  balance: number;
  email: string;
  role: string;
  onAddFunds?: () => void;
  onTransfer?: () => void;
}

export function WalletCard({
  name,
  balance,
  email,
  role,
  onAddFunds,
  onTransfer,
}: WalletCardProps) {
  return (
    <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-1">Balance</p>
        <p className="text-3xl font-bold text-accent">
          ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{email}</p>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
          onClick={onAddFunds}
        >
          <Plus className="w-4 h-4" />
          Add Funds
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2 bg-transparent"
          onClick={onTransfer}
        >
          <Send className="w-4 h-4" />
          Transfer
        </Button>
      </div>
    </Card>
  );
}
