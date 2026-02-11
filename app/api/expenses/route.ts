import { NextRequest, NextResponse } from 'next/server';
import {
  createProjectExpense,
  createCompanyExpense,
  getAllCompanyExpenses,
} from '@/lib/db-utils';

/* =====================================================
   GET → Fetch all company expenses
===================================================== */
export async function GET() {
  try {
    const expenses = await getAllCompanyExpenses();

    return NextResponse.json({
      success: true,
      data: expenses,
    });
  } catch (error: any) {
    console.error('[EXPENSES GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =====================================================
   POST → Create project OR company expense
===================================================== */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      type,        // 'project' | 'company'
      taskId,
      projectName,
      amount,
      description,
      category,    // DIGITAL | GRAPHIC | COMMON
      month,
    } = body;

    if (!type || !amount || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* =========================
       VALIDATE CATEGORY
    ========================= */
    const allowedCategories = ['DIGITAL', 'GRAPHIC', 'COMMON'];

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid category. Use DIGITAL, GRAPHIC or COMMON',
        },
        { status: 400 }
      );
    }

    /* =========================
       PROJECT EXPENSE
    ========================= */
    if (type === 'project') {
      if (!taskId) {
        return NextResponse.json(
          {
            success: false,
            error: 'taskId required for project expense',
          },
          { status: 400 }
        );
      }

      const expenseId = await createProjectExpense({
        taskId,
        projectName,
        amount: Number(amount),
        description,
        category, // stored as-is
      });

      return NextResponse.json({
        success: true,
        data: { _id: expenseId, type: 'project' },
      });
    }

    /* =========================
       COMPANY EXPENSE
    ========================= */
    if (type === 'company') {
      if (!month) {
        return NextResponse.json(
          {
            success: false,
            error: 'month required for company expense',
          },
          { status: 400 }
        );
      }

      const expenseId = await createCompanyExpense({
        month,
        amount: Number(amount),
        description,
        category, // DIGITAL | GRAPHIC | COMMON
      });

      return NextResponse.json({
        success: true,
        data: { _id: expenseId, type: 'company' },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid expense type' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('[EXPENSES POST ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
