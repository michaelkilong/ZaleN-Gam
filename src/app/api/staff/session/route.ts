import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (session.staffUser) {
      return NextResponse.json({ user: session.staffUser });
    }
    return NextResponse.json({ user: null }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
