'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, FileText, Plus, Edit, Eye, Send } from 'lucide-react';
import { ArticleEditor } from './ArticleEditor';

interface Article {
  _id: string;
  title: string;
  slug: string;
  status: string;
  categoryId?: { name: string };
  publishedAt?: string;
  createdAt: string;
  views: number;
}

export function MyArticlesList() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingArticle, setEditingArticle] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/staff/articles');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      } else {
        setError('Failed to load articles');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'SUBMITTED' }),
      });

      if (response.ok) {
        fetchArticles();
      } else {
        setError('Failed to submit for review');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    PUBLISHED: 'bg-green-100 text-green-800',
  };

  if (creatingNew || editingArticle) {
    return (
      <ArticleEditor
        articleId={editingArticle || undefined}
        onSave={() => {
          setCreatingNew(false);
          setEditingArticle(null);
          fetchArticles();
        }}
        onCancel={() => {
          setCreatingNew(false);
          setEditingArticle(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            My Articles
          </h2>
          <p className="text-muted-foreground mt-1">Manage your articles</p>
        </div>
        <Button onClick={() => setCreatingNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No articles yet. Create your first article!
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {article.title}
                    </TableCell>
                    <TableCell>{article.categoryId?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[article.status] || 'bg-gray-100'}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.views || 0}</TableCell>
                    <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/news/${article.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setEditingArticle(article._id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {article.status === 'DRAFT' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSubmitForReview(article._id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
