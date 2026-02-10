import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');

  const client = await clientPromise;
  const db = client.db('ems_db');

  const settings = await db
    .collection('digital_settings')
    .findOne({ month });

  return NextResponse.json({
    success: true,
    data: settings || { month, globalSalary: 0 },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, globalSalary } = body;

  const client = await clientPromise;
  const db = client.db('ems_db');

  await db.collection('digital_settings').updateOne(
    { month },
    {
      $set: {
        month,
        globalSalary: Number(globalSalary),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
