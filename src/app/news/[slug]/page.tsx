import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { Article } from '@/lib/db/models/Article';
import { CommentSection } from '@/components/public/CommentSection';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Eye, Clock, User } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 60;

interface ArticleDoc {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categoryId?: { _id: string; name: string; slug: string };
  authorId?: { _id: string; name: string };
  status: string;
  publishedAt?: string;
  views: number;
  tags: string[];
}

async function getArticle(slug: string) {
  try {
    await connectDB();

    const article = await Article.findOne({ slug, status: 'PUBLISHED' })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .lean() as unknown as ArticleDoc | null;

    if (!article) return null;

    await Article.updateOne({ _id: article._id }, { $inc: { views: 1 } });

    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    console.error('Article fetch error:', error);
    return null;
  }
}

async function getRelatedArticles(categoryId: string, currentSlug: string) {
  try {
    await connectDB();
    const articles = await Article.find({
      status: 'PUBLISHED',
      categoryId,
      slug: { $ne: currentSlug },
    })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    return JSON.parse(JSON.stringify(articles));
  } catch (error) {
    console.error('Related articles fetch error:', error);
    return [];
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = await getRelatedArticles(
    article.categoryId?._id || '',
    params.slug
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <header className="mb-8">
            {article.categoryId && (
              <a href={`/category/${article.categoryId.slug}`}>
                <Badge className="mb-4">{article.categoryId.name}</Badge>
              </a>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {article.authorId && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {article.authorId.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views + 1} views
              </span>
            </div>
          </header>

          {article.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="article-content max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-muted rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <CommentSection articleSlug={params.slug} articleTitle={article.title} />
        </article>

        <aside className="space-y-8">
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Related Articles</h3>
              <div className="border rounded-lg overflow-hidden">
                {relatedArticles.map((related: any) => (
                  <a
                    key={related._id}
                    href={`/news/${related.slug}`}
                    className="block p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <h4 className="font-medium text-sm hover:text-primary transition-colors">
                      {related.title}
                    </h4>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {formatDate(related.publishedAt)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <NewsletterForm />
        </aside>
      </div>
    </div>
  );
}
