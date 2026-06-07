'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, PenTool, Check, X, Eye } from 'lucide-react';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorId?: { name: string };
  categoryId?: { name: string };
  submittedForReviewAt?: string;
}

export function ReviewQueue() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/staff/articles?status=SUBMITTED');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      } else {
        setError('Failed to load review queue');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });

      if (response.ok) {
        fetchArticles();
      } else {
        setError('Failed to approve article');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/staff/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DRAFT' }),
      });

      if (response.ok) {
        fetchArticles();
      } else {
        setError('Failed to reject article');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <PenTool className="h-6 w-6" />
          Review Queue
        </h2>
        <p className="text-muted-foreground mt-1">
          Articles submitted for review by authors
        </p>
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
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No articles pending review
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell className="font-medium max-w-xs">
                      <div>{article.title}</div>
                      <div className="text-sm text-muted-foreground truncate">{article.excerpt}</div>
                    </TableCell>
                    <TableCell>{article.authorId?.name || 'Unknown'}</TableCell>
                    <TableCell>{article.categoryId?.name || 'Uncategorized'}</TableCell>
                    <TableCell>
                      {article.submittedForReviewAt
                        ? new Date(article.submittedForReviewAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/news/${article.slug}`} target="_blank">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(article._id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(article._id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
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
