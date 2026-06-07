import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { StaffUser, hashPassword } from '@/lib/db/models/StaffUser';
import { getSession } from '@/lib/session';
import { SystemLog } from '@/lib/db/models/SystemLog';
import { getClientIP } from '@/lib/security/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || session.staffUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const users = await StaffUser.find({}).select('-passwordHash').sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || session.staffUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, role, temporaryPassword } = await request.json();

    if (!name || !role || !temporaryPassword || temporaryPassword.length < 8) {
      return NextResponse.json(
        { error: 'Name, role, and temporary password (min 8 chars) are required' },
        { status: 400 }
      );
    }

    if (!['AUTHOR', 'EDITOR'].includes(role)) {
      return NextResponse.json(
        { error: 'Can only create AUTHOR or EDITOR roles' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if name exists
    const existing = await StaffUser.findOne({ name });
    if (existing) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(temporaryPassword);

    const user = await StaffUser.create({
      name,
      email,
      passwordHash,
      role,
      isActive: true,
      mustChangePassword: true,
      createdBy: session.staffUser.id,
    });

    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'USER_CREATE',
      userId: session.staffUser.id,
      targetId: user._id.toString(),
      details: `Created ${role}: ${name}`,
      ipAddress: ip,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
