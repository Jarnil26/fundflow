import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const client = await clientPromise;
    const db = client.db('ems_db');

    // 🔍 Find employee
    const user = await db.collection('employees').findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 401 }
      );
    }

    // 🔐 Allow ONLY BA department
    if (user.department !== 'BA') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // 🔑 Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 🍪 Set auth cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set('auth', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    response.cookies.set('role', user.role, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
