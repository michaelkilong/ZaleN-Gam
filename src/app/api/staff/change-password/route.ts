import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { StaffUser, hashPassword, verifyPassword } from '@/lib/db/models/StaffUser';
import { getSession } from '@/lib/session';
import { SystemLog } from '@/lib/db/models/SystemLog';
import { getClientIP } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Invalid password data. New password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await StaffUser.findById(session.staffUser.id);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    // Update session
    session.staffUser.mustChangePassword = false;
    await session.save();

    // Log the action
    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'PASSWORD_CHANGE',
      userId: user._id,
      details: `User ${user.name} changed password`,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
