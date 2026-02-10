import { NextRequest, NextResponse } from 'next/server';
import {
  createDigitalClient,
  getDigitalClientsByMonth,
} from '@/lib/db-utils';

/* =========================
   GET DIGITAL CLIENTS
   (CLIENT-LEVEL ONLY)
========================= */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month parameter required' },
        { status: 400 }
      );
    }

    const clients = await getDigitalClientsByMonth(month);

    return NextResponse.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    console.error('[DIGITAL GET ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   CREATE DIGITAL CLIENT
   (NO SALARY / NO PROFIT)
========================= */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clientName,
      month,
      monthlyPlan,            // 15000 or 25000 (BASE AMOUNT)
      metaAdSpend = 0,
      outsourcedVideoCost = 0,
    } = body;

    if (!clientName || !monthlyPlan || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const baseAmount = Number(monthlyPlan);

    // GST → DISPLAY / INVOICE ONLY
    const gst = baseAmount * 0.18;
    const invoiceTotal = baseAmount + gst;

    const clientId = await createDigitalClient({
      clientName,
      month,

      monthlyPlan: baseAmount,
      gst,
      invoiceTotal,

      metaAdSpend: Number(metaAdSpend || 0),
      outsourcedVideoCost: Number(outsourcedVideoCost || 0),

      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { _id: clientId },
    });
  } catch (error: any) {
    console.error('[DIGITAL POST ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
