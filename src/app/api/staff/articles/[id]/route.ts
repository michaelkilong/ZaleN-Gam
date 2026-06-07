import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Article } from '@/lib/db/models/Article';
import { getSession } from '@/lib/session';
import { SystemLog } from '@/lib/db/models/SystemLog';
import { getClientIP } from '@/lib/security/rate-limiter';
import { sanitizeHTML } from '@/lib/security/sanitizer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const article = await Article.findById(params.id)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name');

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (session.staffUser.role === 'AUTHOR' && article.authorId.toString() !== session.staffUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const article = await Article.findById(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (session.staffUser.role === 'AUTHOR' && article.authorId.toString() !== session.staffUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, content, excerpt, categoryId, featuredImage, tags, status } = await request.json();

    const updates: any = {};
    if (title) updates.title = title;
    if (content) updates.content = sanitizeHTML(content);
    if (excerpt) updates.excerpt = excerpt;
    if (categoryId) updates.categoryId = categoryId;
    if (featuredImage !== undefined) updates.featuredImage = featuredImage;
    if (tags) updates.tags = tags;

    if (status) {
      if (session.staffUser.role === 'AUTHOR') {
        if (status === 'SUBMITTED') {
          updates.status = 'SUBMITTED';
          updates.submittedForReviewAt = new Date();
        } else {
          updates.status = 'DRAFT';
        }
      } else if (session.staffUser.role === 'EDITOR') {
        if (status === 'PUBLISHED') {
          updates.status = 'PUBLISHED';
          updates.publishedAt = new Date();
        } else {
          updates.status = status;
        }
      } else {
        if (status === 'PUBLISHED' && article.status !== 'PUBLISHED') {
          updates.publishedAt = new Date();
        }
        updates.status = status;
      }
    }

    updates.updatedAt = new Date();

    const updated = await Article.findByIdAndUpdate(params.id, updates, { new: true });

    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'ARTICLE_UPDATE',
      userId: session.staffUser.id,
      targetId: params.id,
      details: `Updated article: ${updated?.title}`,
      ipAddress: ip,
    });

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPER_ADMIN', 'ADMIN'].includes(session.staffUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const article = await Article.findByIdAndDelete(params.id);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'ARTICLE_DELETE',
      userId: session.staffUser.id,
      targetId: params.id,
      details: `Deleted article: ${article.title}`,
      ipAddress: ip,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
