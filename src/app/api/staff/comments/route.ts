import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || !['SUPER_ADMIN', 'ADMIN'].includes(session.staffUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const commentsRef = adminDb.collection('comments');
    let query;

    if (status === 'pending') {
      query = commentsRef.where('isApproved', '==', false).orderBy('createdAt', 'desc');
    } else {
      query = commentsRef.where('isApproved', '==', true).orderBy('createdAt', 'desc');
    }

    const snapshot = await query.limit(50).get();
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser || !['SUPER_ADMIN', 'ADMIN'].includes(session.staffUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { commentId, action } = await request.json();
    if (!commentId || !action) {
      return NextResponse.json({ error: 'Comment ID and action required' }, { status: 400 });
    }

    const commentRef = adminDb.collection('comments').doc(commentId);
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (action === 'approve') {
      await commentRef.update({ isApproved: true });
    } else if (action === 'reject') {
      await commentRef.delete();
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Moderate comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
