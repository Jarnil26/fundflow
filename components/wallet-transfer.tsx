'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface WalletTransferProps {
  onTransferComplete?: () => void;
}

export function WalletTransfer({ onTransferComplete }: WalletTransferProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.data || []))
      .catch((err) => console.log('[v0] Error fetching users:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.fromUserId === formData.toUserId) {
      console.log('[v0] Cannot transfer to the same wallet');
      return;
    }

    setLoading(true);

    try {
      // Transfer: update sender balance
      const fromUser = users.find((u) => u._id === formData.fromUserId);
      const toUser = users.find((u) => u._id === formData.toUserId);
      const amount = parseFloat(formData.amount);

      if (fromUser && toUser && fromUser.walletBalance >= amount) {
        // This would be done in a proper transaction
        // For now, just record the finance records
        await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: formData.fromUserId,
            type: 'expense',
            amount,
            category: 'Transfer',
            description: `Transfer to ${toUser.name}: ${formData.description}`,
            date: new Date(),
          }),
        });

        await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: formData.toUserId,
            type: 'income',
            amount,
            category: 'Transfer',
            description: `Transfer from ${fromUser.name}: ${formData.description}`,
            date: new Date(),
          }),
        });

        setFormData({
          fromUserId: '',
          toUserId: '',
          amount: '',
          description: '',
        });

        onTransferComplete?.();
      } else {
        console.log('[v0] Insufficient balance for transfer');
      }
    } catch (error) {
      console.log('[v0] Error processing transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Funds</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            From
          </label>
          <Select
            value={formData.fromUserId}
            onValueChange={(value) => setFormData({ ...formData, fromUserId: value })}
          >
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select sender" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name} (${user.walletBalance.toLocaleString()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">To</label>
          <Select
            value={formData.toUserId}
            onValueChange={(value) => setFormData({ ...formData, toUserId: value })}
          >
            <SelectTrigger className="bg-secondary border-border text-foreground">
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              {users.map((user) => (
                <SelectItem key={user._id} value={user._id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Amount
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            className="bg-secondary border-border text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            placeholder="Transfer reason"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-secondary border border-border text-foreground placeholder:text-muted-foreground rounded-md"
            rows={2}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-primary-foreground"
        >
          {loading ? 'Processing...' : 'Send Transfer'}
        </Button>
      </form>
    </Card>
  );
}
