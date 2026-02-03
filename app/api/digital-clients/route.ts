import { NextRequest, NextResponse } from 'next/server';
import { createDigitalClient, getDigitalClientsByMonth } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    console.log('[v0] Digital Clients API: Fetching clients for month:', month);

    if (month) {
      const clients = await getDigitalClientsByMonth(month);
      console.log('[v0] Digital Clients API: Retrieved', clients.length, 'clients for', month);
      return NextResponse.json({ success: true, data: clients });
    }

    return NextResponse.json({ success: false, error: 'Month parameter required' }, { status: 400 });
  } catch (error: any) {
    console.error('[v0] Digital Clients API error:', error);
    return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      monthlyPlan,
      month,
      metaAdSpend,
      outsourcedVideoCost,
      employee1Salary,
      employee2Salary,
      employee3Salary,
    } = body;

    if (!clientName || !monthlyPlan || !month) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const totalSalaries = employee1Salary + employee2Salary + employee3Salary;
    const totalExpenses = metaAdSpend + outsourcedVideoCost + totalSalaries;
    const revenue = monthlyPlan;
    const gst = revenue * 0.18;
    const postGst = revenue - gst;
    const savings = postGst * 0.1;
    const netProfit = postGst - savings - totalExpenses;

    const clientId = await createDigitalClient({
      clientName,
      monthlyPlan,
      month,
      metaAdSpend,
      outsourcedVideoCost,
      employee1Salary,
      employee2Salary,
      employee3Salary,
      gst,
      savings,
      netProfit,
    });

    return NextResponse.json({ success: true, data: { _id: clientId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
