'use client';

import { useState } from 'react';
import { UserCheck, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());
const money = (v: number) => (Number(v) || 0).toLocaleString('en-IN');

export default function DigitalServicesPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: clientRes, mutate } = useSWR(
    `/api/digital-clients?month=${currentMonth}`,
    fetcher
  );

  const { data: settingsRes, mutate: mutateSettings } = useSWR(
    `/api/digital-settings?month=${currentMonth}`,
    fetcher
  );

  const clients = clientRes?.data || [];
  const globalSalary = Number(settingsRes?.data?.globalSalary || 0);

  /* =========================
     GLOBAL CALCULATIONS
  ========================= */
  const totalBase = clients.reduce(
    (s: number, c: any) => s + Number(c.monthlyPlan || 0),
    0
  );

  const totalGST = clients.reduce(
    (s: number, c: any) => s + Number(c.gst || 0),
    0
  );

  const totalAds = clients.reduce(
    (s: number, c: any) => s + Number(c.metaAdSpend || 0),
    0
  );

  const totalVideo = clients.reduce(
    (s: number, c: any) => s + Number(c.outsourcedVideoCost || 0),
    0
  );

  const remaining =
    totalBase - totalAds - totalVideo - globalSalary;

  const savings = remaining > 0 ? remaining * 0.1 : 0;
  const netProfit = remaining - savings;

  /* =========================
     STATE
  ========================= */
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const [salaryRows, setSalaryRows] = useState([
    { name: '', salary: '' },
    { name: '', salary: '' },
    { name: '', salary: '' },
  ]);

  const totalSalaryInput = salaryRows.reduce(
    (sum, r) => sum + Number(r.salary || 0),
    0
  );

  /* =========================
     SAVE GLOBAL SALARY
  ========================= */
  const saveGlobalSalary = async () => {
    await fetch('/api/digital-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: currentMonth,
        globalSalary: totalSalaryInput,
      }),
    });

    mutateSettings();
    setShowSalaryDialog(false);
  };

  /* =========================
     SAVE CLIENT EXPENSES
  ========================= */
  const saveClientExpenses = async () => {
    if (!editingClient) return;

    await fetch(`/api/digital-clients/${editingClient._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metaAdSpend: Number(editingClient.metaAdSpend || 0),
        outsourcedVideoCost: Number(editingClient.outsourcedVideoCost || 0),
      }),
    });

    mutate();
    setShowEditDialog(false);
    setEditingClient(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Digital Services</h1>
          <p className="text-muted-foreground">
            Monthly digital profitability (global accounting)
          </p>
        </div>

        {/* SUMMARY */}
        <Card className="p-6 space-y-3">
          <div className="flex justify-between">
            <span>Total Base Revenue</span>
            <span className="font-semibold">₹{money(totalBase)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>GST (18%)</span>
            <span>₹{money(totalGST)}</span>
          </div>

          <div className="flex justify-between">
            <span>Ads + Video Expenses</span>
            <span>₹{money(totalAds + totalVideo)}</span>
          </div>

          <div className="flex justify-between text-red-500">
            <span className="flex items-center gap-1">
              Digital Team Salary
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowSalaryDialog(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </span>
            <span>₹{money(globalSalary)}</span>
          </div>

          <div className="flex justify-between text-amber-500">
            <span>10% Savings</span>
            <span>₹{money(savings)}</span>
          </div>

          <div className="flex justify-between text-green-600 font-bold text-lg pt-2 border-t">
            <span>Net Profit</span>
            <span>₹{money(netProfit)}</span>
          </div>
        </Card>

        {/* CLIENT LIST */}
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Clients – {currentMonth}
          </h2>

          <div className="space-y-4">
            {clients.map((c: any) => (
              <div key={c._id} className="border p-4 rounded space-y-1">
                <p className="font-bold">{c.clientName}</p>

                <p className="text-sm">
                  Base ₹{money(c.monthlyPlan)} | GST ₹{money(c.gst)} | Invoice ₹
                  {money(c.invoiceTotal)}
                </p>

                <p className="text-sm text-muted-foreground">
                  Ads ₹{money(c.metaAdSpend)} | Video ₹
                  {money(c.outsourcedVideoCost)}
                </p>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingClient({ ...c });
                    setShowEditDialog(true);
                  }}
                >
                  Edit Expenses
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* GLOBAL SALARY DIALOG */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Digital Team Salary (Monthly)</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {salaryRows.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={`Employee ${i + 1} Name`}
                  value={row.name}
                  onChange={(e) => {
                    const updated = [...salaryRows];
                    updated[i].name = e.target.value;
                    setSalaryRows(updated);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Salary"
                  value={row.salary}
                  onChange={(e) => {
                    const updated = [...salaryRows];
                    updated[i].salary = e.target.value;
                    setSalaryRows(updated);
                  }}
                />
              </div>
            ))}

            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total Salary</span>
              <span>₹{money(totalSalaryInput)}</span>
            </div>

            <Button onClick={saveGlobalSalary}>
              Save Salary
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EDIT CLIENT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client Expenses</DialogTitle>
          </DialogHeader>

          {editingClient && (
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Meta Ads Spend"
                value={editingClient.metaAdSpend || ''}
                onChange={(e) =>
                  setEditingClient({
                    ...editingClient,
                    metaAdSpend: e.target.value,
                  })
                }
              />

              <Input
                type="number"
                placeholder="Video Cost"
                value={editingClient.outsourcedVideoCost || ''}
                onChange={(e) =>
                  setEditingClient({
                    ...editingClient,
                    outsourcedVideoCost: e.target.value,
                  })
                }
              />

              <Button onClick={saveClientExpenses}>
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
