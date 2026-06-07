import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { SiteSetting } from '@/lib/db/models/SiteSetting';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    await connectDB();
    const settings = await SiteSetting.find({});
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || session.staffUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 });
    }

    await connectDB();
    await SiteSetting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
