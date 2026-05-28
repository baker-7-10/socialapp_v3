'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Comment, PaginatedResponse } from '@/types';
import { api, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

interface CommentsSectionProps {
  postId: string;
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComments = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get<PaginatedResponse<Comment>>(
        `/posts/${postId}/comments?page=${p}&limit=20`
      );
      if (p === 1) setComments(data.data);
      else setComments((prev) => [...prev, ...data.data]);
      setTotalPages(data.meta.totalPages);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post<Comment>(`/posts/${postId}/comments`, {
        content: content.trim(),
      });
      setComments((prev) => [data, ...prev]);
      setContent('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      {/* Comment input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        {user && <Avatar src={user.avatarUrl} username={user.username} size="sm" className="flex-shrink-0 mt-0.5" />}
        <div className="flex-1 relative">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment…"
            className="w-full px-4 py-2.5 pr-10 rounded-full text-sm"
            style={{
              background: '#ffffff',
              border: '1.5px solid #e0dbd0',
              color: '#0d0d0d',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#c8a96e')}
            onBlur={(e) => (e.target.style.borderColor = '#e0dbd0')}
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
            style={{
              color: content.trim() ? '#c8a96e' : '#d0d0c8',
              background: content.trim() ? '#f5edd8' : 'transparent',
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </form>

      {/* Comments list */}
      {loading && page === 1 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-fade-in">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-center py-8" style={{ color: '#a8a89e' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = user?.id === comment.authorId;
            return (
              <div key={comment.id} className="flex gap-3 group animate-fade-in">
                <Avatar
                  src={comment.author.avatarUrl}
                  username={comment.author.username}
                  size="sm"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-sm font-semibold" style={{ color: '#0d0d0d' }}>
                        @{comment.author.username}
                      </span>
                      <span className="text-xs ml-2" style={{ color: '#a8a89e' }}>
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                        style={{ color: '#d94f3d' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#3a3a32' }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}

          {page < totalPages && (
            <button
              onClick={() => {
                const next = page + 1;
                setPage(next);
                fetchComments(next);
              }}
              className="w-full py-2 text-sm rounded-lg transition-colors"
              style={{ color: '#c8a96e', background: '#f5edd8' }}
            >
              Load more comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
