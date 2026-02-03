import { NextResponse } from 'next/server';
import { getCompletedPaidTasks } from '@/lib/db-utils';

export async function GET() {
  try {
    const tasks = await getCompletedPaidTasks();
    return NextResponse.json({ success: true, data: tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
