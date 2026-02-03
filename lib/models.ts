import { ObjectId } from 'mongodb';

// READ-ONLY: Task schema from existing MongoDB collection
export interface Task {
  _id: ObjectId;
  clientName: string;
  projectName: string;
  employeeId: 'sanjay0206' | 'bhavesh1609';
  workGivenDate: Date;
  dueDate: Date;
  paymentAmount: number;
  yourProjectEarning: number;
  paymentReceived: boolean;
  taskStatus: 'Pending' | 'Completed';
  workDoneDate?: Date;
  createdAt: Date;
}

// Employee wallet tracking
export interface EmployeeWallet {
  _id?: ObjectId;
  employeeId: 'sanjay0206' | 'bhavesh1609';
  walletBalance: number;
  accumulatedEarnings: number;
  lastPayout?: Date;
  lastPayoutAmount?: number;
  lastTransactionId?: string;
  updatedAt: Date;
}

// Project-level expenses (linked to tasks)
export interface ProjectExpense {
  _id?: ObjectId;
  taskId: ObjectId;
  projectName: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
}

// Company-level monthly expenses
export interface CompanyExpense {
  _id?: ObjectId;
  month: string; // YYYY-MM format
  type: 'rent' | 'parcel' | 'internet' | 'tools' | 'other';
  amount: number;
  description: string;
  createdAt: Date;
}

// Digital services client
export interface DigitalClient {
  _id?: ObjectId;
  clientName: string;
  monthlyPlan: 15000 | 25000;
  month: string; // YYYY-MM format
  metaAdSpend: number;
  outsourcedVideoCost: number;
  employee1Salary: number;
  employee2Salary: number;
  employee3Salary: number;
  gst: number;
  savings: number;
  netProfit: number;
  createdAt: Date;
}

// Financial summary (calculated)
export interface FinancialSummary {
  _id?: ObjectId;
  period: string; // YYYY-MM format
  totalRevenue: number;
  totalGST: number;
  totalSavings: number;
  netProfit: number;
  graphicProfit: number;
  digitalProfit: number;
  walletsPending: number;
  employeeEarnings: {
    sanjay0206: number;
    bhavesh1609: number;
  };
  createdAt: Date;
}
