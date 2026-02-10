import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const client = await clientPromise;
  const db = client.db('ems_db');

  const { metaAdSpend = 0, outsourcedVideoCost = 0 } = body;

  await db.collection('digital_clients').updateOne(
    { _id: new ObjectId(params.id) },
    {
      $set: {
        metaAdSpend,
        outsourcedVideoCost,
        updatedAt: new Date(),
      },
    }
  );

  return NextResponse.json({ success: true });
}
