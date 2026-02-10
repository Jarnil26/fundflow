import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import {
  getAllCompanyExpenses,
  getAllEmployeeWallets,
} from '@/lib/db-utils';
import { ObjectId } from 'mongodb';

/* =========================
   MONTH RANGE
========================= */
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return { start, end };
}

export async function GET() {
  try {
    console.log('[FINANCE][INVOICE] Fetch started');

    const { start, end } = getCurrentMonthRange();
    const client = await clientPromise;
    const db = client.db('ems_db');

    const invoicesCol = db.collection('invoices');
    const tasksCol = db.collection('tasks');

    /* =====================================================
       1️⃣ PAID INVOICES (PAYMENT DATE BASED)
       paymentDate is STRING → converted to Date
    ===================================================== */
    const paidInvoices = await db.collection('invoices').find({
      isPaid: true,

      // 💡 BYPASS DIGITAL / SOCIAL MEDIA WORK
      jobDescription: {
        $not: {
          $regex:
            '(social|social media|instagram|facebook|digital|meta|ads|marketing)',
          $options: 'i',
        },
      },

      $expr: {
        $and: [
          { $gte: [{ $toDate: '$paymentDate' }, start] },
          { $lte: [{ $toDate: '$paymentDate' }, end] },
        ],
      },
    }).toArray();


    let totalRevenue = 0;   // without GST
    let totalGST = 0;
    let totalBilled = 0;    // with GST
    let totalSavings = 0;   // 10% calculated from tasks

    /* =====================================================
       2️⃣ CALCULATIONS FROM PAID INVOICES
    ===================================================== */
    for (const invoice of paidInvoices) {
      const baseAmount = Number(invoice.amount || 0);

      const invoiceGST = invoice.gstApplied
        ? Number(invoice.cgstAmount || 0) +
        Number(invoice.sgstAmount || 0)
        : 0;

      totalRevenue += baseAmount;
      totalGST += invoiceGST;
      totalBilled += Number(invoice.totalAmount || 0);

      /* =========================
         SAVINGS (10%)
         TASK-BASED LOGIC
      ========================= */
      for (const item of invoice.items || []) {
        if (!item.id) continue;

        const task = await tasksCol.findOne({
          _id: new ObjectId(item.id),
        });

        if (!task) continue;

        const paymentAmount = Number(task.paymentAmount || 0);
        const employeeEarning = Number(task.yourProjectEarning || 0);

        // Remove GST from task payment if GST applied
        const amountWithoutGST = task.gstApplied
          ? paymentAmount - paymentAmount * 0.18
          : paymentAmount;

        // Remaining after employee payout
        const remaining =
          amountWithoutGST - employeeEarning;

        if (remaining > 0) {
          totalSavings += remaining * 0.1;
        }
      }
    }

    /* =====================================================
       3️⃣ UNPAID INVOICES (PENDING)
       → Billing date based
    ===================================================== */
    const unpaidInvoices = await invoicesCol.find({
      $or: [
        { isPaid: { $ne: true } },
        { isPaid: { $exists: false } },
      ],
      billingDate: { $gte: start, $lte: end },
    }).toArray();

    const pendingInvoices = unpaidInvoices.map((inv: any) => ({
      id: inv._id.toString(),
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.clientName,
      billingDate: inv.billingDate,
      amount: Number(inv.amount || 0),
      gstApplied: !!inv.gstApplied,
      totalAmount: Number(inv.totalAmount || 0),
    }));

    /* =====================================================
       4️⃣ COMPANY EXPENSES
    ===================================================== */
    const companyExpenses = await getAllCompanyExpenses();
    const companyExpenseTotal = companyExpenses.reduce(
      (sum: number, e: any) => sum + Number(e.amount || 0),
      0
    );

    /* =====================================================
       5️⃣ EMPLOYEE WALLET PENDING
    ===================================================== */
    const wallets = await getAllEmployeeWallets();
    const walletsPending = wallets.reduce(
      (sum: number, w: any) => sum + Number(w.walletBalance || 0),
      0
    );

    /* =====================================================
       6️⃣ FINAL NET PROFIT (CASH BASIS)
       Revenue - Expenses - Savings
    ===================================================== */
    const finalNetProfit =
      totalRevenue -
      companyExpenseTotal -
      totalSavings;

    console.log('[FINANCE][INVOICE] Success');

    return NextResponse.json({
      success: true,
      data: {
        paidInvoiceCount: paidInvoices.length,
        unpaidInvoiceCount: pendingInvoices.length,

        totalBilled,
        totalGST,
        totalRevenue,
        totalSavings,

        companyExpenseTotal,
        finalNetProfit,

        walletsPending,
        pendingInvoices,
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
