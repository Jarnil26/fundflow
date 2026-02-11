'use client';

import { useState, useEffect } from 'react';
import { Pencil, Receipt, UserCheck, Plus, Trash2 } from 'lucide-react';
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
  const month = new Date().toISOString().slice(0, 7);

  const { data } = useSWR(
    `/api/digital-summary?month=${month}`,
    fetcher
  );
  const { data: salaryRes, mutate: mutateSalary } = useSWR(
  `/api/digital-salary?month=${month}`,
  fetcher
);

useEffect(() => {
  if (salaryRes?.data?.employees?.length) {
    setSalaryRows(
      salaryRes.data.employees.map((e: any) => ({
        name: e.name,
        salary: String(e.salary),
      }))
    );
  }
}, [salaryRes]);

const saveSalary = async () => {
  await fetch('/api/digital-salary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      month,
      employees: salaryRows.map((r) => ({
        name: r.name,
        salary: Number(r.salary || 0),
      })),
      totalSalary,
    }),
  });

  mutateSalary();
  setShowSalaryDialog(false);
};

  const digitalClients = data?.data?.digitalClients || [];
  const invoices = data?.data?.invoices || [];
  const digitalExpense = data?.data?.totalDigitalExpense || 0;

  /* =========================
     SALARY (UI ONLY)
  ========================= */
  const [showSalaryDialog, setShowSalaryDialog] = useState(false);
  const [salaryRows, setSalaryRows] = useState<
    { name: string; salary: string }[]
  >([{ name: '', salary: '' }]);

  const totalSalary = salaryRows.reduce(
    (s, r) => s + Number(r.salary || 0),
    0
  );


  const addSalaryRow = () =>
    setSalaryRows([...salaryRows, { name: '', salary: '' }]);

  const removeSalaryRow = (index: number) => {
    const copy = [...salaryRows];
    copy.splice(index, 1);
    setSalaryRows(copy.length ? copy : [{ name: '', salary: '' }]);
  };

  /* =========================
     CALCULATIONS
  ========================= */
  const baseRevenue = digitalClients.reduce(
    (s: number, c: any) => s + Number(c.monthlyPlan || 0),
    0
  );

  const gstTotal = digitalClients.reduce(
    (s: number, c: any) => s + Number(c.gst || 0),
    0
  );

  const remaining =
    baseRevenue - digitalExpense - totalSalary;

  const savings = remaining > 0 ? remaining * 0.1 : 0;
  const netProfit = remaining - savings;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Digital Services</h1>
          <p className="text-muted-foreground">
            Digital clients + paid social media invoices
          </p>
        </div>

        {/* SUMMARY */}
        <Card className="p-6 space-y-3">
          <Row label="Total Base Revenue" value={baseRevenue} />
          <Row label="GST (18%)" value={gstTotal} muted />
          <Row label="Digital Expenses" value={digitalExpense} danger />

          <Row
            label={
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
            }
            value={totalSalary}
            danger
          />

          <Row label="10% Savings" value={savings} warn />

          <div className="flex justify-between pt-3 border-t font-bold text-green-600 text-lg">
            <span>Net Profit</span>
            <span>₹{money(netProfit)}</span>
          </div>
        </Card>

        {/* DIGITAL CLIENTS */}
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Digital Clients – {month}
          </h2>

          {digitalClients.length === 0 ? (
            <p className="text-muted-foreground">No digital clients</p>
          ) : (
            digitalClients.map((c: any) => (
              <div key={c._id} className="border p-4 rounded mb-3">
                <p className="font-semibold">{c.clientName}</p>
                <p className="text-sm">
                  Base ₹{money(c.monthlyPlan)} | GST ₹{money(c.gst)} | Invoice ₹
                  {money(c.invoiceTotal)}
                </p>
              </div>
            ))
          )}
        </Card>

        {/* PAID SOCIAL MEDIA INVOICES */}
        <Card className="p-6">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Social Media – Paid Invoices
          </h2>

          {invoices.length === 0 ? (
            <p className="text-muted-foreground">
              No social media payments received
            </p>
          ) : (
            invoices.map((i: any) => (
              <div key={i._id} className="border p-4 rounded mb-3">
                <p className="font-semibold">{i.clientName}</p>
                <p className="text-sm text-muted-foreground">
                  {i.jobDescription}
                </p>
                <p className="text-sm">
                  Base ₹{money(i.amount)} | GST ₹
                  {money(i.cgstAmount + i.sgstAmount)} | Invoice ₹
                  {money(i.totalAmount)}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* SALARY DIALOG */}
      <Dialog open={showSalaryDialog} onOpenChange={setShowSalaryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Digital Team Salary</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {salaryRows.map((r, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <Input
                  className="col-span-2"
                  placeholder={`Employee ${i + 1}`}
                  value={r.name}
                  onChange={(e) => {
                    const copy = [...salaryRows];
                    copy[i].name = e.target.value;
                    setSalaryRows(copy);
                  }}
                />
                <Input
                  type="number"
                  className="col-span-2"
                  placeholder="Salary"
                  value={r.salary}
                  onChange={(e) => {
                    const copy = [...salaryRows];
                    copy[i].salary = e.target.value;
                    setSalaryRows(copy);
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeSalaryRow(i)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addSalaryRow}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Employee
            </Button>

            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total Salary</span>
              <span>₹{money(totalSalary)}</span>
            </div>
            <div className="flex justify-end pt-2">
  <Button onClick={saveSalary}>
    Save Salary
  </Button>
</div>

          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

/* Helper */
function Row({ label, value, muted, warn, danger }: any) {
  return (
    <div
      className={`flex justify-between ${muted
          ? 'text-muted-foreground'
          : warn
            ? 'text-amber-500'
            : danger
              ? 'text-red-500'
              : ''
        }`}
    >
      <span>{label}</span>
      <span>₹{money(value)}</span>
    </div>
  );
}
