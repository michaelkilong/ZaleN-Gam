import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Category } from '@/lib/db/models/Category';
import { getSession } from '@/lib/session';
import { SystemLog } from '@/lib/db/models/SystemLog';
import { getClientIP } from '@/lib/security/rate-limiter';
import slugify from 'slugify';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || !['SUPER_ADMIN', 'ADMIN'].includes(session.staffUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    await connectDB();

    const slug = slugify(name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    const category = await Category.create({ name, slug, description });

    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'CATEGORY_CREATE',
      userId: session.staffUser.id,
      targetId: category._id.toString(),
      details: `Created category: ${name}`,
      ipAddress: ip,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
