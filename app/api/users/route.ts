import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUsers, createUser, initializeCollections } from '@/lib/db-utils';

export async function GET() {
  try {
    await initializeCollections();
    const users = await getUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeCollections();
    const body = await request.json();
    const { name, email, role, walletBalance = 0 } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const userId = await createUser({
      name,
      email,
      role,
      walletBalance,
    });

    return NextResponse.json({ success: true, data: { _id: userId, name, email, role, walletBalance } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
