'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleCard } from '@/components/public/ArticleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, AlertCircle } from 'lucide-react';

// Shape that ArticleCard expects
interface ArticleCardData {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  category?: { name: string; slug: string };
  author?: { name: string };
  publishedAt?: Date;
  views?: number;
}

// Raw API response shape
interface ApiArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  categoryId?: { _id: string; name: string; slug: string };
  authorId?: { _id: string; name: string };
  publishedAt?: string;
  views?: number;
  tags?: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchQuery) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (q: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/staff/articles?status=PUBLISHED');
      if (response.ok) {
        const data = await response.json();

        // Transform API response to match ArticleCard expected shape
        const apiArticles: ApiArticle[] = data.articles || [];
        const transformed: ArticleCardData[] = apiArticles.map((article) => ({
          _id: article._id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          featuredImage: article.featuredImage,
          category: article.categoryId
            ? { name: article.categoryId.name, slug: article.categoryId.slug }
            : undefined,
          author: article.authorId
            ? { name: article.authorId.name }
            : undefined,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : undefined,
          views: article.views,
        }));

        const filtered = transformed.filter((article) =>
          article.title.toLowerCase().includes(q.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(q.toLowerCase()) ||
          article.tags?.some((tag: string) => tag.toLowerCase().includes(q.toLowerCase()))
        );
        setArticles(filtered);
      } else {
        setError('Failed to search articles');
      }
    } catch (err) {
      setError('An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Articles</h1>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-8 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, content, or tags..."
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2 mb-6">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {searchQuery && !loading && (
        <div className="mb-4">
          <p className="text-muted-foreground">
            {articles.length} result{articles.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
          </p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Searching...</p>
        </div>
      ) : articles.length === 0 && searchQuery ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No articles found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
