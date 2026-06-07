import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { isValidEmail } from '@/lib/security/email-validator';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 subscriptions per minute per IP
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(`newsletter:${ip}`, 5, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many subscription attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // In production, you would add this to a mailing list service
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    });
  } catch (error) {
    console.error('Newsletter error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
