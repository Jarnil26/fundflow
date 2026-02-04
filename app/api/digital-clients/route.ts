import { NextRequest, NextResponse } from 'next/server';
import {
  createDigitalClient,
  getDigitalClientsByMonth,
} from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    console.log(
      '[v1] Digital Clients API: Fetching clients for month:',
      month
    );

    if (!month) {
      return NextResponse.json(
        { success: false, error: 'Month parameter required' },
        { status: 400 }
      );
    }

    const clients = await getDigitalClientsByMonth(month);

    console.log(
      '[v1] Digital Clients API: Retrieved',
      clients.length,
      'clients for',
      month
    );

    return NextResponse.json({ success: true, data: clients });
  } catch (error: any) {
    console.error('[v1] Digital Clients API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clientName,
      monthlyPlan,
      month,
      metaAdSpend = 0,
      outsourcedVideoCost = 0,
    } = body;

    if (!clientName || !monthlyPlan || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    /* =========================
       FINANCIAL CALCULATION
    ========================= */
    const revenue = Number(monthlyPlan);
    const gst = revenue * 0.18;
    const postGst = revenue - gst;
    const savings = postGst * 0.1;

    const totalExpenses =
      Number(metaAdSpend) + Number(outsourcedVideoCost);

    const netProfit = postGst - savings - totalExpenses;

    const clientId = await createDigitalClient({
      clientName,
      monthlyPlan: revenue,
      month,
      metaAdSpend: Number(metaAdSpend),
      outsourcedVideoCost: Number(outsourcedVideoCost),
      gst,
      savings,
      netProfit,
    });

    return NextResponse.json({
      success: true,
      data: { _id: clientId },
    });
  } catch (error: any) {
    console.error('[v1] Digital Clients API POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
