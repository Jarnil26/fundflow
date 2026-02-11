import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const SOCIAL_KEYWORDS = [
  'social',
  'social media',
  'smm',
  'instagram',
  'facebook',
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');

  if (!month) {
    return NextResponse.json(
      { success: false, error: 'Month required' },
      { status: 400 }
    );
  }

  const client = await clientPromise;
  const db = client.db('ems_db');

  /* ===============================
     1. MANUAL DIGITAL CLIENTS
  =============================== */
  const digitalClients = await db
    .collection('digital_clients')
    .find({ month })
    .toArray();

  /* ===============================
     2. PAID SOCIAL MEDIA INVOICES
  =============================== */
  const paidInvoices = await db
    .collection('invoices')
    .find({
      isPaid: true,
      billingMonth: month,
    })
    .toArray();

  const socialInvoices = paidInvoices.filter((inv: any) => {
    const text = `${inv.task || ''} ${inv.description || ''}`.toLowerCase();
    return SOCIAL_KEYWORDS.some((k) => text.includes(k));
  });

  /* ===============================
     3. DIGITAL EXPENSES
  =============================== */
  const digitalExpenses = await db
    .collection('company_expenses')
    .find({
      month,
      category: 'digital',
    })
    .toArray();

  /* ===============================
     TOTALS
  =============================== */
  const clientRevenue = digitalClients.reduce(
    (s, c) => s + Number(c.monthlyPlan || 0),
    0
  );

  const invoiceRevenue = socialInvoices.reduce(
    (s, i) => s + Number(i.amount || 0),
    0
  );

  const digitalExpenseTotal = digitalExpenses.reduce(
    (s, e) => s + Number(e.amount || 0),
    0
  );

  return NextResponse.json({
    success: true,
    data: {
      digitalClients,
      socialInvoices: socialInvoices.map((i) => ({
        clientName: i.clientName,
        amount: i.amount,
        invoiceNumber: i.invoiceNumber,
      })),
      digitalExpenses,
      totals: {
        clientRevenue,
        invoiceRevenue,
        digitalExpenseTotal,
      },
    },
  });
}
