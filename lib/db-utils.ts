import clientPromise from './mongodb';
import { ObjectId } from 'mongodb';
import {
  Task,
  EmployeeWallet,
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
   INITIALIZE COLLECTIONS
============================ */
export async function initializeCollections() {
  const db = await getDatabase();

  const collections = await db.listCollections().toArray();
  const names = collections.map(c => c.name);

  const requiredCollections = [
    'tasks',
    'employee_wallets',
    'project_expenses',
    'company_expenses',
    'digital_clients',
    'users',
  ];

  for (const name of requiredCollections) {
    if (!names.includes(name)) {
      await db.createCollection(name);
      console.log('[v0] DB: Created collection', name);
    }
  }
}

/* ============================
   DATE HELPERS
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
export async function getCompletedPaidTasks(): Promise<Task[]> {
  try {
    const db = await getDatabase();
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    return await db.collection('tasks').find({
      taskStatus: 'Completed',
      $expr: {
        $and: [
          { $gte: [{ $toDate: '$workDoneDate' }, startOfMonth] },
          { $lt: [{ $toDate: '$workDoneDate' }, startOfNextMonth] },
        ],
      },
    }).toArray() as Task[];
  } catch (error) {
    console.error('[v0] DB: Error fetching completed tasks:', error);
    return [];
  }
}

export async function getAllTasks(): Promise<Task[]> {
  try {
    const db = await getDatabase();
    return await db.collection('tasks').find({}).toArray() as Task[];
  } catch {
    return [];
  }
}

export async function getTasksByEmployee(employeeId: string): Promise<Task[]> {
  try {
    const db = await getDatabase();
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    return await db.collection('tasks').find({
      employeeId,
      taskStatus: 'Completed',
      $expr: {
        $and: [
          { $gte: [{ $toDate: '$workDoneDate' }, startOfMonth] },
          { $lt: [{ $toDate: '$workDoneDate' }, startOfNextMonth] },
        ],
      },
    }).toArray() as Task[];
  } catch {
    return [];
  }
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>
) {
  const db = await getDatabase();
  await db.collection('tasks').updateOne(
    { _id: new ObjectId(taskId) },
    { $set: { ...updates, updatedAt: new Date() } }
  );
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
  const db = await getDatabase();
  return db.collection('employee_wallets').findOne({ employeeId });
}

export async function updateEmployeeWallet(
  employeeId: string,
  updates: Partial<EmployeeWallet>
) {
  const db = await getDatabase();
  await db.collection('employee_wallets').updateOne(
    { employeeId },
    { $set: { ...updates, updatedAt: new Date() } },
    { upsert: true }
  );
}

export async function getAllEmployeeWallets(): Promise<EmployeeWallet[]> {
  const db = await getDatabase();
  return await db.collection('employee_wallets').find({}).toArray() as EmployeeWallet[];
}

/* ============================
   PROJECT EXPENSES
============================ */
export async function getProjectExpensesByTask(taskId: ObjectId) {
  const db = await getDatabase();
  return db.collection('project_expenses').find({ taskId }).toArray();
}

export async function createProjectExpense(expense: {
  taskId: ObjectId;
  projectName?: string;
  amount: number;
  description: string;
  category: string;
}) {
  const db = await getDatabase();
  const res = await db.collection('project_expenses').insertOne({
    ...expense,
    status: 'Pending',
    createdAt: new Date(),
  });
  return res.insertedId;
}

export async function updateExpenseStatus(
  expenseId: string,
  status: 'Pending' | 'Approved' | 'Rejected'
) {
  const db = await getDatabase();
  await db.collection('project_expenses').updateOne(
    { _id: new ObjectId(expenseId) },
    { $set: { status, updatedAt: new Date() } }
  );
}

/* ============================
   COMPANY EXPENSES
============================ */
export async function getAllCompanyExpenses(): Promise<CompanyExpense[]> {
  const db = await getDatabase();
  return await db.collection('company_expenses').find({}).toArray() as CompanyExpense[];
}

export async function createCompanyExpense(expense: {
  month: string;
  amount: number;
  description: string;
  category: string;
}) {
  const db = await getDatabase();
  const res = await db.collection('company_expenses').insertOne({
    ...expense,
    createdAt: new Date(),
  });
  return res.insertedId;
}

/* ============================
   DIGITAL CLIENTS
============================ */
export async function getAllDigitalClients(): Promise<DigitalClient[]> {
  const db = await getDatabase();
  return await db.collection('digital_clients').find({}).toArray() as DigitalClient[];
}

export async function createDigitalClient(client: DigitalClient) {
  const db = await getDatabase();
  const res = await db.collection('digital_clients').insertOne({
    ...client,
    createdAt: new Date(),
  });
  return res.insertedId;
}

export async function getDigitalClientsByMonth(month: string) {
  const db = await getDatabase();
  return db.collection('digital_clients').find({ month }).toArray();
}

/* ============================
   USERS
============================ */
export async function getUsers() {
  const db = await getDatabase();
  return db.collection('users').find({}).toArray();
}

export async function createUser(user: {
  name: string;
  email: string;
  role: string;
}) {
  const db = await getDatabase();
  const res = await db.collection('users').insertOne({
    ...user,
    createdAt: new Date(),
  });
  return res.insertedId;
}

/* ============================
   COMPLETED BUT UNPAID TASKS
============================ */
export async function getCompletedUnpaidTasks() {
  try {
    const db = await getDatabase();
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange();

    return await db.collection('tasks').find({
      taskStatus: 'Completed',
      paymentStatus: { $ne: 'PAID' }, // PENDING or missing
      $expr: {
        $and: [
          { $gte: [{ $toDate: '$workDoneDate' }, startOfMonth] },
          { $lt: [{ $toDate: '$workDoneDate' }, startOfNextMonth] },
        ],
      },
    }).toArray();
  } catch (error) {
    console.error('[DB] Error fetching unpaid completed tasks:', error);
    return [];
  }
}

export async function creditEmployeeWallet(
  employeeId: string,
  amount: number
) {
  const db = await getDatabase();

  await db.collection('employee_wallets').updateOne(
    { employeeId },
    {
      $inc: {
        walletBalance: amount,
        accumulatedEarnings: amount,
      },
      $set: {
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
