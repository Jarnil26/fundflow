'use client';

import {
  DollarSign,
  TrendingDown,
  PiggyBank,
  TrendingUp,
  AlertCircle,
  Users,
  Clock,
  Wallet,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';

/* =========================
   FORMATTERS
========================= */
const money = (v?: number | null) =>
  (Number(v) || 0).toLocaleString('en-IN');

const percent = (v?: number | null) =>
  (Number(v) || 0).toFixed(1);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR('/api/finance', fetcher, {
    revalidateOnFocus: false,
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
    pendingPaymentTasks: [],
  };

  /* =========================
     DERIVED VALUES
  ========================= */
  const totalEmployeeProjectIncome = Object.values(
    data.employeeEarnings || {}
  ).reduce((sum: number, v: any) => sum + Number(v || 0), 0);

  const remainingAmount =
    data.totalRevenue -
    data.totalGST -
    data.totalSavings -
    totalEmployeeProjectIncome;

  /* =========================
     MARK TASK AS PAID
  ========================= */
  const markAsPaid = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus: 'PAID' }),
    });

    mutate();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Complete overview of finances, earnings, and pending payouts
          </p>
        </div>

        {/* MAIN METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`₹${money(data.totalRevenue)}`}
            icon={DollarSign}
            color="from-blue-500 to-blue-600"
            trend={
              data.taskCount > 0
                ? `${data.taskCount} paid tasks`
                : 'No paid tasks'
            }
          />

          <MetricCard
            title="GST Paid"
            value={`₹${money(data.totalGST)}`}
            icon={TrendingDown}
            color="from-amber-500 to-amber-600"
            trend={`${percent(18)}% of revenue`}
          />

          <MetricCard
            title="Total Savings"
            value={`₹${money(data.totalSavings)}`}
            icon={PiggyBank}
            color="from-green-500 to-green-600"
            trend={`${percent(10)}% of post-GST`}
          />

          {/* ✅ NEW REMAINING AMOUNT CARD */}
          <MetricCard
            title="Remaining Amount"
            value={`₹${money(remainingAmount)}`}
            icon={Wallet}
            color="from-teal-500 to-teal-600"
            trend="After GST, savings & employee payout"
          />

          <MetricCard
            title="Final Net Profit"
            value={`₹${money(data.finalNetProfit)}`}
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
            trend={
              data.finalNetProfit > 0
                ? 'After expenses'
                : 'Review expenses'
            }
          />
        </div>

        {/* EMPLOYEE + WALLET */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* EMPLOYEE EARNINGS */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">
                Employee Earnings (Paid)
              </h2>
            </div>

            {Object.keys(data.employeeEarnings).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No paid earnings yet
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(data.employeeEarnings).map(
                  ([employeeId, earning]) => (
                    <div
                      key={employeeId}
                      className="flex justify-between items-center p-3 bg-background rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{employeeId}</p>
                        <p className="text-sm text-muted-foreground">
                          Paid tasks only
                        </p>
                      </div>
                      <p className="text-lg font-bold text-primary">
                        ₹{money(earning as number)}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </Card>

          {/* WALLET ALERT */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold">
                Wallets Pending Payout
              </h2>
            </div>

            <div className="text-center py-8">
              <p className="text-5xl font-bold text-orange-500 mb-2">
                ₹{money(data.walletsPending)}
              </p>
              <p className="text-muted-foreground">
                Unpaid employee balances
              </p>
            </div>
          </Card>
        </div>

        {/* 🔴 PENDING PAYMENT TASKS */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold">
              Completed Tasks – Payment Pending (This Month)
            </h2>
          </div>

          {data.pendingPaymentTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No pending payment tasks 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {data.pendingPaymentTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.employeeId} •{' '}
                      {new Date(task.completedAt).toDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <p className="font-bold text-orange-500">
                      ₹{money(task.amount)}
                    </p>

                    <button
                      onClick={() => markAsPaid(task.id)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
