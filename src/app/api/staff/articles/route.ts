import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { Article } from '@/lib/db/models/Article';
import { Category } from '@/lib/db/models/Category';
import { getSession } from '@/lib/session';
import { SystemLog } from '@/lib/db/models/SystemLog';
import { getClientIP } from '@/lib/security/rate-limiter';
import { sanitizeHTML } from '@/lib/security/sanitizer';
import slugify from 'slugify';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};

    if (session.staffUser.role === 'AUTHOR') {
      query.authorId = session.staffUser.id;
    } else if (session.staffUser.role === 'EDITOR') {
      if (status === 'SUBMITTED') {
        query.status = 'SUBMITTED';
      } else {
        query.authorId = session.staffUser.id;
      }
    }

    if (status && session.staffUser.role !== 'EDITOR') {
      query.status = status;
    }
    if (category) query.categoryId = category;
    if (author && ['SUPER_ADMIN', 'ADMIN'].includes(session.staffUser.role)) {
      query.authorId = author;
    }

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(query);

    return NextResponse.json({
      articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.staffUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, excerpt, categoryId, featuredImage, tags, status } = await request.json();

    if (!title || !content || !excerpt || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 400 });
    }

    let slug = slugify(title, { lower: true, strict: true });
    const existing = await Article.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const sanitizedContent = sanitizeHTML(content);

    const articleData: any = {
      title,
      slug,
      content: sanitizedContent,
      excerpt,
      categoryId,
      authorId: session.staffUser.id,
      featuredImage,
      tags: tags || [],
      status: status || 'DRAFT',
    };

    if (session.staffUser.role === 'AUTHOR') {
      articleData.status = 'DRAFT';
    }

    if (status === 'PUBLISHED' && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(session.staffUser.role)) {
      articleData.publishedAt = new Date();
    }

    if (status === 'SUBMITTED') {
      articleData.submittedForReviewAt = new Date();
    }

    const article = await Article.create(articleData);

    const ip = getClientIP(request);
    await SystemLog.create({
      action: 'ARTICLE_CREATE',
      userId: session.staffUser.id,
      targetId: article._id.toString(),
      details: `Created article: ${title}`,
      ipAddress: ip,
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Create article error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
