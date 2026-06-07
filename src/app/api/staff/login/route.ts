import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { StaffUser, verifyPassword } from '@/lib/db/models/StaffUser';
import { getSession, saveSession } from '@/lib/session';
import { rateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { SystemLog } from '@/lib/db/models/SystemLog';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(`login:${ip}`, 5, 15 * 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { name, password } = await request.json();

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await StaffUser.findOne({ name });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session
    const session = await getSession();
    await saveSession(session, {
      staffUser: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });

    // Log the action
    await SystemLog.create({
      action: 'STAFF_LOGIN',
      userId: user._id,
      details: `Staff user ${user.name} logged in`,
      ipAddress: ip,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
