import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/*
  Collection: digital_salaries
  {
    month: '2026-02',
    employees: [{ name, salary }],
    totalSalary,
    updatedAt
  }
*/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');

  if (!month) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db('ems_db');

  const data = await db
    .collection('digital_salaries')
    .findOne({ month });

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, employees, totalSalary } = body;

  if (!month) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const client = await clientPromise;
  const db = client.db('ems_db');

  await db.collection('digital_salaries').updateOne(
    { month },
    {
      $set: {
        month,
        employees,
        totalSalary,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return NextResponse.json({ success: true });
}
