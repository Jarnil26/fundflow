import { NextResponse } from 'next/server';
import { getCompletedPaidTasks, getAllEmployeeWallets, getAllCompanyExpenses } from '@/lib/db-utils';

export async function GET() {
  try {
    console.log('[v0] Test endpoint: Starting MongoDB connection test');

    const tasks = await getCompletedPaidTasks();
    const wallets = await getAllEmployeeWallets();
    const expenses = await getAllCompanyExpenses();

    console.log('[v0] Test endpoint: MongoDB connection successful');
    console.log('[v0] Test endpoint: Found', tasks.length, 'tasks,', wallets.length, 'wallets,', expenses.length, 'expenses');

    return NextResponse.json({
      success: true,
      message: 'MongoDB connection working',
      data: {
        tasksCount: tasks.length,
        walletsCount: wallets.length,
        expensesCount: expenses.length,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      },
    });
  } catch (error: any) {
    console.error('[v0] Test endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
      },
      { status: 500 }
    );
  }
}
