import { NextResponse } from 'next/server';
import { getSession, destroySession } from '@/lib/session';

export async function POST() {
  try {
    const session = await getSession();
    await destroySession(session);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
