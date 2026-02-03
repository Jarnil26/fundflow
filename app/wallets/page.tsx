'use client';

import { useState } from 'react';
import { DollarSign, AlertCircle, ArrowUpRight, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const EMPLOYEES = ['sanjay0206', 'bhavesh1609'];

export default function WalletsPage() {
  const { data: walletData, mutate } = useSWR('/api/wallets', fetcher, {
    revalidateOnFocus: false,
  });

  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const wallets = walletData?.data || [];

  const getWalletForEmployee = (employeeId: string) => {
    return wallets.find((w: any) => w.employeeId === employeeId) || {
      employeeId,
      walletBalance: 0,
    };
  };

  const handlePayout = async () => {
    if (!selectedEmployee || !transactionId.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'payout',
          employeeId: selectedEmployee,
          transactionId,
        }),
      });

      if (response.ok) {
        mutate();
        setShowPayoutDialog(false);
        setTransactionId('');
        setSelectedEmployee(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Employee Wallets</h1>
          <p className="text-muted-foreground">Manage employee earnings and process payouts</p>
        </div>

        {/* Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {EMPLOYEES.map((employeeId) => {
            const wallet = getWalletForEmployee(employeeId);
            const isPendingPayout = wallet.walletBalance >= 5000;

            return (
              <Card key={employeeId} className="p-6 bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{employeeId}</h3>
                    <p className="text-sm text-muted-foreground">Employee Account</p>
                  </div>
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>

                {/* Balance */}
                <div className="mb-6 p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                  <p className="text-3xl font-bold text-foreground">₹{wallet.walletBalance.toLocaleString('en-IN')}</p>
                </div>

                {/* Alert if pending payout */}
                {isPendingPayout && (
                  <Alert className="mb-4 bg-orange-500/10 border-orange-500">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <AlertDescription className="text-orange-600">Balance ≥ ₹5000 - Payout due</AlertDescription>
                  </Alert>
                )}

                {/* Last Payout Info */}
                {wallet.lastPayout && (
                  <div className="mb-4 p-3 bg-background rounded-lg text-sm">
                    <p className="text-muted-foreground mb-1">Last Payout</p>
                    <p className="font-medium text-foreground">
                      ₹{wallet.lastPayoutAmount?.toLocaleString('en-IN')} on {new Date(wallet.lastPayout).toLocaleDateString()}
                    </p>
                    {wallet.lastTransactionId && (
                      <p className="text-xs text-muted-foreground mt-1">ID: {wallet.lastTransactionId}</p>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={() => {
                    setSelectedEmployee(employeeId);
                    setShowPayoutDialog(true);
                  }}
                  disabled={wallet.walletBalance === 0}
                  className="w-full gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Process Payout
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Transaction History */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Transactions</h2>
          <div className="space-y-3">
            {wallets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              wallets
                .filter((w: any) => w.lastPayout)
                .sort((a: any, b: any) => new Date(b.lastPayout).getTime() - new Date(a.lastPayout).getTime())
                .map((wallet: any) => (
                  <div key={wallet.employeeId} className="flex justify-between items-center p-4 bg-background rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{wallet.employeeId}</p>
                      <p className="text-sm text-muted-foreground">{new Date(wallet.lastPayout).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{wallet.lastPayoutAmount?.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">{wallet.lastTransactionId}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* Payout Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Process Employee Payout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee" className="text-foreground">
                Employee
              </Label>
              <Input
                id="employee"
                value={selectedEmployee || ''}
                disabled
                className="mt-1 bg-background text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-foreground">
                Amount to Pay
              </Label>
              <Input
                id="amount"
                value={
                  selectedEmployee
                    ? `₹${getWalletForEmployee(selectedEmployee).walletBalance.toLocaleString('en-IN')}`
                    : ''
                }
                disabled
                className="mt-1 bg-background text-foreground"
              />
            </div>
            <div>
              <Label htmlFor="transactionId" className="text-foreground">
                Transaction ID
              </Label>
              <Input
                id="transactionId"
                placeholder="e.g., TXN-2024-001"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="mt-1 bg-background text-foreground border-border"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPayoutDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayout}
                disabled={loading || !transactionId.trim()}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Confirm Payout'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
