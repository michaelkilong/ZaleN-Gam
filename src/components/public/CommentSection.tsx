'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase/client';
import { collection, query, where, orderBy, addDoc, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { MessageCircle, Send, AlertCircle } from 'lucide-react';

interface CommentData {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  parentCommentId?: string;
  createdAt: Date;
}

interface CommentSectionProps {
  articleSlug: string;
  articleTitle: string;
}

export function CommentSection({ articleSlug, articleTitle }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleSlug),
      where('isApproved', '==', true),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as CommentData[];
      setComments(commentsData);
    });

    return () => unsubscribe();
  }, [articleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        articleId: articleSlug,
        articleTitle: articleTitle,
        authorUid: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorEmail: user.email || '',
        content: newComment.trim(),
        isApproved: false,
        parentCommentId: replyTo || null,
        createdAt: serverTimestamp(),
      });

      setNewComment('');
      setReplyTo(null);
      setMessage('Your comment has been submitted and is pending approval.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('Error posting comment:', error);
      setMessage('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const replies = comments.filter(c => c.parentCommentId);

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        Comments ({comments.length})
      </h2>

      {message && (
        <div className={`p-4 rounded-md mb-6 flex items-center gap-2 ${
          message.includes('pending') ? 'bg-yellow-50 text-yellow-800' : 'bg-red-50 text-red-800'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {message}
        </div>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <Textarea
            placeholder={replyTo ? 'Write a reply...' : 'Share your thoughts...'}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
            rows={4}
          />
          <div className="flex items-center justify-between">
            {replyTo && (
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel reply
              </button>
            )}
            <Button type="submit" disabled={loading || !newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Posting...' : replyTo ? 'Reply' : 'Post Comment'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-muted p-4 rounded-md mb-8 text-center">
          <p className="text-muted-foreground">
            Please <a href="/login" className="text-primary underline">sign in</a> to leave a comment.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{comment.authorName}</span>
              <span className="text-sm text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-muted-foreground mb-3">{comment.content}</p>
            {user && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="text-sm text-primary hover:underline"
              >
                Reply
              </button>
            )}

            {/* Replies */}
            <div className="mt-4 ml-6 space-y-4">
              {replies.filter(r => r.parentCommentId === comment.id).map(reply => (
                <div key={reply.id} className="border-l-2 pl-4 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{reply.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{reply.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        )}
      </div>
    </section>
  );
}
