'use client';

import { useState } from 'react';
import { Receipt, Plus } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_OPTIONS = [
  {
    value: 'DIGITAL',
    label: 'Digital (Social Media / Ads)',
  },
  {
    value: 'GRAPHIC',
    label: 'Graphic / Design / Printing',
  },
  {
    value: 'COMMON',
    label: 'Common / Office / Company',
  },
];

export default function ExpensesPage() {
  const { data: expenseData, mutate } = useSWR('/api/expenses', fetcher, {
    revalidateOnFocus: false,
  });

  const expenses = expenseData?.data || [];

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyTotal = expenses.reduce((sum: number, e: any) => {
    const expenseMonth = e.month || currentMonth;
    return expenseMonth === currentMonth
      ? sum + Number(e.amount || 0)
      : sum;
  }, 0);

  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [expenseType, setExpenseType] = useState<'company' | 'project'>(
    'company'
  );

  const [formData, setFormData] = useState({
    month: currentMonth,
    amount: '',
    description: '',
    category: 'COMMON' as 'DIGITAL' | 'GRAPHIC' | 'COMMON',
  });

  /* =========================
     ADD EXPENSE
  ========================= */
  const handleAddExpense = async () => {
    if (!formData.amount || !formData.description) return;

    setLoading(true);
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: expenseType,
          month: formData.month,
          amount: Number(formData.amount),
          description: formData.description,
          category: formData.category, // 🔥 IMPORTANT
        }),
      });

      if (res.ok) {
        mutate();
        setShowDialog(false);
        setFormData({
          month: currentMonth,
          amount: '',
          description: '',
          category: 'COMMON',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Expenses</h1>
            <p className="text-muted-foreground">
              Track company, graphic & digital expenses
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* MONTHLY SUMMARY */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Receipt className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Monthly Total ({currentMonth})
              </p>
              <p className="text-3xl font-bold">
                ₹{monthlyTotal.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </Card>

        {/* EXPENSE LIST */}
        <Card className="p-6">
          <h2 className="text-lg font-bold mb-4">Recent Expenses</h2>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenses
              .sort(
                (a: any, b: any) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((expense: any) => (
                <div
                  key={expense._id}
                  className="flex justify-between items-center p-3 bg-background rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {expense.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} •{' '}
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}

            {expenses.length === 0 && (
              <p className="text-muted-foreground text-center py-6">
                No expenses recorded
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* ADD EXPENSE DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* TYPE */}
            <div>
              <Label>Expense Type</Label>
              <Select
                value={expenseType}
                onValueChange={(v: any) => setExpenseType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">
                    Company Expense
                  </SelectItem>
                  <SelectItem value="project">
                    Project Expense
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MONTH */}
            {expenseType === 'company' && (
              <div>
                <Label>Month</Label>
                <Input
                  type="month"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      month: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {/* CATEGORY */}
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, category: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AMOUNT */}
            <div>
              <Label>Amount (₹)</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddExpense}
                disabled={loading}
              >
                {loading ? 'Adding…' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
