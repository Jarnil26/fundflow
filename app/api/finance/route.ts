import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getAllEmployeeWallets } from '@/lib/db-utils';
import { ObjectId } from 'mongodb';

/* =========================
   MONTH RANGE
========================= */
function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const month = now.toISOString().slice(0, 7); // YYYY-MM
  return { start, end, month };
}

export async function GET() {
  try {
    console.log('[FINANCE] Fetch started');

    const { start, end, month } = getCurrentMonthRange();
    const client = await clientPromise;
    const db = client.db('ems_db');

    /* =====================================================
       1️⃣ PAID INVOICES (NON-DIGITAL ONLY)
    ===================================================== */
    const paidInvoices = await db.collection('invoices').find({
      isPaid: true,

      // ❌ EXCLUDE DIGITAL / SOCIAL MEDIA
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

    let totalRevenue = 0;
    let totalGST = 0;
    let totalBilled = 0;
    let totalSavings = 0;

    for (const invoice of paidInvoices) {
      const baseAmount = Number(invoice.amount || 0);
      const gstAmount = invoice.gstApplied
        ? Number(invoice.cgstAmount || 0) + Number(invoice.sgstAmount || 0)
        : 0;

      totalRevenue += baseAmount;
      totalGST += gstAmount;
      totalBilled += Number(invoice.totalAmount || 0);

      // 10% savings (simple logic)
      const remaining = baseAmount - gstAmount;
      if (remaining > 0) {
        totalSavings += remaining * 0.1;
      }
    }

    /* =====================================================
       2️⃣ PENDING INVOICES (THIS MONTH)
    ===================================================== */
    const unpaidInvoices = await db.collection('invoices').find({
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
      totalAmount: Number(inv.totalAmount || 0),
    }));

    /* =====================================================
       3️⃣ COMPANY EXPENSES (EXCLUDE DIGITAL)
    ===================================================== */
    const companyExpenses = await db.collection('company_expenses').find({
      month,
      category: { $ne: 'DIGITAL' }, // ✅ IMPORTANT FIX
    }).toArray();

    const companyExpenseTotal = companyExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    console.log('[FINANCE] companyExpenses docs:', companyExpenses);
    console.log('[FINANCE] companyExpenseTotal:', companyExpenseTotal);

    /* =====================================================
       4️⃣ EMPLOYEE WALLET PENDING
    ===================================================== */
    const wallets = await getAllEmployeeWallets();
    const walletsPending = wallets.reduce(
      (sum: number, w: any) => sum + Number(w.walletBalance || 0),
      0
    );

    /* =====================================================
       5️⃣ FINAL NET PROFIT
    ===================================================== */
    const finalNetProfit =
      totalRevenue - companyExpenseTotal - totalSavings;

    console.log('[FINANCE] Success');

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
