'use client';

import { useState } from 'react';
import { Receipt, Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const EXPENSE_CATEGORIES = {
  company: ['rent', 'parcel', 'internet', 'tools', 'other'],
  project: ['development', 'design', 'testing', 'deployment', 'other'],
};

export default function ExpensesPage() {
  const { data: expenseData, mutate } = useSWR('/api/expenses', fetcher, {
    revalidateOnFocus: false,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [expenseType, setExpenseType] = useState<'company' | 'project'>('company');
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: '',
    description: '',
    category: '',
    categoryType: '',
  });
  const [loading, setLoading] = useState(false);

  const expenses = expenseData?.data || [];

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyTotal = expenses.reduce((sum: number, e: any) => {
    const expenseMonth = e.month || currentMonth;
    return expenseMonth === currentMonth ? sum + e.amount : sum;
  }, 0);

  const handleAddExpense = async () => {
    if (!formData.amount || !formData.description || !formData.categoryType) return;

    setLoading(true);
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: expenseType,
          month: formData.month,
          amount: parseFloat(formData.amount),
          description: formData.description,
          category: formData.categoryType,
          expenseType: formData.categoryType,
        }),
      });

      if (response.ok) {
        mutate();
        setShowDialog(false);
        setFormData({
          month: currentMonth,
          amount: '',
          description: '',
          category: '',
          categoryType: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Expenses</h1>
            <p className="text-muted-foreground">Track company and project expenses</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* Monthly Summary */}
        <Card className="p-6 bg-card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-lg">
              <Receipt className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Total ({currentMonth})</p>
              <p className="text-3xl font-bold text-foreground">₹{monthlyTotal.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </Card>

        {/* Expenses by Category */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Company Expenses */}
          <Card className="p-6 bg-card">
            <h2 className="text-lg font-bold text-foreground mb-4">Company Expenses</h2>
            <div className="space-y-3">
              {expenses
                .filter((e: any) => !e.taskId && (e.month || currentMonth) === currentMonth)
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((expense: any) => (
                  <div key={expense._id} className="flex justify-between items-start p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground capitalize">{expense.type || expense.category}</p>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                    </div>
                    <p className="font-bold text-foreground ml-4">₹{expense.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              {expenses.filter((e: any) => !e.taskId && (e.month || currentMonth) === currentMonth).length === 0 && (
                <p className="text-muted-foreground text-center py-6">No company expenses this month</p>
              )}
            </div>
          </Card>

          {/* Project Expenses */}
          <Card className="p-6 bg-card">
            <h2 className="text-lg font-bold text-foreground mb-4">Project Expenses</h2>
            <div className="space-y-3">
              {expenses
                .filter((e: any) => e.taskId && (e.month || currentMonth) === currentMonth)
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((expense: any) => (
                  <div key={expense._id} className="flex justify-between items-start p-3 bg-background rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{expense.projectName}</p>
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                    </div>
                    <p className="font-bold text-foreground ml-4">₹{expense.amount.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              {expenses.filter((e: any) => e.taskId && (e.month || currentMonth) === currentMonth).length === 0 && (
                <p className="text-muted-foreground text-center py-6">No project expenses this month</p>
              )}
            </div>
          </Card>
        </div>

        {/* All Expenses History */}
        <Card className="p-6 bg-card">
          <h2 className="text-lg font-bold text-foreground mb-4">Expense History</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {expenses
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 20)
              .map((expense: any) => (
                <div key={expense._id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      {expense.projectName || expense.type || expense.category}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
            {expenses.length === 0 && (
              <p className="text-muted-foreground text-center py-6">No expenses recorded</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type" className="text-foreground">
                Expense Type
              </Label>
              <Select value={expenseType} onValueChange={(value: any) => setExpenseType(value)}>
                <SelectTrigger className="mt-1 bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="company">Company Expense</SelectItem>
                  <SelectItem value="project">Project Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {expenseType === 'company' && (
              <div>
                <Label htmlFor="month" className="text-foreground">
                  Month
                </Label>
                <Input
                  id="month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="mt-1 bg-background text-foreground border-border"
                />
              </div>
            )}

            <div>
              <Label htmlFor="category" className="text-foreground">
                Category
              </Label>
              <Select
                value={formData.categoryType}
                onValueChange={(value) => setFormData({ ...formData, categoryType: value })}
              >
                <SelectTrigger className="mt-1 bg-background text-foreground border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {EXPENSE_CATEGORIES[expenseType].map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="mt-1 bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Input
                id="description"
                placeholder="What is this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 bg-background text-foreground border-border"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddExpense} disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
