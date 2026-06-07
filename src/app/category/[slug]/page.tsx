import { notFound } from 'next/navigation';
import connectDB from '@/lib/db/mongoose';
import { Article } from '@/lib/db/models/Article';
import { Category } from '@/lib/db/models/Category';
import { ArticleCard } from '@/components/public/ArticleCard';

export const revalidate = 60;

const ARTICLES_PER_PAGE = 12;

async function getCategoryData(slug: string, page: number = 1) {
  await connectDB();

  const category = await Category.findOne({ slug }).lean();
  if (!category) return null;

  const skip = (page - 1) * ARTICLES_PER_PAGE;

  const [articles, total] = await Promise.all([
    Article.find({ status: 'PUBLISHED', categoryId: category._id })
      .populate('categoryId', 'name slug')
      .populate('authorId', 'name')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(ARTICLES_PER_PAGE)
      .lean(),
    Article.countDocuments({ status: 'PUBLISHED', categoryId: category._id }),
  ]);

  return {
    category: JSON.parse(JSON.stringify(category)),
    articles: JSON.parse(JSON.stringify(articles)),
    total,
    totalPages: Math.ceil(total / ARTICLES_PER_PAGE),
    currentPage: page,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const data = await getCategoryData(params.slug, page);

  if (!data) {
    notFound();
  }

  const { category, articles, total, totalPages, currentPage } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          {total} article{total !== 1 ? 's' : ''}
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No articles in this category yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <a
                  key={pageNum}
                  href={`/category/${params.slug}?page=${pageNum}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    pageNum === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
