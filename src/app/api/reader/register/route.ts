import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { rateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { isValidEmail } from '@/lib/security/email-validator';

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(`reader_register:${ip}`, 5, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminDb.collection('readers').doc(userRecord.uid).set({
      email,
      name,
      avatar: null,
      followedCategories: [],
      savedArticles: [],
      notificationEnabled: false,
      pushSubscription: null,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: 'Account created successfully!',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
