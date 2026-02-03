import { NextResponse } from 'next/server';
import {
  getCompletedPaidTasks,
  calculateTaskFinancials,
  getAllEmployeeWallets,
  updateEmployeeWallet,
  getProjectExpensesByTask,
  getAllCompanyExpenses,
} from '@/lib/db-utils';

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export async function GET() {
  try {
    console.log('[v0] Finance API: Starting data fetch from MongoDB');

    const { start, end } = getCurrentMonthRange();
    console.log(
      '[v0] Finance API: Current month range:',
      start.toISOString(),
      '→',
      end.toISOString()
    );

    // 🔹 Get ALL completed tasks
    const allTasks = await getCompletedPaidTasks();

    // 🔹 Filter ONLY current month completed tasks
    const tasks = allTasks.filter((task: any) => {
      if (!task.workDoneDate) return false;
      const doneDate = new Date(task.workDoneDate);
      return doneDate >= start && doneDate <= end;
    });

    console.log(
      '[v0] Finance API: Retrieved',
      tasks.length,
      'completed tasks for current month'
    );

    const companyExpenses = await getAllCompanyExpenses();
    console.log(
      '[v0] Finance API: Retrieved',
      companyExpenses.length,
      'company expenses'
    );

    let totalRevenue = 0;
    let totalGST = 0;
    let totalSavings = 0;
    let totalNetProfit = 0;

    const employeeEarnings: Record<string, number> = {
      sanjay0206: 0,
      bhavesh1609: 0,
    };

    const walletBalances: Record<string, number> = {
      sanjay0206: 0,
      bhavesh1609: 0,
    };

    /* =====================================================
       🔴 RESET WALLETS (MONTHLY LOGIC)
    ===================================================== */
    console.log('[v0] Resetting employee wallets for new month');
    for (const employeeId of Object.keys(walletBalances)) {
      await updateEmployeeWallet(employeeId, {
        walletBalance: 0,
        accumulatedEarnings: 0,
        updatedAt: new Date(),
      });
    }

    /* =====================================================
       CALCULATE FINANCIALS FROM TASKS
    ===================================================== */
    for (const task of tasks) {
      try {
        const paymentAmount = Number(task.paymentAmount || 0);
        const yourProjectEarning = Number(task.yourProjectEarning || 0);

        console.log('[v0] Processing task:', {
          project: task.projectName,
          employee: task.employeeId,
          paymentAmount,
          yourProjectEarning,
        });

        const projectExpenses = await getProjectExpensesByTask(task._id);
        const projectExpenseTotal = projectExpenses.reduce(
          (sum: number, e: any) => sum + (Number(e.amount) || 0),
          0
        );

        const breakdown = calculateTaskFinancials(
          paymentAmount,
          yourProjectEarning,
          projectExpenseTotal
        );

        totalRevenue += paymentAmount;
        totalGST += breakdown.gst;
        totalSavings += breakdown.savings;
        totalNetProfit += breakdown.netProfit;

        employeeEarnings[task.employeeId] =
          (employeeEarnings[task.employeeId] || 0) + yourProjectEarning;

        walletBalances[task.employeeId] =
          (walletBalances[task.employeeId] || 0) + yourProjectEarning;
      } catch (err) {
        console.error('[v0] Error processing task:', task._id, err);
      }
    }

    /* =====================================================
       UPDATE WALLETS WITH CURRENT MONTH VALUES
    ===================================================== */
    for (const [employeeId, balance] of Object.entries(walletBalances)) {
      await updateEmployeeWallet(employeeId, {
        walletBalance: balance,
        accumulatedEarnings: balance,
        updatedAt: new Date(),
      });
    }

    const companyExpenseTotal = companyExpenses.reduce(
      (sum: number, e: any) => sum + (Number(e.amount) || 0),
      0
    );

    const finalNetProfit = totalNetProfit - companyExpenseTotal;
    const walletsPending = Object.values(walletBalances).reduce(
      (sum, balance) => sum + balance,
      0
    );

    console.log(
      '[v0] Finance API: Calculations complete',
      'Revenue:',
      totalRevenue,
      'NetProfit:',
      finalNetProfit
    );

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalGST,
        totalSavings,
        totalNetProfit,
        companyExpenseTotal,
        finalNetProfit,
        walletsPending,
        employeeEarnings,
        taskCount: tasks.length,
      },
    });
  } catch (error: any) {
    console.error('[v0] Finance API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
