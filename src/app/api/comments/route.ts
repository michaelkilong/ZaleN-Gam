import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { rateLimit, getClientIP } from '@/lib/security/rate-limiter';
import { checkSpam } from '@/lib/security/spam-detection';
import { sanitizeText } from '@/lib/security/sanitizer';
import { verifyRecaptcha } from '@/lib/security/recaptcha';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 comments per minute per IP
    const ip = getClientIP(request);
    const rateLimitResult = await rateLimit(`comment:${ip}`, 10, 60);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { articleId, articleTitle, authorUid, authorName, authorEmail, content, parentCommentId, recaptchaToken, honeypot, formLoadTime } = body;

    // reCAPTCHA verification
    if (recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return NextResponse.json({ error: 'reCAPTCHA verification failed' }, { status: 400 });
      }
    }

    // Spam detection
    const spamCheck = checkSpam(content || '', honeypot, formLoadTime);
    if (spamCheck.isSpam) {
      return NextResponse.json(
        { error: 'Spam detected. Please try again.' },
        { status: 400 }
      );
    }

    if (!articleId || !authorUid || !content?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sanitizedContent = sanitizeText(content.trim());

    const commentRef = await adminDb.collection('comments').add({
      articleId,
      articleTitle: articleTitle || '',
      authorUid,
      authorName: authorName || 'Anonymous',
      authorEmail: authorEmail || '',
      content: sanitizedContent,
      isApproved: false,
      parentCommentId: parentCommentId || null,
      createdAt: new Date(),
      ipAddress: ip,
    });

    // If it's a reply, notify parent comment author
    if (parentCommentId) {
      const parentDoc = await adminDb.collection('comments').doc(parentCommentId).get();
      if (parentDoc.exists) {
        const parentData = parentDoc.data();
        if (parentData?.authorUid && parentData.authorUid !== authorUid) {
          await adminDb.collection('notifications').add({
            recipientUid: parentData.authorUid,
            type: 'COMMENT_REPLY',
            title: 'New Reply to Your Comment',
            body: `${authorName} replied to your comment on "${articleTitle}"`,
            link: `/news/${articleId}`,
            read: false,
            createdAt: new Date(),
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      commentId: commentRef.id,
      message: 'Comment submitted and pending approval.',
    }, { status: 201 });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: 'Article ID required' }, { status: 400 });
    }

    const snapshot = await adminDb
      .collection('comments')
      .where('articleId', '==', articleId)
      .where('isApproved', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

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
