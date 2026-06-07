import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Eye, Clock } from 'lucide-react';

interface ArticleCardProps {
  article: {
    _id?: string;
    title: string;
    slug: string;
    excerpt: string;
    featuredImage?: string;
    category?: { name: string; slug: string };
    author?: { name: string };
    publishedAt?: Date;
    views?: number;
  };
  variant?: 'default' | 'featured' | 'compact';
}

export function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-lg border bg-card">
          <div className="aspect-video relative overflow-hidden">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">No Image</span>
              </div>
            )}
          </div>
          <div className="p-6">
            {article.category && (
              <Badge variant="secondary" className="mb-3">
                {article.category.name}
              </Badge>
            )}
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
              {article.title}
            </h2>
            <p className="text-muted-foreground line-clamp-2 mb-4">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {article.author && <span>{article.author.name}</span>}
              {article.publishedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views || 0}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
        <article className="flex gap-4 p-4 border-b hover:bg-muted/50 transition-colors">
          <div className="w-24 h-24 flex-shrink-0 relative rounded-md overflow-hidden">
            {article.featuredImage ? (
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            {article.category && (
              <Badge variant="outline" className="text-xs mb-2">
                {article.category.name}
              </Badge>
            )}
            <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            {article.publishedAt && (
              <span className="text-xs text-muted-foreground mt-1 block">
                {formatDate(article.publishedAt)}
              </span>
            )}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <article className="border rounded-lg overflow-hidden bg-card hover:shadow-md transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          {article.featuredImage ? (
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {article.category && (
            <Badge variant="secondary" className="mb-2">
              {article.category.name}
            </Badge>
          )}
          <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {article.author && <span>{article.author.name}</span>}
            {article.publishedAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(article.publishedAt)}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
