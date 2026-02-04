'use client';

import { useState } from 'react';
import { UserCheck, Plus } from 'lucide-react';
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

export default function DigitalServicesPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: clientData, mutate } = useSWR(
    `/api/digital-clients?month=${currentMonth}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const clients = clientData?.data || [];

  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    clientName: '',
    monthlyPlan: '15000' as '15000' | '25000',
    month: currentMonth,
    metaAdSpend: '',
    outsourcedVideoCost: '',
  });

  /* =========================
     MONTHLY TOTALS
  ========================= */
  const totalRevenue = clients.reduce(
    (sum: number, c: any) => sum + Number(c.monthlyPlan || 0),
    0
  );
  const totalGST = clients.reduce(
    (sum: number, c: any) => sum + Number(c.gst || 0),
    0
  );
  const totalSavings = clients.reduce(
    (sum: number, c: any) => sum + Number(c.savings || 0),
    0
  );
  const totalNetProfit = clients.reduce(
    (sum: number, c: any) => sum + Number(c.netProfit || 0),
    0
  );

  /* =========================
     ADD CLIENT
  ========================= */
  const handleAddClient = async () => {
    if (!formData.clientName) return;

    setLoading(true);
    try {
      const res = await fetch('/api/digital-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          monthlyPlan: Number(formData.monthlyPlan),
          month: formData.month,
          metaAdSpend: Number(formData.metaAdSpend || 0),
          outsourcedVideoCost: Number(formData.outsourcedVideoCost || 0),
        }),
      });

      if (res.ok) {
        mutate();
        setShowDialog(false);
        setFormData({
          clientName: '',
          monthlyPlan: '15000',
          month: currentMonth,
          metaAdSpend: '',
          outsourcedVideoCost: '',
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
            <h1 className="text-3xl font-bold mb-2">Digital Services</h1>
            <p className="text-muted-foreground">
              Monthly client accounts & profitability
            </p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client Account
          </Button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-500">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {clients.length} active accounts
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">GST (18%)</p>
            <p className="text-3xl font-bold text-amber-500">
              ₹{totalGST.toLocaleString('en-IN')}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Savings (10%)</p>
            <p className="text-3xl font-bold text-green-500">
              ₹{totalSavings.toLocaleString('en-IN')}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Net Profit</p>
            <p className="text-3xl font-bold text-purple-500">
              ₹{totalNetProfit.toLocaleString('en-IN')}
            </p>
          </Card>
        </div>

        {/* CLIENT LIST */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Client Accounts for {currentMonth}
          </h2>

          {clients.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              No digital client accounts this month
            </p>
          ) : (
            <div className="space-y-4">
              {clients.map((client: any) => (
                <div
                  key={client._id}
                  className="border rounded-lg p-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="text-xl font-bold">{client.clientName}</p>
                      <p className="text-sm text-primary">
                        ₹{client.monthlyPlan.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Month</p>
                      <p className="font-bold">{client.month}</p>
                    </div>
                  </div>

                  {/* EXPENSES */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Meta Ads Spend
                      </p>
                      <p className="font-bold">
                        ₹{client.metaAdSpend.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Video Cost
                      </p>
                      <p className="font-bold">
                        ₹{client.outsourcedVideoCost.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* PROFIT */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">GST</p>
                      <p className="font-bold">
                        ₹{client.gst.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Savings</p>
                      <p className="font-bold">
                        ₹{client.savings.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net</p>
                      <p className="font-bold text-green-500">
                        ₹{client.netProfit.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ADD CLIENT DIALOG */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Digital Client</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Client Name</Label>
              <Input
                value={formData.clientName}
                onChange={(e) =>
                  setFormData({ ...formData, clientName: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Monthly Plan</Label>
              <Select
                value={formData.monthlyPlan}
                onValueChange={(v: any) =>
                  setFormData({ ...formData, monthlyPlan: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15000">₹15,000</SelectItem>
                  <SelectItem value="25000">₹25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Meta Ads Spend"
                value={formData.metaAdSpend}
                onChange={(e) =>
                  setFormData({ ...formData, metaAdSpend: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Video Cost"
                value={formData.outsourcedVideoCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    outsourcedVideoCost: e.target.value,
                  })
                }
              />
            </div>

            <Button onClick={handleAddClient} disabled={loading}>
              {loading ? 'Adding...' : 'Add Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
