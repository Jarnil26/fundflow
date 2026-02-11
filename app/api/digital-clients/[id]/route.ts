import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { metaAdSpend = 0, outsourcedVideoCost = 0 } = body;

    const client = await clientPromise;
    const db = client.db('ems_db');

    await db.collection('digital_clients').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          metaAdSpend: Number(metaAdSpend),
          outsourcedVideoCost: Number(outsourcedVideoCost),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[DIGITAL PATCH ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
  