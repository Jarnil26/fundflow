import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/* =========================
   GET DIGITAL CLIENTS
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

    const client = await clientPromise;
    const db = client.db('ems_db');

    const clients = await db
      .collection('digital_clients')
      .find({
        month: { $regex: `^${month}` }, // ✅ FIXED month issue
      })
      .sort({ createdAt: -1 })
      .toArray();

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
========================= */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      month,
      monthlyPlan,
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
    const gst = baseAmount * 0.18;
    const invoiceTotal = baseAmount + gst;

    const client = await clientPromise;
    const db = client.db('ems_db');

    const result = await db.collection('digital_clients').insertOne({
      clientName,
      month: month.trim(),        // ✅ normalize
      monthlyPlan: baseAmount,
      gst,
      invoiceTotal,
      metaAdSpend: Number(metaAdSpend),
      outsourcedVideoCost: Number(outsourcedVideoCost),
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId },
    });
  } catch (error: any) {
    console.error('[DIGITAL POST ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
