'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardLayout } from '@/components/dashboard-layout';
import { FinanceForm } from '@/components/finance-form';
import { FinanceList } from '@/components/finance-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

/* =========================
   TYPES
========================= */
interface FinanceRecord {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
}

/* =========================
   SAFE CURRENCY FORMATTER
========================= */
const money = (value?: number | null) =>
  (value ?? 0).toLocaleString('en-IN');

export default function FinancePage() {
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  /* =========================
     FETCH DATA
  ========================= */
  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/finance');
      const json = await response.json();
      setRecords(json?.data ?? []);
    } catch (error) {
      console.error('[v0] Error fetching finance records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  /* =========================
     FILTERING
  ========================= */
  const getFilteredRecords = (filter: string) => {
    if (filter === 'income') return records.filter(r => r.type === 'income');
    if (filter === 'expense') return records.filter(r => r.type === 'expense');
    return records;
  };

  /* =========================
     CALCULATIONS (SAFE)
  ========================= */
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  const net = totalIncome - totalExpense;

  /* =========================
     UI
  ========================= */
  return (
    <DashboardLayout
      title="Finance Management"
      subtitle="Track income, expenses, and financial performance"
    >
      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Income */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Income
              </h3>
              <p className="text-2xl font-bold text-green-500 mt-2">
                ₹ {money(totalIncome)}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* Expense */}
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-red-500 mt-2">
                ₹ {money(totalExpense)}
              </p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        {/* Net */}
        <Card
          className={`bg-gradient-to-br ${
            net >= 0
              ? 'from-accent/10 to-accent/5 border-accent/20'
              : 'from-red-500/10 to-red-500/5 border-red-500/20'
          } p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Net Balance
              </h3>
              <p
                className={`text-2xl font-bold mt-2 ${
                  net >= 0 ? 'text-accent' : 'text-red-500'
                }`}
              >
                ₹ {money(net)}
              </p>
            </div>
            <div
              className={`p-3 ${
                net >= 0 ? 'bg-accent/20' : 'bg-red-500/20'
              } rounded-lg`}
            >
              <DollarSign
                className={`w-6 h-6 ${
                  net >= 0 ? 'text-accent' : 'text-red-500'
                }`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <FinanceForm onRecordCreated={fetchRecords} />
        </div>

        {/* Records */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">
                All ({records.length})
              </TabsTrigger>
              <TabsTrigger value="income">
                Income ({getFilteredRecords('income').length})
              </TabsTrigger>
              <TabsTrigger value="expense">
                Expenses ({getFilteredRecords('expense').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <FinanceList records={records} loading={loading} />
            </TabsContent>

            <TabsContent value="income">
              <FinanceList
                records={getFilteredRecords('income')}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="expense">
              <FinanceList
                records={getFilteredRecords('expense')}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
