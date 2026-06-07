'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, MessageSquare, Check, X, Eye, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Comment {
  id: string;
  articleTitle: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  createdAt: string;
  ipAddress?: string;
}

export function CommentModeration() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const [approvedComments, setApprovedComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/staff/comments?status=pending'),
        fetch('/api/staff/comments?status=approved'),
      ]);

      if (pendingRes.ok && approvedRes.ok) {
        const [pendingData, approvedData] = await Promise.all([
          pendingRes.json(),
          approvedRes.json(),
        ]);
        setPendingComments(pendingData.comments);
        setApprovedComments(approvedData.comments);
      } else {
        setError('Failed to load comments');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (commentId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/staff/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, action }),
      });

      if (response.ok) {
        fetchComments();
      } else {
        setError('Failed to moderate comment');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  const CommentTable = ({ comments, isPending }: { comments: Comment[]; isPending: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Article</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Content</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {comments.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              {isPending ? 'No pending comments' : 'No approved comments'}
            </TableCell>
          </TableRow>
        ) : (
          comments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="font-medium max-w-xs truncate">
                {comment.articleTitle}
              </TableCell>
              <TableCell>
                <div>{comment.authorName}</div>
                <div className="text-xs text-muted-foreground">{comment.authorEmail}</div>
              </TableCell>
              <TableCell className="max-w-md truncate">{comment.content}</TableCell>
              <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {isPending ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(comment.id, 'approve')}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleModerate(comment.id, 'reject')}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleModerate(comment.id, 'reject')}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Comment Moderation
        </h2>
        <p className="text-muted-foreground mt-1">Review and approve reader comments</p>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            {pendingComments.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingComments.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardContent className="p-0">
              <CommentTable comments={pendingComments} isPending={true} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved">
          <Card>
            <CardContent className="p-0">
              <CommentTable comments={approvedComments} isPending={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
