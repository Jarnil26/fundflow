'use client';

import { useState } from 'react';
import { UserCheck, Plus, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DigitalServicesPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: clientData, mutate } = useSWR(`/api/digital-clients?month=${currentMonth}`, fetcher, {
    revalidateOnFocus: false,
  });

  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    monthlyPlan: '15000' as '15000' | '25000',
    month: currentMonth,
    metaAdSpend: '',
    outsourcedVideoCost: '',
    employee1Salary: '',
    employee2Salary: '',
    employee3Salary: '',
  });
  const [loading, setLoading] = useState(false);

  const clients = clientData?.data || [];

  const totalRevenue = clients.reduce((sum: number, c: any) => sum + c.monthlyPlan, 0);
  const totalGST = clients.reduce((sum: number, c: any) => sum + c.gst, 0);
  const totalSavings = clients.reduce((sum: number, c: any) => sum + c.savings, 0);
  const totalNetProfit = clients.reduce((sum: number, c: any) => sum + c.netProfit, 0);

  const handleAddClient = async () => {
    if (
      !formData.clientName ||
      !formData.metaAdSpend ||
      !formData.outsourcedVideoCost ||
      !formData.employee1Salary ||
      !formData.employee2Salary ||
      !formData.employee3Salary
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/digital-clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.clientName,
          monthlyPlan: parseInt(formData.monthlyPlan),
          month: formData.month,
          metaAdSpend: parseFloat(formData.metaAdSpend),
          outsourcedVideoCost: parseFloat(formData.outsourcedVideoCost),
          employee1Salary: parseFloat(formData.employee1Salary),
          employee2Salary: parseFloat(formData.employee2Salary),
          employee3Salary: parseFloat(formData.employee3Salary),
        }),
      });

      if (response.ok) {
        mutate();
        setShowDialog(false);
        setFormData({
          clientName: '',
          monthlyPlan: '15000',
          month: currentMonth,
          metaAdSpend: '',
          outsourcedVideoCost: '',
          employee1Salary: '',
          employee2Salary: '',
          employee3Salary: '',
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Digital Services</h1>
            <p className="text-muted-foreground">Monthly client accounts & profitability</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Client Account
          </Button>
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-500">₹{totalRevenue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">{clients.length} active accounts</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-sm text-muted-foreground mb-2">GST (18%)</p>
            <p className="text-3xl font-bold text-amber-500">₹{totalGST.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">Tax liability</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Savings (10%)</p>
            <p className="text-3xl font-bold text-green-500">₹{totalSavings.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">Reserved</p>
          </Card>
          <Card className="p-6 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Net Profit</p>
            <p className="text-3xl font-bold text-purple-500">₹{totalNetProfit.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-2">After all expenses</p>
          </Card>
        </div>

        {/* Client Accounts */}
        <Card className="p-6 bg-card">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Client Accounts for {currentMonth}
          </h2>

          {clients.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No digital client accounts this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((client: any) => (
                  <div key={client._id} className="border border-border rounded-lg p-6 bg-background">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Client Name</p>
                        <p className="text-xl font-bold text-foreground">{client.clientName}</p>
                        <p className="text-sm text-primary mt-1">₹{client.monthlyPlan.toLocaleString('en-IN')} Plan</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Month</p>
                        <p className="text-lg font-bold text-foreground">{client.month}</p>
                      </div>
                    </div>

                    {/* Expenses Breakdown */}
                    <div className="bg-card rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Meta Ads Spend</p>
                        <p className="font-bold text-foreground">₹{client.metaAdSpend.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Video Production</p>
                        <p className="font-bold text-foreground">₹{client.outsourcedVideoCost.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Salaries</p>
                        <p className="font-bold text-foreground">
                          ₹
                          {(
                            client.employee1Salary +
                            client.employee2Salary +
                            client.employee3Salary
                          ).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-blue-500/10 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                        <p className="font-bold text-blue-600">₹{client.monthlyPlan.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-amber-500/10 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">GST</p>
                        <p className="font-bold text-amber-600">₹{client.gst.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-green-500/10 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Savings</p>
                        <p className="font-bold text-green-600">₹{client.savings.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-purple-500/10 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Net</p>
                        <p className="font-bold text-purple-600">₹{client.netProfit.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">Margin</p>
                        <p className="font-bold text-orange-600">
                          {((client.netProfit / client.monthlyPlan) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Digital Client Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div>
              <Label htmlFor="clientName" className="text-foreground">
                Client Name
              </Label>
              <Input
                id="clientName"
                placeholder="Client/Project name"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="mt-1 bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="plan" className="text-foreground">
                Monthly Plan
              </Label>
              <Select
                value={formData.monthlyPlan}
                onValueChange={(value: any) => setFormData({ ...formData, monthlyPlan: value })}
              >
                <SelectTrigger className="mt-1 bg-background text-foreground border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="15000">₹15,000</SelectItem>
                  <SelectItem value="25000">₹25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="metaAdSpend" className="text-foreground text-xs">
                  Meta Ads Spend (₹)
                </Label>
                <Input
                  id="metaAdSpend"
                  type="number"
                  placeholder="0"
                  value={formData.metaAdSpend}
                  onChange={(e) => setFormData({ ...formData, metaAdSpend: e.target.value })}
                  className="mt-1 bg-background text-foreground border-border"
                />
              </div>
              <div>
                <Label htmlFor="videoCost" className="text-foreground text-xs">
                  Video Cost (₹)
                </Label>
                <Input
                  id="videoCost"
                  type="number"
                  placeholder="0"
                  value={formData.outsourcedVideoCost}
                  onChange={(e) => setFormData({ ...formData, outsourcedVideoCost: e.target.value })}
                  className="mt-1 bg-background text-foreground border-border"
                />
              </div>
            </div>

            <div className="bg-background rounded-lg p-3 border border-border">
              <p className="text-sm font-medium text-foreground mb-3">Employee Salaries</p>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Employee 1 salary"
                  value={formData.employee1Salary}
                  onChange={(e) => setFormData({ ...formData, employee1Salary: e.target.value })}
                  className="bg-card text-foreground border-border"
                />
                <Input
                  type="number"
                  placeholder="Employee 2 salary"
                  value={formData.employee2Salary}
                  onChange={(e) => setFormData({ ...formData, employee2Salary: e.target.value })}
                  className="bg-card text-foreground border-border"
                />
                <Input
                  type="number"
                  placeholder="Employee 3 salary"
                  value={formData.employee3Salary}
                  onChange={(e) => setFormData({ ...formData, employee3Salary: e.target.value })}
                  className="bg-card text-foreground border-border"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddClient} disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
