import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { creditEmployeeWallet } from '@/lib/db-utils';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ IMPORTANT: await params
    const { id } = await context.params;

    console.log('🧠 FIXED INCOMING TASK ID:', id);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid task ID format' },
        { status: 400 }
      );
    }

    const taskId = new ObjectId(id);
    const body = await request.json();

    if (body.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Invalid payment update' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('ems_db');

    const task = await db.collection('tasks').findOne({
      _id: taskId,
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    if (task.paymentStatus === 'PAID') {
      return NextResponse.json(
        { success: false, message: 'Payment already done' },
        { status: 400 }
      );
    }

    /* =========================
       1️⃣ MARK TASK AS PAID
    ========================= */
    await db.collection('tasks').updateOne(
      { _id: taskId },
      {
        $set: {
          paymentStatus: 'PAID',
          paymentProcessedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    /* =========================
       2️⃣ CREDIT EMPLOYEE WALLET
    ========================= */
    await creditEmployeeWallet(
      task.employeeId,
      Number(task.yourProjectEarning || 0)
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[TASK PAYMENT ERROR]', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
  