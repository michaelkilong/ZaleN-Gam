import connectDB from '@/lib/db/mongoose';
import { Article } from '@/lib/db/models/Article';
import { Category } from '@/lib/db/models/Category';
import { ArticleCard } from '@/components/public/ArticleCard';
import { NewsletterForm } from '@/components/public/NewsletterForm';
import { TrendingUp, Clock, Flame } from 'lucide-react';

export const revalidate = 60;

interface ArticleDoc {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  categoryId?: { _id: string; name: string; slug: string };
  authorId?: { _id: string; name: string };
  status: string;
  publishedAt?: string;
  views: number;
}

interface CategoryDoc {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

async function getHomepageData() {
  try {
    await connectDB();

    const categories = await Category.find({}).sort({ name: 1 }).lean() as unknown as CategoryDoc[];

    const featuredArticles = await Article.find({ status: 'PUBLISHED' })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ publishedAt: -1 })
      .limit(1)
      .lean() as unknown as ArticleDoc[];

    const latestArticles = await Article.find({ status: 'PUBLISHED' })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ publishedAt: -1 })
      .skip(1)
      .limit(6)
      .lean() as unknown as ArticleDoc[];

    const trendingArticles = await Article.find({ status: 'PUBLISHED' })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ views: -1 })
      .limit(5)
      .lean() as unknown as ArticleDoc[];

    return {
      categories: JSON.parse(JSON.stringify(categories)),
      featured: JSON.parse(JSON.stringify(featuredArticles[0] || null)),
      latest: JSON.parse(JSON.stringify(latestArticles)),
      trending: JSON.parse(JSON.stringify(trendingArticles)),
    };
  } catch (error) {
    console.error('Homepage data fetch error:', error);
    return {
      categories: [],
      featured: null,
      latest: [],
      trending: [],
    };
  }
}

export default async function HomePage() {
  const { categories, featured, latest, trending } = await getHomepageData();

  return (
    <div className="container mx-auto px-4 py-8">
      {featured && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Featured Story</h2>
          </div>
          <ArticleCard article={featured} variant="featured" />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5" />
            <h2 className="text-xl font-bold">Latest News</h2>
          </div>
          {latest.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latest.map((article: any) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border rounded-lg">
              <p className="text-muted-foreground">No articles yet. Check back soon!</p>
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="font-semibold">Trending</h3>
            </div>
            {trending.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                {trending.map((article: any, index: number) => (
                  <ArticleCard key={article._id} article={article} variant="compact" />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg">
                <p className="text-sm text-muted-foreground">No trending articles yet</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            {categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((category: any) => (
                  <a
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="px-3 py-1.5 bg-muted rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories yet</p>
            )}
          </div>

          <NewsletterForm />
        </aside>
      </div>
    </div>
  );
}
