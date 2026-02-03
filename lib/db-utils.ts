import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import {
  Task,
  EmployeeWallet,
  ProjectExpense,
  CompanyExpense,
  DigitalClient,
} from './models';

const DB_NAME = 'ems_db';

/* ============================
   DB CONNECT
============================ */
export async function getDatabase() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  console.log('[v0] DB: Connected to database:', db.databaseName);
  return db;
}

/* ============================
   DATE HELPERS (CURRENT MONTH)
============================ */
function getCurrentMonthRange() {
  const now = new Date();

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0, 0, 0
  );

  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1,
    0, 0, 0
  );

  return { startOfMonth, startOfNextMonth };
}

/* ============================
   TASK OPERATIONS
============================ */

// ✅ ONLY CURRENT MONTH COMPLETED TASKS
export async function getCompletedPaidTasks(): Promise<Task[]> {
  try {
    const db = await getDatabase();
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    const tasks = await db.collection('tasks').find({
      taskStatus: 'Completed',
      $expr: {
        $and: [
          {
            $gte: [
              { $toDate: '$workDoneDate' },
              startOfMonth,
            ],
          },
          {
            $lt: [
              { $toDate: '$workDoneDate' },
              startOfNextMonth,
            ],
          },
        ],
      },
    }).toArray();

    console.log(
      '[v0] DB: Found',
      tasks.length,
      'completed tasks for current month'
    );

    return tasks as Task[];
  } catch (error) {
    console.error('[v0] DB: Error fetching completed tasks:', error);
    return [];
  }
}


export async function getAllTasks(): Promise<Task[]> {
  try {
    const db = await getDatabase();
    return (await db.collection('tasks').find({}).toArray()) as Task[];
  } catch (error) {
    console.error('[v0] DB: Error fetching all tasks:', error);
    return [];
  }
}

// ✅ CURRENT MONTH PER EMPLOYEE
export async function getTasksByEmployee(employeeId: string): Promise<Task[]> {
  try {
    const db = await getDatabase();
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    const tasks = await db.collection('tasks').find({
      employeeId,
      taskStatus: 'Completed',
      $expr: {
        $and: [
          {
            $gte: [
              { $toDate: '$workDoneDate' },
              startOfMonth,
            ],
          },
          {
            $lt: [
              { $toDate: '$workDoneDate' },
              startOfNextMonth,
            ],
          },
        ],
      },
    }).toArray();

    console.log(
      `[v0] DB: ${employeeId} completed ${tasks.length} tasks this month`
    );

    return tasks as Task[];
  } catch (error) {
    console.error('[v0] DB: Error fetching tasks for employee:', error);
    return [];
  }
}


/* ============================
   FINANCIAL CALCULATIONS
============================ */
export interface FinancialBreakdown {
  paymentAmount: number;
  gst: number;
  postGst: number;
  savings: number;
  remaining: number;
  projectEarning: number;
  extraExpenses: number;
  netProfit: number;
}

export function calculateTaskFinancials(
  paymentAmount: number,
  projectEarning: number,
  extraExpenses = 0
): FinancialBreakdown {
  const gst = paymentAmount * 0.18;
  const postGst = paymentAmount - gst;
  const savings = postGst * 0.1;
  const remaining = postGst - savings;
  const netProfit = remaining - projectEarning - extraExpenses;

  return {
    paymentAmount,
    gst,
    postGst,
    savings,
    remaining,
    projectEarning,
    extraExpenses,
    netProfit,
  };
}

/* ============================
   EMPLOYEE WALLET
============================ */
export async function getEmployeeWallet(employeeId: string) {
  try {
    const db = await getDatabase();
    return await db.collection('employee_wallets').findOne({ employeeId });
  } catch (error) {
    console.error('[v0] DB: Error fetching wallet:', error);
    return null;
  }
}

export async function updateEmployeeWallet(
  employeeId: string,
  updates: Partial<EmployeeWallet>
) {
  try {
    const db = await getDatabase();
    await db.collection('employee_wallets').updateOne(
      { employeeId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.error('[v0] DB: Error updating wallet:', error);
  }
}

export async function getAllEmployeeWallets(): Promise<EmployeeWallet[]> {
  try {
    const db = await getDatabase();
    return (await db.collection('employee_wallets').find({}).toArray()) as EmployeeWallet[];
  } catch (error) {
    console.error('[v0] DB: Error fetching wallets:', error);
    return [];
  }
}

/* ============================
   PROJECT EXPENSES
============================ */
export async function getProjectExpensesByTask(taskId: ObjectId) {
  try {
    const db = await getDatabase();
    return await db.collection('project_expenses').find({ taskId }).toArray();
  } catch (error) {
    console.error('[v0] DB: Error fetching project expenses:', error);
    return [];
  }
}

/* ============================
   COMPANY EXPENSES
============================ */
export async function getAllCompanyExpenses(): Promise<CompanyExpense[]> {
  try {
    const db = await getDatabase();
    return (await db.collection('company_expenses').find({}).toArray()) as CompanyExpense[];
  } catch (error) {
    console.error('[v0] DB: Error fetching company expenses:', error);
    return [];
  }
}

/* ============================
   DIGITAL CLIENTS
============================ */
export async function getAllDigitalClients(): Promise<DigitalClient[]> {
  try {
    const db = await getDatabase();
    return (await db.collection('digital_clients').find({}).toArray()) as DigitalClient[];
  } catch (error) {
    console.error('[v0] DB: Error fetching digital clients:', error);
    return [];
  }
}


// ==============================
// CREATE PROJECT EXPENSE
// ==============================
export async function createProjectExpense(expense: {
  taskId: any;
  projectName?: string;
  amount: number;
  description: string;
  category: string;
}) {
  const db = await getDatabase();
  const result = await db.collection('project_expenses').insertOne({
    ...expense,
    createdAt: new Date(),
  });
  return result.insertedId;
}

// ==============================
// CREATE COMPANY EXPENSE
// Company expense operations
export async function createCompanyExpense(expense: {
  month: string;
  amount: number;
  description: string;
  category: string;
}) {
  const db = await getDatabase();

  const result = await db.collection('company_expenses').insertOne({
    ...expense,
    createdAt: new Date(),
  });

  console.log('[v0] DB: Created company expense:', result.insertedId);
  return result.insertedId;
}
