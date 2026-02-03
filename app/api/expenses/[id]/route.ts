import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { updateExpenseStatus, initializeCollections } from '@/lib/db-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeCollections();
    const { id } = await params;
    const body = await request.json();

    const expenseId = new ObjectId(id);
    const success = await updateExpenseStatus(
      expenseId,
      body.status,
      body.approvedBy ? new ObjectId(body.approvedBy) : undefined
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
