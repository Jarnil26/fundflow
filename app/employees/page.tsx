'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { WalletCard } from '@/components/wallet-card';
import { WalletTransfer } from '@/components/wallet-transfer';
import { WalletHistory } from '@/components/wallet-history';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
}

interface Transaction {
  _id: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string;
  date: string;
  category: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    name: '',
    email: '',
    role: 'employee',
    walletBalance: '0',
  });

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      const employeeData = (data.data || []).filter((u: User) => u.role === 'employee');
      setEmployees(employeeData);
      if (employeeData.length > 0 && !selectedEmployee) {
        setSelectedEmployee(employeeData[0]._id);
      }
    } catch (error) {
      console.log('[v0] Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/finance');
      const data = await response.json();
      setAllTransactions(
        (data.data || []).map((r: any) => ({
          _id: r._id,
          type: r.type,
          amount: r.amount,
          description: r.description,
          date: r.date,
          category: r.category,
        }))
      );
    } catch (error) {
      console.log('[v0] Error fetching transactions:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchTransactions();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEmployeeForm,
          walletBalance: parseFloat(newEmployeeForm.walletBalance),
        }),
      });

      if (response.ok) {
        setNewEmployeeForm({
          name: '',
          email: '',
          role: 'employee',
          walletBalance: '0',
        });
        setShowAddEmployee(false);
        fetchEmployees();
      }
    } catch (error) {
      console.log('[v0] Error adding employee:', error);
    }
  };

  const selectedEmployeeData = employees.find((e) => e._id === selectedEmployee);

  return (
    <DashboardLayout
      title="Employee Wallet Management"
      subtitle="Manage employee wallets and fund transfers"
    >
      <div className="space-y-8">
        {/* Add Employee Section */}
        {showAddEmployee && (
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Employee name"
                    value={newEmployeeForm.name}
                    onChange={(e) =>
                      setNewEmployeeForm({ ...newEmployeeForm, name: e.target.value })
                    }
                    required
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    placeholder="employee@example.com"
                    value={newEmployeeForm.email}
                    onChange={(e) =>
                      setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })
                    }
                    required
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Initial Wallet Balance
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newEmployeeForm.walletBalance}
                    onChange={(e) =>
                      setNewEmployeeForm({ ...newEmployeeForm, walletBalance: e.target.value })
                    }
                    className="bg-secondary border-border text-foreground"
                  />
                </div>
                <div className="flex gap-2 pt-8">
                  <Button
                    type="submit"
                    className="flex-1 bg-accent hover:bg-accent/90 text-primary-foreground"
                  >
                    Add Employee
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => setShowAddEmployee(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {!showAddEmployee && (
          <Button
            className="bg-accent hover:bg-accent/90 text-primary-foreground gap-2"
            onClick={() => setShowAddEmployee(true)}
          >
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        )}

        {/* Employee Selection and Overview */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Employee
            </label>
            <Select value={selectedEmployee || ''} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="bg-card border-border text-foreground">
                <SelectValue placeholder="Choose employee" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {employees.map((emp) => (
                  <SelectItem key={emp._id} value={emp._id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployeeData && (
            <WalletCard
              name={selectedEmployeeData.name}
              balance={selectedEmployeeData.walletBalance}
              email={selectedEmployeeData.email}
              role={selectedEmployeeData.role}
              onAddFunds={() => console.log('Add funds')}
              onTransfer={() => console.log('Transfer')}
            />
          )}
        </div>

        {/* Employees Grid */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">All Employees</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="text-muted-foreground">Loading employees...</p>
            ) : employees.length === 0 ? (
              <p className="text-muted-foreground">No employees yet</p>
            ) : (
              employees.map((emp) => (
                <div
                  key={emp._id}
                  onClick={() => setSelectedEmployee(emp._id)}
                  className="cursor-pointer"
                >
                  <WalletCard
                    name={emp.name}
                    balance={emp.walletBalance}
                    email={emp.email}
                    role={emp.role}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transfer Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WalletTransfer onTransferComplete={() => fetchTransactions()} />
          </div>

          <div className="lg:col-span-2">
            <WalletHistory transactions={allTransactions} loading={loading} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
