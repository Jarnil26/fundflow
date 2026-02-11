import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/* =========================
   GET INVOICES
   + DIGITAL SOCIAL MEDIA FILTER
========================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const client = await clientPromise;
    const db = client.db('ems_db');

    /* =========================
       BASE QUERY
    ========================= */
    const query: any = {};

    if (month) {
      const start = new Date(`${month}-01T00:00:00.000Z`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      query.billingDate = { $gte: start, $lt: end };
    }

    const invoices = await db
      .collection('invoices')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: invoices,
    });
  } catch (error: any) {
    console.error('[INVOICES GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   GET DIGITAL SOCIAL MEDIA
   (PAID INVOICES ONLY)
========================= */
export async function POST(request: NextRequest) {
  try {
    const { month } = await request.json();

    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month required' },
        { status: 400 }
      );
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const client = await clientPromise;
    const db = client.db('ems_db');

    const digitalInvoices = await db
      .collection('invoices')
      .find({
        isPaid: true,
        paymentDate: { $gte: start, $lt: end },
        jobDescription: {
          $regex: /(social|social media|instagram|facebook|digital)/i,
        },
      })
      .sort({ paymentDate: -1 })
      .toArray();

    const formatted = digitalInvoices.map((inv: any) => ({
      _id: inv._id,
      clientName: inv.clientName,
      jobDescription: inv.jobDescription,
      baseAmount: Number(inv.amount || 0),
      gst:
        inv.gstApplied
          ? Number(inv.cgstAmount || 0) + Number(inv.sgstAmount || 0)
          : 0,
      invoiceTotal: Number(inv.totalAmount || 0),
      paymentDate: inv.paymentDate,
      invoiceNumber: inv.invoiceNumber,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error('[DIGITAL SOCIAL INVOICE ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
