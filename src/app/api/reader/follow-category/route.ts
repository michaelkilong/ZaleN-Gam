import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await adminAuth.verifyIdToken(token);
    const { slug, action } = await request.json();

    if (!slug || !action) {
      return NextResponse.json({ error: 'Slug and action required' }, { status: 400 });
    }

    const readerRef = adminDb.collection('readers').doc(decoded.uid);
    const readerDoc = await readerRef.get();

    if (!readerDoc.exists) {
      return NextResponse.json({ error: 'Reader not found' }, { status: 404 });
    }

    const data = readerDoc.data();
    const followed = data?.followedCategories || [];

    if (action === 'follow') {
      if (!followed.includes(slug)) {
        await readerRef.update({ followedCategories: [...followed, slug] });
      }
    } else if (action === 'unfollow') {
      await readerRef.update({ followedCategories: followed.filter((s: string) => s !== slug) });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Follow category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
