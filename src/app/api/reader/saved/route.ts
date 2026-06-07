import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
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
    const saved = data?.savedArticles || [];

    if (action === 'save') {
      if (!saved.includes(slug)) {
        await readerRef.update({ savedArticles: [...saved, slug] });
      }
    } else if (action === 'unsave') {
      await readerRef.update({ savedArticles: saved.filter((s: string) => s !== slug) });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Saved articles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
