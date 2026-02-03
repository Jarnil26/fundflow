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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinanceFormProps {
  onRecordCreated?: () => void;
}

const INCOME_CATEGORIES = [
  'Client Payment',
  'Project Completion',
  'Service Revenue',
  'Consulting',
  'Refund',
  'Other',
];

const EXPENSE_CATEGORIES = [
  'Travel',
  'Marketing',
  'Office Supplies',
  'Software',
  'Equipment',
  'Meals',
  'Other',
];

export function FinanceForm({ onRecordCreated }: FinanceFormProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [formData, setFormData] = useState({
    userId: '',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((data) => setUsers(data.data || []))
      .catch((err) => console.log('[v0] Error fetching users:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: formData.userId,
          type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          date: new Date(formData.date),
        }),
      });

      if (response.ok) {
        setFormData({
          userId: '',
          amount: '',
          category: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
        });
        onRecordCreated?.();
      }
    } catch (error) {
      console.log('[v0] Error creating finance record:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Record Finance</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs value={type} onValueChange={(value) => {
          setType(value as 'income' | 'expense');
          setFormData({ ...formData, category: '' });
        }}>
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="income" className="data-[state=active]:bg-accent">
              Income
            </TabsTrigger>
            <TabsTrigger value="expense" className="data-[state=active]:bg-accent">
              Expense
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">User</label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select user" />
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
            <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-secondary border-border text-foreground">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Date</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="bg-secondary border-border text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            placeholder="Transaction description"
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
          {loading ? 'Recording...' : 'Record Transaction'}
        </Button>
      </form>
    </Card>
  );
}
