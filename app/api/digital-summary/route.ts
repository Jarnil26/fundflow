import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/* =========================
   DIGITAL SUMMARY API
========================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    console.log('[DIGITAL SUMMARY] month:', month);

    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ems_db');

    /* =========================
       1️⃣ DIGITAL CLIENTS
    ========================= */
    const digitalClients = await db
      .collection('digital_clients')
      .find({ month })
      .toArray();

    console.log(
      '[DIGITAL SUMMARY] digitalClients count:',
      digitalClients.length
    );

    /* =========================
       2️⃣ PAID SOCIAL MEDIA INVOICES
    ========================= */
    const invoices = await db
      .collection('invoices')
      .find({
        isPaid: true,
        billingDate: {
          $gte: new Date(`${month}-01`),
          $lte: new Date(`${month}-31`),
        },
        $or: [
          { jobDescription: /social media/i },
          { 'items.project': /social media/i },
        ],
      })
      .toArray();

    console.log(
      '[DIGITAL SUMMARY] paid social invoices:',
      invoices.length
    );

    /* =========================
       3️⃣ DIGITAL EXPENSES (🔥 FIXED)
    ========================= */
    const digitalExpenses = await db
      .collection('company_expenses')
      .find({
        month,
        category: 'DIGITAL', // ⚠️ CASE-SENSITIVE FIX
      })
      .toArray();

    console.log(
      '[DIGITAL SUMMARY] digitalExpenses docs:',
      digitalExpenses
    );

    const totalDigitalExpense = digitalExpenses.reduce(
      (sum, e) => sum + Number(e.amount || 0),
      0
    );

    console.log(
      '[DIGITAL SUMMARY] totalDigitalExpense:',
      totalDigitalExpense
    );

    /* =========================
       RESPONSE
    ========================= */
    return NextResponse.json({
      success: true,
      data: {
        digitalClients,
        invoices,
        digitalExpenses,
        totalDigitalExpense,
      },
    });
  } catch (error: any) {
    console.error('[DIGITAL SUMMARY ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
