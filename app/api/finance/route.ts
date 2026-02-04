import { NextResponse } from 'next/server';
import {
  calculateTaskFinancials,
  getProjectExpensesByTask,
  getAllCompanyExpenses,
  getCompletedUnpaidTasks,
  getAllEmployeeWallets,
} from '@/lib/db-utils';
import clientPromise from '@/lib/mongodb';

/* =========================
   MONTH RANGE (WORK DONE)
========================= */
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export async function GET() {
  try {
    console.log('[FINANCE] Fetch started');

    const { start, end } = getCurrentMonthRange();
    const client = await clientPromise;
    const db = client.db('ems_db');

    /* =====================================================
       1️⃣ PAID + COMPLETED TASKS (REVENUE SOURCE)
       → counted by WORK DONE DATE
    ===================================================== */
    const paidTasks = await db.collection('tasks').find({
  taskStatus: 'Completed',
  paymentStatus: 'PAID',
  paymentProcessedAt: { $gte: start, $lte: end },
}).toArray();


    /* =====================================================
       2️⃣ COMPLETED BUT UNPAID TASKS (PENDING PAYMENT LIST)
    ===================================================== */
    const unpaidTasks = await getCompletedUnpaidTasks();

    const pendingPaymentTasks = unpaidTasks
      .filter((task: any) => {
        if (!task.workDoneDate) return false;
        const doneDate = new Date(task.workDoneDate);
        return doneDate >= start && doneDate <= end;
      })
      .map((task: any) => ({
        id: task._id.toString(),
        title: task.projectName,
        employeeId: task.employeeId,
        amount: Number(task.paymentAmount || 0), // ✅ CLIENT PAYMENT
        completedAt: task.workDoneDate,
      }));

    /* =====================================================
       3️⃣ COMPANY EXPENSES
    ===================================================== */
    const companyExpenses = await getAllCompanyExpenses();

    /* =====================================================
       4️⃣ FINANCIAL CALCULATION (PAID TASKS ONLY)
    ===================================================== */
    let totalRevenue = 0;
    let totalGST = 0;
    let totalSavings = 0;
    let totalNetProfit = 0;

    const employeeEarnings: Record<string, number> = {};

    for (const task of paidTasks) {
      const paymentAmount = Number(task.paymentAmount || 0); // client paid
      const employeeIncome = Number(task.yourProjectEarning || 0); // salary

      const projectExpenses = await getProjectExpensesByTask(task._id);
      const projectExpenseTotal = projectExpenses.reduce(
        (sum: number, e: any) => sum + Number(e.amount || 0),
        0
      );

      const breakdown = calculateTaskFinancials(
        paymentAmount,
        employeeIncome,
        projectExpenseTotal
      );

      totalRevenue += paymentAmount;
      totalGST += breakdown.gst;
      totalSavings += breakdown.savings;
      totalNetProfit += breakdown.netProfit;

      employeeEarnings[task.employeeId] =
        (employeeEarnings[task.employeeId] || 0) + employeeIncome;
    }

    /* =====================================================
       5️⃣ WALLET PENDING (EMPLOYEE SALARY ONLY)
       → comes ONLY from employee_wallets
    ===================================================== */
    const wallets = await getAllEmployeeWallets();

    const walletsPending = wallets.reduce(
      (sum: number, w: any) => sum + Number(w.walletBalance || 0),
      0
    );

    /* =====================================================
       6️⃣ FINAL PROFIT (AFTER COMPANY EXPENSES)
    ===================================================== */
    const companyExpenseTotal = companyExpenses.reduce(
      (sum: number, e: any) => sum + Number(e.amount || 0),
      0
    );

    const finalNetProfit = totalNetProfit - companyExpenseTotal;

    console.log('[FINANCE] Success');

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalGST,
        totalSavings,
        totalNetProfit,
        companyExpenseTotal,
        finalNetProfit,
        walletsPending,        // ✅ salary pending only
        employeeEarnings,      // ✅ paid salaries
        taskCount: paidTasks.length,
        pendingPaymentTasks,   // ✅ unpaid completed tasks
      },
    });
  } catch (error: any) {
    console.error('[FINANCE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
