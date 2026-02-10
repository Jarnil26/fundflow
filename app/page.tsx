'use client';

import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  FileClock,
  Wallet,
  PiggyBank,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricCard } from '@/components/metric-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useSWR from 'swr';

/* =========================
   HELPERS
========================= */
const money = (v?: number | null) =>
  (Number(v) || 0).toLocaleString('en-IN');

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Dashboard() {
  const { data: response, isLoading } = useSWR(
    '/api/finance',
    fetcher,
    { revalidateOnFocus: false }
  );

  /* =========================
     LOADING STATE
  ========================= */
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2" />
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  /* =========================
     SAFE DATA DEFAULTS
  ========================= */
  const data = response?.data ?? {
    paidInvoiceCount: 0,
    unpaidInvoiceCount: 0,
    totalBilled: 0,
    totalGST: 0,
    totalRevenue: 0,
    totalSavings: 0,
    companyExpenseTotal: 0,
    finalNetProfit: 0,
    walletsPending: 0,
    pendingInvoices: [],
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Financial Dashboard
          </h1>
          <p className="text-muted-foreground">
            Invoice-based cash flow overview
          </p>
        </div>

        {/* =========================
            METRICS (ORDERED)
        ========================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

          {/* 1️⃣ TOTAL BILLED */}
          <MetricCard
            title="Total Billed"
            value={`₹${money(data.totalBilled)}`}
            icon={Wallet}
            color="from-teal-500 to-teal-600"
            trend="Revenue + GST"
          />

          {/* 2️⃣ GST COLLECTED */}
          <MetricCard
            title="GST Collected"
            value={`₹${money(data.totalGST)}`}
            icon={TrendingDown}
            color="from-amber-500 to-amber-600"
            trend="Paid invoices only"
          />

          {/* 3️⃣ REVENUE RECEIVED */}
          <MetricCard
            title="Revenue Received"
            value={`₹${money(data.totalRevenue)}`}
            icon={DollarSign}
            color="from-blue-500 to-blue-600"
            trend={`${data.paidInvoiceCount} paid invoices`}
          />

          {/* 4️⃣ SAVINGS (10%) */}
          <MetricCard
            title="Savings (10%)"
            value={`₹${money(data.totalSavings)}`}
            icon={PiggyBank}
            color="from-emerald-500 to-emerald-600"
            trend="After GST & employee payout"
          />

          {/* 5️⃣ COMPANY EXPENSES */}
          <MetricCard
            title="Company Expenses"
            value={`₹${money(data.companyExpenseTotal)}`}
            icon={AlertCircle}
            color="from-red-500 to-red-600"
            trend="Operational costs"
          />

          {/* 6️⃣ NET PROFIT */}
          <MetricCard
            title="Net Profit"
            value={`₹${money(data.finalNetProfit)}`}
            icon={TrendingUp}
            color="from-green-500 to-green-600"
            trend="After savings & expenses"
          />
        </div>

        {/* =========================
            WALLET + PENDING INVOICES
        ========================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* WALLET PENDING */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold">
                Wallets Pending Payout
              </h2>
            </div>

            <p className="text-5xl font-bold text-orange-500 text-center">
              ₹{money(data.walletsPending)}
            </p>

            <p className="text-center text-muted-foreground mt-2">
              Unpaid employee balances
            </p>
          </Card>

          {/* PENDING INVOICES */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileClock className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold">
                Pending Invoices (This Month)
              </h2>
            </div>

            {data.pendingInvoices.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No pending invoices 🎉
              </p>
            ) : (
              <div className="space-y-3">
                {data.pendingInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {inv.invoiceNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inv.clientName}
                      </p>
                    </div>

                    <p className="font-bold text-orange-500">
                      ₹{money(inv.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
