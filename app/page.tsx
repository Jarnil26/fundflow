'use client';

import { useEffect } from 'react';
import {
  DollarSign,
  TrendingDown,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';

/* =========================
   SAFE FORMATTERS
========================= */
const money = (v?: number | null) =>
  (Number(v) || 0).toLocaleString('en-IN');

const percent = (v?: number | null) =>
  (Number(v) || 0).toFixed(1);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: response, isLoading } = useSWR('/api/finance', fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const data = response?.data ?? {
    totalRevenue: 0,
    totalGST: 0,
    totalSavings: 0,
    totalNetProfit: 0,
    companyExpenseTotal: 0,
    finalNetProfit: 0,
    walletsPending: 0,
    employeeEarnings: {},
    taskCount: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of your finances and business operations
          </p>
        </div>

        {/* MAIN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Revenue"
            value={`₹${money(data.totalRevenue)}`}
            icon={DollarSign}
            color="from-blue-500 to-blue-600"
            trend={data.taskCount > 0 ? `${data.taskCount} tasks` : 'No completed tasks'}
          />

          <MetricCard
            label="GST Paid"
            value={`₹${money(data.totalGST)}`}
            icon={TrendingDown}
            color="from-amber-500 to-amber-600"
            trend={`${percent(18)}% of revenue`}
          />

          <MetricCard
            label="Total Savings"
            value={`₹${money(data.totalSavings)}`}
            icon={PiggyBank}
            color="from-green-500 to-green-600"
            trend={`${percent(10)}% of post-GST`}
          />

          <MetricCard
            label="Final Net Profit"
            value={`₹${money(data.finalNetProfit)}`}
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
            trend={data.finalNetProfit > 0 ? 'After expenses' : 'Check expenses'}
          />
        </div>

        {/* EMPLOYEE EARNINGS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Employee Earnings</h2>
            </div>

            <div className="space-y-4">
              {Object.keys(data.employeeEarnings || {}).length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No employee earnings yet
                </p>
              )}

              {Object.entries(data.employeeEarnings || {}).map(
                ([employeeId, earning]) => (
                  <div
                    key={employeeId}
                    className="flex justify-between items-center p-3 bg-background rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{employeeId}</p>
                      <p className="text-sm text-muted-foreground">
                        From completed tasks
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ₹{money(earning as number)}
                    </p>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* WALLET ALERT */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold">Wallets Pending Payout</h2>
            </div>

            <div className="text-center py-8">
              <p className="text-5xl font-bold text-orange-500 mb-2">
                ₹{money(data.walletsPending)}
              </p>

              <p className="text-muted-foreground mb-4">
                Total pending employee payouts
              </p>

              {Number(data.walletsPending) >= 5000 && (
                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-3 text-sm">
                  ⚠️ Wallet balance ≥ ₹5000. Process payouts soon.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* FINANCIAL SUMMARY */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">Financial Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                Completed Tasks
              </p>
              <p className="text-2xl font-bold">{data.taskCount}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Avg per Task</p>
              <p className="text-2xl font-bold">
                ₹{data.taskCount > 0
                  ? money(data.totalRevenue / data.taskCount)
                  : '0'}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Company Expenses
              </p>
              <p className="text-2xl font-bold text-red-500">
                ₹{money(data.companyExpenseTotal)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Profit Margin
              </p>
              <p className="text-2xl font-bold">
                {data.totalRevenue > 0
                  ? percent(
                      (data.finalNetProfit / data.totalRevenue) * 100
                    )
                  : '0'}
                %
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
