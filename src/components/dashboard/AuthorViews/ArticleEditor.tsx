'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Save, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface ArticleEditorProps {
  articleId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export function ArticleEditor({ articleId, onSave, onCancel }: ArticleEditorProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    featuredImage: '',
    tags: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (articleId) {
      fetchArticle();
    }
  }, [articleId]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/staff/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/staff/articles/${articleId}`);
      if (response.ok) {
        const data = await response.json();
        const article = data.article;
        setFormData({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          categoryId: article.categoryId?._id || article.categoryId,
          featuredImage: article.featuredImage || '',
          tags: article.tags?.join(', ') || '',
        });
      }
    } catch (err) {
      setError('Failed to load article');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/staff/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, featuredImage: data.url }));
      } else {
        setError('Failed to upload image');
      }
    } catch (err) {
      setError('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'DRAFT',
    };

    try {
      const url = articleId ? `/api/staff/articles/${articleId}` : '/api/staff/articles';
      const method = articleId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save article');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {articleId ? 'Edit Article' : 'New Article'}
        </h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Article title"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Excerpt *</label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief summary of the article"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category *</label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Featured Image</label>
              <div className="flex gap-3 items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {uploadingImage && <span className="text-sm text-muted-foreground">Uploading...</span>}
              </div>
              {formData.featuredImage && (
                <div className="mt-2">
                  <img src={formData.featuredImage} alt="Featured" className="h-32 object-cover rounded-md" />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tags (comma separated)</label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="technology, news, featured"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here... (HTML supported)"
              rows={20}
              className="font-mono"
              required
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Draft'}
          </Button>
        </div>
      </form>
    </div>
  );
}
